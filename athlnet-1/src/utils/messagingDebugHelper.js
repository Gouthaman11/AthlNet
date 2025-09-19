// Messaging Debug Helper - Simple utilities for debugging messaging issues
import { safeLog } from './safeLogging';
import { getUserConversations, sendMessageToUser } from './firestoreSocialApi';

// Quick conversation check
window.checkConversations = async (userId) => {
  try {
    safeLog.log('🔍 Checking conversations for user:', userId);
    const conversations = await getUserConversations(userId);
    safeLog.log('📋 Found conversations:', conversations.length);
    
    conversations.forEach((conv, index) => {
      safeLog.log(`${index + 1}. ${conv.otherUser?.name || 'Unknown'} - Last: "${conv.lastMessage}" at ${conv.lastMessageAt}`);
    });
    
    return conversations;
  } catch (error) {
    safeLog.error('❌ Error checking conversations:', error);
    return [];
  }
};

// Quick message send test
window.testSendMessage = async (fromUserId, toUserId, message = 'Test message') => {
  try {
    safeLog.log('📤 Testing message send...');
    safeLog.log('From:', fromUserId);
    safeLog.log('To:', toUserId);
    safeLog.log('Message:', message);
    
    const messageId = await sendMessageToUser(fromUserId, toUserId, message);
    safeLog.log('✅ Message sent successfully with ID:', messageId);
    
    return messageId;
  } catch (error) {
    safeLog.error('❌ Error sending test message:', error);
    throw error;
  }
};

// Force refresh messaging page
window.refreshMessaging = () => {
  if (window.forceRefreshConversations) {
    safeLog.log('🔄 Forcing conversation refresh...');
    window.forceRefreshConversations();
  } else {
    safeLog.warn('Refresh function not available - reload the messaging page');
  }
};

safeLog.log('🔧 Messaging debug helpers loaded:');
safeLog.log('- checkConversations(userId)');
safeLog.log('- testSendMessage(fromUserId, toUserId, message)');
safeLog.log('- refreshMessaging()');

export { };