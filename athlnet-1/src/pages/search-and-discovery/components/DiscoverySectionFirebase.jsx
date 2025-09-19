import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getImageURL, getUserDisplayName, getSafeUserField, debugUserData } from '../../../utils/imageHelper';

// Helper functions for safe field extraction
const getSafeTitle = (user) => getSafeUserField(user, 'title', 50);
const getSafeLocation = (user) => getSafeUserField(user, 'location', 100);

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

  if (!suggestedUsers.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🌟</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No suggestions available</h3>
        <p className="text-gray-600 mb-4">We'll find more athletes for you soon!</p>
        <Button onClick={onRefresh} variant="outline">
          <Icon name="RefreshCw" size={14} className="mr-2" />
          Refresh Suggestions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Athletes You Might Know</h2>
          <p className="text-sm text-gray-600 mt-1">Based on your interests and connections</p>
        </div>
        <Button onClick={onRefresh} variant="outline" size="sm">
          <Icon name="RefreshCw" size={14} className="mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestedUsers.map((user) => {
          // Clean the user object to remove Firebase IDs from any field
          const cleanedUser = { ...user };
          const problematicId = 'LlFbpIGRl6SdNMf42k8sQHpHXUk1aAkHoeltpzPQecnENIkeMN6KGks2';
          
          // Clean all string fields that might contain Firebase IDs
          Object.keys(cleanedUser).forEach(key => {
            if (typeof cleanedUser[key] === 'string') {
              if (cleanedUser[key] === problematicId || 
                  cleanedUser[key] === user.id || 
                  cleanedUser[key] === user.uid ||
                  (cleanedUser[key].length > 20 && /^[a-zA-Z0-9]{20,}$/.test(cleanedUser[key]))) {
                console.warn(`Removing Firebase ID from field '${key}':`, cleanedUser[key]);
                delete cleanedUser[key];
              }
            }
          });
          
          // Clean personalInfo object if it exists
          if (cleanedUser.personalInfo && typeof cleanedUser.personalInfo === 'object') {
            Object.keys(cleanedUser.personalInfo).forEach(key => {
              if (typeof cleanedUser.personalInfo[key] === 'string') {
                if (cleanedUser.personalInfo[key] === problematicId || 
                    cleanedUser.personalInfo[key] === user.id || 
                    cleanedUser.personalInfo[key] === user.uid ||
                    (cleanedUser.personalInfo[key].length > 20 && /^[a-zA-Z0-9]{20,}$/.test(cleanedUser.personalInfo[key]))) {
                  console.warn(`Removing Firebase ID from personalInfo.${key}:`, cleanedUser.personalInfo[key]);
                  delete cleanedUser.personalInfo[key];
                }
              }
            });
          }
          
          // Debug user data in development - especially for the problematic user
          const isProblematicUser = user.name === 'Abishek' || user.displayName === 'Abishek' ||
            (user.personalInfo?.firstName === 'Abishek') ||
            JSON.stringify(user).includes('LlFbpIGRl6SdNMf42k8sQHpHXUk1aAkHoeltpzPQecnENIkeMN6KGks2');
          
          if (isProblematicUser) {
            console.log('🔍 DEBUGGING Abishek user data (cleaned):', {
              id: cleanedUser.id,
              uid: cleanedUser.uid,
              name: cleanedUser.name,
              displayName: cleanedUser.displayName,
              title: cleanedUser.title,
              location: cleanedUser.location,
              personalInfo: cleanedUser.personalInfo,
              sports: cleanedUser.sports,
              sport: cleanedUser.sport,
              profileImage: cleanedUser.profileImage,
              photoURL: cleanedUser.photoURL,
              fullUserObject: cleanedUser
            });
          }
          
          // Use the cleaned user object for rendering
          const userToRender = cleanedUser;
          
          return (
          <div
            key={userToRender.id || userToRender.uid}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            {/* Profile Image */}
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <img
                  src={getImageURL(userToRender)}
                  alt={getUserDisplayName(userToRender)}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 mx-auto"
                  onError={(e) => {
                    // Fallback if the URL fails to load
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(userToRender))}&background=3b82f6&color=ffffff&size=80`;
                  }}
                />
                {userToRender.isOnline && (
                  <div className="absolute bottom-0 right-2 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
                {userToRender.verified && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Icon name="Check" size={12} className="text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {getUserDisplayName(userToRender)}
              </h3>
              
              {getSafeTitle(userToRender) && (
                <p className="text-sm font-medium text-gray-700 mb-2">{getSafeTitle(userToRender)}</p>
              )}
              
              {getSafeLocation(userToRender) && (
                <p className="text-sm text-gray-500 mb-2 flex items-center justify-center">
                  <Icon name="MapPin" size={14} className="mr-1" />
                  {getSafeLocation(userToRender)}
                </p>
              )}

              {/* Sports Tags */}
              {(userToRender.sports || userToRender.sport) && (
                <div className="flex flex-wrap justify-center gap-1 mb-3">
                  {(userToRender.sports || [userToRender.sport]).filter(sport => {
                    if (!sport || typeof sport !== 'string') return false;
                    if (sport === userToRender.id || sport === userToRender.uid) return false;
                    if (sport === 'LlFbpIGRl6SdNMf42k8sQHpHXUk1aAkHoeltpzPQecnENIkeMN6KGks2') return false;
                    if (sport.length > 30) return false;
                    if (sport.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(sport)) return false;
                    return true;
                  }).slice(0, 2).map((sport, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                    >
                      {sport}
                    </span>
                  ))}
                  {(userToRender.sports || []).filter(sport => {
                    if (!sport || typeof sport !== 'string') return false;
                    if (sport === userToRender.id || sport === userToRender.uid) return false;
                    if (sport === 'LlFbpIGRl6SdNMf42k8sQHpHXUk1aAkHoeltpzPQecnENIkeMN6KGks2') return false;
                    if (sport.length > 30) return false;
                    if (sport.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(sport)) return false;
                    return true;
                  }).length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                      +{(user.sports || []).filter(sport => 
                        sport && typeof sport === 'string' && sport.length < 30 && sport !== user.id && sport !== user.uid
                      ).length - 2} more
                    </span>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 mb-4">
                {userToRender.connections && (
                  <span className="flex items-center">
                    <Icon name="Users" size={14} className="mr-1" />
                    {userToRender.connections}
                  </span>
                )}
                {userToRender.achievements && (
                  <span className="flex items-center">
                    <Icon name="Trophy" size={14} className="mr-1" />
                    {userToRender.achievements}
                  </span>
                )}
              </div>

              {/* Reason for suggestion */}
              {userToRender.relevanceScore > 0 && (
                <div className="mb-4 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700 flex items-center justify-center">
                    <Icon name="Target" size={12} className="mr-1" />
                    Suggested based on your interests
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleViewProfile(userToRender.id || userToRender.uid)}
                className="w-full"
              >
                View Profile
              </Button>
              
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMessage(userToRender.id || userToRender.uid)}
                  className="flex-1"
                >
                  <Icon name="MessageCircle" size={14} className="mr-1" />
                  Message
                </Button>
                
                {currentUserId !== (userToRender.id || userToRender.uid) && (
                  <Button
                    size="sm"
                    variant={userToRender.isFollowing ? "outline" : "default"}
                    onClick={() => onFollowUser(userToRender.id || userToRender.uid)}
                    className="flex-1"
                  >
                    {userToRender.isFollowing ? (
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