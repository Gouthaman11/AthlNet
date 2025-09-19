import React, { useState, useRef, useEffect } from 'react';
import { auth } from '../../firebaseClient';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../utils/firestoreSocialApi';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const { user } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const [profileName, setProfileName] = useState('Account');
  const [profileTitle, setProfileTitle] = useState('Athlete');

  useEffect(() => {
    async function fetchProfile() {
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setProfileName(profile?.personalInfo?.firstName || user.displayName || user.email || 'Account');
          setProfileTitle(profile?.personalInfo?.title || 'Athlete');
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
  const notificationRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    { label: 'Home', path: '/home-feed', icon: 'Home' },
    { label: 'Discover', path: '/search-and-discovery', icon: 'Search' },
    { label: 'Messages', path: '/messaging', icon: 'MessageCircle' },
    { label: 'Profile', path: '/user-profile', icon: 'User' },
    { label: 'Analytics', path: '/dashboard-analytics', icon: 'BarChart3' }
  ];

  const notifications = [
    { id: 1, type: 'connection', message: 'Sarah Johnson wants to connect', time: '2 min ago', unread: true },
    { id: 2, type: 'message', message: 'New message from Coach Martinez', time: '5 min ago', unread: true },
    { id: 3, type: 'achievement', message: 'Your profile was viewed 15 times today', time: '1 hour ago', unread: false }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef?.current && !userMenuRef?.current?.contains(event?.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef?.current && !notificationRef?.current?.contains(event?.target)) {
        setIsNotificationOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setIsUserMenuOpen(false);
        setIsNotificationOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    if (isNotificationOpen || isUserMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      
      // Prevent body scroll when notification panel is open on mobile
      if (isNotificationOpen && window.innerWidth < 768) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isNotificationOpen, isUserMenuOpen, isMobileMenuOpen]);

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleNotificationClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsNotificationOpen(!isNotificationOpen);
    if (!isNotificationOpen) {
      setNotificationCount(0);
    }
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      setIsMobileMenuOpen(false);
    }
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'connection': return 'UserPlus';
      case 'message': return 'MessageCircle';
      case 'achievement': return 'Trophy';
      default: return 'Bell';
    }
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
          <div className="relative" ref={notificationRef}>
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <Icon name="Bell" size={20} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-error-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>

            {/* Mobile Notification Backdrop */}
            {isNotificationOpen && (
              <div 
                className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] animate-in fade-in-0 duration-200"
                onClick={() => setIsNotificationOpen(false)}
                style={{ top: 0, left: 0, right: 0, bottom: 0 }}
              />
            )}

            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="fixed sm:absolute 
                            inset-x-4 sm:inset-x-auto
                            top-20 sm:top-auto
                            right-0 sm:right-0 md:right-0
                            left-auto sm:left-auto md:left-auto
                            mt-0 sm:mt-2 
                            w-auto sm:w-96 md:w-80 
                            max-w-none sm:max-w-[calc(100vw-2rem)]
                            bg-popover border border-border rounded-lg shadow-modal z-[60] 
                            animate-in slide-in-from-top-4 sm:slide-in-from-top-2 fade-in-0 duration-200">
                <div className="p-4 sm:p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground text-lg sm:text-base">Notifications</h3>
                    <button
                      onClick={() => setIsNotificationOpen(false)}
                      className="sm:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors touch-manipulation min-w-[40px] min-h-[40px] flex items-center justify-center"
                    >
                      <Icon name="X" size={20} />
                    </button>
                  </div>
                </div>
                <div className="max-h-[60vh] sm:max-h-96 overflow-y-auto overscroll-contain">
                  {notifications?.map((notification) => (
                    <div
                      key={notification?.id}
                      className={`p-4 sm:p-4 border-b border-border last:border-b-0 hover:bg-muted active:bg-muted transition-colors cursor-pointer touch-manipulation min-h-[72px] sm:min-h-[64px] ${
                        notification?.unread ? 'bg-muted/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          <Icon name={getNotificationIcon(notification?.type)} size={20} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base sm:text-sm text-foreground leading-relaxed break-words pr-2">{notification?.message}</p>
                          <p className="text-sm sm:text-xs text-muted-foreground mt-2">{notification?.time}</p>
                        </div>
                        {notification?.unread && (
                          <div className="w-3 h-3 sm:w-2 sm:h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                  {(!notifications || notifications.length === 0) && (
                    <div className="p-8 text-center">
                      <Icon name="Bell" size={40} className="text-muted-foreground mx-auto mb-3" />
                      <p className="text-base sm:text-sm text-muted-foreground">No notifications yet</p>
                      <p className="text-sm sm:text-xs text-muted-foreground/70 mt-1">We'll notify you when something happens</p>
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-4 border-t border-border">
                  <Button variant="ghost" className="w-full text-base sm:text-sm touch-manipulation min-h-[48px] sm:min-h-[44px] rounded-lg">
                    View all notifications
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center space-x-2 p-1 hover:bg-muted rounded-lg transition-colors touch-manipulation min-w-[44px] min-h-[44px]"
            >
              <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                <Icon name="User" size={16} color="white" />
              </div>
              <Icon name="ChevronDown" size={16} className="text-muted-foreground hidden sm:block" />
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