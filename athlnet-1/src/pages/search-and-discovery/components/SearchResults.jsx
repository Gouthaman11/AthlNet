import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SearchResults = ({ results, loading, sortBy, setSortBy, viewMode, setViewMode }) => {
  const sortOptions = [
    { value: 'relevance', label: 'Relevance', icon: 'Target' },
    { value: 'location', label: 'Location', icon: 'MapPin' },
    { value: 'achievement', label: 'Achievement Level', icon: 'Trophy' },
    { value: 'activity', label: 'Recent Activity', icon: 'Clock' },
    { value: 'connections', label: 'Most Connected', icon: 'Users' }
  ];

  const viewModes = [
    { value: 'grid', icon: 'Grid3X3' },
    { value: 'list', icon: 'List' }
  ];

  const handleConnect = (userId) => {
    console.log('Connecting to user:', userId);
  };

  const handleViewProfile = (userId) => {
    console.log('Viewing profile:', userId);
  };

  const handleMessage = (userId) => {
    console.log('Messaging user:', userId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)]?.map((_, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 animate-pulse">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-muted rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-1/3"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const ResultCard = ({ result, isGridView = false }) => (
    <div className={`bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow ${
      isGridView ? 'text-center' : ''
    }`}>
      <div className={`flex ${isGridView ? 'flex-col items-center space-y-4' : 'items-start space-x-4'}`}>
        {/* Profile Image */}
        <div className="relative flex-shrink-0">
          <Image
            src={result?.avatar}
            alt={result?.name}
            className={`${isGridView ? 'w-20 h-20' : 'w-16 h-16'} rounded-full object-cover`}
          />
          {result?.verified && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={12} color="white" />
            </div>
          )}
          {result?.online && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-success rounded-full border-2 border-card"></div>
          )}
        </div>

        {/* Profile Info */}
        <div className={`flex-1 ${isGridView ? 'text-center' : ''}`}>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-foreground">{result?.name}</h3>
            {result?.verified && (
              <Icon name="BadgeCheck" size={16} className="text-primary" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mb-2">{result?.title}</p>
          
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mb-3">
            <div className="flex items-center space-x-1">
              <Icon name="MapPin" size={12} />
              <span>{result?.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Icon name="Users" size={12} />
              <span>{result?.connections} connections</span>
            </div>
            {result?.achievements > 0 && (
              <div className="flex items-center space-x-1">
                <Icon name="Trophy" size={12} />
                <span>{result?.achievements} achievements</span>
              </div>
            )}
          </div>

          {/* Sports Tags */}
          <div className="flex flex-wrap gap-1 mb-3">
            {result?.sports?.slice(0, 3)?.map((sport, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
              >
                {sport}
              </span>
            ))}
            {result?.sports?.length > 3 && (
              <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">
                +{result?.sports?.length - 3} more
              </span>
            )}
          </div>

          {/* Bio Preview */}
          {!isGridView && result?.bio && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {result?.bio}
            </p>
          )}

          {/* Action Buttons */}
          <div className={`flex gap-2 ${isGridView ? 'justify-center' : ''}`}>
            <Button
              size="sm"
              onClick={() => handleViewProfile(result?.id)}
              iconName="Eye"
              iconPosition="left"
            >
              View Profile
            </Button>
            
            {result?.type === 'athlete' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect(result?.id)}
                iconName="UserPlus"
                iconPosition="left"
              >
                Connect
              </Button>
            )}
            
            {result?.canMessage && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMessage(result?.id)}
                iconName="MessageCircle"
              />
            )}
          </div>
        </div>

        {/* Achievement Badge */}
        {result?.featuredAchievement && (
          <div className="flex-shrink-0">
            <div className="bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-medium">
              {result?.featuredAchievement}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            {results?.length} Results Found
          </h2>
          <p className="text-sm text-muted-foreground">
            Showing results for your search criteria
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e?.target?.value)}
              className="bg-card border border-border rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {sortOptions?.map((option) => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex bg-muted rounded-md p-1">
            {viewModes?.map((mode) => (
              <button
                key={mode?.value}
                onClick={() => setViewMode(mode?.value)}
                className={`p-1 rounded transition-colors ${
                  viewMode === mode?.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={mode?.icon} size={16} />
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Results Grid/List */}
      {results?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters to find what you're looking for.
          </p>
          <Button variant="outline" iconName="RotateCcw" iconPosition="left">
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' ?'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' :'space-y-4'
        }>
          {results?.map((result) => (
            <ResultCard
              key={result?.id}
              result={result}
              isGridView={viewMode === 'grid'}
            />
          ))}
        </div>
      )}
      {/* Load More */}
      {results?.length > 0 && results?.length % 12 === 0 && (
        <div className="text-center mt-8">
          <Button
            variant="outline"
            iconName="ChevronDown"
            iconPosition="right"
          >
            Load More Results
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;