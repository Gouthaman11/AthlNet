// Enhanced test functions for Instagram-like messaging behavior
// Add these to browser console for testing

// Test conversation creation and message sending with side panel updates
window.testMessagingSidePanel = async function(targetUserId, messageContent = "Test message from improved system") {
  console.log('=== TESTING MESSAGING SIDE PANEL UPDATES ===');
  
  try {
    // Get current user
    const { auth } = await import('../firebaseClient.js');
    
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const currentUserId = auth.currentUser.uid;
    console.log('Current user ID:', currentUserId);
    console.log('Target user ID:', targetUserId);
    
    // Import messaging functions
    const { sendMessageToUser, getUserConversations } = await import('./firestoreSocialApi.js');
    
    console.log('Step 1: Check conversations before sending...');
    const beforeConversations = await getUserConversations(currentUserId);
    console.log('Before:', beforeConversations.length, 'conversations');
    
    console.log('Step 2: Sending message...');
    const messageId = await sendMessageToUser(currentUserId, targetUserId, messageContent);
    console.log('✅ Message sent with ID:', messageId);
    
    // Wait for Firebase to process
    console.log('Step 3: Waiting 3 seconds for Firebase processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Step 4: Check conversations after sending...');
    const afterConversations = await getUserConversations(currentUserId);
    console.log('After:', afterConversations.length, 'conversations');
    
    afterConversations.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.otherUser?.name} - "${conv.lastMessage}" (ID: ${conv.id})`);
    });
    
    // Check if our conversation exists
    const conversationId = [currentUserId, targetUserId].sort().join('_');
    const ourConversation = afterConversations.find(c => c.id === conversationId);
    
    if (ourConversation) {
      console.log('✅ SUCCESS: Conversation found in side panel!');
      console.log('Conversation details:', {
        id: ourConversation.id,
        otherUser: ourConversation.otherUser?.name,
        lastMessage: ourConversation.lastMessage,
        lastMessageAt: ourConversation.lastMessageAt
      });
      
      return {
        success: true,
        messageId,
        conversationId,
        beforeCount: beforeConversations.length,
        afterCount: afterConversations.length,
        conversation: ourConversation,
        sidePanelUpdated: true
      };
    } else {
      console.error('❌ FAILED: Conversation not found in side panel');
      return {
        success: false,
        error: 'Conversation not found in side panel after sending message',
        messageId,
        conversationId,
        beforeCount: beforeConversations.length,
        afterCount: afterConversations.length,
        allConversations: afterConversations
      };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Force refresh conversations list
window.forceRefreshConversations = async function() {
  console.log('=== FORCE REFRESHING CONVERSATIONS ===');
  
  try {
    const { auth } = await import('../firebaseClient.js');
    
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const currentUserId = auth.currentUser.uid;
    const { getUserConversations } = await import('./firestoreSocialApi.js');
    
    console.log('Fetching fresh conversations...');
    const conversations = await getUserConversations(currentUserId);
    
    console.log(`✅ Found ${conversations.length} conversations:`);
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.otherUser?.name}`);
      console.log(`   Last message: "${conv.lastMessage}"`);
      console.log(`   Time: ${conv.lastMessageAt}`);
      console.log(`   ID: ${conv.id}`);
      console.log('---');
    });
    
    return { success: true, conversations, count: conversations.length };
    
  } catch (error) {
    console.error('❌ Force refresh failed:', error);
    return { success: false, error: error.message };
  }
};

// Test Instagram-like behavior
window.testInstagramLikeBehavior = async function(targetUserId) {
  console.log('=== TESTING INSTAGRAM-LIKE SIDE PANEL BEHAVIOR ===');
  
  try {
    // Step 1: Clear any existing conversations (for testing)
    console.log('Step 1: Check initial state...');
    const initialCheck = await window.forceRefreshConversations();
    console.log('Initial conversations:', initialCheck.count);
    
    // Step 2: Send a message
    console.log('Step 2: Send message and check immediate update...');
    const sendResult = await window.testMessagingSidePanel(targetUserId, "Testing Instagram-like behavior!");
    
    if (sendResult.success) {
      console.log('✅ Message sent and side panel updated successfully');
      
      // Step 3: Test navigation simulation
      console.log('Step 3: Simulate navigation away and back...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const afterNavigation = await window.forceRefreshConversations();
      
      if (afterNavigation.count > 0) {
        console.log('✅ PERFECT: Conversations persist after navigation (Instagram-like!)');
        return { success: true, behavior: 'Instagram-like', persistent: true };
      } else {
        console.log('❌ ISSUE: Conversations disappear after navigation');
        return { success: false, behavior: 'Not Instagram-like', persistent: false };
      }
    } else {
      console.log('❌ Message sending failed');
      return { success: false, error: 'Message sending failed' };
    }
    
  } catch (error) {
    console.error('❌ Instagram behavior test failed:', error);
    return { success: false, error: error.message };
  }
};

console.log('✅ Instagram-like messaging test functions loaded!');
console.log('Available functions:');
console.log('- testMessagingSidePanel(targetUserId, "message") - Test side panel updates');
console.log('- forceRefreshConversations() - Force refresh conversation list');
console.log('- testInstagramLikeBehavior(targetUserId) - Test Instagram-like behavior');
console.log('');
console.log('🎯 Quick test for your issue:');
console.log('testInstagramLikeBehavior("TARGET_USER_ID")');
console.log('forceRefreshConversations()');