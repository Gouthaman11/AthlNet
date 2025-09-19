// Test functions for messaging system debugging
// Add these to browser console for testing

// Test conversation creation and message sending
window.testMessagingSystem = async function(targetUserId, messageContent = "Test message") {
  console.log('=== TESTING MESSAGING SYSTEM ===');
  
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
    const { sendMessageToUser, getUserConversations, getConversationMessages } = await import('./firestoreSocialApi.js');
    
    console.log('Step 1: Sending message...');
    const messageId = await sendMessageToUser(currentUserId, targetUserId, messageContent);
    console.log('✅ Message sent with ID:', messageId);
    
    // Wait a moment for Firebase to process
    console.log('Step 2: Waiting 3 seconds for Firebase processing...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('Step 3: Checking conversations list...');
    const conversations = await getUserConversations(currentUserId);
    console.log('✅ Found conversations:', conversations.length);
    conversations.forEach((conv, index) => {
      console.log(`Conversation ${index + 1}:`, {
        id: conv.id,
        otherUser: conv.otherUser?.name,
        lastMessage: conv.lastMessage,
        lastMessageAt: conv.lastMessageAt
      });
    });
    
    // Check if our conversation exists
    const conversationId = [currentUserId, targetUserId].sort().join('_');
    const ourConversation = conversations.find(c => c.id === conversationId);
    
    if (ourConversation) {
      console.log('✅ Found our conversation:', ourConversation.id);
      
      console.log('Step 4: Checking messages in conversation...');
      const messages = await getConversationMessages(currentUserId, targetUserId);
      console.log('✅ Found messages:', messages.length);
      messages.forEach((msg, index) => {
        console.log(`Message ${index + 1}:`, {
          content: msg.content,
          from: msg.sender?.name,
          createdAt: msg.createdAt
        });
      });
      
      return {
        success: true,
        messageId,
        conversationId,
        conversationsCount: conversations.length,
        messagesCount: messages.length,
        conversation: ourConversation
      };
    } else {
      console.error('❌ Our conversation not found in list');
      return {
        success: false,
        error: 'Conversation not found in list after sending message',
        messageId,
        conversationId,
        allConversations: conversations
      };
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test conversation subscription
window.testConversationSubscription = async function() {
  console.log('=== TESTING CONVERSATION SUBSCRIPTION ===');
  
  try {
    // Get current user
    const { auth } = await import('../firebaseClient.js');
    
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const currentUserId = auth.currentUser.uid;
    console.log('Setting up subscription for user:', currentUserId);
    
    // Import subscription function
    const { subscribeToUserConversations } = await import('./firestoreSocialApi.js');
    
    // Set up subscription
    const unsubscribe = subscribeToUserConversations(currentUserId, (conversations) => {
      console.log('🔄 SUBSCRIPTION UPDATE - Conversations received:', conversations.length);
      conversations.forEach((conv, index) => {
        console.log(`  ${index + 1}. ${conv.otherUser?.name} - "${conv.lastMessage}" (${conv.lastMessageAt})`);
      });
    });
    
    console.log('✅ Subscription set up successfully');
    console.log('You should see conversation updates in the console');
    console.log('To stop subscription, call: unsubscribe()');
    
    // Store unsubscribe function globally for easy access
    window.unsubscribeConversations = unsubscribe;
    
    return { success: true, unsubscribe };
    
  } catch (error) {
    console.error('❌ Subscription test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test Firebase rules for conversations
window.testConversationRules = async function() {
  console.log('=== TESTING CONVERSATION RULES ===');
  
  try {
    const { auth, db } = await import('../firebaseClient.js');
    const { doc, getDoc, setDoc } = await import('firebase/firestore');
    
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const currentUserId = auth.currentUser.uid;
    const testConversationId = `test_${currentUserId}_${Date.now()}`;
    
    console.log('Testing conversation creation with ID:', testConversationId);
    
    // Try to create a test conversation
    const testData = {
      members: [currentUserId, 'test_user_id'],
      participants: [currentUserId, 'test_user_id'],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      lastMessage: 'Test conversation',
      lastMessageBy: currentUserId
    };
    
    const conversationRef = doc(db, 'conversations', testConversationId);
    await setDoc(conversationRef, testData);
    console.log('✅ Test conversation created');
    
    // Try to read it back
    const docSnap = await getDoc(conversationRef);
    if (docSnap.exists()) {
      console.log('✅ Test conversation read successfully:', docSnap.data());
      return { success: true, data: docSnap.data() };
    } else {
      console.error('❌ Could not read test conversation');
      return { success: false, error: 'Could not read test conversation' };
    }
    
  } catch (error) {
    console.error('❌ Rules test failed:', error);
    return { success: false, error: error.message };
  }
};

// Check current conversations manually
window.checkConversations = async function() {
  console.log('=== CHECKING CURRENT CONVERSATIONS ===');
  
  try {
    const { auth } = await import('../firebaseClient.js');
    
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    
    const currentUserId = auth.currentUser.uid;
    const { getUserConversations } = await import('./firestoreSocialApi.js');
    
    console.log('Fetching conversations for user:', currentUserId);
    const conversations = await getUserConversations(currentUserId);
    
    console.log(`Found ${conversations.length} conversations:`);
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. ID: ${conv.id}`);
      console.log(`   Other user: ${conv.otherUser?.name}`);
      console.log(`   Last message: "${conv.lastMessage}"`);
      console.log(`   Last message at: ${conv.lastMessageAt}`);
      console.log(`   Unread count: ${conv.unreadCount}`);
      console.log('---');
    });
    
    return { success: true, conversations };
    
  } catch (error) {
    console.error('❌ Check conversations failed:', error);
    return { success: false, error: error.message };
  }
};

console.log('✅ Messaging test functions loaded!');
console.log('Available functions:');
console.log('- testMessagingSystem(targetUserId, "message") - Test sending a message');
console.log('- testConversationSubscription() - Test real-time subscription');
console.log('- testConversationRules() - Test Firebase rules');
console.log('- checkConversations() - Check current conversations');
console.log('');
console.log('Example usage:');
console.log('testMessagingSystem("TARGET_USER_ID", "Hello there!")');
console.log('checkConversations()');
console.log('testConversationSubscription()');