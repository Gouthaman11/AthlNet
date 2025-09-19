import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import { getImageURL, getUserDisplayName, getSafeUserField, debugUserData } from '../../../utils/imageHelper';

// Helper function to safely get user field values, preventing Firebase IDs from showing
const getSafeLocation = (user) => getSafeUserField(user, 'location', 100);

const SearchResultsFirebase = ({ results = [], loading = false, onFollowUser, currentUserId, title = "Search Results" }) => {
  const navigate = useNavigate();
  const [followingStates, setFollowingStates] = useState({});

  const handleFollowClick = async (userId) => {
    setFollowingStates(prev => ({ ...prev, [userId]: true }));
    
    try {
      await onFollowUser(userId);
      // The parent component handles updating the follow status
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setFollowingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId) => {
    navigate(`/messaging?user=${userId}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{title}</h2>
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results.length) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {title} ({results.length})
        </h2>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-sm text-gray-600">Sort by:</label>
          <select
            id="sort"
            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="relevance">Relevance</option>
            <option value="name">Name</option>
            <option value="location">Location</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {results.map((user) => {
          // Debug user data in development
          debugUserData(user, 'SearchResults');
          
          return (
          <div
            key={user.id || user.uid}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start space-x-4">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={getImageURL(user)}
                  alt={getUserDisplayName(user)}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    // Fallback if the URL fails to load
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getUserDisplayName(user))}&background=3b82f6&color=ffffff&size=64`;
                  }}
                />
                {user.isOnline && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {getUserDisplayName(user)}
                      </h3>
                      {user.verified && (
                        <Icon name="BadgeCheck" size={16} className="text-blue-500 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Compact Info Row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 text-sm text-gray-500">
                        {getSafeLocation(user) && (
                          <span className="flex items-center">
                            <Icon name="MapPin" size={12} className="mr-1" />
                            {getSafeLocation(user)}
                          </span>
                        )}
                        {user.connections && (
                          <span className="flex items-center">
                            <Icon name="Users" size={12} className="mr-1" />
                            {user.connections}
                          </span>
                        )}
                      </div>
                      
                      {/* Compact Sports Tags */}
                      {(user.sports || user.sport) && (
                        <div className="flex items-center space-x-1">
                          {(user.sports || [user.sport]).filter(Boolean).slice(0, 2).map((sport, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                            >
                              {sport}
                            </span>
                          ))}
                          {(user.sports?.length > 2) && (
                            <span className="text-xs text-gray-500">
                              +{user.sports.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewProfile(user.id || user.uid)}
                      className="whitespace-nowrap"
                    >
                      View Profile
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMessage(user.id || user.uid)}
                      className="whitespace-nowrap"
                    >
                      <Icon name="MessageCircle" size={14} className="mr-1" />
                      Message
                    </Button>
                    
                    {currentUserId !== (user.id || user.uid) && (
                      <Button
                        size="sm"
                        variant={user.isFollowing ? "outline" : "default"}
                        onClick={() => handleFollowClick(user.id || user.uid)}
                        disabled={followingStates[user.id || user.uid]}
                        className="whitespace-nowrap"
                      >
                        {followingStates[user.id || user.uid] ? (
                          <>
                            <Icon name="Loader2" size={14} className="mr-1 animate-spin" />
                            Loading...
                          </>
                        ) : user.isFollowing ? (
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
            </div>

            {/* Featured Achievement */}
            {user.featuredAchievement && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-2">
                  <Icon name="Star" size={14} className="text-yellow-500" />
                  <span className="text-sm font-medium text-gray-900">Featured:</span>
                  <span className="text-sm text-gray-600">{user.featuredAchievement}</span>
                </div>
              </div>
            )}
          </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {results.length >= 20 && (
        <div className="text-center pt-6">
          <Button variant="outline" size="lg">
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResultsFirebase;