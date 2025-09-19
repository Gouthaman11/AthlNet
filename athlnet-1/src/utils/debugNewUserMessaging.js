// Debug utilities for testing new user messaging issues
import { 
  searchUsers, 
  sendMessageToUser, 
  getUserProfile, 
  createUserProfile 
} from './firestoreSocialApi';
import { safeLog } from './safeLogging';
import { auth } from '../firebaseClient';

// Test if new user can be found in search
const testNewUserSearch = async (searchTerm = '') => {
  console.log('=== TESTING NEW USER SEARCH ===');
  
  if (!searchTerm) {
    const user = auth.currentUser;
    if (user && user.displayName) {
      searchTerm = user.displayName.split(' ')[0]; // Use first name
    } else if (user && user.email) {
      searchTerm = user.email.split('@')[0]; // Use email prefix
    } else {
      console.error('❌ No search term provided and no current user info available');
      return { success: false, error: 'No search term' };
    }
  }
  
  try {
    safeLog.log('Searching for users with term:', searchTerm);
    const searchResults = await searchUsers(searchTerm, 10);
    safeLog.log('Search results:', searchResults.length);
    
    searchResults.forEach((user, index) => {
      safeLog.log(`User ${index + 1}:`, {
        uid: user.uid,
        name: user.name,
        displayName: user.displayName,
        email: user.email,
        hasProfile: !!user.personalInfo
      });
    });
    
    return {
      success: true,
      searchTerm,
      resultsCount: searchResults.length,
      results: searchResults
    };
    
  } catch (error) {
    safeLog.error('Search failed:', error);
    return { success: false, error };
  }
};

// Test if a user profile exists and is properly set up
const testUserProfile = async (userId) => {
  console.log('=== TESTING USER PROFILE ===');
  
  if (!userId) {
    const user = auth.currentUser;
    userId = user?.uid;
  }
  
  if (!userId) {
    console.error('❌ No user ID provided');
    return { success: false, error: 'No user ID' };
  }
  
  try {
    const profile = await getUserProfile(userId);
    safeLog.log('User profile:', profile);
    
    const analysis = {
      exists: !!profile,
      hasBasicInfo: !!(profile?.email || profile?.displayName || profile?.name),
      hasPersonalInfo: !!profile?.personalInfo,
      hasName: !!(profile?.personalInfo?.firstName || profile?.personalInfo?.lastName || profile?.name || profile?.displayName),
      createdAt: profile?.createdAt,
      updatedAt: profile?.updatedAt
    };
    
    safeLog.log('Profile analysis:', analysis);
    
    return {
      success: true,
      profile,
      analysis
    };
    
  } catch (error) {
    safeLog.error('Failed to get user profile:', error);
    return { success: false, error };
  }
};

// Create or update user profile for messaging
const fixUserProfileForMessaging = async (userId) => {
  console.log('=== FIXING USER PROFILE FOR MESSAGING ===');
  
  const user = auth.currentUser;
  if (!userId) {
    userId = user?.uid;
  }
  
  if (!userId) {
    console.error('❌ No user ID provided');
    return { success: false, error: 'No user ID' };
  }
  
  try {
    // Get existing profile
    let existingProfile = await getUserProfile(userId);
    safeLog.log('Existing profile:', existingProfile);
    
    // If no profile exists, create one
    if (!existingProfile && user && user.uid === userId) {
      safeLog.log('Creating new profile for current user...');
      
      const newProfileData = {
        email: user.email,
        displayName: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        personalInfo: {
          firstName: user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User',
          lastName: user.displayName?.split(' ')[1] || '',
          title: 'Athlete',
          primarySport: 'General',
          location: '',
          sports: ['General']
        },
        stats: {
          followers: 0,
          following: 0,
          posts: 0
        },
        followers: [],
        following: [],
        isOnline: true
      };
      
      // Create the profile using Firebase Auth user info
      await createUserProfile(userId, newProfileData);
      safeLog.log('✅ New profile created');
      
      // Verify it was created
      existingProfile = await getUserProfile(userId);
      safeLog.log('Verified new profile:', existingProfile);
    }
    
    return {
      success: true,
      profile: existingProfile,
      created: !existingProfile
    };
    
  } catch (error) {
    safeLog.error('Failed to fix user profile:', error);
    return { success: false, error };
  }
};

// Comprehensive test for new user messaging
const testNewUserMessaging = async (targetUserId, message = 'Hello! This is a test message.') => {
  console.log('=== COMPREHENSIVE NEW USER MESSAGING TEST ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user logged in');
    return { success: false, error: 'No user logged in' };
  }
  
  try {
    // Step 1: Check current user profile
    safeLog.log('1️⃣ Checking current user profile...');
    const currentUserTest = await testUserProfile(user.uid);
    if (!currentUserTest.success) {
      safeLog.log('Fixing current user profile...');
      await fixUserProfileForMessaging(user.uid);
    }
    
    // Step 2: Check target user profile
    safeLog.log('2️⃣ Checking target user profile...');
    const targetUserTest = await testUserProfile(targetUserId);
    if (!targetUserTest.success) {
      safeLog.error('Target user profile not found:', targetUserId);
      return { success: false, error: 'Target user profile not found' };
    }
    
    // Step 3: Test search functionality
    safeLog.log('3️⃣ Testing search functionality...');
    const targetName = targetUserTest.profile?.name || targetUserTest.profile?.displayName || 'Unknown';
    const searchTerm = targetName.split(' ')[0];
    const searchTest = await testNewUserSearch(searchTerm);
    const userFoundInSearch = searchTest.results?.some(u => u.uid === targetUserId);
    safeLog.log('Target user found in search:', userFoundInSearch);
    
    // Step 4: Test message sending
    safeLog.log('4️⃣ Testing message sending...');
    const messageId = await sendMessageToUser(user.uid, targetUserId, message);
    safeLog.log('✅ Message sent successfully with ID:', messageId);
    
    return {
      success: true,
      messageId,
      currentUserProfile: currentUserTest.profile,
      targetUserProfile: targetUserTest.profile,
      foundInSearch: userFoundInSearch
    };
    
  } catch (error) {
    safeLog.error('Comprehensive test failed:', error);
    return { success: false, error };
  }
};

// Clean up any test data
const cleanupTestData = async () => {
  safeLog.log('🧹 Cleaning up test data...');
  // Add cleanup logic if needed in the future
  safeLog.log('✅ Cleanup completed');
};

// Make utilities available globally for console debugging
window.debugNewUserMessaging = {
  testNewUserSearch,
  testUserProfile,
  fixUserProfileForMessaging,
  testNewUserMessaging,
  cleanupTestData
};

console.log('🧪 New user messaging debug tools loaded:');
console.log('- testNewUserSearch(searchTerm) - Test if users can be found in search');
console.log('- testUserProfile(userId) - Check if user profile exists and is complete');
console.log('- fixUserProfileForMessaging(userId) - Create/fix user profile');
console.log('- testNewUserMessaging(targetUserId, message) - Comprehensive messaging test');