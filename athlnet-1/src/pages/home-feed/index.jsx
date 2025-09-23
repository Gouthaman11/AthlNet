
import React from 'react';
import { safeLog } from '../../utils/safeLogging';
import { useHomeFeedData } from './useHomeFeedData';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import PostCreationWidget from './components/PostCreationWidget';
import PostCard from './components/PostCard';
import TrendingPanel from './components/TrendingPanel';
import FeedFilters from './components/FeedFilters';
import LoadingSpinner from './components/LoadingSpinner';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const HomeFeed = () => {
  const navigate = useNavigate();
  const { profile, posts, loading, user, refreshPosts } = useHomeFeedData();
  const [activeFilters, setActiveFilters] = React.useState({
    contentType: 'all',
    sports: 'all',
    connections: 'all'
  });
  const [currentUser, setCurrentUser] = React.useState(null);

  // Update currentUser when user from hook changes
  React.useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Filter posts based on active filters (optional)
  const [localPosts, setLocalPosts] = React.useState([]);
  const handleLike = async (postId, currentLikeState) => {
    try {
      const { auth } = await import('../../firebaseClient');
      const user = auth?.currentUser;
      if (!user) return;
      
      const { likePost } = await import('../../utils/firestoreSocialApi');
      const result = await likePost(postId, user.uid);
      
      // Update the local posts state to reflect the new like status
      setLocalPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: result.isLiked 
                  ? [...(post.likes || []), user.uid]
                  : (post.likes || []).filter(id => id !== user.uid)
              }
            : post
        )
      );
      
      // Also update the main posts state if it exists
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { 
                ...post, 
                likes: result.isLiked 
                  ? [...(post.likes || []), user.uid]
                  : (post.likes || []).filter(id => id !== user.uid)
              }
            : post
        )
      );
      
      return result;
    } catch (e) {
      console.error('Like failed:', e);
      throw e; // Re-throw to let PostCard handle the error
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const { auth } = await import('../../firebaseClient');
      const user = auth?.currentUser;
      if (!user) return;
      
      // Get user profile for author info
      const { getUserProfile, addComment } = await import('../../utils/firestoreSocialApi');
      const userProfile = await getUserProfile(user.uid);
      
      // Prepare author info for comment
      const firstName = userProfile?.personalInfo?.firstName || '';
      const lastName = userProfile?.personalInfo?.lastName || '';
      const displayName = firstName && lastName ? `${firstName} ${lastName}` : 
                         firstName || userProfile?.personalInfo?.name || user.displayName || user.email;
      
      const authorInfo = {
        name: displayName,
        avatar: userProfile?.avatarUrl || user.photoURL || '',
        verified: userProfile?.isVerified || false
      };
      
      await addComment(postId, user.uid, content, authorInfo);
      
      // Refresh the page to show new comment
      window.location.reload();
    } catch (e) {
      console.error('Comment failed:', e);
      alert('Failed to add comment: ' + (e.message || e));
    }
  };

  const handleShare = async (postId) => {
    // Implement share functionality
    console.log('Share post:', postId);
  };

  const handleEdit = async (postId, updates) => {
    try {
      const { auth } = await import('../../firebaseClient');
      const user = auth?.currentUser;
      if (!user) return;
      
      const { updatePost } = await import('../../utils/firestoreSocialApi');
      await updatePost(postId, updates);
      
      // Refresh posts to show the update
      window.location.reload();
    } catch (e) {
      console.error('Edit failed:', e);
      throw e;
    }
  };

  const handleDelete = async (postId) => {
    if (!postId) {
      console.error('❌ No post ID provided for deletion');
      alert('Unable to delete post: Invalid post ID');
      return;
    }

    try {
      console.log('🗑️ Starting delete process for post:', postId);
      
      const { auth } = await import('../../firebaseClient');
      const user = auth?.currentUser;
      
      if (!user) {
        console.error('❌ No authenticated user for delete operation');
        alert('Please log in to delete posts');
        return;
      }

      console.log('👤 User attempting deletion:', user.uid);
      
      const { deletePost } = await import('../../utils/firestoreSocialApi');
      await deletePost(postId, user.uid);
      
      console.log('✅ Post deletion successful, refreshing posts...');
      
      // Use refresh function instead of page reload
      await refreshPosts();
      
      // Show success message
      alert('Post deleted successfully!');
      
    } catch (e) {
      console.error('❌ Delete operation failed:', e);
      const errorMessage = e?.message || 'Failed to delete post';
      alert(`Delete failed: ${errorMessage}`);
      throw e;
    }
  };

  const filteredPosts = [...localPosts, ...posts]; // Show new posts first

  const handleCreatePost = async (newPost) => {
    try {
      // Get current user from Firebase Auth
      const { auth } = await import('../../firebaseClient');
      const user = auth?.currentUser;
      if (!user) {
        alert('You must be logged in to post.');
        return;
      }
      
      // Upload media files to Firebase Storage if any
      let mediaArray = [];
      if (newPost.media && newPost.media.length > 0) {
        safeLog.log('📤 Starting optimized media upload process:', {
          fileCount: newPost.media.length,
          fileTypes: newPost.media.map(m => m.type),
          fileSizes: newPost.media.map(m => m.size)
        });
        
        try {
          const { uploadMediaOptimized, uploadMediaFilesSimple, testStorageConnection } = await import('../../utils/firestoreSocialApi');
          
          // Test storage connection first
          safeLog.log('📡 Testing storage connection...');
          await testStorageConnection();
          safeLog.log('✅ Storage connection test passed');
          
          // Try optimized upload first
          try {
            const uploadedMedia = await uploadMediaOptimized(
              newPost.media, 
              user.uid,
              (progress) => {
                safeLog.log(`📊 Upload progress:`, progress);
                // You could add a progress indicator here
              }
            );
            
            safeLog.log('✅ Optimized upload completed successfully:', {
              uploadedCount: uploadedMedia.length,
              urls: uploadedMedia.map(m => ({ type: m.type, hasUrl: !!m.url }))
            });
            
            mediaArray = uploadedMedia;
          } catch (optimizedError) {
            safeLog.warn('⚠️ Optimized upload failed, trying fallback:', optimizedError);
            
            // Fallback to legacy upload
            const uploadedMedia = await uploadMediaFilesSimple(newPost.media, user.uid);
            safeLog.log('✅ Fallback upload completed successfully:', {
              uploadedCount: uploadedMedia.length,
              urls: uploadedMedia.map(m => ({ type: m.type, hasUrl: !!m.url }))
            });
            
            mediaArray = uploadedMedia;
          }
        } catch (error) {
          safeLog.error('❌ Media upload failed:', error);
          
          // Provide more specific error messages
          if (error.message.includes('Firebase Storage not initialized')) {
            alert('Media upload is not configured. Please contact support.');
          } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
            alert('You don\'t have permission to upload files. Please try refreshing the page or logging out and back in.');
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            alert('Network error. Please check your internet connection and try again.');
          } else if (error.message.includes('quota')) {
            alert('Storage quota exceeded. Please contact support.');
          } else {
            alert(`Failed to upload media: ${error.message}. Please try again.`);
          }
          return;
        }
      }
      
      // Get user profile data from Firestore
      const { getUserProfile } = await import('../../utils/firestoreSocialApi');
      const userProfile = await getUserProfile(user.uid);
      
      // Get display name and details from profile
      const firstName = userProfile?.personalInfo?.firstName || '';
      const lastName = userProfile?.personalInfo?.lastName || '';
      const displayName = firstName && lastName ? `${firstName} ${lastName}` : 
                         firstName || userProfile?.personalInfo?.name || user.displayName || user.email;
      
      const authorInfo = {
        name: displayName,
        avatar: userProfile?.avatarUrl || user.photoURL || '',
        verified: userProfile?.isVerified || false,
        sport: userProfile?.personalInfo?.sport || 'Athlete',
        location: userProfile?.personalInfo?.location || ''
      };
      
      // Save post to Firestore with author info and uploaded media
      const { createPost } = await import('../../utils/firestoreSocialApi');
      await createPost(user.uid, newPost.content, mediaArray, authorInfo);
      setLocalPosts([]); // Clear local posts
      window.location.reload();
    } catch (e) {
      alert('Failed to post: ' + (e?.message || e));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <LoadingSpinner size="xl" text="Loading your personalized feed..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Feed Column */}
            <div className="lg:col-span-3">
              {/* Welcome Message with profile */}
              <div className="bg-gradient-to-r from-primary to-secondary text-white rounded-lg p-6 mb-6 card-elevation-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      Welcome back{profile?.personalInfo?.firstName ? `, ${profile.personalInfo.firstName}` : ''}! 👋
                    </h1>
                    <p className="text-white/90">Stay connected with the sports community. Share your journey, discover new athletes, and get inspired!</p>
                  </div>
                  <div className="hidden sm:block">
                    <Icon name="Zap" size={48} color="white" className="opacity-20" />
                  </div>
                </div>
              </div>

              {/* Feed Filters */}
              <FeedFilters 
                onFilterChange={(cat, val) => setActiveFilters({ ...activeFilters, [cat]: val })}
                activeFilters={activeFilters}
              />

              {/* Post Creation Widget */}
              <PostCreationWidget onCreatePost={handleCreatePost} />

              {/* Posts Feed (from Firestore) */}
              <div className="space-y-6">
                {filteredPosts?.length === 0 ? (
                  <div className="bg-card border border-border rounded-lg p-8 text-center card-elevation-1">
                    <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No posts found</h3>
                    <p className="text-muted-foreground mb-4">Try adjusting your filters or follow more athletes to see content in your feed.</p>
                    <div className="flex items-center justify-center space-x-3">
                      <Button 
                        variant="outline"
                        onClick={() => setActiveFilters({ contentType: 'all', sports: 'all', connections: 'all' })}
                      >
                        Reset Filters
                      </Button>
                      <Button 
                        variant="default"
                        onClick={() => navigate('/search-and-discovery')}
                      >
                        Discover Athletes
                      </Button>
                    </div>
                  </div>
                ) : (
                  filteredPosts?.map(post => (
                    <PostCard 
                      key={post?.id}
                      post={post}
                      onLike={handleLike}
                      onComment={handleComment}
                      onShare={handleShare}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      currentUser={currentUser}
                    />
                  ))
                )}
              </div>
              {/* Mobile Floating Action Button */}
              <div className="fixed bottom-6 right-6 lg:hidden z-50">
                <Button
                  variant="default"
                  size="icon"
                  className="w-14 h-14 rounded-full shadow-lg"
                  onClick={() => document.querySelector('textarea')?.focus()}
                >
                  <Icon name="Plus" size={24} />
                </Button>
              </div>
            </div>

            {/* Sidebar - Trending Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-20">
                <TrendingPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;