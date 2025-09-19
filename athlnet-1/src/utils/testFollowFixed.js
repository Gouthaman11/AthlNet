// Enhanced test functions for follow functionality
// Add these to browser console for testing

// Test the improved follow functionality
window.testFollowFunctionImproved = async function(currentUid, targetUid, shouldFollow = true) {
  console.log('=== TESTING IMPROVED FOLLOW FUNCTION ===');
  console.log(`Testing: ${currentUid} ${shouldFollow ? 'following' : 'unfollowing'} ${targetUid}`);
  
  try {
    // Import the function dynamically
    const { followUserSimple } = await import('./firestoreSocialApi.js');
    
    console.log('Calling followUserSimple...');
    const result = await followUserSimple(currentUid, targetUid, shouldFollow);
    
    console.log('✅ Function completed successfully!');
    console.log('Result:', result);
    
    if (result && result.success !== false) {
      console.log('✅ Operation successful:', result.message);
      
      if (result.warning) {
        console.warn('⚠️ Warning:', result.warning);
      }
      
      if (result.isFollowing !== undefined) {
        console.log('Final follow state:', result.isFollowing);
      }
    } else {
      console.error('❌ Operation may have failed:', result);
    }
    
    return result;
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
    console.error('Error details:', error.message);
    return { success: false, error: error.message };
  }
};

// Test complete follow/unfollow cycle
window.testFollowCycle = async function(currentUid, targetUid) {
  console.log('=== TESTING COMPLETE FOLLOW CYCLE ===');
  
  try {
    console.log('Step 1: Follow user');
    const followResult = await window.testFollowFunctionImproved(currentUid, targetUid, true);
    
    if (!followResult || followResult.success === false) {
      throw new Error('Follow operation failed');
    }
    
    console.log('Step 2: Wait 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log('Step 3: Unfollow user');
    const unfollowResult = await window.testFollowFunctionImproved(currentUid, targetUid, false);
    
    if (!unfollowResult || unfollowResult.success === false) {
      throw new Error('Unfollow operation failed');
    }
    
    console.log('✅ Complete follow cycle test passed!');
    return { success: true, followResult, unfollowResult };
    
  } catch (error) {
    console.error('❌ Follow cycle test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test with current user from auth
window.testFollowWithCurrentUser = async function(targetUid, shouldFollow = true) {
  console.log('=== TESTING WITH CURRENT USER ===');
  
  try {
    // Get current user from Firebase Auth
    const { auth } = await import('../firebaseClient.js');
    
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const currentUid = auth.currentUser.uid;
    console.log('Current user ID:', currentUid);
    
    return await window.testFollowFunctionImproved(currentUid, targetUid, shouldFollow);
    
  } catch (error) {
    console.error('❌ Test with current user failed:', error);
    return { success: false, error: error.message };
  }
};

// Verify user data structure
window.verifyUserData = async function(userId) {
  console.log('=== VERIFYING USER DATA ===');
  console.log('User ID:', userId);
  
  try {
    const { getUserProfile } = await import('./firestoreSocialApi.js');
    
    const userData = await getUserProfile(userId);
    
    if (!userData) {
      console.error('❌ User not found:', userId);
      return { exists: false };
    }
    
    console.log('✅ User found:');
    console.log('- Name:', userData.displayName || userData.name);
    console.log('- Followers:', (userData.followers || []).length);
    console.log('- Following:', (userData.following || []).length);
    console.log('- Followers list:', userData.followers);
    console.log('- Following list:', userData.following);
    
    return {
      exists: true,
      data: userData,
      followers: userData.followers || [],
      following: userData.following || [],
      stats: {
        followersCount: (userData.followers || []).length,
        followingCount: (userData.following || []).length
      }
    };
    
  } catch (error) {
    console.error('❌ Error verifying user data:', error);
    return { exists: false, error: error.message };
  }
};

// Test follow persistence (check after page reload simulation)
window.testFollowPersistence = async function(currentUid, targetUid) {
  console.log('=== TESTING FOLLOW PERSISTENCE ===');
  
  try {
    // Step 1: Follow user
    console.log('Step 1: Follow user');
    await window.testFollowFunctionImproved(currentUid, targetUid, true);
    
    // Step 2: Wait a moment
    console.log('Step 2: Wait 3 seconds...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Step 3: Check if follow persisted by re-reading data
    console.log('Step 3: Verify follow persisted');
    const currentUserData = await window.verifyUserData(currentUid);
    const targetUserData = await window.verifyUserData(targetUid);
    
    const isFollowing = currentUserData.following.includes(targetUid);
    const hasFollower = targetUserData.followers.includes(currentUid);
    
    console.log('Persistence check results:');
    console.log('- Current user is following target:', isFollowing);
    console.log('- Target user has current as follower:', hasFollower);
    
    if (isFollowing && hasFollower) {
      console.log('✅ Follow relationship persisted correctly!');
      return { success: true, persisted: true };
    } else {
      console.error('❌ Follow relationship did not persist properly');
      return { 
        success: false, 
        persisted: false, 
        isFollowing, 
        hasFollower,
        message: 'Follow relationship not properly persisted'
      };
    }
    
  } catch (error) {
    console.error('❌ Persistence test failed:', error);
    return { success: false, error: error.message };
  }
};

console.log('✅ Enhanced follow test functions loaded!');
console.log('Available functions:');
console.log('- testFollowFunctionImproved(currentUid, targetUid, shouldFollow)');
console.log('- testFollowCycle(currentUid, targetUid)');
console.log('- testFollowWithCurrentUser(targetUid, shouldFollow)');
console.log('- verifyUserData(userId)');
console.log('- testFollowPersistence(currentUid, targetUid)');
console.log('');
console.log('Example usage:');
console.log('testFollowWithCurrentUser("TARGET_USER_ID", true)');
console.log('verifyUserData("USER_ID")');
console.log('testFollowPersistence("CURRENT_USER_ID", "TARGET_USER_ID")');