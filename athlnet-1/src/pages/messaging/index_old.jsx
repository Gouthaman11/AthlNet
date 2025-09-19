import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ConversationList from './components/ConversationList';
import ChatArea from './components/ChatArea';
import NewMessageModal from './components/NewMessageModal';
import Icon from '../../components/AppIcon';


const MessagingPage = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // Mock conversations data
  const mockConversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      isOnline: true,
      lastSeen: new Date(Date.now() - 300000),
      lastMessage: {
        type: 'text',
        content: "That sounds like a great opportunity! When would you like to discuss the details?"
      },
      lastMessageTime: new Date(Date.now() - 300000),
      unreadCount: 2,
      connectionContext: "Connected via Tennis Network"
    },
    {
      id: 2,
      name: "Coach Martinez",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000),
      lastMessage: {
        type: 'text',
        content: "Great job on your performance this week. Let\'s schedule a review session."
      },
      lastMessageTime: new Date(Date.now() - 1800000),
      unreadCount: 0,
      connectionContext: "Your coach"
    },
    {
      id: 3,
      name: "Mike Chen",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      isOnline: true,
      lastSeen: new Date(),
      lastMessage: {
        type: 'image',
        content: "Check out this training setup!"
      },
      lastMessageTime: new Date(Date.now() - 7200000),
      unreadCount: 1,
      connectionContext: "Mutual connection: David Kim"
    },
    {
      id: 4,
      name: "Emily Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      isOnline: false,
      lastSeen: new Date(Date.now() - 1800000),
      lastMessage: {
        type: 'text',
        content: "Thanks for the collaboration proposal. I\'m definitely interested!"
      },
      lastMessageTime: new Date(Date.now() - 86400000),
      unreadCount: 0,
      connectionContext: "Connected via Soccer League"
    },
    {
      id: 5,
      name: "SportsBrand Inc",
      avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center",
      isOnline: true,
      lastSeen: new Date(),
      lastMessage: {
        type: 'text',
        content: "We\'d love to discuss a potential sponsorship opportunity with you."
      },
      lastMessageTime: new Date(Date.now() - 172800000),
      unreadCount: 3,
      connectionContext: "Brand partnership inquiry"
    }
  ];

  // Mock messages for selected conversation
  const mockMessages = {
    1: [
      {
        id: 1,
        sender: "Sarah Johnson",
        type: 'text',
        content: "Hi! I saw your recent performance at the championship. Absolutely incredible!",
        timestamp: new Date(Date.now() - 86400000),
        read: true
      },
      {
        id: 2,
        sender: "You",
        type: 'text',
        content: "Thank you so much! It was a tough match but I\'m really happy with how it went.",
        timestamp: new Date(Date.now() - 86300000),
        read: true
      },
      {
        id: 3,
        sender: "Sarah Johnson",
        type: 'text',
        content: "I'm actually working on a documentary about rising tennis stars. Would you be interested in being featured?",
        timestamp: new Date(Date.now() - 86200000),
        read: true
      },
      {
        id: 4,
        sender: "You",
        type: 'text',
        content: "That sounds amazing! I\'d love to hear more about it. What would it involve?",
        timestamp: new Date(Date.now() - 86100000),
        read: true
      },
      {
        id: 5,
        sender: "Sarah Johnson",
        type: 'text',
        content: "That sounds like a great opportunity! When would you like to discuss the details?",
        timestamp: new Date(Date.now() - 300000),
        read: false
      }
    ],
    2: [
      {
        id: 1,
        sender: "Coach Martinez",
        type: 'text',
        content: "Good morning! How are you feeling after yesterday\'s training session?",
        timestamp: new Date(Date.now() - 7200000),
        read: true
      },
      {
        id: 2,
        sender: "You",
        type: 'text',
        content: "Morning Coach! I'm feeling good, a bit sore but that's expected. The new drills were challenging.",
        timestamp: new Date(Date.now() - 7100000),
        read: true
      },
      {
        id: 3,
        sender: "Coach Martinez",
        type: 'text',
        content: "Great job on your performance this week. Let\'s schedule a review session.",
        timestamp: new Date(Date.now() - 1800000),
        read: true
      }
    ],
    3: [
      {
        id: 1,
        sender: "Mike Chen",
        type: 'text',
        content: "Hey! Saw your post about the new training facility. Looks incredible!",
        timestamp: new Date(Date.now() - 14400000),
        read: true
      },
      {
        id: 2,
        sender: "You",
        type: 'text',
        content: "Thanks! Yeah, they have some amazing equipment there. You should check it out sometime.",
        timestamp: new Date(Date.now() - 14300000),
        read: true
      },
      {
        id: 3,
        sender: "Mike Chen",
        type: 'image',
        content: "Check out this training setup!",
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
        timestamp: new Date(Date.now() - 7200000),
        read: false
      }
    ]
  };

  useEffect(() => {
    setConversations(mockConversations);
    
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      setMessages(mockMessages?.[selectedConversation?.id] || []);
      
      // Simulate typing indicator
      const typingTimeout = setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }, 1000);

      return () => clearTimeout(typingTimeout);
    }
  }, [selectedConversation]);

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    
    // Mark conversation as read
    setConversations(prev => 
      prev?.map(conv => 
        conv?.id === conversation?.id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const handleSendMessage = (messageData) => {
    const newMessage = {
      id: Date.now(),
      sender: "You",
      type: messageData?.type,
      content: messageData?.content,
      timestamp: new Date(),
      read: false,
      ...(messageData?.file && { fileName: messageData?.file?.name })
    };

    setMessages(prev => [...prev, newMessage]);
    
    // Update conversation last message
    setConversations(prev =>
      prev?.map(conv =>
        conv?.id === selectedConversation?.id
          ? {
              ...conv,
              lastMessage: {
                type: messageData?.type,
                content: messageData?.content
              },
              lastMessageTime: new Date()
            }
          : conv
      )
    );

    // Simulate response after a delay
    setTimeout(() => {
      const responseMessage = {
        id: Date.now() + 1,
        sender: selectedConversation?.name,
        type: 'text',
        content: "Thanks for your message! I\'ll get back to you soon.",
        timestamp: new Date(),
        read: false
      };
      setMessages(prev => [...prev, responseMessage]);
    }, 2000);
  };

  const handleSendCollaborationRequest = (requestData) => {
    const collaborationMessage = {
      id: Date.now(),
      sender: "You",
      type: 'collaboration',
      content: requestData?.content,
      collaborationType: requestData?.collaborationType,
      timestamp: new Date(),
      read: false
    };

    setMessages(prev => [...prev, collaborationMessage]);
    
    // Update conversation last message
    setConversations(prev =>
      prev?.map(conv =>
        conv?.id === selectedConversation?.id
          ? {
              ...conv,
              lastMessage: {
                type: 'collaboration',
                content: `Collaboration request: ${requestData?.collaborationType}`
              },
              lastMessageTime: new Date()
            }
          : conv
      )
    );
  };

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };

  const handleStartConversation = (selectedUsers) => {
    // Create new conversation with selected users
    const newConversation = {
      id: Date.now(),
      name: selectedUsers?.length === 1 ? selectedUsers?.[0]?.name : `${selectedUsers?.[0]?.name} + ${selectedUsers?.length - 1} others`,
      avatar: selectedUsers?.[0]?.avatar,
      isOnline: selectedUsers?.[0]?.isOnline,
      lastSeen: new Date(),
      lastMessage: {
        type: 'text',
        content: "Conversation started"
      },
      lastMessageTime: new Date(),
      unreadCount: 0,
      connectionContext: "New conversation"
    };

    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-16 h-screen flex">
        {/* Mobile: Show conversation list or chat based on selection */}
        {isMobile ? (
          <>
            {!selectedConversation ? (
              <ConversationList
                conversations={conversations}
                selectedConversation={selectedConversation}
                onSelectConversation={handleSelectConversation}
                onNewMessage={handleNewMessage}
              />
            ) : (
              <div className="flex-1 flex flex-col">
                {/* Mobile back button */}
                <div className="p-4 border-b border-border bg-card lg:hidden">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Icon name="ArrowLeft" size={20} />
                    <span>Back to conversations</span>
                  </button>
                </div>
                
                <ChatArea
                  conversation={selectedConversation}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onSendCollaborationRequest={handleSendCollaborationRequest}
                  isTyping={isTyping}
                />
              </div>
            )}
          </>
        ) : (
          /* Desktop: Show both panels */
          (<>
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onSelectConversation={handleSelectConversation}
              onNewMessage={handleNewMessage}
            />
            <ChatArea
              conversation={selectedConversation}
              messages={messages}
              onSendMessage={handleSendMessage}
              onSendCollaborationRequest={handleSendCollaborationRequest}
              isTyping={isTyping}
            />
          </>)
        )}
      </div>
      <NewMessageModal
        isOpen={showNewMessageModal}
        onClose={() => setShowNewMessageModal(false)}
        onStartConversation={handleStartConversation}
      />
    </div>
  );
};

export default MessagingPage;