// Messaging Debug and Fix Utility
// This utility helps debug and fix conversation loading issues

import { collection, getDocs, query, where, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';

/**
 * Debug current user's conversations
 * @param {string} userId - Current user ID
 */
export const debugUserConversations = async (userId) => {
  try {
    console.log('🔍 Debugging conversations for user:', userId);
    
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    
    console.log('📊 Found', snapshot.docs.length, 'conversations');
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      console.log('📄 Conversation', docSnap.id, ':', {
        members: data.members,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt,
        lastMessageBy: data.lastMessageBy
      });
      
      // Check if this conversation has messages
      const messagesRef = collection(db, 'conversations', docSnap.id, 'messages');
      const messagesSnapshot = await getDocs(messagesRef);
      console.log('💬 Messages in conversation', docSnap.id, ':', messagesSnapshot.docs.length);
    }
    
    return snapshot.docs.length;
  } catch (error) {
    console.error('❌ Error debugging conversations:', error);
    return 0;
  }
};

/**
 * Fix conversation data to ensure proper loading
 * @param {string} userId - Current user ID
 */
export const fixUserConversations = async (userId) => {
  try {
    console.log('🔧 Fixing conversations for user:', userId);
    
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    
    console.log('📊 Processing', snapshot.docs.length, 'conversations');
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const conversationId = docSnap.id;
      
      console.log('🔧 Fixing conversation:', conversationId);
      
      // Ensure required fields exist
      const updateData = {};
      
      if (!data.members && data.participants) {
        updateData.members = data.participants;
      }
      
      if (!data.lastMessageAt) {
        updateData.lastMessageAt = data.createdAt || new Date().toISOString();
      }
      
      if (!data.lastMessage) {
        // Try to get the last message from the messages subcollection
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        
        if (messagesSnapshot.docs.length > 0) {
          const lastMessage = messagesSnapshot.docs[messagesSnapshot.docs.length - 1].data();
          updateData.lastMessage = lastMessage.content || 'Message';
          updateData.lastMessageAt = lastMessage.createdAt || new Date().toISOString();
          updateData.lastMessageBy = lastMessage.senderId || lastMessage.from;
        }
      }
      
      // Update if we have changes
      if (Object.keys(updateData).length > 0) {
        const conversationRef = doc(db, 'conversations', conversationId);
        await updateDoc(conversationRef, updateData);
        console.log('✅ Updated conversation:', conversationId, updateData);
      }
    }
    
    console.log('✅ Conversation fixing completed');
    return true;
  } catch (error) {
    console.error('❌ Error fixing conversations:', error);
    return false;
  }
};

/**
 * Get enhanced user conversations with better error handling
 * @param {string} userId - User ID
 */
export const getEnhancedUserConversations = async (userId) => {
  try {
    console.log('📥 Getting enhanced conversations for user:', userId);
    
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    
    const conversations = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const members = data.members || data.participants || [];
      const otherUserId = members.find(id => id !== userId);
      
      if (otherUserId) {
        try {
          // Get other user's profile
          const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
          let otherUser = { id: otherUserId, name: 'Unknown User', profileImage: null, isOnline: false };
          
          if (otherUserDoc.exists()) {
            const userData = otherUserDoc.data();
            otherUser = {
              id: otherUserId,
              name: userData.name || userData.displayName || 
                    (userData.personalInfo?.firstName && userData.personalInfo?.lastName ? 
                     `${userData.personalInfo.firstName} ${userData.personalInfo.lastName}` :
                     userData.personalInfo?.firstName || userData.email?.split('@')[0] || 'Unknown User'),
              profileImage: userData.profileImage || userData.photoURL,
              isOnline: userData.isOnline || false
            };
          }
          
          // Get unread count
          let unreadCount = 0;
          try {
            const messagesRef = collection(db, 'conversations', docSnap.id, 'messages');
            const unreadQuery = query(
              messagesRef,
              where('recipientId', '==', userId),
              where('read', '==', false)
            );
            const unreadSnapshot = await getDocs(unreadQuery);
            unreadCount = unreadSnapshot.size;
          } catch (unreadError) {
            console.warn('Could not get unread count for conversation:', docSnap.id);
            unreadCount = 0;
          }
          
          conversations.push({
            id: docSnap.id,
            members: members,
            participants: members, // For compatibility
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt || data.createdAt || new Date().toISOString(),
            lastMessageBy: data.lastMessageBy || null,
            unreadCount: unreadCount,
            otherUser: otherUser,
            createdAt: data.createdAt || new Date().toISOString()
          });
          
        } catch (error) {
          console.warn('Error processing conversation:', docSnap.id, error);
        }
      }
    }
    
    // Sort by last message time (newest first)
    conversations.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt).getTime();
      const timeB = new Date(b.lastMessageAt).getTime();
      return timeB - timeA;
    });
    
    console.log('✅ Enhanced conversations loaded:', conversations.length);
    return conversations;
    
  } catch (error) {
    console.error('❌ Error getting enhanced conversations:', error);
    return [];
  }
};

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.debugUserConversations = debugUserConversations;
  window.fixUserConversations = fixUserConversations;
  window.getEnhancedUserConversations = getEnhancedUserConversations;
}