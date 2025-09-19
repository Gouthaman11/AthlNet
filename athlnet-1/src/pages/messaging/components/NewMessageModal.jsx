import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchUsers } from '../../../utils/firestoreSocialApi';
import { safeLog } from '../../../utils/safeLogging';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const NewMessageModal = ({ onClose, onSendMessage, currentUserId }) => {
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
      safeLog.log('Searching for users with query:', searchQuery);
      const results = await searchUsers(searchQuery, 10);
      safeLog.log('Search results found:', results.length);
      
      // Filter out current user
      const filteredResults = results.filter(user => user.uid !== currentUserId);
      setSearchResults(filteredResults);
      
      safeLog.log('Filtered results (excluding current user):', filteredResults.length);
    } catch (error) {
      safeLog.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    safeLog.log('Navigating to profile:', userId);
    navigate(`/profile/${userId}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!selectedUser || !message.trim()) return;
    
    setSending(true);
    try {
      safeLog.log('Sending message to user:', {
        targetUserId: selectedUser.uid,
        userName: selectedUser.name,
        messageLength: message.trim().length
      });
      
      await onSendMessage(selectedUser.uid, message.trim());
      safeLog.log('✅ Message sent successfully');
      onClose();
    } catch (error) {
      safeLog.error('Error sending message:', error);
      alert(`Failed to send message: ${error.message}. Please try again.`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Message</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <Icon name="X" size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!selectedUser ? (
            <>
              {/* Search Section */}
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search for athletes, coaches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Search Results */}
              <div className="max-h-60 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    <span className="ml-2 text-gray-600">Searching...</span>
                  </div>
                )}

                {!loading && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="text-center py-8 text-gray-600">
                    <p>No users found for "{searchQuery}"</p>
                    <p className="text-sm mt-2">Try searching with a different name or email</p>
                  </div>
                )}

                {!loading && searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <div
                        key={user.uid}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200"
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
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {user.name || user.displayName || 'Unknown User'}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {user.personalInfo?.title || user.title || user.personalInfo?.primarySport || user.sport || 'Athlete'}
                            {(user.personalInfo?.location || user.location) && ` • ${user.personalInfo?.location || user.location}`}
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
                            className="text-xs"
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
                            className="text-xs"
                          >
                            Message
                          </Button>
                        </div>
                        {user.isOnline && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length < 2 && (
                  <div className="text-center py-8 text-gray-500">
                    <Icon name="Search" size={32} className="mx-auto mb-2 text-gray-400" />
                    <p>Type at least 2 characters to search for users</p>
                    <p className="text-xs mt-1">Search by name, email, or sport</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Selected User */}
              <div className="mb-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={
                      selectedUser.profileImage ||
                      selectedUser.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        selectedUser.name || selectedUser.displayName || 'User'
                      )}&background=3b82f6&color=ffffff&size=40`
                    }
                    alt={selectedUser.name || selectedUser.displayName}
                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      {selectedUser.name || selectedUser.displayName || 'Unknown User'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {selectedUser.personalInfo?.title || selectedUser.title || selectedUser.personalInfo?.primarySport || selectedUser.sport || 'Athlete'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewProfile(selectedUser.uid)}
                      className="text-xs"
                    >
                      View Profile
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(null)}
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
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    disabled={!message.trim() || sending}
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

export default NewMessageModal;