import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import ConversionCallouts from 'components/ui/ConversionCallouts';

const CTASection = () => {
  const navigate = useNavigate();
  const [selectedUserType, setSelectedUserType] = useState('');

  const handleUserTypeSelect = (userType) => {
    setSelectedUserType(userType);
  };

  const handleGetStarted = () => {
    navigate('/user-registration', { state: { userType: selectedUserType } });
  };

  const handleLogin = () => {
    navigate('/user-login');
  };

  return (
    <section className="py-20 bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA Header */}
        <div className="text-center space-y-6 mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Icon name="Rocket" size={16} className="mr-2" />
            Start Your Journey
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Your Sports Career Starts Here
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of athletes, coaches, sponsors, and fans who are already building their future in sports. Choose your path and start connecting today.
          </p>
        </div>

        {/* User Type Selection */}
        <ConversionCallouts
          userType={selectedUserType}
          onUserTypeSelect={handleUserTypeSelect}
          onGetStarted={handleGetStarted}
          className="mb-16"
        />

        {/* Alternative Actions */}
        <div className="text-center space-y-8">
          {/* Login Option */}
          <div className="bg-card rounded-xl p-8 shadow-card border border-border">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-foreground">
                Already Part of AthlNet?
              </h3>
              <p className="text-muted-foreground">
                Welcome back! Sign in to continue building your sports network and achieving your goals.
              </p>
              <Button
                variant="outline"
                size="lg"
                onClick={handleLogin}
                iconName="LogIn"
                iconPosition="left"
                className="hover:border-primary hover:text-primary"
              >
                Sign In to Your Account
              </Button>
            </div>
          </div>

          {/* Features Highlight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Zap" size={24} className="text-primary" />
              </div>
              <h4 className="font-semibold text-foreground">Quick Setup</h4>
              <p className="text-sm text-muted-foreground">
                Get started in under 5 minutes with our streamlined onboarding process
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Shield" size={24} className="text-secondary" />
              </div>
              <h4 className="font-semibold text-foreground">Secure & Private</h4>
              <p className="text-sm text-muted-foreground">
                Your data is protected with enterprise-grade security and privacy controls
              </p>
            </div>
            
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="Headphones" size={24} className="text-accent" />
              </div>
              <h4 className="font-semibold text-foreground">24/7 Support</h4>
              <p className="text-sm text-muted-foreground">
                Our dedicated support team is here to help you succeed every step of the way
              </p>
            </div>
          </div>

          {/* Final Encouragement */}
          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white text-center space-y-4">
            <Icon name="Trophy" size={48} className="mx-auto opacity-90" />
            <h3 className="text-2xl font-bold">
              Don't Wait - Your Future Starts Now
            </h3>
            <p className="text-white/90 max-w-2xl mx-auto">
              Every day you wait is a day of missed opportunities. Join AthlNet today and start building the sports career you've always dreamed of.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => handleGetStarted()}
                className="bg-white text-primary hover:bg-white/90"
                iconName="ArrowRight"
                iconPosition="right"
              >
                Start Free Today
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleLogin}
                className="text-white border-white/30 hover:bg-white/10"
              >
                Sign In Instead
              </Button>
            </div>
          </div>

          {/* Trust Signals */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground opacity-75">
            <div className="flex items-center space-x-2">
              <Icon name="Lock" size={16} />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Award" size={16} />
              <span>Industry Certified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Users" size={16} />
              <span>GDPR Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Clock" size={16} />
              <span>99.9% Uptime</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;