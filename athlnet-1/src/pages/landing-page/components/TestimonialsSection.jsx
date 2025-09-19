import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const TestimonialsSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Professional Tennis Player',
      sport: 'Tennis',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      verified: true,
      rating: 5,
      content: `AthlNet transformed my career! I connected with my current coach through the platform and landed three major sponsorship deals. The networking opportunities are incredible, and the community support keeps me motivated every day.`,
      achievement: 'WTA Ranking #47',
      followers: '125K'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      role: 'Basketball Coach',
      sport: 'Basketball',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      verified: true,
      rating: 5,
      content: `As a coach, AthlNet helps me discover talented athletes from around the world. I've recruited 15 players through the platform, and the detailed profiles make scouting so much more efficient. It's a game-changer for talent discovery.`,
      achievement: '15+ Players Recruited',
      followers: '89K'
    },
    {
      id: 3,
      name: 'Emily Chen',
      role: 'Olympic Swimmer',
      sport: 'Swimming',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      verified: true,
      rating: 5,
      content: `The media sharing features on AthlNet allowed me to document my Olympic journey and connect with fans worldwide. The platform's professional networking helped me secure partnerships that support my training and competition goals.`,achievement: 'Olympic Gold Medalist',followers: '340K'
    },
    {
      id: 4,
      name: 'David Thompson',role: 'Sports Sponsor',sport: 'Multi-Sport',avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      verified: true,
      rating: 5,
      content: `AthlNet's analytics and engagement metrics help us identify the right athletes for our brand partnerships. We've seen 300% better ROI on our sponsorships since using the platform's data-driven approach to athlete selection.`,
      achievement: 'CEO, SportsTech Inc.',
      followers: '45K'
    },
    {
      id: 5,
      name: 'Alex Rivera',
      role: 'Soccer Player',
      sport: 'Soccer',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
      verified: true,
      rating: 5,
      content: `From amateur to professional - AthlNet was with me every step of the way. The platform helped me showcase my skills, connect with scouts, and eventually sign with my dream team. The community support is unmatched!`,
      achievement: 'MLS Player',
      followers: '78K'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials?.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [testimonials?.length]);

  const handlePrevious = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials?.length) % testimonials?.length);
  };

  const handleNext = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials?.length);
  };

  const currentTestimonialData = testimonials?.[currentTestimonial];

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 rounded-full text-accent text-sm font-medium">
            <Icon name="MessageSquare" size={16} className="mr-2" />
            Success Stories
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Trusted by Athletes Worldwide
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            See how AthlNet has helped thousands of athletes, coaches, and sports professionals achieve their goals and build successful careers.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative">
          <div className="bg-card rounded-2xl shadow-modal border border-border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Testimonial Content */}
              <div className="p-8 lg:p-12 space-y-6">
                {/* Rating */}
                <div className="flex items-center space-x-1">
                  {[...Array(currentTestimonialData?.rating)]?.map((_, i) => (
                    <Icon key={i} name="Star" size={20} className="text-warning fill-current" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="text-lg lg:text-xl text-foreground leading-relaxed">
                  "{currentTestimonialData?.content}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Image
                      src={currentTestimonialData?.avatar}
                      alt={currentTestimonialData?.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    {currentTestimonialData?.verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                        <Icon name="Check" size={12} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-foreground">{currentTestimonialData?.name}</h4>
                      {currentTestimonialData?.verified && (
                        <Icon name="BadgeCheck" size={16} className="text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentTestimonialData?.role}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Icon name="Award" size={12} className="mr-1" />
                        {currentTestimonialData?.achievement}
                      </span>
                      <span className="flex items-center">
                        <Icon name="Users" size={12} className="mr-1" />
                        {currentTestimonialData?.followers} followers
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visual Element */}
              <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 p-8 lg:p-12 flex items-center justify-center">
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Icon name="Quote" size={40} className="text-primary" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                      {currentTestimonialData?.sport}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Professional Athlete
                    </div>
                  </div>

                  {/* Achievement Badge */}
                  <div className="inline-flex items-center px-4 py-2 bg-success/10 rounded-full text-success text-sm font-medium">
                    <Icon name="Trophy" size={16} className="mr-2" />
                    Verified Success Story
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div className="absolute top-1/2 -translate-y-1/2 -left-4 lg:-left-6">
            <button
              onClick={handlePrevious}
              className="w-12 h-12 bg-card rounded-full shadow-modal border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-smooth hover-scale"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
          </div>
          
          <div className="absolute top-1/2 -translate-y-1/2 -right-4 lg:-right-6">
            <button
              onClick={handleNext}
              className="w-12 h-12 bg-card rounded-full shadow-modal border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary transition-smooth hover-scale"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </div>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          {testimonials?.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-smooth ${
                index === currentTestimonial ? 'bg-primary' : 'bg-border hover:bg-muted-foreground'
              }`}
            />
          ))}
        </div>

        {/* Additional Testimonials Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {testimonials?.slice(0, 3)?.map((testimonial, index) => (
            <div
              key={testimonial?.id}
              className={`bg-card rounded-lg p-6 shadow-card border border-border transition-smooth hover-scale ${
                index === currentTestimonial ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className="flex items-center space-x-3 mb-4">
                <Image
                  src={testimonial?.avatar}
                  alt={testimonial?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="flex items-center space-x-1">
                    <h5 className="font-medium text-foreground text-sm">{testimonial?.name}</h5>
                    {testimonial?.verified && (
                      <Icon name="BadgeCheck" size={14} className="text-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{testimonial?.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1 mb-3">
                {[...Array(testimonial?.rating)]?.map((_, i) => (
                  <Icon key={i} name="Star" size={14} className="text-warning fill-current" />
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-3">
                {testimonial?.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;