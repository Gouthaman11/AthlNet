import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ActivityFeed = ({ activities }) => {
  const [expandedActivities, setExpandedActivities] = useState(new Set());

  const toggleExpanded = (activityId) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded?.has(activityId)) {
      newExpanded?.delete(activityId);
    } else {
      newExpanded?.add(activityId);
    }
    setExpandedActivities(newExpanded);
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'achievement': return 'Trophy';
      case 'connection': return 'UserPlus';
      case 'post': return 'FileText';
      case 'media': return 'Image';
      case 'training': return 'Activity';
      default: return 'Bell';
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'achievement': return 'text-yellow-500';
      case 'connection': return 'text-blue-500';
      case 'post': return 'text-green-500';
      case 'media': return 'text-purple-500';
      case 'training': return 'text-orange-500';
      default: return 'text-gray-500';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return `${Math.floor(diffInHours / 168)}w ago`;
  };

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <p className="text-sm text-muted-foreground mt-1">Latest updates and achievements</p>
      </div>
      <div className="divide-y divide-border">
        {activities?.map((activity) => {
          const isExpanded = expandedActivities?.has(activity?.id);
          const shouldTruncate = activity?.description?.length > 150;
          
          return (
            <div key={activity?.id} className="p-6 hover:bg-muted/50 transition-colors">
              <div className="flex space-x-4">
                <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${getActivityColor(activity?.type)}`}>
                  <Icon name={getActivityIcon(activity?.type)} size={20} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-foreground">{activity?.title}</p>
                    <span className="text-sm text-muted-foreground">{formatTimeAgo(activity?.timestamp)}</span>
                  </div>
                  
                  <div className="text-muted-foreground text-sm">
                    {shouldTruncate && !isExpanded ? (
                      <>
                        {activity?.description?.substring(0, 150)}...
                        <button
                          onClick={() => toggleExpanded(activity?.id)}
                          className="text-primary hover:underline ml-1"
                        >
                          Read more
                        </button>
                      </>
                    ) : (
                      <>
                        {activity?.description}
                        {shouldTruncate && isExpanded && (
                          <button
                            onClick={() => toggleExpanded(activity?.id)}
                            className="text-primary hover:underline ml-1"
                          >
                            Show less
                          </button>
                        )}
                      </>
                    )}
                  </div>
                  
                  {activity?.media && (
                    <div className="mt-3 rounded-lg overflow-hidden">
                      <Image
                        src={activity?.media?.url}
                        alt={activity?.media?.caption}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}
                  
                  {activity?.metrics && (
                    <div className="flex items-center space-x-6 mt-3 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Icon name="Heart" size={16} />
                        <span>{activity?.metrics?.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="MessageCircle" size={16} />
                        <span>{activity?.metrics?.comments}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Icon name="Share" size={16} />
                        <span>{activity?.metrics?.shares}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="p-6 border-t border-border text-center">
        <button className="text-primary hover:underline text-sm font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default ActivityFeed;