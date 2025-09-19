// Debug utilities for testing posts and data loading
import { getFeedPosts, createPost } from './firestoreSocialApi';
import { safeLog } from './safeLogging';
import { auth } from '../firebaseClient';

// Test post loading and check for circular reference issues
window.testPostLoading = async () => {
  console.log('=== TESTING POST LOADING ===');
  
  try {
    const posts = await getFeedPosts({ limitCount: 5 });
    safeLog.log('Posts loaded successfully:', posts.length);
    
    if (posts.length > 0) {
      safeLog.log('Sample post:', posts[0]);
      posts.forEach((post, index) => {
        safeLog.log(`Post ${index + 1}:`, {
          id: post.id,
          author: post.author?.name || 'Unknown',
          content: post.content?.substring(0, 50) + '...',
          createdAt: post.createdAt
        });
      });
    } else {
      safeLog.log('No posts found in feed');
    }
    
    return { success: true, postsCount: posts.length, posts };
    
  } catch (error) {
    safeLog.error('Failed to load posts:', error);
    return { success: false, error };
  }
};

// Test creating a new post
window.testPostCreation = async (content = 'Test post from debug utility') => {
  console.log('=== TESTING POST CREATION ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user logged in');
    return { success: false, error: 'No user logged in' };
  }
  
  try {
    const authorInfo = {
      name: user.displayName || user.email || 'Test User',
      avatar: user.photoURL || '',
      verified: false,
      sport: 'Athlete',
      location: ''
    };
    
    safeLog.log('Creating test post...', { content, authorInfo });
    const postId = await createPost(user.uid, content, [], authorInfo);
    safeLog.log('✅ Test post created with ID:', postId);
    
    return { success: true, postId };
    
  } catch (error) {
    safeLog.error('Failed to create test post:', error);
    return { success: false, error };
  }
};

// Check for any circular reference issues in Firebase objects
window.checkCircularReferences = () => {
  console.log('=== CHECKING FOR CIRCULAR REFERENCES ===');
  
  // Test common Firebase objects that might cause issues
  const testObjects = [
    { name: 'auth.currentUser', obj: auth.currentUser },
    { name: 'Empty object', obj: {} },
    { name: 'Simple object', obj: { a: 1, b: 'test', c: [1, 2, 3] } }
  ];
  
  testObjects.forEach(({ name, obj }) => {
    try {
      const jsonString = safeLog.stringify(obj);
      console.log(`✅ ${name}: Safe to stringify (${jsonString.length} chars)`);
    } catch (error) {
      console.error(`❌ ${name}: Circular reference detected`, error);
    }
  });
  
  console.log('✅ Circular reference check completed');
};

// Test safe logging utilities
window.testSafeLogging = () => {
  console.log('=== TESTING SAFE LOGGING ===');
  
  // Create an object with circular reference
  const circular = { a: 1 };
  circular.self = circular;
  
  // Test different logging methods
  safeLog.log('Testing safe log with circular object:', circular);
  safeLog.warn('Testing safe warn with circular object:', circular);
  safeLog.error('Testing safe error:', new Error('Test error'));
  
  // Test Firebase-like objects
  const fakeFirebaseObject = {
    id: 'test123',
    _internal: { circular: null },
    firestore: { internal: 'stuff' },
    data: { message: 'Hello' },
    toDate: () => new Date()
  };
  fakeFirebaseObject._internal.circular = fakeFirebaseObject;
  
  safeLog.log('Testing fake Firebase object:', fakeFirebaseObject);
  
  console.log('✅ Safe logging test completed');
};

console.log('🛠️ Post debugging tools loaded:');
console.log('- testPostLoading() - Test loading posts from Firebase');
console.log('- testPostCreation(content) - Test creating a new post');
console.log('- checkCircularReferences() - Check for circular reference issues');
console.log('- testSafeLogging() - Test safe logging utilities');