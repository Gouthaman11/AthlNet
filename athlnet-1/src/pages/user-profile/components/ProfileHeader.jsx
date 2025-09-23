import React from 'react';
import { safeLog } from '../../../utils/safeLogging';
import { isCoach } from '../../../utils/coachUtils';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import CoachBadge from '../../../components/CoachBadge';
import AddToCoachingButton from '../../../components/AddToCoachingButton';

const ProfileHeader = ({ 
  userProfile, 
  onConnect, 
  onMessage, 
  onFollow, 
  onEditProfile,
  followLoading = false,
  connectLoading = false
}) => {
  const [coachingMessage, setCoachingMessage] = React.useState(null);

  const handleCoachingResult = (result) => {
    setCoachingMessage(result);
    // Auto-clear message after 5 seconds
    setTimeout(() => setCoachingMessage(null), 5000);
  };

  // Use props directly instead of local state to prevent race conditions
  const isFollowing = userProfile?.isFollowing || false;
  const isConnected = userProfile?.isConnected || false;

  const handleFollow = () => {
    const newFollowState = !isFollowing;
    safeLog.log(`ProfileHeader handleFollow: changing from ${isFollowing} to ${newFollowState}`);
    onFollow(newFollowState);
  };

  const handleConnect = () => {
    if (!isConnected) {
      onConnect();
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000)?.toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000)?.toFixed(1) + 'K';
    return num?.toString();
  };

  const formatJoinDate = (date) => {
    if (!date) return 'Recently';
    if (typeof date === 'string') return date;
    return new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 lg:h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        {userProfile?.coverImage ? (
          <Image
            src={userProfile.coverImage}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>
      
      {/* Profile Content */}
      <div className="relative px-6 pb-6 bg-white dark:bg-gray-800">
        {/* Profile Picture */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16 lg:-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-white shadow-xl bg-white overflow-hidden">
                <Image
                  src={userProfile?.profileImage || userProfile?.photoURL || userProfile?.personalInfo?.profileImage}
                  alt={userProfile?.name || userProfile?.displayName || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
              {userProfile?.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                  <Icon name="Check" size={20} color="white" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="mt-4 lg:mt-0 lg:mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {userProfile?.name || userProfile?.displayName || 
                   (userProfile?.personalInfo?.firstName && userProfile?.personalInfo?.lastName ? 
                    `${userProfile?.personalInfo?.firstName} ${userProfile?.personalInfo?.lastName}` :
                    userProfile?.personalInfo?.firstName || userProfile?.email?.split('@')[0] || 'Anonymous User')}
                </h1>
                {userProfile?.isVerified && (
                  <Icon name="BadgeCheck" size={28} className="text-blue-500 flex-shrink-0" />
                )}
                <CoachBadge userProfile={userProfile} />
              </div>
              <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 mb-3 font-medium">
                {isCoach(userProfile) ? 
                  `${userProfile?.title || userProfile?.personalInfo?.title || userProfile?.sport || 'Coach'}` :
                  userProfile?.title || userProfile?.personalInfo?.title || userProfile?.sport || 
                  userProfile?.personalInfo?.sport || 'Athlete'}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {(userProfile?.sports || userProfile?.personalInfo?.sports || []).slice(0, 3).map((sport, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-semibold rounded-full"
                  >
                    {sport}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={16} />
                  <span>{userProfile?.location || userProfile?.personalInfo?.location || 'Location not specified'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={16} />
                  <span>Joined {formatJoinDate(userProfile?.joinedDate || userProfile?.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 lg:mt-0">
            {!userProfile?.isOwnProfile && (
              <>
                <Button
                  variant={isConnected ? "outline" : "default"}
                  onClick={handleConnect}
                  iconName={isConnected ? "UserCheck" : "UserPlus"}
                  iconPosition="left"
                  disabled={isConnected || connectLoading}
                  className="flex-1 sm:flex-none"
                >
                  {connectLoading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : isConnected ? "Connected" : "Connect"}
                </Button>
                <Button
                  variant="outline"
                  onClick={onMessage}
                  iconName="MessageCircle"
                  iconPosition="left"
                  className="flex-1 sm:flex-none"
                >
                  Message
                </Button>
                <Button
                  variant={isFollowing ? "outline" : "secondary"}
                  onClick={handleFollow}
                  iconName={isFollowing ? "UserMinus" : "UserPlus"}
                  iconPosition="left"
                  className="flex-1 sm:flex-none"
                  disabled={followLoading}
                >
                  {followLoading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      {isFollowing ? 'Unfollowing...' : 'Following...'}
                    </>
                  ) : isFollowing ? "Unfollow" : "Follow"}
                </Button>
                
                {/* Add to Coaching Button (only visible to coaches) */}
                <AddToCoachingButton 
                  athleteProfile={userProfile}
                  onSuccess={handleCoachingResult}
                  className="flex-1 sm:flex-none"
                />
              </>
            )}
            {userProfile?.isOwnProfile && (
              <Button
                variant="outline"
                onClick={onEditProfile}
                iconName="Edit"
                iconPosition="left"
                className="flex-1 sm:flex-none"
              >
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(userProfile?.stats?.followers || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(userProfile?.stats?.following || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Following</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(userProfile?.stats?.connections || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {formatNumber(userProfile?.stats?.posts || userProfile?.posts?.length || 0)}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">Posts</div>
          </div>
        </div>
      </div>

      {/* Coaching Message Display */}
      {coachingMessage && (
        <div className={`mt-4 p-4 rounded-lg border ${
          coachingMessage.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <Icon 
              name={coachingMessage.type === 'success' ? 'CheckCircle' : 'AlertCircle'} 
              size={16} 
              className="mr-2" 
            />
            <div>
              <p className="font-medium">{coachingMessage.title}</p>
              <p className="text-sm">{coachingMessage.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;