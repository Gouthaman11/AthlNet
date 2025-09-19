import React from 'react';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const SocialAuthOptions = ({ onSocialLogin, isLoading, disabled }) => {
  const socialProviders = [
    {
      id: 'google',
      name: 'Google',
      icon: 'Chrome',
      color: 'bg-white hover:bg-gray-50 text-gray-900 border border-border',
      description: 'Continue with Google'
    }
  ];

  const handleSocialLogin = (provider) => {
    if (onSocialLogin) {
      onSocialLogin(provider);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Quick Registration
        </h3>
        <p className="text-sm text-muted-foreground">
          Sign up with your Google account or email
        </p>
      </div>
      <div className="space-y-3">
        {socialProviders?.map((provider) => (
          <Button
            key={provider?.id}
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => handleSocialLogin(provider?.id)}
            disabled={isLoading || disabled}
            className={`${provider?.color} transition-smooth hover-scale`}
          >
            <Icon name={provider?.icon} size={20} className="mr-3" />
            {provider?.description}
          </Button>
        ))}
      </div>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-background text-muted-foreground">
            or register with email
          </span>
        </div>
      </div>
      {/* Benefits of Registration */}
      <div className="p-4 bg-muted rounded-lg">
        <h4 className="font-medium text-foreground mb-2 flex items-center">
          <Icon name="Zap" size={16} className="mr-2 text-primary" />
          Registration Benefits
        </h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li className="flex items-center">
            <Icon name="Check" size={14} className="mr-2 text-success" />
            Quick setup with Google
          </li>
          <li className="flex items-center">
            <Icon name="Check" size={14} className="mr-2 text-success" />
            Secure authentication
          </li>
          <li className="flex items-center">
            <Icon name="Check" size={14} className="mr-2 text-success" />
            Auto-fill profile information
          </li>
          <li className="flex items-center">
            <Icon name="Check" size={14} className="mr-2 text-success" />
            Easy account recovery
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SocialAuthOptions;