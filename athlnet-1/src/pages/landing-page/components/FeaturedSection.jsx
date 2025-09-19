import React, { useState } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const FeaturedSection = () => {
  const [activeTab, setActiveTab] = useState('athletes');

  const featuredAthletes = [
    {
      id: 1,
      name: 'Maria Santos',
      sport: 'Track & Field',
      achievement: 'Olympic Gold Medalist',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      followers: '245K',
      verified: true,
      recentPost: 'Training for the upcoming World Championships! 💪',
      engagement: '12.5K likes'
    },
    {
      id: 2,
      name: 'James Wilson',
      sport: 'Basketball',
      achievement: 'NBA All-Star',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      followers: '189K',
      verified: true,
      recentPost: 'Great practice session with the team today!',
      engagement: '8.7K likes'
    },
    {
      id: 3,
      name: 'Sophie Chen',
      sport: 'Swimming',
      achievement: 'World Record Holder',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      followers: '156K',
      verified: true,
      recentPost: 'New personal best in training! Ready for competition 🏊‍♀️',
      engagement: '15.2K likes'
    },
    {
      id: 4,
      name: 'Carlos Rodriguez',
      sport: 'Soccer',
      achievement: 'Premier League Player',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      followers: '298K',
      verified: true,
      recentPost: 'Amazing match today! Thanks to all the fans for the support ⚽',
      engagement: '22.1K likes'
    }
  ];

  const trendingContent = [
    {
      id: 1,
      type: 'video',
      title: 'Behind the Scenes: Olympic Training',
      author: 'Maria Santos',
      thumbnail: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: '125K',
      hashtags: ['#Olympics', '#Training', '#Motivation'],
      duration: '2:45'
    },
    {
      id: 2,
      type: 'photo',
      title: 'Victory Celebration',
      author: 'James Wilson',
      thumbnail: 'https://images.unsplash.com/photo-1546525848-3ce03ca516f6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: '89K',
      hashtags: ['#Victory', '#Basketball', '#TeamWork'],
      duration: null
    },
    {
      id: 3,
      type: 'story',
      title: 'Road to Recovery',
      author: 'Sophie Chen',
      thumbnail: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: '67K',
      hashtags: ['#Recovery', '#Swimming', '#Comeback'],
      duration: '1:30'
    },
    {
      id: 4,
      type: 'video',
      title: 'Match Highlights',
      author: 'Carlos Rodriguez',
      thumbnail: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: '234K',
      hashtags: ['#Soccer', '#Goals', '#Highlights'],
      duration: '3:12'
    }
  ];

  const tabs = [
    { id: 'athletes', label: 'Featured Athletes', icon: 'Trophy' },
    { id: 'content', label: 'Trending Content', icon: 'TrendingUp' }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-warning/10 rounded-full text-warning text-sm font-medium">
            <Icon name="Star" size={16} className="mr-2" />
            Community Highlights
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Discover Amazing Athletes & Content
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore featured athletes, trending content, and inspiring stories from our vibrant sports community.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-center mb-12">
          <div className="bg-muted rounded-lg p-1 flex">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-md text-sm font-medium transition-smooth ${
                  activeTab === tab?.id
                    ? 'bg-card text-foreground shadow-card'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Athletes Tab */}
        {activeTab === 'athletes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAthletes?.map((athlete) => (
              <div
                key={athlete?.id}
                className="bg-card rounded-xl shadow-card border border-border overflow-hidden hover-scale transition-smooth group"
              >
                {/* Profile Header */}
                <div className="p-6 text-center space-y-4">
                  <div className="relative inline-block">
                    <Image
                      src={athlete?.avatar}
                      alt={athlete?.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto"
                    />
                    {athlete?.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                        <Icon name="Check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <h3 className="font-semibold text-foreground">{athlete?.name}</h3>
                      {athlete?.verified && (
                        <Icon name="BadgeCheck" size={16} className="text-primary" />
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{athlete?.sport}</p>
                      <p className="text-xs text-accent font-medium">{athlete?.achievement}</p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Users" size={14} />
                      <span>{athlete?.followers}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Heart" size={14} />
                      <span>{athlete?.engagement}</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="px-6 pb-6">
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Icon name="Clock" size={12} />
                      <span>Recent post</span>
                    </div>
                    <p className="text-sm text-foreground">{athlete?.recentPost}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trending Content Tab */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingContent?.map((content) => (
              <div
                key={content?.id}
                className="bg-card rounded-xl shadow-card border border-border overflow-hidden hover-scale transition-smooth group"
              >
                {/* Content Thumbnail */}
                <div className="relative">
                  <Image
                    src={content?.thumbnail}
                    alt={content?.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-smooth"
                  />
                  
                  {/* Content Type Badge */}
                  <div className="absolute top-3 left-3">
                    <div className="bg-black/70 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
                      <Icon 
                        name={content?.type === 'video' ? 'Play' : content?.type === 'photo' ? 'Camera' : 'BookOpen'} 
                        size={12} 
                        className="text-white" 
                      />
                      <span className="text-xs text-white capitalize">{content?.type}</span>
                    </div>
                  </div>

                  {/* Duration for videos */}
                  {content?.duration && (
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/70 backdrop-blur-sm rounded px-2 py-1">
                        <span className="text-xs text-white">{content?.duration}</span>
                      </div>
                    </div>
                  )}

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-smooth flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Icon name="Play" size={20} className="text-white" />
                    </div>
                  </div>
                </div>

                {/* Content Info */}
                <div className="p-4 space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground line-clamp-2 group-hover:text-primary transition-smooth">
                      {content?.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">by {content?.author}</p>
                  </div>

                  {/* Hashtags */}
                  <div className="flex flex-wrap gap-1">
                    {content?.hashtags?.map((hashtag, index) => (
                      <span
                        key={index}
                        className="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full"
                      >
                        {hashtag}
                      </span>
                    ))}
                  </div>

                  {/* Views */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Eye" size={14} />
                      <span>{content?.views} views</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Icon name="Heart" size={14} />
                      <Icon name="MessageCircle" size={14} />
                      <Icon name="Share" size={14} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-2xl p-8 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">
              Ready to Join the Community?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with amazing athletes, share your journey, and discover opportunities that can transform your sports career.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-medium transition-smooth hover-scale flex items-center justify-center space-x-2">
                <Icon name="UserPlus" size={20} />
                <span>Join AthlNet</span>
              </button>
              <button className="border border-border hover:border-primary text-foreground px-8 py-3 rounded-lg font-medium transition-smooth hover-scale flex items-center justify-center space-x-2">
                <Icon name="Play" size={20} />
                <span>Watch Demo</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;