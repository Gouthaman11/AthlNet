import React from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const BenefitsSection = () => {
  const benefits = [
    {
      id: 1,
      icon: 'Network',
      title: 'Professional Networking',
      description: 'Connect with athletes, coaches, sponsors, and industry professionals to expand your sports network and discover new opportunities.',
      image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['Direct messaging', 'Connection requests', 'Industry insights', 'Collaboration tools']
    },
    {
      id: 2,
      icon: 'Camera',
      title: 'Media Sharing',
      description: 'Showcase your achievements, training sessions, and sports journey through photos, videos, and stories that engage your audience.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['Photo & video uploads', 'Story highlights', 'Live streaming', 'Achievement galleries']
    },
    {
      id: 3,
      icon: 'TrendingUp',
      title: 'Career Advancement',
      description: 'Build your professional profile, track your progress, and get discovered by scouts, coaches, and sponsors looking for talent.',
      image: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['Profile optimization', 'Achievement tracking', 'Skill verification', 'Opportunity alerts']
    },
    {
      id: 4,
      icon: 'Users',
      title: 'Community Building',
      description: 'Join sports-specific communities, participate in challenges, and engage with content from your favorite athletes and teams.',
      image: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['Sports communities', 'Group challenges', 'Event participation', 'Fan engagement']
    },
    {
      id: 5,
      icon: 'Search',
      title: 'Smart Discovery',
      description: 'Find exactly what you\'re looking for with advanced search and AI-powered recommendations tailored to your interests and goals.',
      image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['Advanced filters', 'AI recommendations', 'Trending content', 'Personalized feed']
    },
    {
      id: 6,
      icon: 'Shield',
      title: 'Verified Profiles',
      description: 'Trust and authenticity with verified athlete badges, secure messaging, and privacy controls to protect your professional reputation.',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      features: ['Identity verification', 'Privacy settings', 'Secure messaging', 'Content moderation']
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-secondary/10 rounded-full text-secondary text-sm font-medium">
            <Icon name="Sparkles" size={16} className="mr-2" />
            Platform Benefits
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Everything You Need to Succeed in Sports
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            AthlNet combines the best of social media engagement with professional networking tools designed specifically for the sports industry.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits?.map((benefit, index) => (
            <div
              key={benefit?.id}
              className={`group bg-card rounded-xl shadow-card hover:shadow-modal transition-smooth border border-border overflow-hidden hover-scale ${
                index === 0 ? 'md:col-span-2 lg:col-span-1' : ''
              }`}
            >
              {/* Benefit Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={benefit?.image}
                  alt={benefit?.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                
                {/* Icon Overlay */}
                <div className="absolute bottom-4 left-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-modal">
                    <Icon name={benefit?.icon} size={24} className="text-white" />
                  </div>
                </div>
              </div>

              {/* Benefit Content */}
              <div className="p-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-smooth">
                    {benefit?.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit?.description}
                  </p>
                </div>

                {/* Feature List */}
                <div className="space-y-2">
                  {benefit?.features?.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Check" size={16} className="mr-2 text-success flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-muted rounded-full p-2">
            <div className="flex -space-x-2">
              {[...Array(4)]?.map((_, i) => (
                <div
                  key={i}
                  className="w-8 h-8 bg-primary rounded-full border-2 border-background flex items-center justify-center"
                >
                  <Icon name="User" size={14} className="text-white" />
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground pr-4">
              Join 10,000+ athletes already building their careers on AthlNet
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;