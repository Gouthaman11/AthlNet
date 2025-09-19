import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from 'components/ui/Button';
import Icon from 'components/AppIcon';
import { auth } from '../../firebaseClient';

const AuthenticationHeader = ({ showLogo = true }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isLoginPage = location?.pathname === '/user-login';
  const isRegistrationPage = location?.pathname === '/user-registration';

  const handleLogoClick = () => navigate('/landing-page');
  const handleLoginClick = () => navigate('/user-login');
  const handleSignUpClick = () => navigate('/user-registration');
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleLogout = async () => {
    try {
      if (auth && typeof auth.signOut === 'function') {
  await auth.signOut();
  window.localStorage.removeItem('uid');
  window.location.replace('/user-login');
      } else {
        alert('Auth not initialized.');
      }
    } catch (e) {
      alert('Logout failed: ' + (e?.message || e));
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border shadow-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 hover:opacity-80 transition-smooth"
            >
              {showLogo && (
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg
                    width="20"
                    height="20"
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
              )}
              <span className="text-xl font-bold text-foreground">AthlNet</span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {!isLoginPage && !isRegistrationPage && (
              <>
                <Button
                  variant="ghost"
                  onClick={handleLoginClick}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign In
                </Button>
                <Button
                  variant="default"
                  onClick={handleSignUpClick}
                  className="bg-primary hover:bg-primary/90"
                >
                  Get Started
                </Button>
                {/* Only show signout if authenticated */}
                {window.localStorage.getItem('uid') && (
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="ml-2"
                  >
                    Sign Out
                  </Button>
                )}
              </>
            )}

            {isLoginPage && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Don't have an account?</span>
                <Button
                  variant="link"
                  onClick={handleSignUpClick}
                  className="p-0 h-auto text-primary hover:text-primary/80"
                >
                  Sign up
                </Button>
              </div>
            )}

            {isRegistrationPage && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <span>Already have an account?</span>
                <Button
                  variant="link"
                  onClick={handleLoginClick}
                  className="p-0 h-auto text-primary hover:text-primary/80"
                >
                  Sign in
                </Button>
              </div>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMobileMenu}
              className="text-muted-foreground hover:text-foreground"
            >
              <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card animate-slide-in-from-top">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {!isLoginPage && !isRegistrationPage && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      handleLoginClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    Sign In
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => {
                      handleSignUpClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-primary hover:bg-primary/90"
                  >
                    Get Started
                  </Button>
                </>
              )}

              {isLoginPage && (
                <div className="px-3 py-2">
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-muted-foreground">Don't have an account?</span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleSignUpClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Sign up
                    </Button>
                  </div>
                </div>
              )}

              {isRegistrationPage && (
                <div className="px-3 py-2">
                  <div className="flex flex-col space-y-2">
                    <span className="text-sm text-muted-foreground">Already have an account?</span>
                    <Button
                      variant="outline"
                      onClick={() => {
                        handleLoginClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full"
                    >
                      Sign in
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default AuthenticationHeader;