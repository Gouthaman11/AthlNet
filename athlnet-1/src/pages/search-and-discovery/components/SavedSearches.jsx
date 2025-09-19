import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const SavedSearches = ({ savedSearches, onLoadSearch, onDeleteSearch, onSaveCurrentSearch, currentFilters }) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [searchName, setSearchName] = useState('');

  const handleSaveSearch = () => {
    if (searchName?.trim()) {
      onSaveCurrentSearch(searchName?.trim(), currentFilters);
      setSearchName('');
      setShowSaveDialog(false);
    }
  };

  const formatFiltersPreview = (filters) => {
    const activeFilters = [];
    
    if (filters?.sports?.length > 0) {
      activeFilters?.push(`${filters?.sports?.length} sport${filters?.sports?.length > 1 ? 's' : ''}`);
    }
    
    if (filters?.userTypes?.length > 0) {
      activeFilters?.push(`${filters?.userTypes?.length} user type${filters?.userTypes?.length > 1 ? 's' : ''}`);
    }
    
    if (filters?.achievementLevel) {
      activeFilters?.push(filters?.achievementLevel);
    }
    
    if (filters?.location) {
      activeFilters?.push(`near ${filters?.location}`);
    }
    
    if (filters?.verified) {
      activeFilters?.push('verified only');
    }

    return activeFilters?.length > 0 ? activeFilters?.join(', ') : 'No filters applied';
  };

  const getSearchIcon = (filters) => {
    if (filters?.userTypes?.includes('athlete')) return 'User';
    if (filters?.userTypes?.includes('coach')) return 'Whistle';
    if (filters?.userTypes?.includes('sponsor')) return 'Building';
    return 'Search';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Bookmark" size={20} className="text-primary" />
          <h2 className="text-lg font-semibold text-foreground">Saved Searches</h2>
        </div>
        
        <Button
          size="sm"
          onClick={() => setShowSaveDialog(true)}
          iconName="Plus"
          iconPosition="left"
        >
          Save Current
        </Button>
      </div>
      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="mb-4 p-4 bg-muted rounded-lg border border-border">
          <h3 className="font-medium text-foreground mb-2">Save Current Search</h3>
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Enter search name..."
              value={searchName}
              onChange={(e) => setSearchName(e?.target?.value)}
              onKeyDown={(e) => e?.key === 'Enter' && handleSaveSearch()}
            />
            <div className="text-sm text-muted-foreground">
              <strong>Current filters:</strong> {formatFiltersPreview(currentFilters)}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSaveSearch}
                disabled={!searchName?.trim()}
              >
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowSaveDialog(false);
                  setSearchName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Saved Searches List */}
      {savedSearches?.length === 0 ? (
        <div className="text-center py-8">
          <Icon name="Bookmark" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">No saved searches yet</p>
          <p className="text-sm text-muted-foreground">
            Save your current search to quickly access it later
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {savedSearches?.map((search) => (
            <div
              key={search?.id}
              className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <Icon 
                  name={getSearchIcon(search?.filters)} 
                  size={16} 
                  className="text-muted-foreground flex-shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground truncate">{search?.name}</h4>
                  <p className="text-sm text-muted-foreground truncate">
                    {formatFiltersPreview(search?.filters)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Saved {new Date(search.createdAt)?.toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLoadSearch(search)}
                  iconName="Play"
                >
                  Load
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteSearch(search?.id)}
                  iconName="Trash2"
                  className="text-error hover:text-error"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Quick Filters */}
      <div className="mt-6 pt-4 border-t border-border">
        <h3 className="text-sm font-medium text-foreground mb-3">Quick Filters</h3>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoadSearch({
              name: 'Verified Athletes',
              filters: { userTypes: ['athlete'], verified: true }
            })}
            iconName="BadgeCheck"
            iconPosition="left"
          >
            Verified Athletes
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoadSearch({
              name: 'Local Coaches',
              filters: { userTypes: ['coach'], locationRadius: '25' }
            })}
            iconName="MapPin"
            iconPosition="left"
          >
            Local Coaches
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onLoadSearch({
              name: 'Active Sponsors',
              filters: { userTypes: ['sponsor'], activeRecently: true }
            })}
            iconName="Building"
            iconPosition="left"
          >
            Active Sponsors
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SavedSearches;