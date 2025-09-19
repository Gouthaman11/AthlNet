import React from 'react';
import Icon from '../../../components/AppIcon';

const ProfileStats = ({ stats }) => {
  const statItems = [
    {
      label: 'Profile Views',
      value: stats?.profileViews,
      icon: 'Eye',
      change: stats?.profileViewsChange,
      color: 'text-blue-500'
    },
    {
      label: 'Post Engagement',
      value: stats?.postEngagement,
      icon: 'Heart',
      change: stats?.postEngagementChange,
      color: 'text-red-500'
    },
    {
      label: 'Connection Requests',
      value: stats?.connectionRequests,
      icon: 'UserPlus',
      change: stats?.connectionRequestsChange,
      color: 'text-green-500'
    },
    {
      label: 'Content Shares',
      value: stats?.contentShares,
      icon: 'Share',
      change: stats?.contentSharesChange,
      color: 'text-purple-500'
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000)?.toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000)?.toFixed(1) + 'K';
    return num?.toString();
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Profile Analytics</h3>
        <p className="text-sm text-muted-foreground mt-1">Your profile performance this month</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {statItems?.map((item, index) => (
            <div key={index} className="text-center">
              <div className={`w-12 h-12 mx-auto mb-3 rounded-lg bg-muted flex items-center justify-center ${item?.color}`}>
                <Icon name={item?.icon} size={24} />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                {formatNumber(item?.value)}
              </div>
              <div className="text-sm text-muted-foreground mb-2">{item?.label}</div>
              <div className={`text-xs font-medium ${
                item?.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatChange(item?.change)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Profile Completion</span>
            <span className="font-medium text-foreground">{stats?.profileCompletion}%</span>
          </div>
          <div className="mt-2 w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats?.profileCompletion}%` }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Complete your profile to increase visibility and connections
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;