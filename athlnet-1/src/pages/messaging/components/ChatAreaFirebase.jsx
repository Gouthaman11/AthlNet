import React, { useState, useRef, useEffect } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';
import { uploadMessageFile } from '../../../utils/firestoreSocialApi';

const ChatAreaFirebase = ({ 
  conversation, 
  messages = [], 
  onSendMessage, 
  loading = false,
  sending = false,
  currentUserId,
  onBack = null 
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    console.log('ChatArea: Sending message...', messageInput.trim());
    
    if (!messageInput.trim() && !attachmentPreview) {
      console.log('ChatArea: No message content or attachment');
      return;
    }
    
    let mediaUrl = null;
    
    // Upload file if there's an attachment
    if (attachmentPreview) {
      setUploading(true);
      try {
        mediaUrl = await uploadMessageFile(attachmentPreview.file, currentUserId);
        console.log('ChatArea: File uploaded successfully');
      } catch (error) {
        console.error('ChatArea: Error uploading file:', error);
        alert('Failed to upload file. Please try again.');
        setUploading(false);
        return;
      }
    }
    
    const messageContent = messageInput.trim();
    
    try {
      // Clear input immediately for better UX
      setMessageInput('');
      setAttachmentPreview(null);
      setUploading(false);
      
      await onSendMessage(messageContent, mediaUrl);
      console.log('ChatArea: Message sent successfully');
      
    } catch (error) {
      console.error('ChatArea: Error sending message:', error);
      // Restore message content on error
      setMessageInput(messageContent);
      setUploading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !uploading) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic file validation
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachmentPreview({
        file,
        url: event.target.result,
        type: file.type,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachmentPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const isMyMessage = (message) => {
    // Check both senderId (new structure) and from (legacy structure) for compatibility
    const messageSenderId = message.senderId || message.from;
    return messageSenderId === currentUserId;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center space-x-4 p-4 border-b border-gray-200 bg-white">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="lg:hidden"
          >
            <Icon name="ArrowLeft" size={16} />
          </Button>
        )}
        
        <div className="relative flex-shrink-0">
          <img
            src={
              conversation.otherUser?.profileImage ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                conversation.otherUser?.name || 'User'
              )}&background=3b82f6&color=ffffff&size=40`
            }
            alt={conversation.otherUser?.name}
            className="w-10 h-10 rounded-full object-cover border border-gray-200"
          />
          {conversation.otherUser?.isOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {conversation.otherUser?.name || 'Unknown User'}
          </h2>
          <p className="text-sm text-gray-500">
            {conversation.otherUser?.isOnline ? 'Online' : 'Offline'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Icon name="Phone" size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="Video" size={16} />
          </Button>
          <Button variant="ghost" size="sm">
            <Icon name="MoreVertical" size={16} />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading messages...</span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="MessageCircle" size={24} className="text-gray-400" />
              </div>
              <p className="text-gray-600">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message, index) => {
              const isMy = isMyMessage(message);
              const messageSenderId = message.senderId || message.from;
              const showAvatar = !isMy && (
                index === 0 || 
                (messages[index - 1]?.senderId || messages[index - 1]?.from) !== messageSenderId ||
                new Date(message.createdAt) - new Date(messages[index - 1]?.createdAt) > 300000 // 5 minutes
              );

              return (
                <div
                  key={message.id}
                  className={`flex ${isMy ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-xs lg:max-w-md ${isMy ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 ${isMy ? 'ml-2' : 'mr-2'}`}>
                      {showAvatar && !isMy ? (
                        <img
                          src={
                            message.sender?.profileImage ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              message.sender?.name || 'User'
                            )}&background=3b82f6&color=ffffff&size=32`
                          }
                          alt={message.sender?.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8"></div>
                      )}
                    </div>

                    {/* Message Bubble */}
                    <div className="flex flex-col">
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isMy
                            ? `bg-blue-500 text-white rounded-br-md ${message.isPending ? 'opacity-70' : ''}`
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        {/* Media Content */}
                        {message.mediaUrl && (
                          <div className="mb-2">
                            {message.mediaUrl.toLowerCase().includes('.jpg') || 
                             message.mediaUrl.toLowerCase().includes('.jpeg') || 
                             message.mediaUrl.toLowerCase().includes('.png') || 
                             message.mediaUrl.toLowerCase().includes('.gif') || 
                             message.mediaUrl.toLowerCase().includes('.webp') ? (
                              <img
                                src={message.mediaUrl}
                                alt="Shared image"
                                className="max-w-full h-auto rounded-lg cursor-pointer"
                                onClick={() => window.open(message.mediaUrl, '_blank')}
                              />
                            ) : (
                              <div 
                                className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200"
                                onClick={() => window.open(message.mediaUrl, '_blank')}
                              >
                                <Icon name="Paperclip" size={16} />
                                <span className="text-sm">File attachment</span>
                                <Icon name="ExternalLink" size={12} />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Text Content */}
                        {message.content && (
                          <div className="flex items-center justify-between">
                            <p className="break-words whitespace-pre-wrap flex-1">
                              {message.content}
                            </p>
                            {/* Sending indicator */}
                            {message.isPending && isMy && (
                              <div className="ml-2 flex-shrink-0">
                                <Icon name="Clock" size={12} className="text-blue-200" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Timestamp and Status */}
                      <div className={`flex items-center mt-1 ${isMy ? 'justify-end' : 'justify-start'}`}>
                        <p className="text-xs text-gray-500">
                          {formatMessageTime(message.createdAt)}
                        </p>
                        {isMy && (
                          <div className="ml-1">
                            {message.isPending ? (
                              <Icon name="Clock" size={10} className="text-gray-400" />
                            ) : message.read ? (
                              <Icon name="CheckCheck" size={10} className="text-blue-500" />
                            ) : (
                              <Icon name="Check" size={10} className="text-gray-400" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        {/* Attachment Preview */}
        {attachmentPreview && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon name="Paperclip" size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700 truncate">
                  {attachmentPreview.name}
                </span>
                {uploading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={removeAttachment}
                disabled={uploading}
              >
                <Icon name="X" size={16} />
              </Button>
            </div>
            {attachmentPreview.type?.startsWith('image/') && (
              <img 
                src={attachmentPreview.url} 
                alt="Preview" 
                className="mt-2 max-w-full h-32 object-cover rounded"
              />
            )}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {/* Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex-shrink-0"
          >
            <Icon name="Paperclip" size={16} />
          </Button>

          {/* Message Input */}
          <div className="flex-1">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending || uploading}
              className="resize-none border-gray-300 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Send Button */}
          <Button
            type="submit"
            disabled={(!messageInput.trim() && !attachmentPreview) || sending || uploading}
            className="flex-shrink-0 rounded-full px-4 py-2"
          >
            {sending || uploading ? (
              <Icon name="Loader2" size={16} className="animate-spin" />
            ) : (
              <Icon name="Send" size={16} />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatAreaFirebase;