import React from 'react';
import Icon from '../../../components/AppIcon';

const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    default: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className="flex flex-col items-center justify-center py-8">
      <div className={`${sizeClasses?.[size]} animate-spin text-primary mb-2`}>
        <Icon name="Loader2" size={size === 'sm' ? 16 : size === 'lg' ? 32 : size === 'xl' ? 48 : 24} />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground">{text}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;