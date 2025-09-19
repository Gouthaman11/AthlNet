import React from 'react';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const ConversionCallouts = ({ userType, onUserTypeSelect, onGetStarted, className = '' }) => {
  const userTypes = [
    {
      id: 'athlete',
      title: 'Athletes',
      description: 'Showcase your achievements and connect with opportunities',
      icon: 'Trophy',
      benefits: ['Build your sports profile', 'Connect with scouts', 'Share achievements'],
      color: 'bg-primary',
    },
    {
      id: 'coach',
      title: 'Coaches',
      description: 'Discover talent and grow your professional network',
      icon: 'Users',
      benefits: ['Find talented athletes', 'Share expertise', 'Build reputation'],
      color: 'bg-secondary',
    },
    {
      id: 'sponsor',
      title: 'Sponsors',
      description: 'Connect with athletes and measure engagement impact',
      icon: 'Target',
      benefits: ['Discover partnerships', 'Track engagement', 'Measure ROI'],
      color: 'bg-accent',
    },
    {
      id: 'fan',
      title: 'Fans',
      description: 'Follow your favorite athletes and stay connected',
      icon: 'Heart',
      benefits: ['Follow athletes', 'Get exclusive content', 'Join community'],
      color: 'bg-warning',
    },
  ];

  const handleUserTypeClick = (type) => {
    if (onUserTypeSelect) {
      onUserTypeSelect(type);
    }
  };

  const handleGetStartedClick = () => {
    if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* User Type Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {userTypes?.map((type) => (
          <div
            key={type?.id}
            className={`relative p-6 rounded-lg border-2 cursor-pointer transition-smooth hover-scale ${
              userType === type?.id
                ? 'border-primary bg-primary/5 shadow-modal'
                : 'border-border bg-card hover:border-primary/50 shadow-card'
            }`}
            onClick={() => handleUserTypeClick(type?.id)}
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`w-12 h-12 rounded-full ${type?.color} flex items-center justify-center`}>
                <Icon name={type?.icon} size={24} color="white" />
              </div>
              
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">{type?.title}</h3>
                <p className="text-sm text-muted-foreground">{type?.description}</p>
              </div>
              
              <ul className="space-y-1">
                {type?.benefits?.map((benefit, index) => (
                  <li key={index} className="flex items-center text-xs text-muted-foreground">
                    <Icon name="Check" size={12} className="mr-2 text-success" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            {userType === type?.id && (
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={16} color="white" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Call to Action */}
      {userType && (
        <div className="text-center space-y-4 animate-fade-in">
          <div className="p-6 bg-muted rounded-lg">
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Ready to join as a {userTypes?.find(t => t?.id === userType)?.title?.slice(0, -1)}?
            </h4>
            <p className="text-muted-foreground mb-4">
              Join thousands of sports professionals already building their network on AthlNet.
            </p>
            <Button
              variant="default"
              size="lg"
              onClick={handleGetStartedClick}
              className="bg-primary hover:bg-primary/90"
              iconName="ArrowRight"
              iconPosition="right"
            >
              Get Started Now
            </Button>
          </div>
        </div>
      )}
      {/* Social Proof */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-8 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} />
            <span>10K+ Athletes</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Trophy" size={16} />
            <span>500+ Coaches</span>
          </div>
          <div className="flex items-center space-x-2">
            <Icon name="Target" size={16} />
            <span>100+ Sponsors</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          {[...Array(5)]?.map((_, i) => (
            <Icon key={i} name="Star" size={16} className="text-warning fill-current" />
          ))}
          <span className="ml-2 text-sm text-muted-foreground">4.9/5 from 2,000+ reviews</span>
        </div>
      </div>
    </div>
  );
};

export default ConversionCallouts;