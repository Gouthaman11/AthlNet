// Debug utilities for testing follow functionality
import { followUserSimple, getUserProfile } from './firestoreSocialApi';
import { db } from '../firebaseClient';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';

// Test basic Firestore connectivity
export async function testFirestoreConnection(userId) {
  console.log('=== TESTING FIRESTORE CONNECTION ===');
  console.log('DB instance:', db);
  console.log('User ID:', userId);
  
  if (!db) {
    console.error('❌ Firestore not initialized');
    return false;
  }
  
  try {
    // Test read operation
    console.log('1. Testing read operation...');
    const userRef = doc(db, 'users', userId);
    console.log('User ref path:', userRef.path);
    
    const userDoc = await getDoc(userRef);
    console.log('Document exists:', userDoc.exists());
    
    if (userDoc.exists()) {
      console.log('User data:', userDoc.data());
    } else {
      console.log('User document not found');
    }
    
    // Test write operation
    console.log('2. Testing write operation...');
    const testData = {
      lastTestTime: new Date().toISOString(),
      testCounter: (userDoc.data()?.testCounter || 0) + 1
    };
    
    await updateDoc(userRef, testData);
    console.log('✅ Write operation successful');
    
    // Verify write
    console.log('3. Verifying write...');
    const updatedDoc = await getDoc(userRef);
    console.log('Updated data:', updatedDoc.data());
    
    console.log('✅ Firestore connection test PASSED');
    return true;
    
  } catch (error) {
    console.error('❌ Firestore connection test FAILED:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      name: error.name
    });
    return false;
  }
}

// Test follow functionality
export async function testFollowFunction(currentUid, targetUid) {
  console.log('=== TESTING FOLLOW FUNCTIONALITY ===');
  console.log(`Current User: ${currentUid}`);
  console.log(`Target User: ${targetUid}`);
  
  try {
    // First test basic connectivity
    const connectivityTest = await testFirestoreConnection(currentUid);
    if (!connectivityTest) {
      console.error('❌ Connectivity test failed - aborting follow test');
      return false;
    }
    
    // Test getting user profiles
    console.log('1. Testing getUserProfile...');
    const currentUser = await getUserProfile(currentUid);
    const targetUser = await getUserProfile(targetUid);
    
    console.log('Current User Data:', currentUser);
    console.log('Target User Data:', targetUser);
    
    if (!currentUser) {
      console.error('❌ Current user not found');
      return false;
    }
    
    if (!targetUser) {
      console.error('❌ Target user not found');
      return false;
    }
    
    console.log('Current user following:', currentUser?.following || []);
    console.log('Target user followers:', targetUser?.followers || []);
    
    // Test follow operation
    console.log('2. Testing follow operation...');
    await followUserSimple(currentUid, targetUid, true);
    console.log('Follow operation completed');
    
    // Check results
    console.log('3. Checking results...');
    const updatedCurrentUser = await getUserProfile(currentUid);
    const updatedTargetUser = await getUserProfile(targetUid);
    
    console.log('Updated current user following:', updatedCurrentUser?.following || []);
    console.log('Updated target user followers:', updatedTargetUser?.followers || []);
    
    const isNowFollowing = updatedCurrentUser?.following?.includes(targetUid);
    const hasAsFollower = updatedTargetUser?.followers?.includes(currentUid);
    
    console.log('Is now following:', isNowFollowing);
    console.log('Target has as follower:', hasAsFollower);
    
    if (isNowFollowing && hasAsFollower) {
      console.log('✅ Follow test PASSED');
      return true;
    } else {
      console.log('❌ Follow test FAILED');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Follow test ERROR:', error);
    return false;
  }
}

// Test unfollow functionality  
export async function testUnfollowFunction(currentUid, targetUid) {
  console.log('=== TESTING UNFOLLOW FUNCTIONALITY ===');
  
  try {
    await followUserSimple(currentUid, targetUid, false);
    
    const currentUser = await getUserProfile(currentUid);
    const targetUser = await getUserProfile(targetUid);
    
    const isStillFollowing = currentUser?.following?.includes(targetUid);
    const stillHasAsFollower = targetUser?.followers?.includes(currentUid);
    
    console.log('Is still following:', isStillFollowing);
    console.log('Target still has as follower:', stillHasAsFollower);
    
    if (!isStillFollowing && !stillHasAsFollower) {
      console.log('✅ Unfollow test PASSED');
      return true;
    } else {
      console.log('❌ Unfollow test FAILED');
      return false;
    }
  } catch (error) {
    console.error('❌ Unfollow test ERROR:', error);
    return false;
  }
}

// Make functions available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testFirestoreConnection = testFirestoreConnection;
  window.testFollowFunction = testFollowFunction;
  window.testUnfollowFunction = testUnfollowFunction;
}