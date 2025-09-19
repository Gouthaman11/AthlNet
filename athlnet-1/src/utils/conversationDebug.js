// Comprehensive conversation debugging and fixing
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  getDoc,
  setDoc,
  addDoc,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../firebaseClient';
import { getUserProfile } from './firestoreSocialApi';

// Test if conversations exist for current user
window.checkUserConversations = async () => {
  console.log('=== CHECKING USER CONVERSATIONS ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return null;
  }
  
  console.log('Checking conversations for user:', user.uid);
  
  try {
    // Check conversations collection directly
    const conversationsRef = collection(db, 'conversations');
    const q = query(
      conversationsRef,
      where('members', 'array-contains', user.uid)
    );
    
    const snapshot = await getDocs(q);
    console.log('Found conversations:', snapshot.size);
    
    const conversations = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Conversation:', doc.id, data);
      conversations.push({ id: doc.id, ...data });
    });
    
    return conversations;
    
  } catch (error) {
    console.error('Error checking conversations:', error);
    return [];
  }
};

// Create a test conversation manually
window.createTestConversation = async (targetUserId) => {
  console.log('=== CREATING TEST CONVERSATION ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return;
  }
  
  if (!targetUserId) {
    console.error('Target user ID required');
    return;
  }
  
  try {
    // Create conversation document
    const conversationId = [user.uid, targetUserId].sort().join('_');
    const conversationRef = doc(db, 'conversations', conversationId);
    
    // Get target user data
    const targetUserData = await getUserProfile(targetUserId);
    const targetUserName = targetUserData ? 
      (targetUserData.displayName || targetUserData.name || 
       (targetUserData.personalInfo?.firstName && targetUserData.personalInfo?.lastName ? 
        `${targetUserData.personalInfo.firstName} ${targetUserData.personalInfo.lastName}` :
        targetUserData.personalInfo?.firstName || targetUserData.email?.split('@')[0] || 'Unknown User')
      ) : 'Unknown User';
    
    const conversationData = {
      members: [user.uid, targetUserId],
      participants: [user.uid, targetUserId],
      createdAt: new Date().toISOString(),
      lastMessage: 'Test conversation',
      lastMessageAt: new Date().toISOString(),
      lastMessageBy: user.uid,
      updatedAt: new Date().toISOString(),
      // Add metadata for easier debugging
      _metadata: {
        createdBy: user.uid,
        purpose: 'test_conversation',
        targetUser: {
          id: targetUserId,
          name: targetUserName
        }
      }
    };
    
    console.log('Creating conversation with data:', conversationData);
    await setDoc(conversationRef, conversationData);
    
    console.log('✅ Test conversation created:', conversationId);
    
    // Create a test message
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const messageData = {
      senderId: user.uid,
      recipientId: targetUserId,
      content: 'Test message to ensure conversation appears',
      createdAt: new Date().toISOString(),
      read: false,
      type: 'text',
      // Also include legacy field names for compatibility
      from: user.uid,
      to: targetUserId
    };
    
    const messageDoc = await addDoc(messagesRef, messageData);
    console.log('✅ Test message created:', messageDoc.id);
    
    return { conversationId, messageId: messageDoc.id };
    
  } catch (error) {
    console.error('Error creating test conversation:', error);
  }
};

// Fix conversations that exist but aren't showing
window.fixConversationsDisplay = async () => {
  console.log('=== FIXING CONVERSATIONS DISPLAY ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return;
  }
  
  try {
    // 1. Check what conversations exist
    const conversations = await window.checkUserConversations();
    console.log('Found conversations to fix:', conversations.length);
    
    if (conversations.length === 0) {
      console.log('No conversations found to fix');
      return;
    }
    
    // 2. Ensure each conversation has required fields
    for (const conv of conversations) {
      console.log(`Fixing conversation: ${conv.id}`);
      
      const updates = {};
      let needsUpdate = false;
      
      // Ensure members array exists
      if (!conv.members || !Array.isArray(conv.members)) {
        updates.members = conv.participants || [user.uid];
        needsUpdate = true;
      }
      
      // Ensure participants array exists
      if (!conv.participants || !Array.isArray(conv.participants)) {
        updates.participants = conv.members || [user.uid];
        needsUpdate = true;
      }
      
      // Ensure timestamps exist
      if (!conv.lastMessageAt) {
        updates.lastMessageAt = conv.createdAt || new Date().toISOString();
        needsUpdate = true;
      }
      
      if (!conv.createdAt) {
        updates.createdAt = new Date().toISOString();
        needsUpdate = true;
      }
      
      // Ensure lastMessage exists
      if (!conv.lastMessage) {
        updates.lastMessage = 'New conversation';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        const conversationRef = doc(db, 'conversations', conv.id);
        await setDoc(conversationRef, updates, { merge: true });
        console.log(`✅ Updated conversation ${conv.id}:`, updates);
      } else {
        console.log(`✅ Conversation ${conv.id} is properly formatted`);
      }
    }
    
    // 3. Force refresh the conversations in the UI
    if (window.forceRefreshConversations) {
      console.log('Triggering UI refresh...');
      window.forceRefreshConversations();
    }
    
    console.log('✅ Conversations display fix completed');
    
  } catch (error) {
    console.error('Error fixing conversations display:', error);
  }
};

// Test real-time subscription directly
window.testConversationSubscription = () => {
  console.log('=== TESTING CONVERSATION SUBSCRIPTION ===');
  
  const user = auth.currentUser;
  if (!user) {
    console.error('No user logged in');
    return;
  }
  
  const conversationsRef = collection(db, 'conversations');
  const q = query(
    conversationsRef,
    where('members', 'array-contains', user.uid),
    limit(50)
  );
  
  console.log('Setting up test subscription...');
  const unsubscribe = onSnapshot(q, (snapshot) => {
    console.log('🔔 Subscription fired - documents:', snapshot.size);
    
    snapshot.docs.forEach((doc, index) => {
      console.log(`Document ${index + 1}:`, doc.id, doc.data());
    });
    
    // Auto-unsubscribe after 10 seconds
    setTimeout(() => {
      console.log('Unsubscribing from test...');
      unsubscribe();
    }, 10000);
  }, (error) => {
    console.error('Subscription error:', error);
  });
  
  return unsubscribe;
};

console.log('🔧 Conversation debugging tools loaded:');
console.log('- checkUserConversations() - Check what conversations exist');
console.log('- createTestConversation(targetUserId) - Create test conversation');
console.log('- fixConversationsDisplay() - Fix conversation display issues');
console.log('- testConversationSubscription() - Test real-time updates');