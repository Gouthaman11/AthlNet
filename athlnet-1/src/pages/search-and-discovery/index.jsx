import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebaseClient';
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