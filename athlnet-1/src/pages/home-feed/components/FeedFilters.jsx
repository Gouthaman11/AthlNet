import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeedFilters = ({ onFilterChange, activeFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = {
    contentType: [
      { id: 'all', label: 'All Posts', icon: 'Grid3X3' },
      { id: 'photos', label: 'Photos', icon: 'Image' },
      { id: 'videos', label: 'Videos', icon: 'Video' },
      { id: 'achievements', label: 'Achievements', icon: 'Trophy' },
      { id: 'training', label: 'Training', icon: 'Dumbbell' }
    ],
    sports: [
      { id: 'all', label: 'All Sports', icon: 'Zap' },
      { id: 'basketball', label: 'Basketball', icon: 'Circle' },
      { id: 'soccer', label: 'Soccer', icon: 'Circle' },
      { id: 'tennis', label: 'Tennis', icon: 'Circle' },
      { id: 'swimming', label: 'Swimming', icon: 'Waves' },
      { id: 'running', label: 'Running', icon: 'Zap' }
    ],
    connections: [
      { id: 'all', label: 'All Connections', icon: 'Users' },
      { id: 'following', label: 'Following', icon: 'UserCheck' },
      { id: 'athletes', label: 'Athletes', icon: 'User' },
      { id: 'coaches', label: 'Coaches', icon: 'GraduationCap' },
      { id: 'sponsors', label: 'Sponsors', icon: 'Building' }
    ]
  };

  const handleFilterClick = (category, filterId) => {
    onFilterChange?.(category, filterId);
  };

  const getActiveFilterCount = () => {
    return Object.values(activeFilters || {})?.filter(filter => filter !== 'all')?.length;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 card-elevation-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={18} className="text-muted-foreground" />
          <span className="font-medium text-foreground">Feed Filters</span>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
        </Button>
      </div>
      {/* Quick Filters - Always Visible */}
      <div className="flex items-center space-x-2 mt-3 overflow-x-auto pb-2">
        {filterOptions?.contentType?.slice(0, 5)?.map((filter) => (
          <button
            key={filter?.id}
            onClick={() => handleFilterClick('contentType', filter?.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilters?.contentType === filter?.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            <Icon name={filter?.icon} size={14} />
            <span>{filter?.label}</span>
          </button>
        ))}
      </div>
      {/* Expanded Filters */}
      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {/* Sports Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Sports</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions?.sports?.map((sport) => (
                <button
                  key={sport?.id}
                  onClick={() => handleFilterClick('sports', sport?.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilters?.sports === sport?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon name={sport?.icon} size={14} />
                  <span>{sport?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Connections Filter */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Connections</h4>
            <div className="flex flex-wrap gap-2">
              {filterOptions?.connections?.map((connection) => (
                <button
                  key={connection?.id}
                  onClick={() => handleFilterClick('connections', connection?.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilters?.connections === connection?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                  }`}
                >
                  <Icon name={connection?.icon} size={14} />
                  <span>{connection?.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-ring"
                  defaultChecked
                />
                <span className="text-muted-foreground">Show verified accounts only</span>
              </label>
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  className="rounded border-border text-primary focus:ring-ring"
                />
                <span className="text-muted-foreground">Hide sponsored content</span>
              </label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterChange?.('reset')}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedFilters;