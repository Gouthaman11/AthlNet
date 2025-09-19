import React from 'react';
import Input from 'components/ui/Input';
import Select from 'components/ui/Select';
import Image from 'components/AppImage';

import Icon from 'components/AppIcon';

const PersonalInfoForm = ({ formData, onFormChange, errors, onFileUpload, profilePreview }) => {
  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'in', label: 'India' },
    { value: 'jp', label: 'Japan' },
    { value: 'br', label: 'Brazil' },
    { value: 'mx', label: 'Mexico' }
  ];

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' }
  ];

  const handleInputChange = (field, value) => {
    onFormChange({ ...formData, [field]: value });
  };

  const handleFileChange = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      onFileUpload(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Profile Photo Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-border">
            {profilePreview ? (
              <Image
                src={profilePreview}
                alt="Profile preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="User" size={32} className="text-muted-foreground" />
              </div>
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover-scale shadow-card">
            <Icon name="Camera" size={16} color="white" />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground text-center">
          Upload a profile photo to help others recognize you
        </p>
      </div>
      {/* Personal Information Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData?.firstName || ''}
          onChange={(e) => handleInputChange('firstName', e?.target?.value)}
          error={errors?.firstName}
          required
        />

        <Input
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData?.lastName || ''}
          onChange={(e) => handleInputChange('lastName', e?.target?.value)}
          error={errors?.lastName}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          value={formData?.email || ''}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          description="This will be your login email"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a password"
          value={formData?.password || ''}
          onChange={(e) => handleInputChange('password', e?.target?.value)}
          error={errors?.password}
          description="Minimum 6 characters"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          value={formData?.confirmPassword || ''}
          onChange={(e) => handleInputChange('confirmPassword', e?.target?.value)}
          error={errors?.confirmPassword}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+1 (555) 123-4567"
          value={formData?.phone || ''}
          onChange={(e) => handleInputChange('phone', e?.target?.value)}
          error={errors?.phone}
        />

        <Input
          label="Date of Birth"
          type="date"
          value={formData?.dateOfBirth || ''}
          onChange={(e) => handleInputChange('dateOfBirth', e?.target?.value)}
          error={errors?.dateOfBirth}
          required
        />

        <Select
          label="Gender"
          placeholder="Select gender"
          options={genderOptions}
          value={formData?.gender || ''}
          onChange={(value) => handleInputChange('gender', value)}
          error={errors?.gender}
        />

        <Input
          label="City"
          type="text"
          placeholder="Enter your city"
          value={formData?.city || ''}
          onChange={(e) => handleInputChange('city', e?.target?.value)}
          error={errors?.city}
          required
        />

        <Select
          label="Country"
          placeholder="Select country"
          options={countryOptions}
          value={formData?.country || ''}
          onChange={(value) => handleInputChange('country', value)}
          error={errors?.country}
          searchable
          required
        />
      </div>
      {/* Bio Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground">
          Bio <span className="text-accent">*</span>
        </label>
        <textarea
          placeholder="Tell us about yourself, your sports background, and what you hope to achieve on AthlNet..."
          value={formData?.bio || ''}
          onChange={(e) => handleInputChange('bio', e?.target?.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg resize-none transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
            errors?.bio ? 'border-error' : 'border-border'
          }`}
        />
        {errors?.bio && (
          <p className="text-sm text-error flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-1" />
            {errors?.bio}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          {formData?.bio ? formData?.bio?.length : 0}/500 characters
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoForm;