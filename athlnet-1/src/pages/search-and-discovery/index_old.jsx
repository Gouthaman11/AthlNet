import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';
import { 
  searchUsers, 
  getSuggestedUsers, 
  getUsersBySport, 
  toggleFollowUser 
} from '../../utils/firestoreSocialApi';
import Header from '../../components/ui/Header';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import SearchResultsFirebase from './components/SearchResultsFirebase';
import DiscoverySectionFirebase from './components/DiscoverySectionFirebase';
import SavedSearches from './components/SavedSearches';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const SearchAndDiscovery = () => {
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('discover'); // 'search', 'discover', 'sport'
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(false);
  
  // Firebase data states
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [sportUsers, setSportUsers] = useState([]);
  const [selectedSport, setSelectedSport] = useState('');
  
  const [filters, setFilters] = useState({
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
  });

  const sports = [
    'Basketball', 'Football', 'Soccer', 'Tennis', 'Baseball', 
    'Swimming', 'Running', 'Cycling', 'Golf', 'Volleyball',
    'Fitness', 'Yoga', 'CrossFit', 'Boxing', 'Martial Arts'
  ];

  // Mock data for suggestions and recent searches
  const suggestions_mock = [
    { text: 'Basketball players in Los Angeles', category: 'Athletes', icon: 'User' },
    { text: 'Tennis coaches near me', category: 'Coaches', icon: 'Whistle' },
    { text: 'Verified football athletes', category: 'Athletes', icon: 'BadgeCheck' },
    { text: 'Sponsors looking for partnerships', category: 'Sponsors', icon: 'Building' },
    { text: 'Swimming competitions 2025', category: 'Events', icon: 'Trophy' }
  ];

  const recentSearches = [
    'Professional basketball players',
    'Tennis coaches California',
    'Verified athletes',
    'Local sponsors'
  ];

  // Mock saved searches
  const [savedSearches, setSavedSearches] = useState([
    {
      id: 1,
      name: 'Local Basketball Coaches',
      filters: {
        sports: ['basketball'],
        userTypes: ['coach'],
        locationRadius: '25',
        verified: true
      },
      createdAt: '2025-01-05T10:00:00Z'
    },
    {
      id: 2,
      name: 'Verified Athletes',
      filters: {
        userTypes: ['athlete'],
        verified: true,
        hasAchievements: true
      },
      createdAt: '2025-01-03T15:30:00Z'
    }
  ]);

  // Load suggested users on component mount
  useEffect(() => {
    if (user?.uid) {
      loadSuggestedUsers();
    }
  }, [user]);

  const loadSuggestedUsers = async () => {
    if (!user?.uid) return;
    
    setSuggestions(true);
    try {
      const suggested = await getSuggestedUsers(user.uid, 12);
      setSuggestedUsers(suggested);
    } catch (error) {
      console.error('Error loading suggested users:', error);
    } finally {
      setSuggestions(false);
    }
  };

  const handleSearch = async (term = searchQuery) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const results = await searchUsers(term, 20);
      setSearchResults(results.filter(u => u.uid !== user?.uid)); // Exclude current user
      setActiveTab('search');
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSportFilter = async (sport) => {
    if (!sport) {
      setSportUsers([]);
      return;
    }

    setLoading(true);
    setSelectedSport(sport);
    try {
      const results = await getUsersBySport(sport, 15);
      setSportUsers(results.filter(u => u.uid !== user?.uid)); // Exclude current user
      setActiveTab('sport');
    } catch (error) {
      console.error('Error filtering by sport:', error);
      setSportUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUser = async (targetUserId) => {
    if (!user?.uid) return;
    
    try {
      await toggleFollowUser(user.uid, targetUserId);
      
      // Update the follow status in all our local state
      const updateUserFollowStatus = (users, setUsers) => {
        setUsers(prevUsers => 
          prevUsers.map(u => 
            (u.uid || u.id) === targetUserId 
              ? { ...u, isFollowing: !u.isFollowing }
              : u
          )
        );
      };

      updateUserFollowStatus(searchResults, setSearchResults);
      updateUserFollowStatus(suggestedUsers, setSuggestedUsers);
      updateUserFollowStatus(sportUsers, setSportUsers);
      
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      alert('Failed to follow user. Please try again.');
    }
  };

  const handleSaveCurrentSearch = (name, currentFilters) => {
    const newSearch = {
      id: Date.now(),
      name,
      filters: currentFilters,
      createdAt: new Date().toISOString()
    };
    setSavedSearches(prev => [newSearch, ...prev]);
  };

  const handleLoadSearch = (search) => {
    setFilters(search.filters);
    setActiveTab('search');
    handleSearch();
  };

  const handleDeleteSearch = (searchId) => {
    setSavedSearches(prev => prev.filter(search => search.id !== searchId));
  };

  // Auto search when query changes
  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600">You need to be logged in to discover athletes.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Search & Discovery - AthlNet</title>
        <meta name="description" content="Discover and connect with athletes, coaches, sponsors, and sports content on AthlNet." />
      </Helmet>

      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Search & Discovery</h1>
            <p className="text-muted-foreground">
              Find athletes, coaches, and sports professionals in your network
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              suggestions={suggestions_mock}
              recentSearches={recentSearches}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'discover' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Compass" size={16} className="mr-2 inline" />
                Discover ({suggestedUsers.length})
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'search' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Search" size={16} className="mr-2 inline" />
                Search ({searchResults.length})
              </button>
              <button
                onClick={() => setActiveTab('sport')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'sport' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Trophy" size={16} className="mr-2 inline" />
                By Sport ({sportUsers.length})
              </button>
            </div>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden"
              iconName="Filter"
              iconPosition="left"
            >
              Filters
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Sport</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedSport('');
                      setSportUsers([]);
                      setActiveTab('discover');
                    }}
                    className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors ${
                      !selectedSport
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    All Sports
                  </button>
                  {sports.map((sport) => (
                    <button
                      key={sport}
                      onClick={() => handleSportFilter(sport)}
                      className={`w-full text-left py-2 px-3 rounded-md text-sm transition-colors ${
                        selectedSport === sport
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {sport}
                    </button>
                  ))}
                </div>
              </div>

              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                isOpen={true}
                onClose={() => {}}
                resultCount={searchResults.length}
              />
              
              {/* Saved Searches */}
              <div className="mt-6">
                <SavedSearches
                  savedSearches={savedSearches}
                  onLoadSearch={handleLoadSearch}
                  onDeleteSearch={handleDeleteSearch}
                  onSaveCurrentSearch={handleSaveCurrentSearch}
                  currentFilters={filters}
                />
              </div>
            </div>

            {/* Mobile Filter Panel */}
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              resultCount={searchResults.length}
            />

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Loading State */}
              {(loading || suggestions) && (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-gray-600">
                    {loading ? 'Searching...' : 'Loading suggestions...'}
                  </span>
                </div>
              )}

              {!loading && !suggestions && (
                <>
                  {/* Search Results Tab */}
                  {activeTab === 'search' && (
                    <SearchResultsFirebase 
                      results={searchResults}
                      loading={false}
                      onFollowUser={handleFollowUser}
                      currentUserId={user.uid}
                      title={`Search Results for "${searchQuery}"`}
                    />
                  )}

                  {/* Discover Tab */}
                  {activeTab === 'discover' && (
                    <DiscoverySectionFirebase 
                      suggestedUsers={suggestedUsers}
                      onFollowUser={handleFollowUser}
                      onRefresh={loadSuggestedUsers}
                      currentUserId={user.uid}
                    />
                  )}

                  {/* Sport Filter Tab */}
                  {activeTab === 'sport' && (
                    <SearchResultsFirebase 
                      results={sportUsers}
                      loading={false}
                      onFollowUser={handleFollowUser}
                      currentUserId={user.uid}
                      title={selectedSport ? `${selectedSport} Athletes` : 'Select a Sport'}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchAndDiscovery;
  
  const [filters, setFilters] = useState({
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
  });

  // Mock data for suggestions and recent searches
  const suggestions = [
    { text: 'Basketball players in Los Angeles', category: 'Athletes', icon: 'User' },
    { text: 'Tennis coaches near me', category: 'Coaches', icon: 'Whistle' },
    { text: 'Verified football athletes', category: 'Athletes', icon: 'BadgeCheck' },
    { text: 'Sponsors looking for partnerships', category: 'Sponsors', icon: 'Building' },
    { text: 'Swimming competitions 2025', category: 'Events', icon: 'Trophy' }
  ];

  const recentSearches = [
    'Professional basketball players',
    'Tennis coaches California',
    'Verified athletes',
    'Local sponsors'
  ];

  // Mock search results
  const mockResults = [
    {
      id: 1,
      name: 'Marcus Johnson',
      title: 'Professional Basketball Player',
      location: 'Los Angeles, CA',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      verified: true,
      online: true,
      connections: 2847,
      achievements: 15,
      sports: ['Basketball', 'Fitness'],
      bio: 'Professional basketball player with 8 years of experience in the NBA. Passionate about mentoring young athletes and community outreach.',
      type: 'athlete',
      canMessage: true,
      featuredAchievement: 'NBA Champion 2023'
    },
    {
      id: 2,
      name: 'Sarah Martinez',
      title: 'Tennis Coach & Former Pro',
      location: 'Miami, FL',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      verified: true,
      online: false,
      connections: 1523,
      achievements: 8,
      sports: ['Tennis', 'Fitness'],
      bio: 'Former professional tennis player turned coach. Specializing in junior development and mental performance coaching.',
      type: 'coach',
      canMessage: true,
      featuredAchievement: 'WTA Top 50'
    },
    {
      id: 3,
      name: 'Nike Sports Division',
      title: 'Athletic Sponsor',
      location: 'Portland, OR',
      avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=150&h=150&fit=crop&crop=center',
      verified: true,
      online: true,
      connections: 5642,
      achievements: 0,
      sports: ['Multi-Sport'],
      bio: 'Leading athletic brand seeking partnerships with emerging and established athletes across all sports disciplines.',
      type: 'sponsor',
      canMessage: false,
      featuredAchievement: null
    },
    {
      id: 4,
      name: 'Alex Rodriguez',
      title: 'Swimming Champion',
      location: 'Austin, TX',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      verified: false,
      online: true,
      connections: 892,
      achievements: 12,
      sports: ['Swimming', 'Triathlon'],
      bio: 'Competitive swimmer specializing in freestyle and butterfly. Currently training for the 2028 Olympics.',
      type: 'athlete',
      canMessage: true,
      featuredAchievement: 'State Record Holder'
    },
    {
      id: 5,
      name: 'Coach Williams',
      title: 'Football Strength Coach',
      location: 'Dallas, TX',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
      verified: true,
      online: false,
      connections: 3421,
      achievements: 6,
      sports: ['Football', 'Strength Training'],
      bio: 'Experienced strength and conditioning coach with 15 years in professional football. Expert in injury prevention and performance optimization.',
      type: 'coach',
      canMessage: true,
      featuredAchievement: 'NFL Championship Team'
    },
    {
      id: 6,
      name: 'Emma Thompson',
      title: 'Track & Field Athlete',
      location: 'Eugene, OR',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      verified: true,
      online: true,
      connections: 1876,
      achievements: 9,
      sports: ['Track & Field', 'Marathon'],
      bio: 'Long-distance runner and track athlete. Competed in multiple international competitions and marathons worldwide.',
      type: 'athlete',
      canMessage: true,
      featuredAchievement: 'Olympic Qualifier'
    }
  ];

  // Mock discovery data
  const recommendations = [
    {
      user: {
        id: 7,
        name: 'Jordan Smith',
        title: 'Basketball Coach',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      reason: 'Based on your interest in basketball and coaching'
    },
    {
      user: {
        id: 8,
        name: 'Lisa Chen',
        title: 'Fitness Influencer',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      reason: 'Popular in your network and location'
    },
    {
      user: {
        id: 9,
        name: 'Mike Torres',
        title: 'Sports Photographer',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      reason: 'Frequently collaborates with athletes like you'
    },
    {
      user: {
        id: 10,
        name: 'Rachel Green',
        title: 'Nutritionist',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      reason: 'Specializes in sports nutrition for your sport'
    }
  ];

  const trending = [
    {
      id: 1,
      title: 'Olympic Training Tips',
      description: 'Athletes sharing their training routines for 2028 Olympics',
      icon: 'Trophy',
      rank: 1,
      posts: 1247,
      growth: 23
    },
    {
      id: 2,
      title: 'Mental Health in Sports',
      description: 'Discussion about mental wellness and performance',
      icon: 'Brain',
      rank: 2,
      posts: 892,
      growth: 18
    },
    {
      id: 3,
      title: 'Sustainable Sports Gear',
      description: 'Eco-friendly equipment and apparel trends',
      icon: 'Leaf',
      rank: 3,
      posts: 634,
      growth: 15
    },
    {
      id: 4,
      title: 'Youth Sports Development',
      description: 'Programs and initiatives for young athletes',
      icon: 'Users',
      rank: 4,
      posts: 567,
      growth: 12
    },
    {
      id: 5,
      title: 'Sports Technology',
      description: 'Latest innovations in athletic performance tracking',
      icon: 'Smartphone',
      rank: 5,
      posts: 423,
      growth: 9
    },
    {
      id: 6,
      title: 'Recovery Techniques',
      description: 'Advanced methods for athlete recovery and wellness',
      icon: 'Heart',
      rank: 6,
      posts: 389,
      growth: 7
    }
  ];

  const suggestedConnections = [
    {
      user: {
        id: 11,
        name: 'David Park',
        title: 'Tennis Pro',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      mutualConnections: 12
    },
    {
      user: {
        id: 12,
        name: 'Anna Wilson',
        title: 'Swim Coach',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      mutualConnections: 8
    },
    {
      user: {
        id: 13,
        name: 'Carlos Rodriguez',
        title: 'Sports Agent',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        verified: true
      },
      mutualConnections: 15
    },
    {
      user: {
        id: 14,
        name: 'Sophie Brown',
        title: 'Yoga Instructor',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        verified: false
      },
      mutualConnections: 6
    }
  ];

  // Mock saved searches
  const [savedSearches, setSavedSearches] = useState([
    {
      id: 1,
      name: 'Local Basketball Coaches',
      filters: {
        sports: ['basketball'],
        userTypes: ['coach'],
        locationRadius: '25',
        verified: true
      },
      createdAt: '2025-01-05T10:00:00Z'
    },
    {
      id: 2,
      name: 'Verified Athletes',
      filters: {
        userTypes: ['athlete'],
        verified: true,
        hasAchievements: true
      },
      createdAt: '2025-01-03T15:30:00Z'
    }
  ]);

  const handleSearch = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handleSaveCurrentSearch = (name, currentFilters) => {
    const newSearch = {
      id: Date.now(),
      name,
      filters: currentFilters,
      createdAt: new Date()?.toISOString()
    };
    setSavedSearches(prev => [newSearch, ...prev]);
  };

  const handleLoadSearch = (search) => {
    setFilters(search?.filters);
    setActiveTab('search');
    handleSearch();
  };

  const handleDeleteSearch = (searchId) => {
    setSavedSearches(prev => prev?.filter(search => search?.id !== searchId));
  };

  useEffect(() => {
    if (searchQuery) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filters]);

  const resultCount = mockResults?.length;

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Search & Discovery - AthlNet</title>
        <meta name="description" content="Discover and connect with athletes, coaches, sponsors, and sports content on AthlNet. Advanced search and filtering capabilities." />
      </Helmet>

      <Header />

      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Search & Discovery</h1>
            <p className="text-muted-foreground">
              Find athletes, coaches, sponsors, and content across the AthlNet community
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-8">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onSearch={handleSearch}
              suggestions={suggestions}
              recentSearches={recentSearches}
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'search' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Search" size={16} className="mr-2 inline" />
                Search Results
              </button>
              <button
                onClick={() => setActiveTab('discover')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'discover' ?'bg-card text-foreground shadow-sm' :'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name="Compass" size={16} className="mr-2 inline" />
                Discover
              </button>
            </div>

            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden"
              iconName="Filter"
              iconPosition="left"
            >
              Filters
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex gap-8">
            {/* Filters Sidebar - Desktop */}
            <div className="hidden lg:block w-80 flex-shrink-0">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                isOpen={true}
                onClose={() => {}}
                resultCount={resultCount}
              />
              
              {/* Saved Searches */}
              <div className="mt-6">
                <SavedSearches
                  savedSearches={savedSearches}
                  onLoadSearch={handleLoadSearch}
                  onDeleteSearch={handleDeleteSearch}
                  onSaveCurrentSearch={handleSaveCurrentSearch}
                  currentFilters={filters}
                />
              </div>
            </div>

            {/* Mobile Filter Panel */}
            <FilterPanel
              filters={filters}
              setFilters={setFilters}
              isOpen={isFilterOpen}
              onClose={() => setIsFilterOpen(false)}
              resultCount={resultCount}
            />

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {activeTab === 'search' ? (
                <SearchResults
                  results={mockResults}
                  loading={loading}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                />
              ) : (
                <DiscoverySection
                  recommendations={recommendations}
                  trending={trending}
                  suggestedConnections={suggestedConnections}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SearchAndDiscovery;