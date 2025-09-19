import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Input from '../../../components/ui/Input';

const FilterPanel = ({ filters, setFilters, isOpen, onClose, resultCount }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const sportCategories = [
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'soccer', label: 'Soccer' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'track-field', label: 'Track & Field' },
    { value: 'golf', label: 'Golf' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'hockey', label: 'Hockey' }
  ];

  const userTypes = [
    { value: 'athlete', label: 'Athletes' },
    { value: 'coach', label: 'Coaches' },
    { value: 'sponsor', label: 'Sponsors' },
    { value: 'fan', label: 'Fans' },
    { value: 'scout', label: 'Scouts' }
  ];

  const achievementLevels = [
    { value: 'professional', label: 'Professional' },
    { value: 'semi-professional', label: 'Semi-Professional' },
    { value: 'collegiate', label: 'Collegiate' },
    { value: 'high-school', label: 'High School' },
    { value: 'amateur', label: 'Amateur' },
    { value: 'youth', label: 'Youth' }
  ];

  const locationOptions = [
    { value: '5', label: 'Within 5 miles' },
    { value: '10', label: 'Within 10 miles' },
    { value: '25', label: 'Within 25 miles' },
    { value: '50', label: 'Within 50 miles' },
    { value: '100', label: 'Within 100 miles' },
    { value: 'anywhere', label: 'Anywhere' }
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApplyFilters = () => {
    setFilters(localFilters);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      sports: [],
      userTypes: [],
      achievementLevel: '',
      location: '',
      locationRadius: '',
      verified: false,
      hasAchievements: false,
      activeRecently: false,
      budgetRange: '',
      partnershipType: '',
      engagementLevel: ''
    };
    setLocalFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sports Categories */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Sports</h3>
        <Select
          multiple
          searchable
          placeholder="Select sports..."
          options={sportCategories}
          value={localFilters?.sports}
          onChange={(value) => handleFilterChange('sports', value)}
        />
      </div>

      {/* User Types */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">User Type</h3>
        <div className="space-y-2">
          {userTypes?.map((type) => (
            <Checkbox
              key={type?.value}
              label={type?.label}
              checked={localFilters?.userTypes?.includes(type?.value)}
              onChange={(e) => {
                const newTypes = e?.target?.checked
                  ? [...localFilters?.userTypes, type?.value]
                  : localFilters?.userTypes?.filter(t => t !== type?.value);
                handleFilterChange('userTypes', newTypes);
              }}
            />
          ))}
        </div>
      </div>

      {/* Achievement Level */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Achievement Level</h3>
        <Select
          placeholder="Select level..."
          options={achievementLevels}
          value={localFilters?.achievementLevel}
          onChange={(value) => handleFilterChange('achievementLevel', value)}
        />
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Location</h3>
        <div className="space-y-3">
          <Input
            type="text"
            placeholder="Enter city, state, or zip code"
            value={localFilters?.location}
            onChange={(e) => handleFilterChange('location', e?.target?.value)}
          />
          <Select
            placeholder="Distance radius..."
            options={locationOptions}
            value={localFilters?.locationRadius}
            onChange={(value) => handleFilterChange('locationRadius', value)}
          />
        </div>
      </div>

      {/* Additional Filters */}
      <div>
        <h3 className="text-sm font-medium text-foreground mb-3">Additional Filters</h3>
        <div className="space-y-2">
          <Checkbox
            label="Verified profiles only"
            checked={localFilters?.verified}
            onChange={(e) => handleFilterChange('verified', e?.target?.checked)}
          />
          <Checkbox
            label="Has achievements"
            checked={localFilters?.hasAchievements}
            onChange={(e) => handleFilterChange('hasAchievements', e?.target?.checked)}
          />
          <Checkbox
            label="Active in last 30 days"
            checked={localFilters?.activeRecently}
            onChange={(e) => handleFilterChange('activeRecently', e?.target?.checked)}
          />
        </div>
      </div>

      {/* Sponsor-specific Filters */}
      {localFilters?.userTypes?.includes('sponsor') && (
        <div className="border-t border-border pt-6">
          <h3 className="text-sm font-medium text-foreground mb-3">Sponsor Filters</h3>
          <div className="space-y-3">
            <Select
              label="Budget Range"
              placeholder="Select budget range..."
              options={[
                { value: '1k-5k', label: '$1K - $5K' },
                { value: '5k-10k', label: '$5K - $10K' },
                { value: '10k-25k', label: '$10K - $25K' },
                { value: '25k-50k', label: '$25K - $50K' },
                { value: '50k+', label: '$50K+' }
              ]}
              value={localFilters?.budgetRange}
              onChange={(value) => handleFilterChange('budgetRange', value)}
            />
            <Select
              label="Partnership Type"
              placeholder="Select partnership type..."
              options={[
                { value: 'endorsement', label: 'Endorsement' },
                { value: 'sponsorship', label: 'Sponsorship' },
                { value: 'collaboration', label: 'Collaboration' },
                { value: 'ambassador', label: 'Brand Ambassador' }
              ]}
              value={localFilters?.partnershipType}
              onChange={(value) => handleFilterChange('partnershipType', value)}
            />
            <Select
              label="Engagement Level"
              placeholder="Select engagement level..."
              options={[
                { value: 'high', label: 'High (10K+ followers)' },
                { value: 'medium', label: 'Medium (1K-10K followers)' },
                { value: 'low', label: 'Low (<1K followers)' }
              ]}
              value={localFilters?.engagementLevel}
              onChange={(value) => handleFilterChange('engagementLevel', value)}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border">
        <Button
          variant="outline"
          onClick={handleClearFilters}
          className="flex-1"
          iconName="RotateCcw"
          iconPosition="left"
        >
          Clear All
        </Button>
        <Button
          onClick={handleApplyFilters}
          className="flex-1"
          iconName="Filter"
          iconPosition="left"
        >
          Apply Filters ({resultCount})
        </Button>
      </div>
    </div>
  );

  // Mobile Slide-out Panel
  if (isOpen) {
    return (
      <>
        {/* Mobile Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 z-modal lg:hidden"
          onClick={onClose}
        />
        
        {/* Mobile Panel */}
        <div className="fixed inset-y-0 right-0 w-80 bg-card border-l border-border z-modal lg:hidden overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                iconName="X"
              />
            </div>
            <FilterContent />
          </div>
        </div>

        {/* Desktop Panel */}
        <div className="hidden lg:block w-80 bg-card border border-border rounded-lg p-6 h-fit sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Filters</h2>
            <span className="text-sm text-muted-foreground">{resultCount} results</span>
          </div>
          <FilterContent />
        </div>
      </>
    );
  }

  return null;
};

export default FilterPanel;