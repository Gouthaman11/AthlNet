import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GoalTracker = ({ goals, onUpdateGoal }) => {
  const [activeGoal, setActiveGoal] = useState(null);

  const getProgressColor = (progress) => {
    if (progress >= 90) return 'bg-success';
    if (progress >= 70) return 'bg-primary';
    if (progress >= 50) return 'bg-warning';
    return 'bg-error';
  };

  const getProgressTextColor = (progress) => {
    if (progress >= 90) return 'text-success';
    if (progress >= 70) return 'text-primary';
    if (progress >= 50) return 'text-warning';
    return 'text-error';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return 'CheckCircle';
      case 'on-track': return 'TrendingUp';
      case 'behind': return 'AlertTriangle';
      default: return 'Target';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-success';
      case 'on-track': return 'text-primary';
      case 'behind': return 'text-warning';
      default: return 'text-muted-foreground';
    }
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date?.toLocaleDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Goal Tracker</h3>
        <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
          Add Goal
        </Button>
      </div>
      <div className="space-y-4">
        {goals?.map((goal) => (
          <div 
            key={goal?.id} 
            className={`border rounded-lg p-4 transition-all cursor-pointer ${
              activeGoal === goal?.id 
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 hover:bg-muted/30'
            }`}
            onClick={() => setActiveGoal(activeGoal === goal?.id ? null : goal?.id)}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={goal?.icon} size={16} className="text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{goal?.title}</h4>
                  <p className="text-xs text-muted-foreground">{goal?.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Icon 
                  name={getStatusIcon(goal?.status)} 
                  size={16} 
                  className={getStatusColor(goal?.status)} 
                />
                <span className={`text-xs font-medium ${getProgressTextColor(goal?.progress)}`}>
                  {goal?.progress}%
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>{goal?.current?.toLocaleString()} / {goal?.target?.toLocaleString()}</span>
                <span>{formatDeadline(goal?.deadline)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(goal?.progress)}`}
                  style={{ width: `${goal?.progress}%` }}
                />
              </div>
            </div>

            {/* Expanded Details */}
            {activeGoal === goal?.id && (
              <div className="mt-4 pt-4 border-t border-border space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Daily Average</p>
                    <p className="font-medium text-foreground">{goal?.dailyAverage}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Days Remaining</p>
                    <p className="font-medium text-foreground">{goal?.daysRemaining}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Required Daily</p>
                    <p className="font-medium text-foreground">{goal?.requiredDaily}</p>
                  </div>
                </div>

                {/* Recent Progress */}
                <div>
                  <p className="text-sm font-medium text-foreground mb-2">Recent Progress</p>
                  <div className="flex items-end space-x-1 h-12">
                    {goal?.recentProgress?.map((day, index) => (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-primary/20 rounded-t-sm"
                          style={{ height: `${(day?.value / Math.max(...goal?.recentProgress?.map(d => d?.value))) * 100}%` }}
                        />
                        <span className="text-xs text-muted-foreground mt-1">{day?.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-2">
                  <Button variant="outline" size="sm" iconName="Edit" iconPosition="left">
                    Edit Goal
                  </Button>
                  <Button variant="ghost" size="sm" iconName="BarChart3" iconPosition="left">
                    View Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-border">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-success">
              {goals?.filter(g => g?.status === 'completed')?.length}
            </p>
            <p className="text-sm text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">
              {goals?.filter(g => g?.status === 'on-track')?.length}
            </p>
            <p className="text-sm text-muted-foreground">On Track</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-warning">
              {goals?.filter(g => g?.status === 'behind')?.length}
            </p>
            <p className="text-sm text-muted-foreground">Behind</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalTracker;