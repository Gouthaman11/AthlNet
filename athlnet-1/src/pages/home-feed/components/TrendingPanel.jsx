import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TrendingPanel = () => {
  const trendingHashtags = [
    { tag: '#Olympics2024', posts: 15420, growth: '+12%' },
    { tag: '#BasketballTraining', posts: 8930, growth: '+8%' },
    { tag: '#FitnessMotivation', posts: 12340, growth: '+15%' },
    { tag: '#SoccerSkills', posts: 6780, growth: '+5%' },
    { tag: '#SwimmingTechnique', posts: 4560, growth: '+18%' }
  ];

  const suggestedConnections = [
    {
      id: 1,
      name: 'Maria Santos',
      sport: 'Tennis',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      verified: true,
      mutualConnections: 12,
      achievements: 'Wimbledon Semifinalist'
    },
    {
      id: 2,
      name: 'James Wilson',
      sport: 'Swimming',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: false,
      mutualConnections: 8,
      achievements: 'Olympic Qualifier'
    },
    {
      id: 3,
      name: 'Sarah Chen',
      sport: 'Gymnastics',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      verified: true,
      mutualConnections: 15,
      achievements: 'World Championship Medalist'
    }
  ];

  const upcomingChallenges = [
    {
      id: 1,
      title: '30-Day Fitness Challenge',
      participants: 2340,
      daysLeft: 5,
      category: 'Fitness',
      icon: 'Dumbbell'
    },
    {
      id: 2,
      title: 'Marathon Training Program',
      participants: 890,
      daysLeft: 12,
      category: 'Running',
      icon: 'Zap'
    },
    {
      id: 3,
      title: 'Basketball Skills Showcase',
      participants: 1560,
      daysLeft: 8,
      category: 'Basketball',
      icon: 'Target'
    }
  ];

  const storyHighlights = [
    {
      id: 1,
      title: 'Recovery Journey',
      author: 'Mike Johnson',
      thumbnail: 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?w=150&h=150&fit=crop',
      views: 1240
    },
    {
      id: 2,
      title: 'Championship Win',
      author: 'Lisa Rodriguez',
      thumbnail: 'https://images.pixabay.com/photo/2016/11/29/13/14/attractive-1869761_1280.jpg?w=150&h=150&fit=crop',
      views: 3450
    },
    {
      id: 3,
      title: 'Training Routine',
      author: 'David Kim',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=150&h=150&fit=crop',
      views: 890
    }
  ];

  return (
    <div className="space-y-6">
      {/* Trending Hashtags */}
      <div className="bg-card border border-border rounded-lg p-4 card-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Trending in Sports</h3>
          <Icon name="TrendingUp" size={18} className="text-primary" />
        </div>
        <div className="space-y-3">
          {trendingHashtags?.map((trend, index) => (
            <div key={index} className="flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors cursor-pointer">
              <div>
                <p className="font-medium text-primary text-sm">{trend?.tag}</p>
                <p className="text-xs text-muted-foreground">{trend?.posts?.toLocaleString()} posts</p>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="TrendingUp" size={12} className="text-success" />
                <span className="text-xs text-success font-medium">{trend?.growth}</span>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-3 text-sm">
          View All Trends
        </Button>
      </div>
      {/* Suggested Connections */}
      <div className="bg-card border border-border rounded-lg p-4 card-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Suggested Connections</h3>
          <Icon name="Users" size={18} className="text-primary" />
        </div>
        <div className="space-y-4">
          {suggestedConnections?.map((connection) => (
            <div key={connection?.id} className="flex items-start space-x-3">
              <div className="relative flex-shrink-0">
                <Image
                  src={connection?.avatar}
                  alt={connection?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                {connection?.verified && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                    <Icon name="Check" size={10} color="white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-foreground text-sm truncate">{connection?.name}</h4>
                    <p className="text-xs text-muted-foreground">{connection?.sport}</p>
                    <p className="text-xs text-muted-foreground mt-1">{connection?.achievements}</p>
                    <p className="text-xs text-muted-foreground">{connection?.mutualConnections} mutual connections</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Button variant="outline" size="xs">
                    Connect
                  </Button>
                  <Button variant="ghost" size="xs">
                    <Icon name="X" size={12} />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-3 text-sm">
          See All Suggestions
        </Button>
      </div>
      {/* Upcoming Challenges */}
      <div className="bg-card border border-border rounded-lg p-4 card-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Upcoming Challenges</h3>
          <Icon name="Trophy" size={18} className="text-primary" />
        </div>
        <div className="space-y-3">
          {upcomingChallenges?.map((challenge) => (
            <div key={challenge?.id} className="p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name={challenge?.icon} size={16} color="white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground text-sm">{challenge?.title}</h4>
                    <p className="text-xs text-muted-foreground">{challenge?.category}</p>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-xs text-muted-foreground">{challenge?.participants?.toLocaleString()} participants</span>
                      <span className="text-xs text-warning font-medium">{challenge?.daysLeft} days left</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-3 text-sm">
          Browse All Challenges
        </Button>
      </div>
      {/* Story Highlights */}
      <div className="bg-card border border-border rounded-lg p-4 card-elevation-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Story Highlights</h3>
          <Icon name="Play" size={18} className="text-primary" />
        </div>
        <div className="space-y-3">
          {storyHighlights?.map((story) => (
            <div key={story?.id} className="flex items-center space-x-3 hover:bg-muted p-2 rounded-lg transition-colors cursor-pointer">
              <div className="relative flex-shrink-0">
                <Image
                  src={story?.thumbnail}
                  alt={story?.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-lg flex items-center justify-center">
                  <Icon name="Play" size={16} color="white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-foreground text-sm truncate">{story?.title}</h4>
                <p className="text-xs text-muted-foreground">by {story?.author}</p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon name="Eye" size={12} className="text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{story?.views?.toLocaleString()} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-3 text-sm">
          View All Stories
        </Button>
      </div>
    </div>
  );
};

export default TrendingPanel;