import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const ChatArea = ({ conversation, messages, onSendMessage, onSendCollaborationRequest, isTyping }) => {
  const [messageText, setMessageText] = useState('');
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (messageText?.trim() || selectedFile) {
      onSendMessage({
        type: selectedFile ? 'file' : 'text',
        content: messageText?.trim(),
        file: selectedFile
      });
      setMessageText('');
      setSelectedFile(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e?.key === 'Enter' && !e?.shiftKey) {
      e?.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp)?.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatMessageDate = (timestamp) => {
    const messageDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday?.setDate(yesterday?.getDate() - 1);

    if (messageDate?.toDateString() === today?.toDateString()) {
      return 'Today';
    } else if (messageDate?.toDateString() === yesterday?.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate?.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: messageDate?.getFullYear() !== today?.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const renderMessage = (message, index) => {
    const isCurrentUser = message?.sender === 'You';
    const showDate = index === 0 || 
      new Date(messages[index - 1].timestamp)?.toDateString() !== new Date(message.timestamp)?.toDateString();

    return (
      <React.Fragment key={message?.id}>
        {showDate && (
          <div className="flex justify-center my-4">
            <span className="bg-muted text-muted-foreground text-xs px-3 py-1 rounded-full">
              {formatMessageDate(message?.timestamp)}
            </span>
          </div>
        )}
        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
          <div className={`flex items-end space-x-2 max-w-[85vw] sm:max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
            {!isCurrentUser && (
              <Image
                src={conversation?.avatar}
                alt={conversation?.name}
                className="w-8 h-8 md:w-8 md:h-8 rounded-full object-cover flex-shrink-0"
              />
            )}
            
            <div className={`px-3 py-2 md:px-4 md:py-2 rounded-2xl ${
              isCurrentUser 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted text-foreground'
            }`}>
              {message?.type === 'text' && (
                <p className="text-sm md:text-sm whitespace-pre-wrap leading-relaxed">{message?.content}</p>
              )}
              
              {message?.type === 'image' && (
                <div className="space-y-2">
                  <Image
                    src={message?.imageUrl}
                    alt="Shared image"
                    className="rounded-lg max-w-full h-auto"
                  />
                  {message?.content && (
                    <p className="text-sm leading-relaxed">{message?.content}</p>
                  )}
                </div>
              )}
              
              {message?.type === 'file' && (
                <div className="flex items-center space-x-2">
                  <Icon name="Paperclip" size={16} />
                  <span className="text-sm truncate">{message?.fileName}</span>
                </div>
              )}
              
              {message?.type === 'collaboration' && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Icon name="Handshake" size={16} />
                    <span className="text-sm font-medium">Collaboration Request</span>
                  </div>
                  <p className="text-sm leading-relaxed">{message?.content}</p>
                  <div className="text-xs opacity-80">
                    Type: {message?.collaborationType}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-end mt-1 space-x-1">
                <span className="text-xs opacity-70">
                  {formatMessageTime(message?.timestamp)}
                </span>
                {isCurrentUser && (
                  <Icon 
                    name={message?.read ? "CheckCheck" : "Check"} 
                    size={12} 
                    className={message?.read ? "text-success" : "opacity-70"} 
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <Icon name="MessageCircle" size={64} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Select a conversation</h3>
          <p className="text-muted-foreground">Choose a conversation from the list to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Chat Header */}
      <div className="p-3 md:p-4 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <Image
              src={conversation?.avatar}
              alt={conversation?.name}
              className="w-10 h-10 md:w-10 md:h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground truncate">{conversation?.name}</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${conversation?.isOnline ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                <span className="text-xs md:text-sm text-muted-foreground truncate">
                  {conversation?.isOnline ? 'Online' : `Last seen ${formatMessageTime(conversation?.lastSeen)}`}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCollaborationModal(true)}
              iconName="Handshake"
              iconPosition="left"
            >
              Collaborate
            </Button>
            <Button variant="ghost" size="icon">
              <Icon name="MoreVertical" size={18} />
            </Button>
          </div>
        </div>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages?.map((message, index) => renderMessage(message, index))}
        
        {isTyping && (
          <div className="flex justify-start mb-4">
            <div className="flex items-end space-x-2">
              <Image
                src={conversation?.avatar}
                alt={conversation?.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="bg-muted px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      {/* Message Input */}
      <div className="p-3 md:p-4 border-t border-border bg-card">
        {selectedFile && (
          <div className="mb-3 p-3 bg-muted rounded-lg flex items-center justify-between">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <Icon name="Paperclip" size={16} className="flex-shrink-0" />
              <span className="text-sm truncate">{selectedFile?.name}</span>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-muted-foreground hover:text-foreground touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[32px] md:min-h-[32px] flex items-center justify-center flex-shrink-0"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        )}
        
        <div className="flex items-end space-x-2">
          <div className="flex space-x-1">
            <button
              onClick={() => fileInputRef?.current?.click()}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Icon name="Paperclip" size={20} />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Icon name="Image" size={20} />
            </button>
          </div>
          
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e?.target?.value)}
              onKeyDown={handleKeyDown}
              className="resize-none text-base md:text-sm h-12 md:h-10"
            />
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!messageText?.trim() && !selectedFile}
            size="icon"
            className="touch-manipulation min-w-[44px] min-h-[44px] md:min-w-[36px] md:min-h-[36px] flex items-center justify-center"
          >
            <Icon name="Send" size={18} />
          </Button>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx"
        />
      </div>
      {/* Collaboration Modal */}
      {showCollaborationModal && (
        <CollaborationModal
          conversation={conversation}
          onClose={() => setShowCollaborationModal(false)}
          onSend={onSendCollaborationRequest}
        />
      )}
    </div>
  );
};

const CollaborationModal = ({ conversation, onClose, onSend }) => {
  const [collaborationType, setCollaborationType] = useState('sponsorship');
  const [message, setMessage] = useState('');

  const collaborationTypes = [
    { value: 'sponsorship', label: 'Sponsorship Opportunity' },
    { value: 'coaching', label: 'Coaching Partnership' },
    { value: 'training', label: 'Training Collaboration' },
    { value: 'event', label: 'Event Partnership' }
  ];

  const templates = {
    sponsorship: `Hi ${conversation?.name},\n\nI'm interested in exploring a potential sponsorship opportunity with you. I believe your athletic achievements and audience engagement align perfectly with our brand values.\n\nWould you be open to discussing this further?\n\nBest regards`,
    coaching: `Hi ${conversation?.name},\n\nI'm reaching out regarding a potential coaching partnership. Your expertise in your sport and proven track record make you an ideal candidate for collaboration.\n\nI'd love to discuss how we can work together.\n\nBest regards`,
    training: `Hi ${conversation?.name},\n\nI'm interested in exploring a training collaboration opportunity. Your training methods and athletic achievements are impressive, and I believe we could benefit from working together.\n\nWould you be interested in discussing this?\n\nBest regards`,
    event: `Hi ${conversation?.name},\n\nI'm organizing an upcoming event and would love to have you participate. Your presence would add tremendous value to our event.\n\nWould you be interested in learning more?\n\nBest regards`
  };

  const handleSend = () => {
    onSend({
      type: 'collaboration',
      collaborationType,
      content: message
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">Send Collaboration Request</h3>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={20} />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Collaboration Type
              </label>
              <select
                value={collaborationType}
                onChange={(e) => {
                  setCollaborationType(e?.target?.value);
                  setMessage(templates?.[e?.target?.value]);
                }}
                className="w-full p-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {collaborationTypes?.map(type => (
                  <option key={type?.value} value={type?.value}>
                    {type?.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e?.target?.value)}
                placeholder="Enter your collaboration message..."
                rows={8}
                className="w-full p-3 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSend} disabled={!message?.trim()}>
              Send Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;