import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseClient';
import { getAllTrendingData } from '../../../services/sportsApiService';
import { connectWithUser } from '../../../utils/firestoreSocialApi';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const TrendingPanel = () => {
  const [user] = useAuthState(auth);
  const [trendingData, setTrendingData] = useState({
    trending: [],
    connections: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectingUsers, setConnectingUsers] = useState(new Set());
  const [hiddenConnections, setHiddenConnections] = useState(new Set());

  // Load trending data on component mount
  useEffect(() => {
    loadTrendingData();
  }, [user?.uid]);

  const loadTrendingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllTrendingData(user?.uid);
      setTrendingData(data);
    } catch (error) {
      console.error('Error loading trending data:', error);
      setError('Failed to load trending data');
    } finally {
      setLoading(false);
    }
  };

  // Handle connection with suggested users
  const handleConnect = async (connectionId) => {
    if (!user?.uid || connectingUsers.has(connectionId)) return;

    setConnectingUsers(prev => new Set([...prev, connectionId]));
    try {
      await connectWithUser(user.uid, connectionId);
      
      // Remove connected user from suggestions
      setTrendingData(prev => ({
        ...prev,
        connections: prev.connections.filter(conn => conn.id !== connectionId)
      }));
      
      // Show success feedback (optional)
      console.log('Successfully connected with user');
    } catch (error) {
      console.error('Failed to connect with user:', error);
    } finally {
      setConnectingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectionId);
        return newSet;
      });
    }
  };

  // Handle hiding suggested connections
  const handleHideConnection = (connectionId) => {
    setHiddenConnections(prev => new Set([...prev, connectionId]));
  };

  // Handle clicking on trending topics
  const handleTrendingClick = (trend) => {
    if (trend.url) {
      window.open(trend.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Filter visible connections
  const visibleConnections = trendingData.connections.filter(
    conn => !hiddenConnections.has(conn.id)
  );

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
          <div className="flex items-center space-x-2">
            {!loading && (
              <Button 
                variant="ghost" 
                size="xs" 
                onClick={loadTrendingData}
                className="p-1"
              >
                <Icon name="RefreshCw" size={14} />
              </Button>
            )}
            <Icon name="TrendingUp" size={18} className="text-primary" />
          </div>
        </div>
        
        {error ? (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <Icon name="AlertCircle" size={24} className="mx-auto mb-2 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={loadTrendingData}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        ) : loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {trendingData.trending.map((trend, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between hover:bg-muted p-2 rounded-lg transition-colors cursor-pointer"
                onClick={() => handleTrendingClick(trend)}
              >
                <div>
                  <p className="font-medium text-primary text-sm">{trend.tag}</p>
                  <p className="text-xs text-muted-foreground">
                    {trend.posts?.toLocaleString()} {trend.source ? `posts from ${trend.source}` : 'posts'}
                  </p>
                  {trend.title && (
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                      {trend.title}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="TrendingUp" size={12} className="text-success" />
                  <span className="text-xs text-success font-medium">{trend.growth}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        
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
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-start space-x-3 animate-pulse">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {visibleConnections.slice(0, 3).map((connection) => (
              <div key={connection.id} className="flex items-start space-x-3">
                <div className="relative flex-shrink-0">
                  <Image
                    src={connection.avatar}
                    alt={connection.name}
                    className="w-12 h-12 rounded-full object-cover bg-muted"
                  />
                  {connection.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                      <Icon name="Check" size={10} color="white" />
                    </div>
                  )}
                  {connection.isCoach && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Icon name="GraduationCap" size={8} color="white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-foreground text-sm truncate">
                        {connection.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {connection.isCoach ? 'Coach' : 'Athlete'} • {connection.sport}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {connection.achievements}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                        <span>{connection.mutualConnections} mutual connections</span>
                        {connection.location && (
                          <>
                            <span>•</span>
                            <span>{connection.location}</span>
                          </>
                        )}
                      </div>
                      {connection.commonInterests?.length > 0 && (
                        <div className="flex items-center space-x-1 mt-2">
                          {connection.commonInterests.map((interest, idx) => (
                            <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                              {interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button 
                      variant="outline" 
                      size="xs"
                      onClick={() => handleConnect(connection.id)}
                      disabled={connectingUsers.has(connection.id)}
                    >
                      {connectingUsers.has(connection.id) ? (
                        <>
                          <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
                          Connecting...
                        </>
                      ) : (
                        'Connect'
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="xs"
                      onClick={() => handleHideConnection(connection.id)}
                    >
                      <Icon name="X" size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {visibleConnections.length === 0 && !loading && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                <Icon name="Users" size={24} className="mx-auto mb-2 opacity-50" />
                <p>No suggestions available right now</p>
                <p className="text-xs">Check back later for new connections!</p>
              </div>
            )}
          </div>
        )}
        
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