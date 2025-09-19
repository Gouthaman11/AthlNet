import React from 'react';
import Icon from '../../../components/AppIcon';

const ConversationListFirebase = ({ 
  conversations = [], 
  selectedConversation, 
  onConversationSelect, 
  loading = false,
  currentUserId 
}) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (!message) return '';
    return message.length > maxLength ? `${message.substring(0, maxLength)}...` : message;
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-3 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!conversations || conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="MessageCircle" size={24} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
          <p className="text-sm text-gray-600">Start a conversation by sending a message!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-2">
        {conversations.map((conversation) => {
          const isSelected = selectedConversation?.id === conversation.id;
          const lastMessageFromMe = conversation.lastMessageBy === currentUserId;
          
          return (
            <div
              key={conversation.id}
              onClick={() => onConversationSelect(conversation)}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-blue-50 border border-blue-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  src={
                    conversation.otherUser?.profileImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      conversation.otherUser?.name || 'User'
                    )}&background=3b82f6&color=ffffff&size=48`
                  }
                  alt={conversation.otherUser?.name}
                  className="w-12 h-12 rounded-full object-cover border border-gray-200"
                />
                {conversation.otherUser?.isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`text-sm font-medium truncate ${
                    isSelected ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {conversation.otherUser?.name || 'Unknown User'}
                  </h3>
                  <span className={`text-xs ${
                    isSelected ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {formatTime(conversation.lastMessageAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate ${
                    isSelected ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {lastMessageFromMe && (
                      <span className="mr-1">
                        <Icon name="Check" size={12} className="inline" />
                      </span>
                    )}
                    {truncateMessage(conversation.lastMessage)}
                  </p>
                  
                  {/* Unread Count */}
                  {conversation.unreadCount > 0 && (
                    <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center ml-2">
                      {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationListFirebase;