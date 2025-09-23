// Hook to fetch current user profile and feed from Firestore
import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, getFeedPosts } from '../../utils/firestoreSocialApi';

export function useHomeFeedData() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (authLoading) return; // Wait for auth to load
    
    setLoading(true);
    
    // Fetch user profile if authenticated
    if (user) {
      try {
        const profileData = await getUserProfile(user.uid);
        setProfile(profileData);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setProfile(null);
      }
    } else {
      setProfile(null);
    }
    
    // Fetch feed posts regardless of auth state
    try {
      const feedPosts = await getFeedPosts();
      setPosts(feedPosts);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      setPosts([]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user, authLoading]);

  // Provide refresh function
  const refreshPosts = async () => {
    console.log('🔄 Refreshing posts data...');
    try {
      const feedPosts = await getFeedPosts();
      setPosts(feedPosts);
      console.log('✅ Posts refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to refresh posts:', error);
    }
  };

  return { 
    profile, 
    posts, 
    loading: loading || authLoading, 
    user,
    refreshPosts
  };
}
