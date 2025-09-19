import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';

const SearchBar = ({ searchQuery, setSearchQuery, onSearch, suggestions, recentSearches }) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef?.current && !searchRef?.current?.contains(event?.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    setShowSuggestions(value?.length > 0);
    setActiveSuggestionIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions) return;

    const totalSuggestions = suggestions?.length + recentSearches?.length;

    if (e?.key === 'ArrowDown') {
      e?.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev < totalSuggestions - 1 ? prev + 1 : 0
      );
    } else if (e?.key === 'ArrowUp') {
      e?.preventDefault();
      setActiveSuggestionIndex(prev => 
        prev > 0 ? prev - 1 : totalSuggestions - 1
      );
    } else if (e?.key === 'Enter') {
      e?.preventDefault();
      if (activeSuggestionIndex >= 0) {
        const allSuggestions = [...suggestions, ...recentSearches];
        const selectedSuggestion = allSuggestions?.[activeSuggestionIndex];
        setSearchQuery(selectedSuggestion?.text || selectedSuggestion);
        setShowSuggestions(false);
        onSearch();
      } else {
        onSearch();
      }
    } else if (e?.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion?.text || suggestion);
    setShowSuggestions(false);
    onSearch();
  };

  return (
    <div className="relative w-full" ref={searchRef}>
      <div className="relative">
        <Icon 
          name="Search" 
          size={20} 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10" 
        />
        <Input
          type="search"
          placeholder="Search athletes, coaches, sponsors, or content..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => searchQuery?.length > 0 && setShowSuggestions(true)}
          className="pl-12 pr-12 h-12 text-base"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setShowSuggestions(false);
            }}
            className="absolute right-12 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        )}
        <button
          onClick={onSearch}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <Icon name="Search" size={16} />
        </button>
      </div>
      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions?.length > 0 || recentSearches?.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-modal z-dropdown max-h-80 overflow-y-auto">
          {suggestions?.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Suggestions
              </div>
              {suggestions?.map((suggestion, index) => (
                <button
                  key={`suggestion-${index}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    activeSuggestionIndex === index
                      ? 'bg-muted text-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Icon name={suggestion?.icon} size={16} className="text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{suggestion?.text}</div>
                    {suggestion?.category && (
                      <div className="text-xs text-muted-foreground">{suggestion?.category}</div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {recentSearches?.length > 0 && (
            <div className="p-2 border-t border-border">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent Searches
              </div>
              {recentSearches?.map((search, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSuggestionClick(search)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-md transition-colors ${
                    activeSuggestionIndex === (suggestions?.length + index)
                      ? 'bg-muted text-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Icon name="Clock" size={16} className="text-muted-foreground" />
                  <span className="text-sm">{search}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;