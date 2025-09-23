import React from 'react';
import Icon from './AppIcon';

const CoachBadge = ({ userProfile, className = "" }) => {
  const isCoach = userProfile?.role === 'coach' || userProfile?.userType === 'coach' || userProfile?.isCoach;
  
  if (!isCoach) return null;

  return (
    <div className={`inline-flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-sm ${className}`}>
      <Icon name="BookOpen" size={14} className="text-white" />
      <span>Coach</span>
    </div>
  );
};

export default CoachBadge;