import React from 'react';
import { safeLog } from '../../../utils/safeLogging';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProfileHeader = ({ 
  userProfile, 
  onConnect, 
  onMessage, 
  onFollow, 
  onEditProfile,
  followLoading = false,
  connectLoading = false
}) => {
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
    <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
      {/* Cover Image */}
      <div className="relative h-48 lg:h-64 bg-gradient-to-r from-primary to-secondary">
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
      <div className="relative px-6 pb-6">
        {/* Profile Picture */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between -mt-16 lg:-mt-20">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6">
            <div className="relative">
              <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full border-4 border-card bg-card overflow-hidden">
                <Image
                  src={userProfile?.profileImage || userProfile?.photoURL}
                  alt={userProfile?.name || userProfile?.displayName}
                  className="w-full h-full object-cover"
                />
              </div>
              {userProfile?.isVerified && (
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                  <Icon name="Check" size={16} color="white" />
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="mt-4 lg:mt-0 lg:mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {userProfile?.name || userProfile?.displayName || 'Anonymous User'}
                </h1>
                {userProfile?.isVerified && (
                  <Icon name="BadgeCheck" size={24} className="text-primary" />
                )}
              </div>
              <p className="text-lg text-muted-foreground mb-2">
                {userProfile?.title || userProfile?.sport || 'Athlete'}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {userProfile?.sports?.map((sport, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full"
                  >
                    {sport}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Icon name="MapPin" size={16} />
                  <span>{userProfile?.location || 'Unknown Location'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Calendar" size={16} />
                  <span>Joined {formatJoinDate(userProfile?.joinedDate)}</span>
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-6 pt-6 border-t border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(userProfile?.stats?.followers || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(userProfile?.stats?.following || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Following</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(userProfile?.stats?.connections || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Connections</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">
              {formatNumber(userProfile?.stats?.posts || 0)}
            </div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;