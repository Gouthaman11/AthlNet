import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebaseClient';
import Header from '../../components/ui/Header';
import ProfileHeader from './components/ProfileHeader';
import ProfileTabs from './components/ProfileTabs';
import EditProfileModal from './components/EditProfileModal';
import { getFullUserProfile, updateUserProfile, toggleFollowUser, followUserSimple, connectWithUser, subscribeToProfileStats, subscribeToFollowState, subscribeToConnectionState } from '../../utils/firestoreSocialApi';
import { cleanUserProfile } from '../../utils/profileUtils';
import { safeLog } from '../../utils/safeLogging';
import '../../utils/debugFollow';
import '../../utils/testFollowFixed';

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('about');
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [profileStats, setProfileStats] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);
  
  const navigate = useNavigate();
  const { userId } = useParams(); // Get userId from URL params
  const [currentUser, authLoading] = useAuthState(auth);
  
  // Determine which profile to load: URL param or current user
  const profileUserId = userId || currentUser?.uid;
  const isOwnProfile = currentUser?.uid === profileUserId;

  useEffect(() => {
    async function fetchProfile() {
      if (!profileUserId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        safeLog.log('🔍 Loading profile for user:', profileUserId);
        const profile = await getFullUserProfile(profileUserId);
        
        safeLog.log('📋 Raw profile data received');
        safeLog.log('👤 Profile name fields:', {
          name: profile?.name,
          displayName: profile?.displayName,
          personalInfoFirstName: profile?.personalInfo?.firstName,
          personalInfoLastName: profile?.personalInfo?.lastName
        });
        
        // Get current user's data to check follow status correctly
        let currentUserData = null;
        if (currentUser && !isOwnProfile) {
          safeLog.log('Getting current user data for follow state check...');
          currentUserData = await getFullUserProfile(currentUser.uid);
          safeLog.log('Current user following list length:', currentUserData?.following?.length || 0);
        }
        
        // Add context flags
        profile.isOwnProfile = isOwnProfile;
        profile.isFollowing = currentUserData ? 
          currentUserData.following?.includes(profileUserId) || false : false;
        
        // Fix connection status check - check if target user is in current user's connections
        profile.isConnected = currentUser && currentUserData ? 
          currentUserData.connections?.includes(profileUserId) || false : false;
        
        safeLog.log('Connection status calculation:', {
          currentUserId: currentUser?.uid,
          targetUserId: profileUserId,
          currentUserConnections: currentUserData?.connections,
          isConnected: profile.isConnected
        });
        
        // Apply data cleaning to ensure consistent display
        const cleanedProfile = cleanUserProfile(profile);
        if (cleanedProfile) {
          // Preserve original profile fields that cleaning might remove
          cleanedProfile.isOwnProfile = profile.isOwnProfile;
          cleanedProfile.isFollowing = profile.isFollowing;
          cleanedProfile.isConnected = profile.isConnected;
          cleanedProfile.stats = profile.stats;
          cleanedProfile.posts = profile.posts;
          cleanedProfile.media = profile.media;
          cleanedProfile.joinedDate = profile.joinedDate;
          cleanedProfile.personalInfo = profile.personalInfo;
          
          // Preserve coach-specific data that might be lost in cleaning
          cleanedProfile.role = profile.role || cleanedProfile.role;
          cleanedProfile.userType = profile.userType || cleanedProfile.userType;
          cleanedProfile.isCoach = profile.isCoach || cleanedProfile.isCoach || profile.role === 'coach';
          cleanedProfile.coachInfo = profile.coachInfo;
          
          setUserProfile(cleanedProfile);
          safeLog.log('✅ Profile cleaned and set successfully');
          safeLog.log('📊 Final cleaned profile summary:', {
            name: cleanedProfile?.name,
            displayName: cleanedProfile?.displayName,
            originalName: profile?.name,
            originalDisplayName: profile?.displayName,
            isFollowing: cleanedProfile?.isFollowing,
            statsPostsCount: cleanedProfile?.stats?.posts
          });
        } else {
          setUserProfile(profile);
          safeLog.warn('⚠️ Profile cleaning failed, using original profile');
        }
      } catch (error) {
        safeLog.error('Failed to load profile:', error);
        setUserProfile(null);
        setSaveError('Failed to load profile. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    if (!authLoading) {
      fetchProfile();
    }
  }, [profileUserId, currentUser, authLoading, isOwnProfile]);

  // Real-time stats subscription
  useEffect(() => {
    let unsubscribe = null;
    
    if (profileUserId && !authLoading) {
      unsubscribe = subscribeToProfileStats(profileUserId, (stats) => {
        setProfileStats(stats);
        // Update userProfile stats if it exists
        setUserProfile(prev => prev ? { ...prev, stats } : prev);
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [profileUserId, authLoading]);

  // Real-time follow state subscription
  useEffect(() => {
    let unsubscribe = null;
    
    if (currentUser && profileUserId && !isOwnProfile && !authLoading) {
      unsubscribe = subscribeToFollowState(currentUser.uid, profileUserId, (isFollowing) => {
        setUserProfile(prev => prev ? { ...prev, isFollowing } : prev);
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, profileUserId, isOwnProfile, authLoading]);

  // Real-time connection state subscription
  useEffect(() => {
    let unsubscribe = null;
    
    if (currentUser && profileUserId && !isOwnProfile && !authLoading) {
      unsubscribe = subscribeToConnectionState(currentUser.uid, profileUserId, (isConnected) => {
        setUserProfile(prev => prev ? { ...prev, isConnected } : prev);
      });
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [currentUser, profileUserId, isOwnProfile, authLoading]);

  const handleSaveProfile = async (data) => {
    setSaveError(null);
    try {
      await updateUserProfile(currentUser.uid, data);
      setUserProfile(prev => ({ ...prev, ...data }));
      setShowEdit(false);
      safeLog.log('Profile updated successfully');
    } catch (error) {
      safeLog.error('Failed to save profile:', error);
      setSaveError('Failed to save profile. Please try again.');
    }
  };

  const handleFollow = async (shouldFollow) => {
    safeLog.log('=== FOLLOW BUTTON CLICKED ===');
    safeLog.log('shouldFollow:', shouldFollow);
    safeLog.log('currentUser:', currentUser?.uid);
    safeLog.log('profileUserId:', profileUserId);
    
    if (!currentUser) {
      safeLog.error('No current user found');
      setSaveError('You must be logged in to follow users');
      return;
    }
    
    if (!userProfile) {
      safeLog.error('No user profile found');
      setSaveError('User profile not found');
      return;
    }
    
    const targetUserId = userProfile.uid || profileUserId;
    safeLog.log('Target user ID:', targetUserId);
    
    if (!targetUserId) {
      safeLog.error('No target user ID found');
      setSaveError('Unable to identify user to follow');
      return;
    }
    
    if (currentUser.uid === targetUserId) {
      safeLog.error('Cannot follow yourself');
      setSaveError('You cannot follow yourself');
      return;
    }
    
    safeLog.log(`Starting follow operation: ${currentUser.uid} -> ${targetUserId}, shouldFollow: ${shouldFollow}`);
    
    setFollowLoading(true);
    setSaveError(null);
    
    try {
      safeLog.log('Calling followUserSimple...');
      const result = await followUserSimple(currentUser.uid, targetUserId, shouldFollow);
      safeLog.log('followUserSimple result completed successfully');
      
      // Only update local state if the operation was successful
      if (result && result.success !== false) {
        safeLog.log('Updating local follow state to:', shouldFollow);
        setUserProfile(prev => ({
          ...prev,
          isFollowing: shouldFollow
        }));
        
        // Show success message if returned
        if (result.message) {
          safeLog.log('Success:', result.message);
        }
        
        // Show warning if returned
        if (result.warning) {
          safeLog.warn('Warning:', result.warning);
          setSaveError(`${shouldFollow ? 'Followed' : 'Unfollowed'} user, but ${result.warning}`);
        }
      }
      
      safeLog.log(`✅ ${shouldFollow ? 'Followed' : 'Unfollowed'} user successfully`);
    } catch (error) {
      safeLog.error('❌ Failed to toggle follow:', error);
      setSaveError(`Failed to ${shouldFollow ? 'follow' : 'unfollow'} user: ${error.message}`);
      
      // Don't update local state on error - real-time subscription will handle correct state
      safeLog.log('Local state NOT updated due to error - relying on real-time subscription');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!currentUser || !userProfile || userProfile.isConnected) return;
    
    console.log('=== handleConnect called ===');
    console.log('Current user:', currentUser.uid);
    console.log('Target user:', userProfile.uid || profileUserId);
    console.log('Is connected:', userProfile.isConnected);
    
    setConnectLoading(true);
    setSaveError(null);
    
    try {
      const targetUserId = userProfile.uid || profileUserId;
      if (!targetUserId) {
        throw new Error('Target user ID not found');
      }
      
      const result = await connectWithUser(currentUser.uid, targetUserId);
      console.log('Connection result:', result);
      
      // Update local state immediately
      setUserProfile(prev => ({
        ...prev,
        isConnected: true
      }));
      
      // Force refresh of current user data to update connection counts
      try {
        const updatedCurrentUser = await getFullUserProfile(currentUser.uid);
        console.log('Updated current user connections count:', updatedCurrentUser?.connections?.length || 0);
      } catch (refreshError) {
        console.warn('Could not refresh user data:', refreshError);
      }
      
      safeLog.log('Connected with user successfully');
      
      // Show success message briefly
      if (result?.message) {
        setSaveError(`Success: ${result.message}`);
        setTimeout(() => setSaveError(null), 3000);
      }
      
    } catch (error) {
      console.error('Connection error details:', error);
      safeLog.error('Failed to connect with user:', error);
      
      // Show more specific error message
      const errorMessage = error.message || 'Failed to connect with user';
      setSaveError(`Connection failed: ${errorMessage}`);
    } finally {
      setConnectLoading(false);
    }
  };

  const handleMessage = () => {
    // Navigate to messaging page
    navigate(`/messaging?user=${profileUserId}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view profiles.</p>
            <button 
              onClick={() => navigate('/login')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Profile Not Found</h2>
            <p className="text-muted-foreground mb-6">The user profile you're looking for doesn't exist.</p>
            {saveError && <p className="text-error mb-4">{saveError}</p>}
            <button 
              onClick={() => navigate('/feed')}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Back to Feed
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {saveError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{saveError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setSaveError(null)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <span className="sr-only">Dismiss</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
          <ProfileHeader
            userProfile={userProfile}
            onConnect={handleConnect}
            onMessage={handleMessage}
            onFollow={handleFollow}
            onEditProfile={() => setShowEdit(true)}
            followLoading={followLoading}
            connectLoading={connectLoading}
          />
          <div className="mt-6">
            <ProfileTabs
              userProfile={userProfile}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
          
          {showEdit && (
            <EditProfileModal
              userProfile={userProfile}
              onSave={handleSaveProfile}
              onClose={() => {
                setShowEdit(false);
                setSaveError(null);
              }}
            />
          )}
          
          {saveError && (
            <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
              <p className="text-error text-sm">{saveError}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;