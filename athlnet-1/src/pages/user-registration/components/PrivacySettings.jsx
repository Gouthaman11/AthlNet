import React from 'react';
import { Checkbox } from 'components/ui/Checkbox';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const PrivacySettings = ({ privacySettings, onPrivacyChange, errors }) => {
  const handleSettingChange = (setting, value) => {
    onPrivacyChange({ ...privacySettings, [setting]: value });
  };

  const privacyOptions = [
    {
      id: 'profileVisibility',
      title: 'Profile Visibility',
      description: 'Make your profile visible to other users',
      defaultValue: true
    },
    {
      id: 'showAchievements',
      title: 'Show Achievements',
      description: 'Display your achievements and awards on your profile',
      defaultValue: true
    },
    {
      id: 'showContactInfo',
      title: 'Show Contact Information',
      description: 'Allow other users to see your contact details',
      defaultValue: false
    },
    {
      id: 'allowMessages',
      title: 'Allow Direct Messages',
      description: 'Let other users send you direct messages',
      defaultValue: true
    },
    {
      id: 'showInSearch',
      title: 'Appear in Search Results',
      description: 'Allow your profile to appear in user searches',
      defaultValue: true
    },
    {
      id: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive email notifications for important updates',
      defaultValue: true
    },
    {
      id: 'marketingEmails',
      title: 'Marketing Communications',
      description: 'Receive emails about new features and opportunities',
      defaultValue: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Privacy & Communication Settings
        </h3>
        <p className="text-muted-foreground">
          Control how others can interact with you and what information is visible
        </p>
      </div>
      {/* Privacy Settings */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground flex items-center">
          <Icon name="Shield" size={20} className="mr-2 text-primary" />
          Privacy Controls
        </h4>
        
        <div className="space-y-4 pl-6">
          {privacyOptions?.slice(0, 5)?.map((option) => (
            <div key={option?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
              <Checkbox
                checked={privacySettings?.[option?.id] ?? option?.defaultValue}
                onChange={(e) => handleSettingChange(option?.id, e?.target?.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <label className="font-medium text-foreground cursor-pointer">
                  {option?.title}
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {option?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Communication Settings */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground flex items-center">
          <Icon name="Mail" size={20} className="mr-2 text-primary" />
          Communication Preferences
        </h4>
        
        <div className="space-y-4 pl-6">
          {privacyOptions?.slice(5)?.map((option) => (
            <div key={option?.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
              <Checkbox
                checked={privacySettings?.[option?.id] ?? option?.defaultValue}
                onChange={(e) => handleSettingChange(option?.id, e?.target?.checked)}
                className="mt-1"
              />
              <div className="flex-1">
                <label className="font-medium text-foreground cursor-pointer">
                  {option?.title}
                </label>
                <p className="text-sm text-muted-foreground mt-1">
                  {option?.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Terms and Conditions */}
      <div className="space-y-4 p-4 bg-muted rounded-lg">
        <h4 className="font-medium text-foreground flex items-center">
          <Icon name="FileText" size={20} className="mr-2 text-primary" />
          Terms & Agreements
        </h4>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={privacySettings?.acceptTerms || false}
              onChange={(e) => handleSettingChange('acceptTerms', e?.target?.checked)}
              className="mt-1"
              required
            />
            <div className="flex-1">
              <label className="font-medium text-foreground cursor-pointer">
                I agree to the Terms of Service <span className="text-error">*</span>
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                By checking this box, you agree to our{' '}
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                  Terms of Service
                </Button>
                {' '}and{' '}
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                  Community Guidelines
                </Button>
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={privacySettings?.acceptPrivacy || false}
              onChange={(e) => handleSettingChange('acceptPrivacy', e?.target?.checked)}
              className="mt-1"
              required
            />
            <div className="flex-1">
              <label className="font-medium text-foreground cursor-pointer">
                I agree to the Privacy Policy <span className="text-error">*</span>
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                I understand how my data will be collected, used, and protected as outlined in the{' '}
                <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                  Privacy Policy
                </Button>
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              checked={privacySettings?.ageConfirmation || false}
              onChange={(e) => handleSettingChange('ageConfirmation', e?.target?.checked)}
              className="mt-1"
              required
            />
            <div className="flex-1">
              <label className="font-medium text-foreground cursor-pointer">
                Age Confirmation <span className="text-error">*</span>
              </label>
              <p className="text-sm text-muted-foreground mt-1">
                I confirm that I am at least 13 years old and have the legal capacity to enter into this agreement
              </p>
            </div>
          </div>
        </div>
        
        {errors?.terms && (
          <p className="text-sm text-error flex items-center">
            <Icon name="AlertCircle" size={16} className="mr-1" />
            {errors?.terms}
          </p>
        )}
      </div>
      {/* Data Usage Notice */}
      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <h5 className="font-medium text-foreground mb-2">Data Usage Notice</h5>
            <p className="text-sm text-muted-foreground">
              Your information will be used to create your AthlNet profile and connect you with relevant opportunities. 
              You can modify these settings anytime from your account preferences. We never sell your personal data to third parties.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySettings;