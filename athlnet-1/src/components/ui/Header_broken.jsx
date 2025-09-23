import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../../firebaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../utils/firestoreSocialApi';
import { isCoach } from '../../utils/coachUtils';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const { user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileName, setProfileName] = useState('Account');
  const [profileTitle, setProfileTitle] = useState('Athlete');

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setProfileName(profile?.personalInfo?.firstName || user.displayName || user.email || 'Account');
          
          // Use isCoach function to determine correct title
          const userIsCoach = isCoach(profile);
          setProfileTitle(userIsCoach ? 'Coach' : profile?.personalInfo?.title || 'Athlete');
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          setProfileName(user.displayName || user.email || 'Account');
          setProfileTitle('Athlete');
        }
      } else {
        setProfileName('Account');
        setProfileTitle('Athlete');
      }
    }

    fetchProfile();
  }, [user]);
  const userMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'Home', path: '/home-feed', icon: 'Home' },
    { label: 'Discover', path: '/search-and-discovery', icon: 'Search' },
    { label: 'Messages', path: '/messaging', icon: 'MessageCircle' },
    { label: 'Profile', path: '/user-profile', icon: 'User' },
    { label: 'Analytics', path: '/dashboard-analytics', icon: 'BarChart3' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isUserMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isUserMenuOpen, isMobileMenuOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleUserMenuClick = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-card border-b border-border z-navigation">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <button
            onClick={() => navigate('/home-feed')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity touch-manipulation"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Zap" size={20} color="white" />
            </div>
            <span className="text-xl md:text-xl sm:text-lg font-bold text-foreground">AthlNet</span>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActivePath(item?.path)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
            </button>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Search - Desktop Only */}
          <div className="hidden lg:block">
            <div className="relative">
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                placeholder="Search athletes, coaches..."
                className="w-64 pl-10 pr-4 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Notifications */}
          <NotificationCenter />

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={handleUserMenuClick}
              className="flex items-center space-x-2 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px]"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-secondary flex items-center justify-center">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="User" size={16} />
                )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium text-foreground">{profileName}</div>
                <div className="text-xs text-muted-foreground">{profileTitle}</div>
              </div>
            </button>
            {/* User Dropdown */}
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 max-w-[90vw] bg-popover border border-border rounded-lg shadow-modal z-dropdown">
                <div className="p-4 border-b border-border">
                  <p className="font-medium text-foreground">{profileName}</p>
                  <p className="text-sm text-muted-foreground">{profileTitle}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => handleNavigation('/user-profile')}
                    className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors touch-manipulation"
                  >
                    <Icon name="User" size={16} />
                    <span>View Profile</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors touch-manipulation">
                    <Icon name="Settings" size={16} />
                    <span>Settings</span>
                  </button>
                  <button className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors touch-manipulation">
                    <Icon name="HelpCircle" size={16} />
                    <span>Help & Support</span>
                  </button>
                  <div className="border-t border-border mt-2 pt-2">
                    <button 
                      onClick={async () => {
                        try {
                          await auth.signOut();
                          window.localStorage.removeItem('uid');
                          // Clear browser history to prevent back button access to protected routes
                          window.history.replaceState(null, '', '/');
                          window.location.replace('/');
                        } catch (e) {
                          alert('Logout failed: ' + (e?.message || e));
                        }
                      }}
                      className="flex items-center space-x-3 w-full px-4 py-3 text-sm text-error hover:bg-muted transition-colors touch-manipulation"
                    >
                      <Icon name="LogOut" size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-card border-t border-border shadow-lg">
          <div className="px-4 py-3 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            {/* Mobile Search */}
            <div className="relative mb-4">
              <Icon 
                name="Search" 
                size={18} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <input
                type="text"
                placeholder="Search athletes, coaches..."
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent touch-manipulation"
              />
            </div>

            {/* Mobile Navigation Items */}
            {navigationItems?.map((item) => (
              <button
                key={item?.path}
                onClick={() => {
                  handleNavigation(item?.path);
                  setIsMobileMenuOpen(false); // Close menu after navigation
                }}
                className={`flex items-center space-x-3 w-full px-4 py-4 rounded-lg text-sm font-medium transition-colors touch-manipulation ${
                  isActivePath(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={18} />
                <span>{item?.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;