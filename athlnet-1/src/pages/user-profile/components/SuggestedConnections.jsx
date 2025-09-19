import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SuggestedConnections = ({ suggestions, onConnect, onDismiss }) => {
  return (
    <div className="bg-card rounded-lg shadow-sm border border-border">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Suggested Connections</h3>
        <p className="text-sm text-muted-foreground mt-1">People you may know in the sports community</p>
      </div>
      <div className="p-6 space-y-4">
        {suggestions?.map((person) => (
          <div key={person?.id} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={person?.profileImage}
                    alt={person?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {person?.isVerified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-card">
                    <Icon name="Check" size={10} color="white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <p className="font-medium text-foreground">{person?.name}</p>
                  {person?.isVerified && (
                    <Icon name="BadgeCheck" size={16} className="text-primary" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{person?.title}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">{person?.mutualConnections} mutual connections</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-primary">{person?.sport}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConnect(person?.id)}
                iconName="UserPlus"
                iconPosition="left"
              >
                Connect
              </Button>
              <button
                onClick={() => onDismiss(person?.id)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="p-6 border-t border-border">
        <Button variant="ghost" fullWidth>
          View All Suggestions
        </Button>
      </div>
    </div>
  );
};

export default SuggestedConnections;