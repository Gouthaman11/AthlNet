import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Input from '../../../components/ui/Input';

const ConversationList = ({ conversations, selectedConversation, onSelectConversation, onNewMessage }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations?.filter(conversation =>
    conversation?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase())
  );

  const formatTime = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = (now - messageTime) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - messageTime) / (1000 * 60));
      return diffInMinutes < 1 ? 'now' : `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return messageTime?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const truncateMessage = (message, maxLength = 50) => {
    if (message?.length <= maxLength) return message;
    return message?.substring(0, maxLength) + '...';
  };

  return (
    <div className="w-full lg:w-80 bg-card border-r border-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Messages</h2>
          <button
            onClick={onNewMessage}
            className="p-2 text-primary hover:bg-muted rounded-lg transition-colors"
            title="New Message"
          >
            <Icon name="Plus" size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Icon 
            name="Search" 
            size={18} 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
          />
          <Input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e?.target?.value)}
            className="pl-10"
          />
        </div>
      </div>
      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations?.length === 0 ? (
          <div className="p-4 text-center">
            <Icon name="MessageCircle" size={48} className="mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">
              {searchQuery ? 'No conversations found' : 'No messages yet'}
            </p>
          </div>
        ) : (
          filteredConversations?.map((conversation) => (
            <div
              key={conversation?.id}
              onClick={() => onSelectConversation(conversation)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted transition-colors ${
                selectedConversation?.id === conversation?.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <Image
                    src={conversation?.avatar}
                    alt={conversation?.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success border-2 border-card rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {conversation?.name}
                    </h3>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTime(conversation?.lastMessageTime)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation?.lastMessage?.type === 'text' 
                        ? truncateMessage(conversation?.lastMessage?.content)
                        : conversation?.lastMessage?.type === 'image' ?'📷 Photo' :'📎 Attachment'
                      }
                    </p>
                    
                    {conversation?.unreadCount > 0 && (
                      <div className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium flex-shrink-0 ml-2">
                        {conversation?.unreadCount > 9 ? '9+' : conversation?.unreadCount}
                      </div>
                    )}
                  </div>

                  {/* Connection Context */}
                  {conversation?.connectionContext && (
                    <div className="flex items-center mt-1">
                      <Icon name="Users" size={12} className="text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        {conversation?.connectionContext}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;