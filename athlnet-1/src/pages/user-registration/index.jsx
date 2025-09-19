import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticationHeader from 'components/ui/AuthenticationHeader';
import ProgressIndicator from 'components/ui/ProgressIndicator';
import Button from 'components/ui/Button';

import Icon from 'components/AppIcon';
import { auth, db, storage, isConfigured, initError } from '../../firebaseClient';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import RoleSelectionCard from './components/RoleSelectionCard';
import PersonalInfoForm from './components/PersonalInfoForm';
import SportsInfoForm from './components/SportsInfoForm';
import AchievementUpload from './components/AchievementUpload';
import PrivacySettings from './components/PrivacySettings';
import SocialAuthOptions from './components/SocialAuthOptions';

const UserRegistration = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showSocialAuth, setShowSocialAuth] = useState(true);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);

  // Form data state
  const [formData, setFormData] = useState({
    // Personal info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    city: '',
    country: '',
    bio: '',
    // Role and sports info will be added dynamically
  });

  const [selectedRole, setSelectedRole] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [privacySettings, setPrivacySettings] = useState({});
  const [errors, setErrors] = useState({});

  const registrationSteps = [
    { id: 1, title: 'Account Type', description: 'Choose your role' },
    { id: 2, title: 'Personal Info', description: 'Basic information' },
    { id: 3, title: 'Sports Details', description: 'Your sports background' },
    { id: 4, title: 'Achievements', description: 'Upload documents' },
    { id: 5, title: 'Privacy & Terms', description: 'Final settings' }
  ];

  // Mock credentials for testing
  const mockCredentials = {
    email: 'test@athlnet.com',
    password: 'AthlNet2024!'
  };

  useEffect(() => {
    // Scroll to top when step changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!selectedRole) {
          newErrors.role = 'Please select your account type';
        }
        break;

      case 2:
        if (!formData?.firstName?.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!formData?.lastName?.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!formData?.email?.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        if (!formData?.dateOfBirth) {
          newErrors.dateOfBirth = 'Date of birth is required';
        }
        if (!formData?.city?.trim()) {
          newErrors.city = 'City is required';
        }
        if (!formData?.country) {
          newErrors.country = 'Country is required';
        }
        if (!formData?.bio?.trim()) {
          newErrors.bio = 'Bio is required';
        } else if (formData?.bio?.length > 500) {
          newErrors.bio = 'Bio must be less than 500 characters';
        }

        // Password validation for email registration
        if (!showSocialAuth) {
          if (!formData?.password) {
            newErrors.password = 'Password is required';
          } else if (formData?.password?.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
          }
          if (formData?.password !== formData?.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
          }
        }
        break;

      case 3:
        if (selectedRole === 'athlete') {
          if (!formData?.primarySport) {
            newErrors.primarySport = 'Primary sport is required';
          }
          if (!formData?.skillLevel) {
            newErrors.skillLevel = 'Skill level is required';
          }
          if (!formData?.experience) {
            newErrors.experience = 'Experience is required';
          }
        } else if (selectedRole === 'coach') {
          if (!formData?.specialization) {
            newErrors.specialization = 'Coaching specialization is required';
          }
          if (!formData?.coachingExperience) {
            newErrors.coachingExperience = 'Coaching experience is required';
          }
        } else if (selectedRole === 'sponsor') {
          if (!formData?.companyName?.trim()) {
            newErrors.companyName = 'Company name is required';
          }
          if (!formData?.industry?.trim()) {
            newErrors.industry = 'Industry is required';
          }
        }
        break;

      case 5:
        if (!privacySettings?.acceptTerms) {
          newErrors.terms = 'You must accept the Terms of Service';
        }
        if (!privacySettings?.acceptPrivacy) {
          newErrors.terms = 'You must accept the Privacy Policy';
        }
        if (!privacySettings?.ageConfirmation) {
          newErrors.terms = 'You must confirm your age';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < registrationSteps?.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleStepClick = (step) => {
    if (step <= currentStep) {
      setCurrentStep(step);
      setErrors({});
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setErrors({});
  };

  const handleFormChange = (newData) => {
    setFormData(newData);
    setErrors({});
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfilePreview(e?.target?.result);
    };
    reader?.readAsDataURL(file);
    setProfileFile(file);
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    try {
      if (!isConfigured) {
        throw new Error('Firebase client not configured. ' + (initError || 'See console for details'));
      }

      if (provider === 'google') {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        const user = result?.user;

        // Build profile data from available fields and Google profile
        const userProfile = {
          email: user?.email,
          displayName: user?.displayName || `${formData?.firstName || ''} ${formData?.lastName || ''}`.trim(),
          role: selectedRole || 'athlete',
          personalInfo: { ...formData },
          achievements,
          privacySettings,
          provider: 'google',
          photoURL: user?.photoURL || null,
          createdAt: new Date().toISOString(),
        };

        // Save to Firestore
        await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });

  // Navigate to home feed
  navigate('/home-feed');
      } else {
        // fallback: treat as mock
        await new Promise(resolve => setTimeout(resolve, 800));
  navigate('/home-feed');
      }
    } catch (error) {
      console.error('Social login failed:', error);
      setErrors({ submit: error?.message || 'Social login failed' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      if (!isConfigured) {
        throw new Error('Firebase client not configured. ' + (initError || 'See console for details'));
      }
      // Create user in Firebase Auth using email/password
      const email = formData?.email;
      const password = formData?.password;
      if (!email || !password) {
        throw new Error('Email and password are required to create an account');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // If profile file exists, upload to storage
      let photoURL = null;
      if (profileFile && user?.uid) {
        const storageRef = ref(storage, `profiles/${user.uid}/avatar`);
        await uploadBytes(storageRef, profileFile);
        photoURL = await getDownloadURL(storageRef);
        // update Firebase Auth profile
        try { await updateProfile(user, { photoURL }); } catch (e) { /* non-fatal */ }
      }

      const registrationData = {
        role: selectedRole,
        personalInfo: formData,
        achievements: achievements,
        privacySettings: privacySettings,
        provider: 'password',
        photoURL,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', user.uid), registrationData, { merge: true });

  // Navigate to home feed
  navigate('/home-feed');
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors({ submit: error?.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailRegistration = () => {
    setShowSocialAuth(false);
  };

  const renderStepContent = () => {
    if (showSocialAuth && currentStep === 1) {
      return (
        <div className="space-y-6">
          <SocialAuthOptions 
            onSocialLogin={handleSocialLogin}
            isLoading={isLoading}
            disabled={!isConfigured}
          />
          
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={handleEmailRegistration}
              className="text-primary hover:text-primary/80"
            >
              Register with email instead
            </Button>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-foreground">
                Choose Your Account Type
              </h2>
              <p className="text-muted-foreground">
                Select the option that best describes your role in the sports community
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {['athlete', 'coach', 'sponsor', 'fan']?.map((role) => (
                <RoleSelectionCard
                  key={role}
                  role={role}
                  isSelected={selectedRole === role}
                  onSelect={handleRoleSelect}
                />
              ))}
            </div>
            {errors?.role && (
              <p className="text-sm text-error text-center flex items-center justify-center">
                <Icon name="AlertCircle" size={16} className="mr-1" />
                {errors?.role}
              </p>
            )}
          </div>
        );

      case 2:
        return (
          <PersonalInfoForm
            formData={formData}
            onFormChange={handleFormChange}
            errors={errors}
            onFileUpload={handleFileUpload}
            profilePreview={profilePreview}
          />
        );

      case 3:
        return (
          <SportsInfoForm
            formData={formData}
            onFormChange={handleFormChange}
            errors={errors}
            selectedRole={selectedRole}
          />
        );

      case 4:
        return (
          <AchievementUpload
            achievements={achievements}
            onAchievementsChange={setAchievements}
            errors={errors}
          />
        );

      case 5:
        return (
          <PrivacySettings
            privacySettings={privacySettings}
            onPrivacyChange={setPrivacySettings}
            errors={errors}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticationHeader />
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Indicator */}
          {!showSocialAuth && (
            <div className="mb-8">
              <ProgressIndicator
                currentStep={currentStep}
                totalSteps={registrationSteps?.length}
                steps={registrationSteps}
                onStepClick={handleStepClick}
              />
            </div>
          )}

          {/* Main Content */}
          <div className="bg-card rounded-lg shadow-card p-6 md:p-8">
            {/* If firebase is not configured, show a prominent notice */}
            {!isConfigured && (
              <div className="mb-4 p-4 rounded-md bg-yellow-50 border border-yellow-200 text-yellow-800">
                <strong>Firebase not configured:</strong> {initError || 'Missing configuration'}. Please add your VITE_FIREBASE_* values to <code>.env.local</code> and restart the dev server.
              </div>
            )}
            {renderStepContent()}

            {/* Navigation Buttons */}
            {!showSocialAuth && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1 || isLoading}
                  iconName="ArrowLeft"
                  iconPosition="left"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-4">
                  {currentStep < registrationSteps?.length ? (
                    <Button
                      variant="default"
                      onClick={handleNext}
                      disabled={isLoading}
                      loading={isLoading}
                      iconName="ArrowRight"
                      iconPosition="right"
                    >
                      Next Step
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handleSubmit}
                      disabled={isLoading}
                      loading={isLoading}
                      iconName="Check"
                      iconPosition="right"
                      className="bg-success hover:bg-success/90"
                    >
                      Complete Registration
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errors?.submit && (
              <div className="mt-4 p-4 bg-error/10 border border-error/20 rounded-lg">
                <p className="text-sm text-error flex items-center">
                  <Icon name="AlertCircle" size={16} className="mr-2" />
                  {errors?.submit}
                </p>
              </div>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our{' '}
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                support team
              </Button>
              {' '}or check our{' '}
              <Button variant="link" className="p-0 h-auto text-primary hover:text-primary/80">
                FAQ
              </Button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserRegistration;