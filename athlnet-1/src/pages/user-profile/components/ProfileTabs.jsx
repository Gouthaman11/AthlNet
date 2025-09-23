import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import { getUserPosts, getUserConnections } from '../../../utils/firestoreSocialApi';
import { safeLog } from '../../../utils/safeLogging';
import CoachDashboard from './CoachDashboard';
import CoachInfo from '../../../components/CoachInfo';

const ProfileTabs = ({ userProfile, activeTab, onTabChange }) => {
  const [userPosts, setUserPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [userConnections, setUserConnections] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  
  const navigate = useNavigate();

  // Load user posts when posts tab is active
  useEffect(() => {
    if (activeTab === 'posts' && userProfile?.uid) {
      loadUserPosts();
    }
  }, [activeTab, userProfile?.uid]);

  // Load user connections when connections tab is active
  useEffect(() => {
    if (activeTab === 'connections' && userProfile?.uid) {
      loadUserConnections();
    }
  }, [activeTab, userProfile?.uid]);

  const loadUserPosts = async () => {
    try {
      setPostsLoading(true);
      safeLog.log('Loading posts for user:', userProfile.uid);
      const posts = await getUserPosts(userProfile.uid, 20);
      safeLog.log('Loaded posts:', posts.length);
      setUserPosts(posts);
    } catch (error) {
      safeLog.error('Failed to load user posts:', error);
      setUserPosts([]);
    } finally {
      setPostsLoading(false);
    }
  };

  const loadUserConnections = async () => {
    try {
      setConnectionsLoading(true);
      safeLog.log('Loading connections for user:', userProfile.uid);
      const connections = await getUserConnections(userProfile.uid);
      safeLog.log('Successfully loaded connections:', connections.length);
      setUserConnections(connections);
    } catch (error) {
      safeLog.error('Failed to load user connections:', error);
      setUserConnections([]);
    } finally {
      setConnectionsLoading(false);
    }
  };

  const handleViewProfile = (connectionId) => {
    navigate(`/profile/${connectionId}`);
  };

  const handleMessage = (connectionId) => {
    navigate(`/messaging?user=${connectionId}`);
  };
  // Check if user is a coach to show coaching tab
  const isCoach = userProfile?.role === 'coach' || userProfile?.userType === 'coach' || userProfile?.isCoach;
  
  // Debug logging for coach detection
  React.useEffect(() => {
    if (userProfile) {
      console.log('🏆 Coach Detection Debug:', {
        userId: userProfile.uid || userProfile.id,
        role: userProfile.role,
        userType: userProfile.userType,
        isCoach: userProfile.isCoach,
        isCoachDetected: isCoach,
        isOwnProfile: userProfile.isOwnProfile,
        personalInfoRole: userProfile.personalInfo?.role,
        personalInfoUserType: userProfile.personalInfo?.userType
      });
    }
  }, [userProfile, isCoach]);
  
  const tabs = [
    { id: 'about', label: 'About', icon: 'User' },
    { id: 'posts', label: 'Posts', icon: 'FileText' },
    { id: 'media', label: 'Media', icon: 'Image' },
    { id: 'achievements', label: 'Achievements', icon: 'Trophy' },
    { id: 'connections', label: 'Connections', icon: 'Users' },
    ...(isCoach && userProfile?.isOwnProfile ? [{ id: 'coaching', label: 'Coaching', icon: 'BookOpen' }] : [])
  ];

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      {/* Tab Navigation */}
      <div className="border-b border-border">
        <nav className="flex overflow-x-auto">
          {tabs?.map((tab) => (
            <button
              key={tab?.id}
              onClick={() => onTabChange(tab?.id)}
              className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab?.id
                  ? 'border-primary text-primary bg-primary/5' :'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <Icon name={tab?.icon} size={18} />
              <span>{tab?.label}</span>
            </button>
          ))}
        </nav>
      </div>
      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'about' && (
          <div className="space-y-6">
            {/* Coach Information (for athletes) */}
            <CoachInfo athleteProfile={userProfile} />

            {/* Bio */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Biography</h3>
              <p className="text-muted-foreground leading-relaxed">{userProfile?.bio}</p>
            </div>

            {/* Career Details */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Career Highlights</h3>
              <div className="space-y-3">
                {userProfile?.careerHighlights?.map((highlight, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium text-foreground">{highlight?.title}</p>
                      <p className="text-sm text-muted-foreground">{highlight?.year} • {highlight?.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Future Goals</h3>
              <div className="grid gap-3">
                {userProfile?.goals?.map((goal, index) => (
                  <div key={index} className="p-4 bg-muted rounded-lg">
                    <p className="text-foreground">{goal}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'posts' && (
          <div className="space-y-4">
            {postsLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={32} className="text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading posts...</p>
              </div>
            ) : userPosts && userPosts.length > 0 ? (
              userPosts.map((post) => (
                <div key={post?.id} className="p-4 bg-muted rounded-lg border border-border">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                      {post?.author?.avatar || userProfile?.profileImage || userProfile?.avatarUrl ? (
                        <img 
                          src={post?.author?.avatar || userProfile?.profileImage || userProfile?.avatarUrl} 
                          alt={post?.author?.name || userProfile?.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <Icon name="User" size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{post?.author?.name || userProfile?.name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">
                        {post?.createdAt ? 
                          new Date(post?.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 
                          'Recently'
                        }
                      </p>
                    </div>
                  </div>
                  
                  {/* Post Content */}
                  {post?.content && (
                    <p className="text-foreground mb-3 leading-relaxed">{post.content}</p>
                  )}
                  
                  {/* Post Media */}
                  {(post?.media || post?.mediaUrls) && (post?.media?.length > 0 || post?.mediaUrls?.length > 0) && (
                    <div className="mb-4">
                      {(() => {
                        const mediaItems = post?.media || post?.mediaUrls?.map(url => ({ url, type: 'image' })) || [];
                        
                        if (mediaItems.length === 1) {
                          return (
                            <div className="rounded-lg overflow-hidden">
                              {mediaItems[0]?.type === 'image' || !mediaItems[0]?.type ? (
                                <img 
                                  src={mediaItems[0]?.url} 
                                  alt="Post content" 
                                  className="w-full max-h-64 object-cover" 
                                />
                              ) : (
                                <video 
                                  src={mediaItems[0]?.url} 
                                  controls 
                                  className="w-full max-h-64 object-cover" 
                                />
                              )}
                            </div>
                          );
                        } else if (mediaItems.length > 1) {
                          return (
                            <div className="grid grid-cols-2 gap-2">
                              {mediaItems.slice(0, 4).map((media, index) => (
                                <div key={index} className="aspect-square rounded-lg overflow-hidden">
                                  {media?.type === 'image' || !media?.type ? (
                                    <img 
                                      src={media?.url} 
                                      alt={`Post media ${index + 1}`} 
                                      className="w-full h-full object-cover" 
                                    />
                                  ) : (
                                    <video 
                                      src={media?.url} 
                                      className="w-full h-full object-cover" 
                                      muted 
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                  
                  {/* Post Actions */}
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground pt-2 border-t border-border/50">
                    <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                      <Icon name="Heart" size={16} />
                      <span>{post?.likes?.length || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                      <Icon name="MessageCircle" size={16} />
                      <span>{post?.comments?.length || 0}</span>
                    </button>
                    <button className="flex items-center space-x-1 hover:text-primary transition-colors">
                      <Icon name="Share" size={16} />
                      <span>{post?.shares || 0}</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground">
                  {userProfile?.isOwnProfile ? 
                    "Share your first post to get started!" : 
                    "This user hasn't posted anything yet."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'media' && (
          <div>
            {userProfile?.media && userProfile?.media?.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userProfile?.media?.map((item, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer">
                    {item?.type === 'image' ? (
                      <img 
                        src={item?.url} 
                        alt={item?.name || `Media ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <video 
                        src={item?.url} 
                        className="w-full h-full object-cover" 
                        muted
                      />
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <Icon 
                        name={item?.type === 'video' ? 'Play' : 'Eye'} 
                        size={24} 
                        color="white" 
                        className="opacity-0 group-hover:opacity-100 transition-opacity" 
                      />
                    </div>
                    {item?.type === 'video' && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                        <Icon name="Play" size={12} color="white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Image" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No media yet</h3>
                <p className="text-muted-foreground">
                  {userProfile?.isOwnProfile ? 
                    "Share posts with photos or videos to see them here!" : 
                    "This user hasn't shared any media yet."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="space-y-4">
            {userProfile?.achievements?.map((achievement, index) => (
              <div key={index} className="flex items-start space-x-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Trophy" size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{achievement?.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{achievement?.date} • {achievement?.organization}</p>
                  <p className="text-muted-foreground">{achievement?.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'connections' && (
          <div className="space-y-4">
            {connectionsLoading ? (
              <div className="text-center py-12">
                <Icon name="Loader2" size={32} className="text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground">Loading connections...</p>
              </div>
            ) : userConnections && userConnections.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userConnections.map((connection) => (
                  <div key={connection?.id} className="p-4 bg-muted rounded-lg border border-border hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
                        {connection?.profileImage ? (
                          <img 
                            src={connection.profileImage} 
                            alt={connection?.name || 'User'} 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <Icon name="User" size={16} className="text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {connection?.name || connection?.displayName || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {connection?.title || connection?.sport || 'Athlete'}
                        </p>
                        {connection?.location && (
                          <p className="text-xs text-muted-foreground truncate">
                            {connection.location}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {connection?.bio && (
                      <p className="text-sm text-muted-foreground mb-3 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {connection.bio}
                      </p>
                    )}
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewProfile(connection.id || connection.uid)}
                        className="flex-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium"
                      >
                        View Profile
                      </button>
                      <button 
                        onClick={() => handleMessage(connection.id || connection.uid)}
                        className="px-3 py-2 bg-background border border-border text-sm rounded-lg hover:bg-muted transition-colors"
                        title="Send Message"
                      >
                        <Icon name="MessageCircle" size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : userProfile?.connections && userProfile.connections.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    Found {userProfile.connections.length} connections, but couldn't load their profile details. 
                    This might be a temporary issue.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userProfile.connections.map((connectionId, index) => (
                    <div key={connectionId} className="p-4 bg-muted rounded-lg border border-border">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary flex items-center justify-center flex-shrink-0">
                          <Icon name="User" size={16} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate">
                            Connection {index + 1}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            Athlete
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewProfile(connectionId)}
                          className="flex-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors font-medium"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => handleMessage(connectionId)}
                          className="px-3 py-2 bg-background border border-border text-sm rounded-lg hover:bg-muted transition-colors"
                          title="Send Message"
                        >
                          <Icon name="MessageCircle" size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {userProfile?.isOwnProfile ? 'No connections yet' : 'No connections to show'}
                </h3>
                <p className="text-muted-foreground">
                  {userProfile?.isOwnProfile ? 
                    "Connect with other athletes to see them here!" : 
                    "This user hasn't connected with anyone yet."
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'coaching' && isCoach && (
          <CoachDashboard userProfile={userProfile} />
        )}
      </div>
    </div>
  );
};

export default ProfileTabs;