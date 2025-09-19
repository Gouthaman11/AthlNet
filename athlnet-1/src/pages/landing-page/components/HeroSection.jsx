import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const HeroSection = () => {
  const navigate = useNavigate();
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const handleGetStarted = (userType) => {
    navigate('/user-registration', { state: { userType } });
  };

  const handleLogin = () => {
    navigate('/user-login');
  };

  const handleVideoPlay = () => {
    setIsVideoPlaying(true);
  };

  return (
    <section className="relative bg-gradient-to-br from-primary/5 via-background to-secondary/5 pt-20 pb-16 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-accent rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
                <Icon name="Trophy" size={16} className="mr-2" />
                The Future of Sports Networking
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                Connect. Share.{' '}
                <span className="text-primary">Achieve</span> Greatness
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed">
                Join the premier social networking platform where athletes, coaches, sponsors, and fans unite to build careers, share achievements, and discover opportunities in the world of sports.
              </p>
            </div>

            {/* User Type Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGetStarted('athlete')}
                  className="flex flex-col items-center p-4 h-auto hover:border-primary hover:bg-primary/5"
                >
                  <Icon name="Trophy" size={20} className="mb-2 text-primary" />
                  <span className="text-xs font-medium">Athletes</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGetStarted('coach')}
                  className="flex flex-col items-center p-4 h-auto hover:border-secondary hover:bg-secondary/5"
                >
                  <Icon name="Users" size={20} className="mb-2 text-secondary" />
                  <span className="text-xs font-medium">Coaches</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGetStarted('sponsor')}
                  className="flex flex-col items-center p-4 h-auto hover:border-accent hover:bg-accent/5"
                >
                  <Icon name="Target" size={20} className="mb-2 text-accent" />
                  <span className="text-xs font-medium">Sponsors</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGetStarted('fan')}
                  className="flex flex-col items-center p-4 h-auto hover:border-warning hover:bg-warning/5"
                >
                  <Icon name="Heart" size={20} className="mb-2 text-warning" />
                  <span className="text-xs font-medium">Fans</span>
                </Button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() => handleGetStarted('athlete')}
                  className="bg-primary hover:bg-primary/90 flex-1 sm:flex-none"
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  Get Started Free
                </Button>
                
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleLogin}
                  className="flex-1 sm:flex-none"
                >
                  Already have an account? Sign In
                </Button>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Icon name="Users" size={16} />
                <span>10,000+ Athletes</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Star" size={16} className="text-warning" />
                <span>4.9/5 Rating</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Shield" size={16} />
                <span>Verified Platform</span>
              </div>
            </div>
          </div>

          {/* Hero Media */}
          <div className="relative">
            <div className="relative bg-card rounded-2xl shadow-modal overflow-hidden">
              {!isVideoPlaying ? (
                <div className="relative">
                  <Image
                    src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="AthlNet Platform Preview"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Button
                      variant="default"
                      size="lg"
                      onClick={handleVideoPlay}
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30"
                      iconName="Play"
                      iconPosition="left"
                    >
                      Watch Demo
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-80 bg-black flex items-center justify-center">
                  <div className="text-center text-white space-y-4">
                    <Icon name="Play" size={48} className="mx-auto opacity-50" />
                    <p className="text-sm opacity-75">Demo video would play here</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsVideoPlaying(false)}
                      className="text-white hover:bg-white/10"
                    >
                      Close Video
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-6 -left-6 bg-card rounded-lg shadow-modal p-4 border border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-success rounded-full flex items-center justify-center">
                  <Icon name="TrendingUp" size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">2.5M+</div>
                  <div className="text-xs text-muted-foreground">Connections Made</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-card rounded-lg shadow-modal p-4 border border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Award" size={20} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">500+</div>
                  <div className="text-xs text-muted-foreground">Success Stories</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;