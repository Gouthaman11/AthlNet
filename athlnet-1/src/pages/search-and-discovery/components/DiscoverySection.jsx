import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../../firebaseClient';
import { useAuthState } from 'react-firebase-hooks/auth';
import { cleanUserProfile } from '../../../utils/profileUtils';
import AppIcon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CoachBadge from '../../../components/CoachBadge';
import AddToCoachingButton from '../../../components/AddToCoachingButton';

// Use AppIcon consistently throughout the component
const Icon = AppIcon;

const DiscoverySection = ({ recommendations, trending, suggestedConnections }) => {
  const handleViewProfile = (userId) => {
    console.log('Viewing profile:', userId);
  };

  const handleConnect = (userId) => {
    console.log('Connecting to user:', userId);
  };

  const handleFollowTrend = (trend) => {
    console.log('Following trend:', trend);
  };

  const RecommendationCard = ({ user, reason }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start space-x-3">
        <div className="relative">
          <Image
            src={user?.avatar}
            alt={user?.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          {user?.verified && (
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={10} color="white" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-1 mb-1">
            <h4 className="font-medium text-foreground truncate">{user?.name}</h4>
            {user?.verified && (
              <Icon name="BadgeCheck" size={14} className="text-primary flex-shrink-0" />
            )}
            <CoachBadge userProfile={user} className="ml-1" />
          </div>
          <p className="text-sm text-muted-foreground mb-2">{user?.title}</p>
          <p className="text-xs text-muted-foreground mb-3">{reason}</p>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              size="xs"
              onClick={() => handleViewProfile(user?.id)}
            >
              View
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleConnect(user?.id)}
              iconName="UserPlus"
            >
              Connect
            </Button>
            
            {/* Add to Coaching Button (only visible to coaches) */}
            <AddToCoachingButton 
              athleteProfile={user}
              onSuccess={(result) => {
                console.log('Coaching request result:', result);
                // You could add toast notifications here
              }}
              className="xs"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const TrendingCard = ({ trend }) => (
    <div className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
         onClick={() => handleFollowTrend(trend)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <Icon name={trend?.icon} size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">{trend?.title}</span>
        </div>
        <span className="text-xs text-muted-foreground">#{trend?.rank}</span>
      </div>
      
      <p className="text-sm text-muted-foreground mb-2">{trend?.description}</p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{trend?.posts} posts</span>
        <span className="flex items-center space-x-1">
          <Icon name="TrendingUp" size={12} />
          <span>{trend?.growth}% growth</span>
        </span>
      </div>
    </div>
  );

  const ConnectionCard = ({ user, mutualConnections }) => (
    <div className="bg-card border border-border rounded-lg p-4 text-center hover:shadow-md transition-shadow">
      <div className="relative mb-3">
        <Image
          src={user?.avatar}
          alt={user?.name}
          className="w-16 h-16 rounded-full object-cover mx-auto"
        />
        {user?.verified && (
          <div className="absolute bottom-0 right-1/2 transform translate-x-1/2 translate-y-1/2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Check" size={10} color="white" />
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-center space-x-1 mb-1">
        <h4 className="font-medium text-foreground">{user?.name}</h4>
        {user?.verified && (
          <Icon name="BadgeCheck" size={14} className="text-primary" />
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mb-2">{user?.title}</p>
      
      <div className="flex items-center justify-center space-x-1 text-xs text-muted-foreground mb-3">
        <Icon name="Users" size={12} />
        <span>{mutualConnections} mutual connections</span>
      </div>
      
      <Button
        size="sm"
        fullWidth
        onClick={() => handleConnect(user?.id)}
        iconName="UserPlus"
        iconPosition="left"
      >
        Connect
      </Button>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* AI Recommendations */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="Sparkles" size={20} className="text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Recommended for You</h2>
          </div>
          <Button variant="ghost" size="sm" iconName="ChevronRight">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations?.map((rec) => (
            <RecommendationCard
              key={rec?.user?.id}
              user={rec?.user}
              reason={rec?.reason}
            />
          ))}
        </div>
      </section>
      {/* Trending */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="TrendingUp" size={20} className="text-accent" />
            <h2 className="text-lg font-semibold text-foreground">Trending Now</h2>
          </div>
          <Button variant="ghost" size="sm" iconName="ChevronRight">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trending?.map((trend) => (
            <TrendingCard key={trend?.id} trend={trend} />
          ))}
        </div>
      </section>
      {/* Suggested Connections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon name="UserPlus" size={20} className="text-secondary" />
            <h2 className="text-lg font-semibold text-foreground">People You May Know</h2>
          </div>
          <Button variant="ghost" size="sm" iconName="ChevronRight">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {suggestedConnections?.map((connection) => (
            <ConnectionCard
              key={connection?.user?.id}
              user={connection?.user}
              mutualConnections={connection?.mutualConnections}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DiscoverySection;