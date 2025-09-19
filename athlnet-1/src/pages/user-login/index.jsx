import React, { useState } from 'react';
import { auth, isConfigured, initError } from '../../firebaseClient';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import AuthenticationHeader from 'components/ui/AuthenticationHeader';
import SocialLoginButtons from './components/SocialLoginButtons';
import LoginForm from './components/LoginForm';
import TrustSignals from './components/TrustSignals';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';

const UserLogin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async (formData) => {
    setIsLoading(true);
    setError('');

    if (!isConfigured) {
      setError('Firebase not configured. ' + (initError || 'See console for details'));
      setIsLoading(false);
      return;
    }

    try {
      const { email, password } = formData;
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Optionally store user info in localStorage if needed
      // localStorage.setItem('user', JSON.stringify(userCredential.user));
      navigate('/home-feed');
    } catch (err) {
      setError(err?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setIsLoading(true);
    setError('');

    if (!isConfigured) {
      setError('Firebase not configured. ' + (initError || 'See console for details'));
      setIsLoading(false);
      return;
    }

    try {
      if (provider === 'Google') {
        const googleProvider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, googleProvider);
        // Optionally store user info in localStorage if needed
        // localStorage.setItem('user', JSON.stringify(result.user));
        navigate('/home-feed');
      } else {
        setError('Only Google login is supported.');
      }
    } catch (err) {
      setError(err?.message || `${provider} login failed. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpClick = () => {
    navigate('/user-registration');
  };

  return (
    <div className="min-h-screen bg-background">
      <AuthenticationHeader />
      <div className="pt-16">
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary-foreground"
                >
                  <path
                    d="M12 2L15.09 8.26L22 9L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9L8.91 8.26L12 2Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back</h1>
              <p className="text-muted-foreground">
                Sign in to your AthlNet account to continue your sports journey
              </p>
            </div>

            {/* Login Card */}
            <div className="bg-card border border-border rounded-lg shadow-card p-6 space-y-6">
              {/* Social Login */}
              <div className="space-y-4">
                <SocialLoginButtons
                  onGoogleLogin={() => handleSocialLogin('Google')}
                  onFacebookLogin={() => handleSocialLogin('Facebook')}
                  isLoading={isLoading}
                />

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-card text-muted-foreground">or continue with email</span>
                  </div>
                </div>
              </div>

              {/* Login Form */}
              <LoginForm
                onSubmit={handleLogin}
                isLoading={isLoading}
                error={error}
              />

              {/* ...removed demo credentials info... */}

              {/* Sign Up Link */}
              <div className="text-center pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Button
                    variant="link"
                    onClick={handleSignUpClick}
                    className="p-0 h-auto text-primary hover:text-primary/80 font-medium"
                    disabled={isLoading}
                  >
                    Sign up for free
                  </Button>
                </p>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="mt-8">
              <TrustSignals />
            </div>

            {/* Additional Help */}
            <div className="mt-6 text-center">
              <p className="text-xs text-muted-foreground mb-2">Need help?</p>
              <div className="flex items-center justify-center space-x-4 text-xs">
                <button className="text-primary hover:text-primary/80 underline">
                  Contact Support
                </button>
                <div className="w-1 h-1 bg-muted-foreground rounded-full"></div>
                <button className="text-primary hover:text-primary/80 underline">
                  Help Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;