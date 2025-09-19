import React from 'react';
import Icon from 'components/AppIcon';

const RoleSelectionCard = ({ role, isSelected, onSelect }) => {
  const roleConfig = {
    athlete: {
      title: 'Athlete',
      description: 'Showcase your achievements and connect with opportunities',
      icon: 'Trophy',
      color: 'bg-primary',
      benefits: ['Build your sports profile', 'Connect with scouts', 'Share achievements']
    },
    coach: {
      title: 'Coach',
      description: 'Discover talent and grow your professional network',
      icon: 'Users',
      color: 'bg-secondary',
      benefits: ['Find talented athletes', 'Share expertise', 'Build reputation']
    },
    sponsor: {
      title: 'Sponsor',
      description: 'Connect with athletes and measure engagement impact',
      icon: 'Target',
      color: 'bg-accent',
      benefits: ['Discover partnerships', 'Track engagement', 'Measure ROI']
    },
    fan: {
      title: 'Fan',
      description: 'Follow your favorite athletes and stay connected',
      icon: 'Heart',
      color: 'bg-warning',
      benefits: ['Follow athletes', 'Get exclusive content', 'Join community']
    }
  };

  const config = roleConfig?.[role];

  return (
    <div
      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-smooth hover-scale ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-modal'
          : 'border-border bg-card hover:border-primary/50 shadow-card'
      }`}
      onClick={() => onSelect(role)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-12 h-12 rounded-full ${config?.color} flex items-center justify-center`}>
          <Icon name={config?.icon} size={24} color="white" />
        </div>
        
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">{config?.title}</h3>
          <p className="text-sm text-muted-foreground">{config?.description}</p>
        </div>
        
        <ul className="space-y-1">
          {config?.benefits?.map((benefit, index) => (
            <li key={index} className="flex items-center text-xs text-muted-foreground">
              <Icon name="Check" size={12} className="mr-2 text-success" />
              {benefit}
            </li>
          ))}
        </ul>
      </div>
      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Check" size={16} color="white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleSelectionCard;