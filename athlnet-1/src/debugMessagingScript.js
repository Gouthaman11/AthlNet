// Messaging Debug Console Script
// Run this in the browser console to debug and fix messaging issues

async function debugAndFixMessaging() {
  try {
    console.log('🔧 Starting messaging debug and fix...');
    
    // Import Firebase functions
    const { auth } = await import('./src/firebaseClient');
    const { 
      debugUserConversations, 
      fixUserConversations, 
      getEnhancedUserConversations 
    } = await import('./src/utils/messagingFixes');
    
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No user is currently logged in');
      return false;
    }

    console.log('👤 Current user:', user.uid, user.email);
    
    // Step 1: Debug current conversations
    console.log('\n=== Step 1: Debugging Conversations ===');
    const conversationCount = await debugUserConversations(user.uid);
    
    // Step 2: Fix conversation data
    console.log('\n=== Step 2: Fixing Conversations ===');
    await fixUserConversations(user.uid);
    
    // Step 3: Load enhanced conversations
    console.log('\n=== Step 3: Loading Enhanced Conversations ===');
    const conversations = await getEnhancedUserConversations(user.uid);
    
    console.log('\n📊 RESULTS:');
    console.log('Total conversations found:', conversations.length);
    
    conversations.forEach((conv, index) => {
      console.log(`${index + 1}. ${conv.otherUser.name}:`);
      console.log(`   ID: ${conv.id}`);
      console.log(`   Last Message: "${conv.lastMessage}"`);
      console.log(`   Last Message At: ${conv.lastMessageAt}`);
      console.log(`   Unread: ${conv.unreadCount}`);
    });
    
    console.log('\n✅ Messaging debug completed!');
    console.log('🔄 Refresh the messages page to see updated conversations');
    
    return conversations;
    
  } catch (error) {
    console.error('❌ Error in messaging debug:', error);
    return false;
  }
}

// Auto-run the debug
debugAndFixMessaging();