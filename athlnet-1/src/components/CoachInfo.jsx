import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from './AppIcon';
import Button from './ui/Button';
import Image from './AppImage';

const CoachInfo = ({ athleteProfile, className = "" }) => {
  const navigate = useNavigate();

  // Get coach information from athlete profile
  const currentCoach = athleteProfile?.currentCoach;
  const coaches = athleteProfile?.coaches || [];

  if (!currentCoach && coaches.length === 0) {
    return null;
  }

  const handleViewCoach = (coachId) => {
    navigate(`/profile/${coachId}`);
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center space-x-2 mb-3">
        <Icon name="BookOpen" size={20} className="text-blue-600" />
        <h3 className="font-semibold text-blue-900">
          {coaches.length > 1 ? 'Coaches' : 'Coach'}
        </h3>
      </div>

      {currentCoach && (
        <div className="mb-3">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-lg border">
            <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center">
              <Icon name="User" size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900">{currentCoach.name}</h4>
                <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  Current Coach
                </span>
              </div>
              <p className="text-sm text-gray-600">{currentCoach.specialization}</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleViewCoach(currentCoach.id)}
            >
              <Icon name="Eye" size={14} className="mr-1" />
              View
            </Button>
          </div>
        </div>
      )}

      {coaches.length > 1 && (
        <div>
          <p className="text-sm text-gray-600 mb-2">All Coaches ({coaches.length})</p>
          <div className="space-y-2">
            {coaches.map((coach, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-2 bg-white rounded border text-sm"
              >
                <div>
                  <span className="font-medium text-gray-900">{coach.name}</span>
                  <span className="text-gray-600 ml-2">• {coach.specialization}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleViewCoach(coach.id)}
                  className="text-xs"
                >
                  View
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachInfo;