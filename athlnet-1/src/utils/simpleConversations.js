// Simple conversation loader without real-time subscriptions for debugging
import { db } from '../firebaseClient';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { getUserProfile } from './firestoreSocialApi';

export async function getSimpleUserConversations(userId) {
  try {
    console.log('=== SIMPLE USER CONVERSATIONS ===');
    console.log('Getting conversations for user:', userId);
    
    if (!db) {
      throw new Error('Firestore not initialized');
    }
    
    const conversationsRef = collection(db, 'conversations');
    const q = query(conversationsRef, where('members', 'array-contains', userId));
    const snapshot = await getDocs(q);
    
    console.log('Raw conversations found:', snapshot.docs.length);
    
    const conversations = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      console.log('Processing conversation:', docSnap.id, {
        members: data.members,
        lastMessage: data.lastMessage,
        lastMessageAt: data.lastMessageAt
      });
      
      const members = data.members || data.participants || [];
      const otherUserId = members.find(id => id !== userId);
      
      if (otherUserId) {
        // Get basic user info
        let otherUser = {
          id: otherUserId,
          name: 'Unknown User',
          profileImage: null,
          isOnline: false
        };
        
        try {
          const userDoc = await getDoc(doc(db, 'users', otherUserId));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            otherUser.name = userData.displayName || userData.name || 
                           userData.personalInfo?.firstName || 
                           userData.email?.split('@')[0] || 'Unknown User';
            otherUser.profileImage = userData.profileImage || userData.photoURL;
            otherUser.isOnline = userData.isOnline || false;
          }
        } catch (userError) {
          console.warn('Could not get user data for:', otherUserId, userError.message);
        }
        
        conversations.push({
          id: docSnap.id,
          members: members,
          lastMessage: data.lastMessage || '',
          lastMessageAt: data.lastMessageAt || data.createdAt || new Date().toISOString(),
          lastMessageBy: data.lastMessageBy || null,
          unreadCount: 0, // Simplified - no unread count for now
          otherUser: otherUser,
          createdAt: data.createdAt || new Date().toISOString()
        });
      }
    }
    
    // Sort by last message time
    const sortedConversations = conversations.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA;
    });
    
    console.log('Returning', sortedConversations.length, 'conversations');
    sortedConversations.forEach((conv, idx) => {
      console.log(`${idx + 1}. ${conv.otherUser.name}: "${conv.lastMessage}"`);
    });
    
    return sortedConversations;
  } catch (error) {
    console.error('Error in getSimpleUserConversations:', error);
    return [];
  }
}