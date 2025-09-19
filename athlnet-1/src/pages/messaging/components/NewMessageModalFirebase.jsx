import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../../utils/firestoreSocialApi';
import { safeLog } from '../../../utils/safeLogging';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NewMessageModalFirebase = ({ onClose, onSendMessage, currentUserId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  // Search users when query changes
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      safeLog.log('🔍 Searching for users with query:', searchQuery);
      const results = await searchUsers(searchQuery, 10);
      safeLog.log('✅ Search results found:', results.length);
      
      // Filter out current user
      const filteredResults = results.filter(user => user.uid !== currentUserId);
      setSearchResults(filteredResults);
      
      safeLog.log('📋 Filtered results (excluding current user):', filteredResults.length);
    } catch (error) {
      safeLog.error('❌ Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    safeLog.log('🔗 Navigating to profile:', userId);
    navigate(`/profile/${userId}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !message.trim()) return;
    
    setSending(true);
    try {
      safeLog.log('📤 Sending message to user:', {
        targetUserId: selectedUser.uid,
        userName: selectedUser.name,
        messageLength: message.trim().length,
        hasProfile: !!selectedUser.personalInfo
      });
      
      // Test if this is a new user by checking if we can run debug utilities
      try {
        const { testNewUserMessaging } = await import('../../../utils/debugNewUserMessaging.js');
        safeLog.log('🧪 Testing new user messaging...');
        await testNewUserMessaging(currentUserId, selectedUser.uid);
      } catch (debugError) {
        safeLog.warn('Debug utilities not available or failed:', debugError.message);
      }
      
      await onSendMessage(selectedUser.uid, message.trim());
      safeLog.log('✅ Message sent successfully');
      onClose();
    } catch (error) {
      safeLog.error('❌ Error sending message:', error);
      
      // Enhanced error handling for new user messaging
      let errorMessage = 'Failed to send message. Please try again.';
      
      if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
        errorMessage = 'Permission denied. You may need to refresh the page or log out and back in.';
      } else if (error?.code === 'not-found' || error?.message?.includes('not found')) {
        errorMessage = 'User not found. Please make sure the user profile exists and try again.';
      } else if (error?.message?.includes('auth')) {
        errorMessage = 'Authentication error. Please refresh the page and try again.';
      } else if (error?.code === 'unavailable') {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
      } else if (error?.message) {
        errorMessage = `Failed to send message: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] md:max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900">New Message</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center">
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {!selectedUser ? (
            <>
              {/* Search Section */}
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search for athletes, coaches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 md:h-10 text-base md:text-sm"
                />
              </div>

              {/* Search Results */}
              <div className="max-h-60 md:max-h-60 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Searching...</span>
                  </div>
                )}

                {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    No users found for "{searchQuery}"
                  </div>
                )}

                {!loading && searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.uid}
                        className="flex items-center space-x-3 p-4 md:p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 touch-manipulation"
                      >
                        <img
                          src={
                            user.profileImage ||
                            user.photoURL ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              user.name || user.displayName || 'User'
                            )}&background=3b82f6&color=ffffff&size=40`
                          }
                          alt={user.name || user.displayName}
                          className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base md:text-sm font-medium text-gray-900 truncate">
                            {user.name || user.displayName || 'Unknown User'}
                          </h3>
                          <p className="text-sm md:text-sm text-gray-500 truncate">
                            {user.personalInfo?.title || user.title || 
                             user.personalInfo?.primarySport || user.sport || 'Athlete'}
                            {(user.personalInfo?.location || user.location) && 
                             ` • ${user.personalInfo?.location || user.location}`}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile(user.uid);
                            }}
                            className="text-xs touch-manipulation min-h-[36px]"
                          >
                            View Profile
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUser(user);
                            }}
                            className="text-xs touch-manipulation min-h-[36px]"
                          >
                            Message
                          </Button>
                        </div>
                        {user.isOnline && (
                          <div className="w-3 h-3 md:w-2 md:h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length < 2 && (
                  <div className="text-center py-8 text-gray-500">
                    Type at least 2 characters to search for users
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected User */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 p-4 md:p-3 bg-gray-50 rounded-lg">
                  <img
                    src={
                      selectedUser.profileImage ||
                      selectedUser.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedUser.name || selectedUser.displayName || 'User'
                      )}&background=3b82f6&color=ffffff&size=40`
                    }
                    alt={selectedUser.name || selectedUser.displayName}
                    className="w-12 h-12 md:w-10 md:h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-sm font-medium text-gray-900">
                      {selectedUser.name || selectedUser.displayName || 'Unknown User'}
                    </h3>
                    <p className="text-sm md:text-sm text-gray-500">
                      {selectedUser.personalInfo?.title || selectedUser.title || 
                       selectedUser.personalInfo?.primarySport || selectedUser.sport || 'Athlete'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(selectedUser.uid)}
                      className="text-xs touch-manipulation min-h-[36px]"
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(null)}
                      className="touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Message Form */}
              <form onSubmit={handleSendMessage}>
                <div className="mb-4">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="w-full p-4 md:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base md:text-sm"
                    rows={4}
                    required
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedUser(null)}
                    disabled={sending}
                    className="touch-manipulation min-h-[44px] md:min-h-[36px]"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="touch-manipulation min-h-[44px] md:min-h-[36px]"
                  >
                    {sending ? (
                      <>
                        <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Icon name="Send" size={16} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewMessageModalFirebase;