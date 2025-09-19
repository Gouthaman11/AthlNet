import React from 'react';
import Icon from '../../../components/AppIcon';

const NetworkingInsights = ({ insights }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-success/10';
    if (score >= 60) return 'bg-warning/10';
    return 'bg-error/10';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Networking Insights</h3>
        <Icon name="Users" size={20} className="text-primary" />
      </div>
      <div className="space-y-6">
        {/* Connection Quality Score */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">Connection Quality Score</span>
            <span className={`text-lg font-bold ${getScoreColor(insights?.qualityScore)}`}>
              {insights?.qualityScore}/100
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                insights?.qualityScore >= 80 ? 'bg-success' : 
                insights?.qualityScore >= 60 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${insights?.qualityScore}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Based on mutual connections, engagement, and profile completeness
          </p>
        </div>

        {/* Networking Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={`p-4 rounded-lg ${getScoreBg(insights?.qualityScore)}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="UserPlus" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">New Connections</span>
            </div>
            <p className="text-xl font-bold text-foreground">{insights?.newConnections}</p>
            <p className="text-xs text-muted-foreground">This month</p>
          </div>

          <div className={`p-4 rounded-lg ${getScoreBg(insights?.qualityScore)}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Network" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Mutual Connections</span>
            </div>
            <p className="text-xl font-bold text-foreground">{insights?.mutualConnections}</p>
            <p className="text-xs text-muted-foreground">Average per connection</p>
          </div>

          <div className={`p-4 rounded-lg ${getScoreBg(insights?.qualityScore)}`}>
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Handshake" size={16} className="text-primary" />
              <span className="text-sm font-medium text-foreground">Collaboration Requests</span>
            </div>
            <p className="text-xl font-bold text-foreground">{insights?.collaborationRequests}</p>
            <p className="text-xs text-muted-foreground">Pending responses</p>
          </div>
        </div>

        {/* Recommendations */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Recommendations</h4>
          <div className="space-y-2">
            {insights?.recommendations?.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon name="Lightbulb" size={12} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{recommendation?.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{recommendation?.description}</p>
                </div>
                <button className="text-xs text-primary hover:text-primary/80 font-medium">
                  Act
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Connection Growth Chart */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Connection Growth (Last 6 months)</h4>
          <div className="flex items-end space-x-2 h-20">
            {insights?.growthData?.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-primary rounded-t-sm transition-all duration-300 hover:bg-primary/80"
                  style={{ height: `${(month?.connections / Math.max(...insights?.growthData?.map(m => m?.connections))) * 100}%` }}
                />
                <span className="text-xs text-muted-foreground mt-2">{month?.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkingInsights;