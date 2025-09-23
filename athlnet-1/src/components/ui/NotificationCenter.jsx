import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebaseClient';
import Icon from '../AppIcon';
import { 
  subscribeToNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead,
  getUnreadNotificationCount,
  NotificationTypes
} from '../../utils/notificationUtils';

const NotificationCenter = () => {
  const [user] = useAuthState(auth);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Subscribe to notifications
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    const unsubscribe = subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
      const unread = newNotifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read) {
      await markNotificationAsRead(notification.id);
    }

    // Navigate to the relevant page
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
    
    setIsOpen(false);
  };

  const handleMarkAllAsRead = async () => {
    if (user && unreadCount > 0) {
      await markAllNotificationsAsRead(user.uid);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NotificationTypes.NEW_FOLLOW:
        return 'UserPlus';
      case NotificationTypes.NEW_CONNECTION:
        return 'Users';
      case NotificationTypes.MESSAGE_RECEIVED:
        return 'MessageCircle';
      case NotificationTypes.POST_LIKED:
        return 'Heart';
      case NotificationTypes.POST_COMMENTED:
        return 'MessageSquare';
      case NotificationTypes.COACHING_REQUEST:
        return 'Award';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case NotificationTypes.NEW_FOLLOW:
        return 'text-blue-500';
      case NotificationTypes.NEW_CONNECTION:
        return 'text-green-500';
      case NotificationTypes.MESSAGE_RECEIVED:
        return 'text-purple-500';
      case NotificationTypes.POST_LIKED:
        return 'text-red-500';
      case NotificationTypes.POST_COMMENTED:
        return 'text-orange-500';
      case NotificationTypes.COACHING_REQUEST:
        return 'text-yellow-500';
      default:
        return 'text-gray-500';
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon name="Bell" size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[400px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center">
                <Icon name="Loader2" size={24} className="text-muted-foreground mx-auto mb-2 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Icon name="Bell" size={48} className="text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Sender Avatar */}
                    <div className="flex-shrink-0">
                      {notification.senderImage ? (
                        <img
                          src={notification.senderImage}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                          <Icon 
                            name={getNotificationIcon(notification.type)} 
                            size={16} 
                            className={getNotificationColor(notification.type)}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-border bg-muted/30">
              <button
                onClick={() => {
                  navigate('/notifications');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-primary hover:text-primary/80 transition-colors"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;