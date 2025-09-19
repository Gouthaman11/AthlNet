import React from 'react';
import Icon from 'components/AppIcon';

const TrustSignals = () => {
  const trustFeatures = [
    {
      icon: 'Shield',
      text: 'SSL Encrypted',
      description: 'Your data is protected'
    },
    {
      icon: 'Lock',
      text: 'Secure Login',
      description: 'Bank-level security'
    },
    {
      icon: 'CheckCircle',
      text: 'Verified Platform',
      description: 'Trusted by 10K+ users'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center space-x-6">
        {trustFeatures?.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name={feature?.icon} size={16} className="text-success" />
            <span>{feature?.text}</span>
          </div>
        ))}
      </div>
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <button className="text-primary hover:text-primary/80 underline">
            Terms of Service
          </button>{' '}
          and{' '}
          <button className="text-primary hover:text-primary/80 underline">
            Privacy Policy
          </button>
        </p>
      </div>
      <div className="flex items-center justify-center space-x-4 pt-2">
        <div className="flex items-center space-x-1">
          <Icon name="Users" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">10K+ Athletes</span>
        </div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
        <div className="flex items-center space-x-1">
          <Icon name="Trophy" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">500+ Coaches</span>
        </div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
        <div className="flex items-center space-x-1">
          <Icon name="Target" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">100+ Sponsors</span>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;