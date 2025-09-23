import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { cleanUserProfile } from '../../../utils/profileUtils';

const DiscoverySectionFirebase = ({ 
  suggestedUsers = [], 
  onFollowUser, 
  onRefresh, 
  currentUserId 
}) => {
  const navigate = useNavigate();

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    navigate(`/messaging?user=${userId}`);
  };

  // Helper function to get profile image with fallback
  const getProfileImage = (user) => {
    if (user.profileImage && user.profileImage.startsWith('http')) {
      return user.profileImage;
    }
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.name || 'User')}&background=3b82f6&color=ffffff&size=80`;
  };

  if (!suggestedUsers.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Discover New People</h3>
        <p className="text-gray-600 mb-4">Find athletes, coaches, and sports enthusiasts to connect with</p>
        <Button onClick={onRefresh} variant="outline">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Load Suggestions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Suggested for you ({suggestedUsers.length})
        </h2>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      {/* User Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedUsers.map((user) => {
          // Clean user data using the utility function
          const cleanedUser = cleanUserProfile(user);
          
          return (
            <div
              key={cleanedUser.id || cleanedUser.uid}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              {/* Profile Image */}
              <div className="text-center mb-4">
                <div className="relative inline-block">
                  <img
                    src={getProfileImage(cleanedUser)}
                    alt={cleanedUser.displayName || cleanedUser.name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 mx-auto"
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanedUser.displayName || cleanedUser.name || 'User')}&background=3b82f6&color=ffffff&size=80`;
                    }}
                  />
                  {cleanedUser.isOnline && (
                    <div className="absolute bottom-0 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  )}
                  {cleanedUser.verified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Icon name="Check" size={12} className="text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {cleanedUser.displayName || cleanedUser.name || 'User'}
                </h3>
                
                {cleanedUser.title && (
                  <p className="text-sm font-medium text-gray-700 mb-2">{cleanedUser.title}</p>
                )}
                
                {cleanedUser.location && (
                  <p className="text-sm text-gray-500 mb-2 flex items-center justify-center">
                    <Icon name="MapPin" size={14} className="mr-1" />
                    {cleanedUser.location}
                  </p>
                )}

                {/* Sports Tags */}
                {cleanedUser.sports && cleanedUser.sports.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-1 mb-3">
                    {cleanedUser.sports.slice(0, 2).map((sport, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                      >
                        {sport}
                      </span>
                    ))}
                    {cleanedUser.sports.length > 2 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                        +{cleanedUser.sports.length - 2} more
                      </span>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                  {cleanedUser.connections > 0 && (
                    <span className="flex items-center">
                      <Icon name="Users" size={14} className="mr-1" />
                      {cleanedUser.connections}
                    </span>
                  )}
                  {cleanedUser.achievements > 0 && (
                    <span className="flex items-center">
                      <Icon name="Trophy" size={14} className="mr-1" />
                      {cleanedUser.achievements}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewProfile(cleanedUser.id || cleanedUser.uid)}
                  className="w-full"
                >
                  View Profile
                </Button>
                
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleMessage(cleanedUser.id || cleanedUser.uid)}
                    className="flex-1"
                  >
                    <Icon name="MessageCircle" size={14} className="mr-1" />
                    Message
                  </Button>
                  
                  {currentUserId !== (cleanedUser.id || cleanedUser.uid) && (
                    <Button
                      size="sm"
                      variant={cleanedUser.isFollowing ? "outline" : "default"}
                      onClick={() => onFollowUser(cleanedUser.id || cleanedUser.uid)}
                      className="flex-1"
                    >
                      {cleanedUser.isFollowing ? (
                        <>
                          <Icon name="UserCheck" size={14} className="mr-1" />
                          Following
                        </>
                      ) : (
                        <>
                          <Icon name="UserPlus" size={14} className="mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Section */}
      <div className="text-center pt-6">
        <Button onClick={onRefresh} variant="outline" size="lg">
          <Icon name="RefreshCw" size={16} className="mr-2" />
          Load More Suggestions
        </Button>
      </div>
    </div>
  );
};

export default DiscoverySectionFirebase;