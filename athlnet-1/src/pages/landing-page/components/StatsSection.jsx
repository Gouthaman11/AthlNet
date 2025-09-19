import React, { useState, useEffect } from 'react';
import Icon from 'components/AppIcon';

const StatsSection = () => {
  const [counters, setCounters] = useState({
    athletes: 0,
    connections: 0,
    success: 0,
    countries: 0
  });

  const finalStats = {
    athletes: 10000,
    connections: 2500000,
    success: 500,
    countries: 85
  };

  const stats = [
    {
      id: 'athletes',
      icon: 'Users',
      value: counters?.athletes,
      suffix: '+',
      label: 'Active Athletes',
      description: 'Professional and amateur athletes building their careers',
      color: 'text-primary'
    },
    {
      id: 'connections',
      icon: 'Network',
      value: counters?.connections,
      suffix: '+',
      label: 'Connections Made',
      description: 'Meaningful professional relationships formed',
      color: 'text-secondary'
    },
    {
      id: 'success',
      icon: 'Trophy',
      value: counters?.success,
      suffix: '+',
      label: 'Success Stories',
      description: 'Athletes who achieved their career goals',
      color: 'text-accent'
    },
    {
      id: 'countries',
      icon: 'Globe',
      value: counters?.countries,
      suffix: '+',
      label: 'Countries',
      description: 'Global reach across all continents',
      color: 'text-warning'
    }
  ];

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const steps = 60;
    const stepDuration = duration / steps;

    const intervals = Object.keys(finalStats)?.map(key => {
      const increment = finalStats?.[key] / steps;
      let currentValue = 0;
      
      return setInterval(() => {
        currentValue += increment;
        if (currentValue >= finalStats?.[key]) {
          currentValue = finalStats?.[key];
          clearInterval(intervals?.find(interval => interval === this));
        }
        
        setCounters(prev => ({
          ...prev,
          [key]: Math.floor(currentValue)
        }));
      }, stepDuration);
    });

    return () => {
      intervals?.forEach(interval => clearInterval(interval));
    };
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000)?.toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000)?.toFixed(0) + 'K';
    }
    return num?.toString();
  };

  return (
    <section className="py-20 bg-gradient-to-r from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
            <Icon name="BarChart3" size={16} className="mr-2" />
            Platform Impact
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Powering Sports Careers Globally
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join a thriving community of athletes, coaches, and sports professionals who are already building their futures on AthlNet.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats?.map((stat) => (
            <div
              key={stat?.id}
              className="bg-card rounded-xl p-8 shadow-card border border-border text-center space-y-4 hover-scale transition-smooth group"
            >
              {/* Icon */}
              <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-${stat?.color?.split('-')?.[1]}/10 to-${stat?.color?.split('-')?.[1]}/20 flex items-center justify-center group-hover:scale-110 transition-smooth`}>
                <Icon name={stat?.icon} size={32} className={stat?.color} />
              </div>

              {/* Value */}
              <div className="space-y-2">
                <div className={`text-4xl md:text-5xl font-bold ${stat?.color} font-data`}>
                  {formatNumber(stat?.value)}{stat?.suffix}
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {stat?.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stat?.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Metrics */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-foreground">98%</div>
            <div className="text-sm text-muted-foreground">User Satisfaction Rate</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-foreground">24/7</div>
            <div className="text-sm text-muted-foreground">Platform Availability</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-foreground">&lt;2s</div>
            <div className="text-sm text-muted-foreground">Average Load Time</div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 opacity-60">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Shield" size={16} />
            <span>SSL Secured</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Award" size={16} />
            <span>Industry Verified</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Users" size={16} />
            <span>GDPR Compliant</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={16} />
            <span>99.9% Uptime</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;