import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useSearchParams } from 'react-router-dom';
import { auth, db, isConfigured } from '../../firebaseClient';
import { 
  getUserConversations, 
  sendMessageToUser, 
  sendMessageSimple,
  getConversationMessages, 
  markMessagesAsRead,
  getUserProfile,
  subscribeToUserConversations,
  subscribeToConversationMessages,
  testStorageConnection,
  ensureUserDocumentExists
} from '../../utils/firestoreSocialApi';
import { 
  debugUserConversations, 
  fixUserConversations, 
  getEnhancedUserConversations 
} from '../../utils/messagingFixes';
import { safeLog } from '../../utils/safeLogging';
import { collection, addDoc, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import Header from '../../components/ui/Header';
import ConversationListFirebase from './components/ConversationListFirebase';
import ChatAreaFirebase from './components/ChatAreaFirebase';
import NewMessageModalFirebase from './components/NewMessageModalFirebase';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import '../../utils/testMessaging';
import '../../utils/testMessagingInstagram';
import '../../utils/debugMessaging';
import '../../utils/conversationDebug';
import '../../utils/newUserPermissions';
import '../../utils/debugPosts';
import '../../utils/messagingDebugHelper';
import { getSimpleUserConversations } from '../../utils/simpleConversations';

const MessagingPage = () => {
  const [user] = useAuthState(auth);
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [conversationsUnsubscribe, setConversationsUnsubscribe] = useState(null);
  const [messagesUnsubscribe, setMessagesUnsubscribe] = useState(null);
  const [connectionRetries, setConnectionRetries] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Get user ID from search params to start a conversation
  const targetUserId = searchParams.get('user');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (user?.uid && connectionRetries < 3) {
        console.log('Back online, retrying connection...');
        loadConversations();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user, connectionRetries]);

  // Manual refresh function for debugging
  window.forceRefreshConversations = () => {
    safeLog.log('🔄 Manual refresh triggered');
    safeLog.log('Current conversations before refresh:', conversations);
    loadConversations();
  };

  // Test function to check conversations directly
  window.testConversations = async () => {
    if (!user?.uid) {
      console.log('No user logged in');
      return;
    }
    
    console.log('=== TESTING CONVERSATIONS DIRECTLY ===');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    
    try {
      const conversationsRef = collection(db, 'conversations');
      const testQuery = query(conversationsRef, where('members', 'array-contains', user.uid));
      const snapshot = await getDocs(testQuery);
      
      console.log('Found', snapshot.docs.length, 'conversations');
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log('Conversation:', doc.id, data);
      });
      
      return snapshot.docs.length;
    } catch (error) {
      console.error('Error testing conversations:', error);
      return 0;
    }
  };

  // Add to window for debugging
  window.getConversationsDebug = () => {
    safeLog.log('=== CONVERSATIONS DEBUG ===');
    safeLog.log('Current conversations:', conversations);
    safeLog.log('Selected conversation:', selectedConversation);
    safeLog.log('Loading:', loading);
    safeLog.log('User ID:', user?.uid);
    return { conversations, selectedConversation, loading, userId: user?.uid };
  };

  // Test Firebase connectivity with better error handling
  const testFirebaseConnection = async () => {
    try {
      safeLog.log('=== TESTING FIREBASE CONNECTION ===');
      safeLog.log('Firebase config loaded:', isConfigured);
      safeLog.log('Firebase db object available:', !!db);
      safeLog.log('Firebase auth object available:', !!auth);
      safeLog.log('Current user available:', !!user);
      safeLog.log('Online status:', isOnline);
      
      if (!isOnline) {
        safeLog.warn('Device is offline');
        return false;
      }
      
      if (!isConfigured) {
        const errorMsg = 'Firebase not configured. Please check environment variables.';
        safeLog.error(errorMsg);
        if (connectionRetries === 0) {
          alert('Configuration Error: Firebase is not properly configured. Please contact support.');
        }
        return false;
      }
      
      if (!db) {
        const errorMsg = 'Firebase Firestore not available';
        safeLog.error(errorMsg);
        if (connectionRetries === 0) {
          alert('Service Error: Database service not available. Please refresh the page.');
        }
        return false;
      }

      if (!auth) {
        const errorMsg = 'Firebase Auth not available';
        safeLog.error(errorMsg);
        if (connectionRetries === 0) {
          alert('Authentication Error: Authentication service not available. Please refresh the page.');
        }
        return false;
      }
      
      if (!user) {
        const errorMsg = 'No user logged in';
        safeLog.error(errorMsg);
        return false;
      }
      
      // Test storage connection with timeout
      try {
        await Promise.race([
          testStorageConnection(user.uid),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Connection timeout')), 10000)
          )
        ]);
        safeLog.log('✅ Firebase connection test completed successfully');
        setConnectionRetries(0); // Reset retries on success
        return true;
      } catch (storageError) {
        safeLog.error('Storage connection test failed:', storageError);
        setConnectionRetries(prev => prev + 1);
        
        if (storageError.message.includes('timeout')) {
          if (connectionRetries === 0) {
            alert('Connection Timeout: Please check your internet connection and try again.');
          }
        } else if (storageError.code === 'permission-denied') {
          if (connectionRetries === 0) {
            alert('Permission Error: You may need to log out and log back in.');
          }
        } else {
          console.warn('Storage test failed but continuing...', storageError.message);
        }
        return connectionRetries < 2; // Continue even if storage test fails, but limit retries
      }
    } catch (error) {
      safeLog.error('Firebase connection test failed:', error);
      setConnectionRetries(prev => prev + 1);
      
      if (connectionRetries === 0) {
        alert(`Connection Error: ${error.message}\n\nPlease refresh the page and try again.`);
      }
      return false;
    }
  };

  // Run Firebase test when component mounts
  useEffect(() => {
    if (user?.uid && db) {
      testFirebaseConnection();
    }
  }, [user]);

  // Track conversation changes for debugging
  useEffect(() => {
    const conversationSummary = {
      count: conversations.length,
      conversations: conversations.map(c => ({ 
        id: c.id, 
        name: c.otherUser?.name, 
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageAt
      }))
    };
    safeLog.log('🔄 Conversations state changed:', conversationSummary);
  }, [conversations]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load conversations when user is available
  useEffect(() => {
    if (user?.uid) {
      loadConversations();
      
      // Set up periodic refresh as backup (every 30 seconds)
      const refreshInterval = setInterval(() => {
        if (conversations.length === 0) {
          console.log('🔄 Periodic refresh: No conversations, retrying...');
          loadConversations();
        }
      }, 30000);
      
      return () => {
        clearInterval(refreshInterval);
      };
    }
    
    // Cleanup subscriptions on unmount or user change
    return () => {
      if (conversationsUnsubscribe) {
        conversationsUnsubscribe();
        setConversationsUnsubscribe(null);
      }
      if (messagesUnsubscribe) {
        messagesUnsubscribe();
        setMessagesUnsubscribe(null);
      }
    };
  }, [user]);

  // Handle starting a conversation with a specific user
  useEffect(() => {
    if (targetUserId && user?.uid && !loading) {
      safeLog.log('URL parameter detected, starting conversation with:', targetUserId);
      startConversationWithUser(targetUserId);
    }
  }, [targetUserId, user, loading]);

  const loadConversations = async () => {
    if (!user?.uid) return;
    
    safeLog.log('🔄 Loading conversations for user:', user.uid);
    
    // Test connection first
    const connectionOk = await testFirebaseConnection();
    if (!connectionOk) {
      setLoading(false);
      return;
    }
    
    // Clean up existing subscription
    if (conversationsUnsubscribe) {
      safeLog.log('🧹 Cleaning up existing subscription');
      conversationsUnsubscribe();
    }
    
    setLoading(true);
    
    try {
      // Debug existing conversations first
      const conversationCount = await debugUserConversations(user.uid);
      safeLog.log('🔍 Debug found', conversationCount, 'conversations');
      
      // DIRECT SIMPLE TEST - Let's try the most basic query first
      safeLog.log('🔍 Testing direct Firestore query...');
      const { collection, query, where, getDocs } = await import('firebase/firestore');
      const conversationsRef = collection(db, 'conversations');
      const directQuery = query(conversationsRef, where('members', 'array-contains', user.uid));
      const directSnapshot = await getDocs(directQuery);
      safeLog.log('🔍 Direct query found', directSnapshot.docs.length, 'raw conversations');
      
      // Log each conversation found
      directSnapshot.docs.forEach(doc => {
        const data = doc.data();
        safeLog.log('🔍 Found conversation:', doc.id, {
          members: data.members,
          lastMessage: data.lastMessage,
          lastMessageAt: data.lastMessageAt,
          createdAt: data.createdAt
        });
      });
      
      // Fix any conversation data issues
      if (conversationCount > 0) {
        await fixUserConversations(user.uid);
        safeLog.log('🔧 Conversation data fixed');
      }
      
      // Load conversations with direct method (skip enhanced method for debugging)
      safeLog.log('📥 Loading conversations with simple method...');
      const simpleConversations = await getSimpleUserConversations(user.uid);
      safeLog.log('📥 Simple conversations loaded:', simpleConversations.length);
      
      if (simpleConversations.length > 0) {
        setConversations(simpleConversations);
        setLoading(false);
        
        // Auto-select first conversation if none selected and not targeting a user
        if (!selectedConversation && !searchParams.get('user')) {
          setSelectedConversation(simpleConversations[0]);
          loadMessages(simpleConversations[0].id, simpleConversations[0].otherUser.id);
        }
        
        // Skip subscription setup for now to avoid conflicts
        safeLog.log('✅ Conversations loaded successfully, skipping subscription for debugging');
        return;
      }
      
      // Fallback to the original method if simple method fails
      safeLog.log('📥 Simple method found no conversations, trying original method...');
      const directConversations = await getUserConversations(user.uid);
      safeLog.log('📥 Direct conversations loaded:', directConversations.length);
      
      if (directConversations.length > 0) {
        const sortedConversations = directConversations.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || 0).getTime();
          return timeB - timeA;
        });
        
        setConversations(sortedConversations);
        setLoading(false);
        
        // Auto-select first conversation if none selected and not targeting a user
        if (!selectedConversation && !searchParams.get('user')) {
          setSelectedConversation(sortedConversations[0]);
          loadMessages(sortedConversations[0].id, sortedConversations[0].otherUser.id);
        }
      } else {
        safeLog.log('📥 No direct conversations found, checking enhanced method...');
        // Try enhanced method as fallback
        const enhancedConversations = await getEnhancedUserConversations(user.uid);
        safeLog.log('📥 Enhanced conversations loaded:', enhancedConversations.length);
        
        if (enhancedConversations.length > 0) {
          setConversations(enhancedConversations);
          setLoading(false);
          
          // Auto-select first conversation if none selected and not targeting a user
          if (!selectedConversation && !searchParams.get('user')) {
            setSelectedConversation(enhancedConversations[0]);
            loadMessages(enhancedConversations[0].id, enhancedConversations[0].otherUser.id);
          }
        } else {
          setLoading(false);
          safeLog.log('📥 No conversations found with any method');
        }
      }
      
      // Set up real-time subscription (temporarily disabled for debugging)
      safeLog.log('🔔 Setting up real-time subscription...');
      const unsubscribe = subscribeToUserConversations(user.uid, (userConversations) => {
        safeLog.log('🔔 Subscription update:', userConversations.length, 'conversations');
        
        // Only update if we get more conversations than currently loaded
        if (userConversations.length > 0) {
          const sortedConversations = userConversations.sort((a, b) => {
            const timeA = new Date(a.lastMessageAt || 0).getTime();
            const timeB = new Date(b.lastMessageAt || 0).getTime();
            return timeB - timeA;
          });
          
          safeLog.log('🔔 Updating conversations via subscription');
          setConversations(sortedConversations);
          
          // Auto-select if needed
          if (sortedConversations.length > 0 && !selectedConversation && !searchParams.get('user')) {
            setSelectedConversation(sortedConversations[0]);
            loadMessages(sortedConversations[0].id, sortedConversations[0].otherUser.id);
          }
        } else {
          safeLog.log('🔔 Subscription returned empty, keeping existing conversations');
        }
      });
      
      setConversationsUnsubscribe(() => unsubscribe);
      
    } catch (error) {
      safeLog.error('❌ Error loading conversations:', error);
      
      // Handle specific error types
      if (error.code === 'permission-denied') {
        alert('Permission Denied: You may need to log out and log back in.');
      } else if (error.code === 'unavailable') {
        alert('Service Unavailable: Please check your internet connection and try again.');
      } else if (error.message?.includes('network')) {
        alert('Network Error: Please check your internet connection.');
      } else {
        alert(`Failed to load conversations: ${error.message}`);
      }
      
      setLoading(false);
      setConversations([]);
    }
  };

  const startConversationWithUser = async (userId) => {
    if (!user?.uid || userId === user.uid) return;

    safeLog.log('Starting conversation with user:', userId);

    try {
      // Check if conversation already exists in current list
      const existingConversation = conversations.find(conv => 
        conv.otherUser.id === userId
      );

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        setSelectedConversation(existingConversation);
        loadMessages(existingConversation.id, userId);
        return;
      }

      // Create new conversation context for UI
      safeLog.log('Creating new conversation context...');
      const otherUserData = await getUserProfile(userId);
      safeLog.log('Other user data loaded successfully');
      
      // Extract name using the same helper function as in the API
      const otherUserName = otherUserData ? 
        (otherUserData.displayName || otherUserData.name || 
         (otherUserData.personalInfo?.firstName && otherUserData.personalInfo?.lastName ? 
          `${otherUserData.personalInfo.firstName} ${otherUserData.personalInfo.lastName}` :
          otherUserData.personalInfo?.firstName || otherUserData.email?.split('@')[0] || 'Unknown User')
        ) : 'Unknown User';
      
      const newConversation = {
        id: [user.uid, userId].sort().join('_'),
        members: [user.uid, userId],
        participants: [user.uid, userId],
        otherUser: {
          id: userId,
          name: otherUserName,
          profileImage: otherUserData?.profileImage || otherUserData?.photoURL,
          isOnline: otherUserData?.isOnline || false
        },
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        lastMessageBy: null,
        unreadCount: 0,
        createdAt: new Date().toISOString()
      };

      console.log('Created new conversation:', newConversation);

      // Add to conversations list immediately for Instagram-like behavior
      console.log('Adding new conversation to side panel...');
      setConversations(prev => {
        // Check if it already exists (race condition protection)
        const exists = prev.find(conv => conv.id === newConversation.id);
        if (exists) {
          return prev;
        }
        // Add at the beginning of the list
        return [newConversation, ...prev];
      });
      
      setSelectedConversation(newConversation);
      setMessages([]);
      
      // Set up message subscription for the new conversation
      loadMessages(newConversation.id, userId);
      
      console.log('✅ New conversation set up successfully in side panel');
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  const loadMessages = async (conversationId, otherUserId) => {
    if (!user?.uid) return;
    
    console.log('Loading messages for conversation:', conversationId);
    
    // Clean up existing messages subscription
    if (messagesUnsubscribe) {
      messagesUnsubscribe();
    }
    
    setMessagesLoading(true);
    try {
      // Set up real-time subscription for messages
      const unsubscribe = subscribeToConversationMessages(user.uid, otherUserId, (conversationMessages) => {
        console.log('Messages updated:', conversationMessages.length);
        setMessages(conversationMessages);
        setMessagesLoading(false);
        
        // Update conversation list with latest message info
        if (conversationMessages.length > 0) {
          const latestMessage = conversationMessages[conversationMessages.length - 1];
          setConversations(prev => {
            const updated = prev.map(conv => {
              if (conv.id === conversationId) {
                return {
                  ...conv,
                  lastMessage: latestMessage.content || 'File attachment',
                  lastMessageAt: latestMessage.createdAt,
                  lastMessageBy: latestMessage.senderId || latestMessage.from,
                  // Update unread count if message is from other user
                  unreadCount: latestMessage.senderId === user.uid ? 0 : conv.unreadCount
                };
              }
              return conv;
            });
            
            // Sort by lastMessageAt (newest first)
            return updated.sort((a, b) => {
              const timeA = new Date(a.lastMessageAt || 0).getTime();
              const timeB = new Date(b.lastMessageAt || 0).getTime();
              return timeB - timeA;
            });
          });
        }
      });
      
      setMessagesUnsubscribe(() => unsubscribe);
      
      // Mark messages as read
      await markMessagesAsRead(conversationId, user.uid);
      
      // Update conversation unread count in local state
      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
    } catch (error) {
      console.error('Error setting up messages subscription:', error);
      setMessages([]);
      setMessagesLoading(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    loadMessages(conversation.id, conversation.otherUser.id);
  };

  const handleSendMessage = async (content, mediaUrl = null) => {
    console.log('=== SENDING MESSAGE ===');
    console.log('Content:', content);
    console.log('Selected conversation:', selectedConversation?.id);
    
    if (!user?.uid || !selectedConversation || (!content.trim() && !mediaUrl)) {
      console.log('ERROR: Missing required data for sending message');
      return;
    }
    
    // Create optimistic message for immediate UI feedback
    const optimisticMessage = {
      id: `temp_${Date.now()}`,
      senderId: user.uid,
      recipientId: selectedConversation.otherUser.id,
      content: content.trim(),
      mediaUrl,
      createdAt: new Date().toISOString(),
      read: false,
      type: mediaUrl ? 'media' : 'text',
      sender: {
        id: user.uid,
        name: user.displayName || user.email || 'You',
        profileImage: user.photoURL
      },
      isPending: true
    };

    // Add optimistic message immediately
    setMessages(prev => [...prev, optimisticMessage]);
    
    setSending(true);
    try {
      console.log('Sending message to Firebase...');
      const messageId = await sendMessageSimple(
        user.uid,
        selectedConversation.otherUser.id,
        content.trim(),
        mediaUrl
      );

      console.log('✅ Message sent successfully with ID:', messageId);

      // Remove optimistic message - real message will come via subscription
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));

      // Update conversation list immediately
      const currentTime = new Date().toISOString();
      setConversations(prev => {
        const conversationId = selectedConversation.id;
        const updatedConversation = {
          ...selectedConversation,
          lastMessage: content.trim() || 'File attachment',
          lastMessageAt: currentTime,
          lastMessageBy: user.uid,
        };
        
        const existingIndex = prev.findIndex(conv => conv.id === conversationId);
        let updated;
        
        if (existingIndex >= 0) {
          updated = [...prev];
          updated[existingIndex] = updatedConversation;
        } else {
          updated = [updatedConversation, ...prev];
        }
        
        // Sort by lastMessageAt (newest first)
        return updated.sort((a, b) => {
          const timeA = new Date(a.lastMessageAt || 0).getTime();
          const timeB = new Date(b.lastMessageAt || 0).getTime();
          return timeB - timeA;
        });
      });

    } catch (error) {
      console.error('❌ Error sending message:', error);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
      
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. You may need to log out and log back in.';
      } else if (error.code === 'not-found') {
        errorMessage = 'User not found. Please check the recipient exists.';
      } else if (error.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
      }
      
      alert(`${errorMessage}\n\nTechnical details: ${error.message}`);
      throw error;
    } finally {
      setSending(false);
    }
  };

  const handleNewMessage = async (userId, content) => {
    if (!user?.uid) return;
    
    safeLog.log('🚀 Starting new message conversation:', {
      currentUser: user.uid,
      targetUser: userId,
      contentLength: content.length,
      userHasName: !!user.displayName || !!user.email
    });
    
    try {
      // Enhanced setup for new users - ensure both users have proper documents
      safeLog.log('Ensuring user documents exist for messaging...');
      await Promise.all([
        ensureUserDocumentExists(user.uid),
        ensureUserDocumentExists(userId)
      ]);
      safeLog.log('✅ User documents verified/created');

      // Check if current user has proper profile for messaging
      if (!user.displayName && !user.email) {
        safeLog.warn('⚠️ Current user lacks basic profile information');
        
        try {
          const { fixUserProfileForMessaging } = await import('../../utils/debugNewUserMessaging.js');
          await fixUserProfileForMessaging(user.uid);
          safeLog.log('✅ User profile updated for messaging');
        } catch (debugError) {
          safeLog.warn('Could not auto-fix user profile:', debugError.message);
        }
      }

      // First, start the conversation to set up the UI
      await startConversationWithUser(userId);
      
      // Then send the message using the simple method for better compatibility
      safeLog.log('Attempting to send message with simple method...');
      const messageId = await sendMessageSimple(user.uid, userId, content);
      safeLog.log('✅ New message sent with ID:', messageId);
      
      // Close modal
      setShowNewMessageModal(false);
      
    } catch (error) {
      safeLog.error('❌ Error starting new conversation:', error);
      
      // Enhanced error handling for new users with auto-retry
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error.code === 'permission-denied' || error.message?.includes('permission-denied')) {
        errorMessage = 'Permission denied. Trying alternative messaging method...';
        safeLog.error('🔐 Firebase permission issue detected');
        
        // Try alternative simple messaging method
        try {
          safeLog.log('Trying alternative messaging approach...');
          await startConversationWithUser(userId);
          const messageId = await sendMessageSimple(user.uid, userId, content);
          safeLog.log('✅ Message sent successfully with alternative method');
          setShowNewMessageModal(false);
          return; // Success!
        } catch (altError) {
          safeLog.error('❌ Alternative method also failed:', altError.message);
          errorMessage = 'Unable to send message due to permission restrictions. Please try refreshing the page.';
        }
      } else if (error.message?.includes('Missing or insufficient permissions')) {
        errorMessage = 'Account permission issue. For new users, please refresh the page and try again. If the problem persists, try logging out and back in.';
      } else if (error.message?.includes('profile not found')) {
        errorMessage = 'This user may have an incomplete profile. We\'ve created a basic profile - trying again...';
        safeLog.warn('👤 User profile issue detected, attempting alternative messaging...');
        
        // Try alternative messaging approach for new users
        try {
          await sendMessageSimple(user.uid, userId, content);
          safeLog.log('✅ Message sent with basic validation');
          setShowNewMessageModal(false);
          return; // Success with alternative method
        } catch (altError) {
          errorMessage = 'Unable to send message. The recipient may need to complete their profile setup first.';
          safeLog.error('❌ Alternative messaging method also failed:', altError.message);
        }
      }
      
      alert(`${errorMessage}\n\nTechnical details: ${error.message}`);
    }
  };

  // Alternative messaging method for new users with incomplete profiles
  const sendMessageWithBasicValidation = async (fromUserId, toUserId, content) => {
    try {
      safeLog.log('🔄 Attempting basic validation messaging...');
      
      // Create conversation with minimal validation
      const conversationId = [fromUserId, toUserId].sort().join('_');
      const currentTime = new Date().toISOString();
      
      // Check if conversation exists, if not create it
      const conversationRef = doc(db, 'conversations', conversationId);
      const conversationDoc = await getDoc(conversationRef);
      
      if (!conversationDoc.exists()) {
        await setDoc(conversationRef, {
          members: [fromUserId, toUserId],
          participants: [fromUserId, toUserId],
          lastMessageAt: currentTime,
          lastMessage: content,
          lastMessageBy: fromUserId,
          createdAt: currentTime,
          updatedAt: currentTime
        });
        safeLog.log('✅ Conversation created with basic validation');
      }
      
      // Send the message
      const messageData = {
        senderId: fromUserId,
        recipientId: toUserId,
        content: content,
        createdAt: currentTime,
        read: false,
        type: 'text'
      };
      
      const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
      const docRef = await addDoc(messagesCollectionRef, messageData);
      safeLog.log('✅ Message added with basic validation');
      
      // Update conversation
      await updateDoc(conversationRef, {
        lastMessageAt: currentTime,
        lastMessage: content,
        lastMessageBy: fromUserId,
        updatedAt: currentTime
      });
      
      // Set up UI state for the new conversation
      await startConversationWithUser(toUserId);
      
      return docRef.id;
    } catch (error) {
      safeLog.error('Basic validation messaging failed:', error);
      throw error;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to access messaging.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-16">
        <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)]">
          <div className="flex h-full bg-white shadow-sm">
            
            {/* Conversations Sidebar */}
            <div className={`${
              isMobile ? (selectedConversation ? 'hidden' : 'flex') : 'flex'
            } w-full lg:w-80 flex-col border-r border-gray-200`}>
              
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                {!isOnline && (
                  <div className="w-full mb-2 flex items-center justify-center space-x-2 px-3 py-2 bg-red-50 border border-red-200 rounded-md">
                    <Icon name="WifiOff" size={16} className="text-red-500" />
                    <span className="text-sm text-red-700">You're offline</span>
                  </div>
                )}
                <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      safeLog.log('🔄 Manual refresh requested');
                      setConnectionRetries(0);
                      loadConversations();
                    }}
                    className="flex-shrink-0"
                    disabled={!isOnline}
                  >
                    <Icon name="RotateCcw" size={16} />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setShowNewMessageModal(true)}
                    className="flex-shrink-0"
                    disabled={!isOnline}
                  >
                    <Icon name="Plus" size={16} className="mr-1" />
                    New
                  </Button>
                </div>
              </div>

              {/* Conversation List */}
              <div className="flex-1 overflow-hidden">
                <ConversationListFirebase
                  conversations={conversations}
                  selectedConversation={selectedConversation}
                  onConversationSelect={handleConversationSelect}
                  loading={loading}
                  currentUserId={user.uid}
                />
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${
              isMobile ? (selectedConversation ? 'flex' : 'hidden') : 'flex'
            } flex-1 flex-col`}>
              {selectedConversation ? (
                <ChatAreaFirebase
                  conversation={selectedConversation}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  loading={messagesLoading}
                  sending={sending}
                  currentUserId={user.uid}
                  onBack={isMobile ? () => setSelectedConversation(null) : null}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="MessageCircle" size={32} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Choose from your existing conversations or start a new one
                    </p>
                    <Button onClick={() => setShowNewMessageModal(true)}>
                      <Icon name="Plus" size={16} className="mr-2" />
                      New Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <NewMessageModalFirebase
          onClose={() => setShowNewMessageModal(false)}
          onSendMessage={handleNewMessage}
          currentUserId={user.uid}
        />
      )}
    </div>
  );
};

export default MessagingPage;