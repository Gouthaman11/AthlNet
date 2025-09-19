// Debug messaging functions for browser console testing
import { getUserConversations, subscribeToUserConversations } from './firestoreSocialApi';
import { auth } from '../firebaseClient';

// Test conversation loading directly
window.testConversationLoading = async () => {
  console.log('=== TESTING CONVERSATION LOADING ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return;
  }
  
  console.log('Testing for user ID:', user.uid);
  
  try {
    // Test direct loading
    console.log('1. Testing direct conversation loading...');
    const directConversations = await getUserConversations(user.uid);
    console.log('Direct load result:', directConversations);
    console.log('Direct load count:', directConversations.length);
    
    if (directConversations.length > 0) {
      directConversations.forEach((conv, index) => {
        console.log(`Conversation ${index + 1}:`, {
          id: conv.id,
          otherUser: conv.otherUser?.name,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt
        });
      });
    }
    
    // Test subscription
    console.log('2. Testing subscription...');
    const unsubscribe = subscribeToUserConversations(user.uid, (conversations) => {
      console.log('Subscription received conversations:', conversations.length);
      conversations.forEach((conv, index) => {
        console.log(`Subscription Conversation ${index + 1}:`, {
          id: conv.id,
          otherUser: conv.otherUser?.name,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt
        });
      });
      
      // Unsubscribe after first update
      setTimeout(() => {
        console.log('Unsubscribing...');
        unsubscribe();
      }, 2000);
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
};

// Check current app state
window.checkMessagingState = () => {
  console.log('=== CURRENT MESSAGING STATE ===');
  
  // Try to access React state if available
  const conversationsDebug = window.getConversationsDebug?.();
  if (conversationsDebug) {
    console.log('App state:', conversationsDebug);
  } else {
    console.log('App debug function not available');
  }
  
  // Check if conversations are in localStorage or sessionStorage
  console.log('Local storage keys:', Object.keys(localStorage));
  console.log('Session storage keys:', Object.keys(sessionStorage));
  
  return conversationsDebug;
};

// Force conversation refresh
window.debugForceRefresh = () => {
  console.log('=== FORCING CONVERSATION REFRESH ===');
  
  if (window.forceRefreshConversations) {
    window.forceRefreshConversations();
  } else {
    console.log('Force refresh function not available');
  }
};

console.log('🛠️ Debug messaging functions loaded:');
console.log('- testConversationLoading()');
console.log('- checkMessagingState()');
console.log('- debugForceRefresh()');