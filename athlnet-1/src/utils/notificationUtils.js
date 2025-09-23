import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc,
  arrayUnion,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebaseClient';

/**
 * Send notification to user
 * @param {string} recipientId - User ID to send notification to
 * @param {Object} notificationData - Notification details
 * @returns {Promise<boolean>} - Success status
 */
export const sendNotification = async (recipientId, notificationData) => {
  try {
    if (!recipientId || !notificationData) {
      throw new Error('Recipient ID and notification data are required');
    }

    const notification = {
      recipientId,
      ...notificationData,
      createdAt: serverTimestamp(),
      read: false,
      id: Date.now().toString()
    };

    // Add to notifications collection
    await addDoc(collection(db, 'notifications'), notification);

    // Also add to user's notifications array for quick access
    await updateDoc(doc(db, 'users', recipientId), {
      notifications: arrayUnion(notification)
    });

    console.log('✅ Notification sent successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending notification:', error);
    return false;
  }
};

/**
 * Send coaching request notification to athlete
 * @param {string} athleteId - Athlete user ID
 * @param {string} coachId - Coach user ID
 * @param {Object} coachInfo - Coach information
 * @returns {Promise<boolean>} - Success status
 */
export const sendCoachingRequestNotification = async (athleteId, coachId, coachInfo) => {
  try {
    const notificationData = {
      type: 'coaching_request',
      title: 'New Coaching Request',
      message: `${coachInfo.name || 'A coach'} wants to start training you!`,
      coachId,
      coachName: coachInfo.name,
      coachSpecialization: coachInfo.specialization || coachInfo.sport,
      coachImage: coachInfo.profileImage,
      actionUrl: `/profile/${coachId}`,
      actions: [
        {
          type: 'accept',
          label: 'Accept',
          style: 'primary'
        },
        {
          type: 'decline',
          label: 'Decline', 
          style: 'secondary'
        }
      ]
    };

    return await sendNotification(athleteId, notificationData);
  } catch (error) {
    console.error('❌ Error sending coaching request notification:', error);
    return false;
  }
};

/**
 * Send coaching acceptance notification to coach
 * @param {string} coachId - Coach user ID
 * @param {string} athleteId - Athlete user ID  
 * @param {Object} athleteInfo - Athlete information
 * @returns {Promise<boolean>} - Success status
 */
export const sendCoachingAcceptedNotification = async (coachId, athleteId, athleteInfo) => {
  try {
    const notificationData = {
      type: 'coaching_accepted',
      title: 'Coaching Request Accepted',
      message: `${athleteInfo.name || 'An athlete'} has accepted your coaching request!`,
      athleteId,
      athleteName: athleteInfo.name,
      athleteSport: athleteInfo.sport,
      athleteImage: athleteInfo.profileImage,
      actionUrl: `/profile/${athleteId}`,
      actions: [
        {
          type: 'view_profile',
          label: 'View Profile',
          style: 'primary'
        },
        {
          type: 'create_training_plan',
          label: 'Create Training Plan',
          style: 'success'
        }
      ]
    };

    return await sendNotification(coachId, notificationData);
  } catch (error) {
    console.error('❌ Error sending coaching accepted notification:', error);
    return false;
  }
};

/**
 * Send general coaching update notification
 * @param {string} recipientId - Recipient user ID
 * @param {string} senderId - Sender user ID
 * @param {Object} updateData - Update information
 * @returns {Promise<boolean>} - Success status
 */
export const sendCoachingUpdateNotification = async (recipientId, senderId, updateData) => {
  try {
    const notificationData = {
      type: 'coaching_update',
      title: updateData.title || 'Coaching Update',
      message: updateData.message,
      senderId,
      senderName: updateData.senderName,
      actionUrl: updateData.actionUrl,
      metadata: updateData.metadata || {}
    };

    return await sendNotification(recipientId, notificationData);
  } catch (error) {
    console.error('❌ Error sending coaching update notification:', error);
    return false;
  }
};

/**
 * Create a notification toast for immediate display
 * @param {string} type - Notification type (success, error, info, warning)
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @returns {Object} - Toast notification object
 */
