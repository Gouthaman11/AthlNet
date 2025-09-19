import React from 'react';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import { Checkbox } from 'components/ui/Checkbox';


const SportsInfoForm = ({ formData, onFormChange, errors, selectedRole }) => {
  const sportsOptions = [
    { value: 'football', label: 'Football' },
    { value: 'basketball', label: 'Basketball' },
    { value: 'soccer', label: 'Soccer' },
    { value: 'baseball', label: 'Baseball' },
    { value: 'tennis', label: 'Tennis' },
    { value: 'swimming', label: 'Swimming' },
    { value: 'track-field', label: 'Track & Field' },
    { value: 'volleyball', label: 'Volleyball' },
    { value: 'golf', label: 'Golf' },
    { value: 'hockey', label: 'Hockey' },
    { value: 'wrestling', label: 'Wrestling' },
    { value: 'gymnastics', label: 'Gymnastics' },
    { value: 'martial-arts', label: 'Martial Arts' },
    { value: 'cycling', label: 'Cycling' },
    { value: 'boxing', label: 'Boxing' },
    { value: 'other', label: 'Other' }
  ];

  const skillLevelOptions = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'professional', label: 'Professional' },
    { value: 'elite', label: 'Elite' }
  ];

  const experienceOptions = [
    { value: '0-1', label: '0-1 years' },
    { value: '2-5', label: '2-5 years' },
    { value: '6-10', label: '6-10 years' },
    { value: '11-15', label: '11-15 years' },
    { value: '16+', label: '16+ years' }
  ];

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleMultiSelectChange = (field, value) => {
    const currentValues = formData?.[field] || [];
    const newValues = currentValues?.includes(value)
      ? currentValues?.filter(v => v !== value)
      : [...currentValues, value];
    onFormChange({ ...formData, [field]: newValues });
  };

  const renderAthleteFields = () => (
    <>
      <Select
        label="Primary Sport"
        placeholder="Select your primary sport"
        options={sportsOptions}
        value={formData?.primarySport || ''}
        onChange={(value) => handleInputChange('primarySport', value)}
        error={errors?.primarySport}
        searchable
        required
      />

      <Select
        label="Skill Level"
        placeholder="Select your skill level"
        options={skillLevelOptions}
        value={formData?.skillLevel || ''}
        onChange={(value) => handleInputChange('skillLevel', value)}
        error={errors?.skillLevel}
        required
      />

      <Select
        label="Years of Experience"
        placeholder="Select experience range"
        options={experienceOptions}
        value={formData?.experience || ''}
        onChange={(value) => handleInputChange('experience', value)}
        error={errors?.experience}
        required
      />

      <Input
        label="Current Team/Organization"
        type="text"
        placeholder="Enter your current team or organization"
        value={formData?.currentTeam || ''}
        onChange={(e) => handleInputChange('currentTeam', e?.target?.value)}
        error={errors?.currentTeam}
      />

      <Input
        label="Position/Role"
        type="text"
        placeholder="Enter your position or role"
        value={formData?.position || ''}
        onChange={(e) => handleInputChange('position', e?.target?.value)}
        error={errors?.position}
      />

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-foreground mb-3">
          Secondary Sports <span className="text-muted-foreground">(Optional)</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sportsOptions?.slice(0, 8)?.map((sport) => (
            <Checkbox
              key={sport?.value}
              label={sport?.label}
              checked={(formData?.secondarySports || [])?.includes(sport?.value)}
              onChange={() => handleMultiSelectChange('secondarySports', sport?.value)}
              size="sm"
            />
          ))}
        </div>
      </div>
    </>
  );

  const renderCoachFields = () => (
    <>
      <Select
        label="Coaching Specialization"
        placeholder="Select your coaching specialization"
        options={sportsOptions}
        value={formData?.specialization || ''}
        onChange={(value) => handleInputChange('specialization', value)}
        error={errors?.specialization}
        searchable
        required
      />

      <Select
        label="Coaching Experience"
        placeholder="Select experience range"
        options={experienceOptions}
        value={formData?.coachingExperience || ''}
        onChange={(value) => handleInputChange('coachingExperience', value)}
        error={errors?.coachingExperience}
        required
      />

      <Input
        label="Current Organization"
        type="text"
        placeholder="Enter your current coaching organization"
        value={formData?.currentOrganization || ''}
        onChange={(e) => handleInputChange('currentOrganization', e?.target?.value)}
        error={errors?.currentOrganization}
      />

      <Input
        label="Certifications"
        type="text"
        placeholder="List your coaching certifications"
        value={formData?.certifications || ''}
        onChange={(e) => handleInputChange('certifications', e?.target?.value)}
        error={errors?.certifications}
      />

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Coaching Philosophy
        </label>
        <textarea
          placeholder="Describe your coaching philosophy and approach..."
          value={formData?.coachingPhilosophy || ''}
          onChange={(e) => handleInputChange('coachingPhilosophy', e?.target?.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg resize-none transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </>
  );

  const renderSponsorFields = () => (
    <>
      <Input
        label="Company/Organization Name"
        type="text"
        placeholder="Enter your company or organization name"
        value={formData?.companyName || ''}
        onChange={(e) => handleInputChange('companyName', e?.target?.value)}
        error={errors?.companyName}
        required
      />

      <Input
        label="Industry"
        type="text"
        placeholder="Enter your industry"
        value={formData?.industry || ''}
        onChange={(e) => handleInputChange('industry', e?.target?.value)}
        error={errors?.industry}
        required
      />

      <Input
        label="Job Title"
        type="text"
        placeholder="Enter your job title"
        value={formData?.jobTitle || ''}
        onChange={(e) => handleInputChange('jobTitle', e?.target?.value)}
        error={errors?.jobTitle}
      />

      <Input
        label="Company Website"
        type="url"
        placeholder="https://www.company.com"
        value={formData?.companyWebsite || ''}
        onChange={(e) => handleInputChange('companyWebsite', e?.target?.value)}
        error={errors?.companyWebsite}
      />

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-foreground mb-3">
          Sports of Interest
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sportsOptions?.slice(0, 8)?.map((sport) => (
            <Checkbox
              key={sport?.value}
              label={sport?.label}
              checked={(formData?.sportsOfInterest || [])?.includes(sport?.value)}
              onChange={() => handleMultiSelectChange('sportsOfInterest', sport?.value)}
              size="sm"
            />
          ))}
        </div>
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          Sponsorship Goals
        </label>
        <textarea
          placeholder="Describe your sponsorship goals and what you're looking for in partnerships..."
          value={formData?.sponsorshipGoals || ''}
          onChange={(e) => handleInputChange('sponsorshipGoals', e?.target?.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg resize-none transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </>
  );

  const renderFanFields = () => (
    <>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-foreground mb-3">
          Favorite Sports
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {sportsOptions?.slice(0, 12)?.map((sport) => (
            <Checkbox
              key={sport?.value}
              label={sport?.label}
              checked={(formData?.favoriteSports || [])?.includes(sport?.value)}
              onChange={() => handleMultiSelectChange('favoriteSports', sport?.value)}
              size="sm"
            />
          ))}
        </div>
      </div>

      <Input
        label="Favorite Team"
        type="text"
        placeholder="Enter your favorite team"
        value={formData?.favoriteTeam || ''}
        onChange={(e) => handleInputChange('favoriteTeam', e?.target?.value)}
        error={errors?.favoriteTeam}
      />

      <Input
        label="Favorite Athlete"
        type="text"
        placeholder="Enter your favorite athlete"
        value={formData?.favoriteAthlete || ''}
        onChange={(e) => handleInputChange('favoriteAthlete', e?.target?.value)}
        error={errors?.favoriteAthlete}
      />

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-foreground mb-2">
          What interests you most about sports?
        </label>
        <textarea
          placeholder="Tell us what you love about sports and what you hope to get from AthlNet..."
          value={formData?.sportsInterest || ''}
          onChange={(e) => handleInputChange('sportsInterest', e?.target?.value)}
          rows={3}
          className="w-full px-3 py-2 border border-border rounded-lg resize-none transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Sports Information
        </h3>
        <p className="text-muted-foreground">
          Tell us about your sports background and interests
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedRole === 'athlete' && renderAthleteFields()}
        {selectedRole === 'coach' && renderCoachFields()}
        {selectedRole === 'sponsor' && renderSponsorFields()}
        {selectedRole === 'fan' && renderFanFields()}
      </div>
    </div>
  );
};

export default SportsInfoForm;