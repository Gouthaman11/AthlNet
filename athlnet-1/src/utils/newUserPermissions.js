// New user permissions testing and debugging
import { 
  sendMessageToUser, 
  getUserProfile, 
  testStorageConnection 
} from './firestoreSocialApi';
import { auth } from '../firebaseClient';

// Test new user permissions
window.testNewUserPermissions = async (targetUserId, messageContent = "Hello! Testing permissions") => {
  console.log('=== TESTING NEW USER PERMISSIONS ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('❌ No user logged in');
    return { success: false, error: 'No user logged in' };
  }
  
  console.log('✅ Current user:', {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerified
  });
  
  if (!targetUserId) {
    console.error('❌ Target user ID is required');
    return { success: false, error: 'Target user ID required' };
  }
  
  try {
    // Step 1: Test basic Firebase connection
    console.log('1️⃣ Testing Firebase connection...');
    await testStorageConnection(user.uid);
    console.log('✅ Firebase connection successful');
    
    // Step 2: Test user profile access
    console.log('2️⃣ Testing user profile access...');
    const userProfile = await getUserProfile(user.uid);
    console.log('✅ User profile accessible:', !!userProfile);
    
    const targetProfile = await getUserProfile(targetUserId);
    console.log('✅ Target profile accessible:', !!targetProfile);
    console.log('Target user name:', targetProfile?.displayName || targetProfile?.name || 'Unknown');
    
    // Step 3: Test message sending (this tests both conversation creation and message creation)
    console.log('3️⃣ Testing message sending...');
    const messageId = await sendMessageToUser(user.uid, targetUserId, messageContent);
    console.log('✅ Message sent successfully with ID:', messageId);
    
    return {
      success: true,
      messageId,
      userProfile,
      targetProfile
    };
    
  } catch (error) {
    console.error('❌ Permission test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    });
    
    // Provide specific help based on error type
    if (error.code === 'permission-denied') {
      console.log('🔧 PERMISSION DENIED - This suggests Firebase security rules are blocking the operation');
      console.log('🔧 Possible causes:');
      console.log('   - User not properly authenticated');
      console.log('   - Firebase rules not deployed');
      console.log('   - User missing in conversations members/participants array');
      console.log('🔧 Try running: firebase deploy --only firestore:rules');
    } else if (error.code === 'not-found') {
      console.log('🔧 NOT FOUND - Document or collection doesn\'t exist yet (this might be normal for first message)');
    } else if (error.code === 'unavailable') {
      console.log('🔧 UNAVAILABLE - Firebase service temporarily unavailable');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error
    };
  }
};

// Test conversation creation specifically
window.testConversationCreation = async (targetUserId) => {
  console.log('=== TESTING CONVERSATION CREATION ===');
  
  const user = auth.currentUser;
  if (!user || !targetUserId) {
    console.error('❌ User and target user ID required');
    return;
  }
  
  try {
    const { collection, doc, setDoc } = await import('firebase/firestore');
    const { db } = await import('../firebaseClient');
    
    const conversationId = [user.uid, targetUserId].sort().join('_');
    console.log('Testing conversation ID:', conversationId);
    
    const conversationData = {
      members: [user.uid, targetUserId],
      participants: [user.uid, targetUserId],
      createdAt: new Date().toISOString(),
      lastMessage: 'Test conversation creation',
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: user.uid,
      updatedAt: new Date().toISOString()
    };
    
    console.log('Creating conversation with data:', conversationData);
    
    const conversationRef = doc(db, 'conversations', conversationId);
    await setDoc(conversationRef, conversationData);
    
    console.log('✅ Conversation created successfully');
    return { success: true, conversationId };
    
  } catch (error) {
    console.error('❌ Conversation creation failed:', error);
    return { success: false, error };
  }
};

// Enhanced error handler for messaging
window.handleMessagingError = (error, context = 'messaging operation') => {
  console.error(`❌ Error during ${context}:`, error);
  
  const errorMessages = {
    'permission-denied': 'Permission denied. Check Firebase security rules and user authentication.',
    'not-found': 'Document not found. This might be normal for first-time operations.',
    'unavailable': 'Firebase service temporarily unavailable. Please try again.',
    'unauthenticated': 'User not authenticated. Please log in again.',
    'invalid-argument': 'Invalid data provided. Check required fields.',
    'deadline-exceeded': 'Operation timed out. Please try again.',
    'resource-exhausted': 'Too many requests. Please wait and try again.'
  };
  
  const friendlyMessage = errorMessages[error.code] || `Unknown error: ${error.message}`;
  
  console.log('🔧 User-friendly error:', friendlyMessage);
  console.log('🔧 Error code:', error.code);
  console.log('🔧 Full error:', error);
  
  return friendlyMessage;
};

console.log('🧪 New user permission testing tools loaded:');
console.log('- testNewUserPermissions(targetUserId, message) - Test full messaging flow');
console.log('- testConversationCreation(targetUserId) - Test conversation creation only');
console.log('- handleMessagingError(error, context) - Get friendly error messages');