export const createToastNotification = (type, title, message) => {
  return {
    id: Date.now().toString(),
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    duration: type === 'error' ? 5000 : 3000
  };
};

// Notification types enum for consistency
export const NotificationTypes = {
  COACHING_REQUEST: 'coaching_request',
  COACHING_ACCEPTED: 'coaching_accepted', 
  COACHING_DECLINED: 'coaching_declined',
  COACHING_UPDATE: 'coaching_update',
  TRAINING_PLAN_CREATED: 'training_plan_created',
  TRAINING_SESSION_SCHEDULED: 'training_session_scheduled',
  ACHIEVEMENT_SHARED: 'achievement_shared',
  MESSAGE_RECEIVED: 'message_received',
  NEW_FOLLOW: 'new_follow',
  NEW_CONNECTION: 'new_connection',
  POST_LIKED: 'post_liked',
  POST_COMMENTED: 'post_commented'
};

/**
 * Send new follower notification
 * @param {string} recipientId - User who got followed
 * @param {string} followerId - User who followed
 * @param {Object} followerInfo - Follower's information
 * @returns {Promise<boolean>} - Success status
 */
export const sendNewFollowNotification = async (recipientId, followerId, followerInfo) => {
  try {
    const notificationData = {
      type: NotificationTypes.NEW_FOLLOW,
      title: 'New Follower',
      message: `${followerInfo.name || 'Someone'} started following you!`,
      senderId: followerId,
      senderName: followerInfo.name,
      senderImage: followerInfo.profileImage,
      actionUrl: `/profile/${followerId}`,
      actions: [
        {
          type: 'view_profile',
          label: 'View Profile',
          style: 'primary'
        },
        {
          type: 'follow_back',
          label: 'Follow Back',
          style: 'success'
        }
      ]
    };

    return await sendNotification(recipientId, notificationData);
  } catch (error) {
    console.error('❌ Error sending new follow notification:', error);
    return false;
  }
};

/**
 * Send new connection notification
 * @param {string} recipientId - User who got connected with
 * @param {string} connecterId - User who initiated connection
 * @param {Object} connecterInfo - Connecter's information
 * @returns {Promise<boolean>} - Success status
 */
export const sendNewConnectionNotification = async (recipientId, connecterId, connecterInfo) => {
  try {
    const notificationData = {
      type: NotificationTypes.NEW_CONNECTION,
      title: 'New Connection',
      message: `${connecterInfo.name || 'Someone'} connected with you!`,
      senderId: connecterId,
      senderName: connecterInfo.name,
      senderImage: connecterInfo.profileImage,
      actionUrl: `/profile/${connecterId}`,
      actions: [
        {
          type: 'view_profile',
          label: 'View Profile',
          style: 'primary'
        },
        {
          type: 'send_message',
          label: 'Send Message',
          style: 'secondary'
        }
      ]
    };

    return await sendNotification(recipientId, notificationData);
  } catch (error) {
    console.error('❌ Error sending new connection notification:', error);
    return false;
  }
};

/**
 * Send new message notification
 * @param {string} recipientId - Message recipient
 * @param {string} senderId - Message sender
 * @param {Object} messageInfo - Message information
 * @returns {Promise<boolean>} - Success status
 */
export const sendNewMessageNotification = async (recipientId, senderId, messageInfo) => {
  try {
    const notificationData = {
      type: NotificationTypes.MESSAGE_RECEIVED,
      title: 'New Message',
      message: `${messageInfo.senderName || 'Someone'}: ${messageInfo.preview || 'Sent you a message'}`,
      senderId,
      senderName: messageInfo.senderName,
      senderImage: messageInfo.senderImage,
      actionUrl: `/messaging?user=${senderId}`,
      metadata: {
        conversationId: messageInfo.conversationId,
        messageId: messageInfo.messageId
      },
      actions: [
        {
          type: 'reply',
          label: 'Reply',
          style: 'primary'
        },
        {
          type: 'view_conversation',
          label: 'View Chat',
          style: 'secondary'
        }
      ]
    };

    return await sendNotification(recipientId, notificationData);
  } catch (error) {
    console.error('❌ Error sending new message notification:', error);
    return false;
  }
};

/**
 * Send post liked notification
 * @param {string} recipientId - Post author
 * @param {string} likerId - User who liked the post
 * @param {Object} likeInfo - Like information
 * @returns {Promise<boolean>} - Success status
 */
export const sendPostLikedNotification = async (recipientId, likerId, likeInfo) => {
  try {
    // Don't send notification if user liked their own post
    if (recipientId === likerId) {
      return true;
    }

    const notificationData = {
      type: NotificationTypes.POST_LIKED,
      title: 'Post Liked',
      message: `${likeInfo.likerName || 'Someone'} liked your post`,
      senderId: likerId,
      senderName: likeInfo.likerName,
      senderImage: likeInfo.likerImage,
      actionUrl: `/feed?post=${likeInfo.postId}`,
      metadata: {
        postId: likeInfo.postId,
        postContent: likeInfo.postContent?.substring(0, 100) + '...'
      },
      actions: [
        {
          type: 'view_post',
          label: 'View Post',
          style: 'primary'
        },
        {
          type: 'view_profile',
          label: 'View Profile',
          style: 'secondary'
        }
      ]
    };

    return await sendNotification(recipientId, notificationData);
  } catch (error) {
    console.error('❌ Error sending post liked notification:', error);
    return false;
  }
};

/**
 * Send post commented notification
 * @param {string} recipientId - Post author
 * @param {string} commenterId - User who commented
 * @param {Object} commentInfo - Comment information
 * @returns {Promise<boolean>} - Success status
 */
export const sendPostCommentedNotification = async (recipientId, commenterId, commentInfo) => {
  try {
    // Don't send notification if user commented on their own post
    if (recipientId === commenterId) {
      return true;
    }

    const notificationData = {
      type: NotificationTypes.POST_COMMENTED,
      title: 'New Comment',
      message: `${commentInfo.commenterName || 'Someone'} commented on your post: "${commentInfo.commentContent?.substring(0, 50) + '...' || 'View comment'}"`,
      senderId: commenterId,
      senderName: commentInfo.commenterName,
      senderImage: commentInfo.commenterImage,
      actionUrl: `/feed?post=${commentInfo.postId}`,
      metadata: {
        postId: commentInfo.postId,
        commentId: commentInfo.commentId,
        commentContent: commentInfo.commentContent
      },
      actions: [
        {
          type: 'reply_comment',
          label: 'Reply',
          style: 'primary'
        },
        {
          type: 'view_post',
          label: 'View Post',
          style: 'secondary'
        }
      ]
    };

    return await sendNotification(recipientId, notificationData);
  } catch (error) {
    console.error('❌ Error sending post commented notification:', error);
    return false;
  }
};

/**
 * Get user's notifications
 * @param {string} userId - User ID
 * @param {number} limitCount - Number of notifications to fetch
 * @returns {Promise<Array>} - Array of notifications
 */
export const getUserNotifications = async (userId, limitCount = 20) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const snapshot = await getDocs(q);
    const notifications = [];

    snapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });

    return notifications;
  } catch (error) {
    console.error('❌ Error getting user notifications:', error);
    return [];
  }
};

/**
 * Subscribe to user's notifications in real-time
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to handle notifications
 * @returns {Function} - Unsubscribe function
 */
export const subscribeToNotifications = (userId, callback) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const notifications = [];
      snapshot.forEach((doc) => {
        notifications.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        });
      });

      callback(notifications);
    }, (error) => {
      console.error('❌ Error in notifications subscription:', error);
      callback([]);
    });
  } catch (error) {
    console.error('❌ Error setting up notifications subscription:', error);
    return () => {};
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<boolean>} - Success status
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });

    return true;
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return false;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - Success status
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = [];

    snapshot.forEach((doc) => {
      updatePromises.push(
        updateDoc(doc.ref, {
          read: true,
          readAt: serverTimestamp()
        })
      );
    });

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    return false;
  }
};

/**
 * Get unread notification count
 * @param {string} userId - User ID
 * @returns {Promise<number>} - Unread notification count
 */
export const getUnreadNotificationCount = async (userId) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('recipientId', '==', userId),
      where('read', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('❌ Error getting unread notification count:', error);
    return 0;
  }
};