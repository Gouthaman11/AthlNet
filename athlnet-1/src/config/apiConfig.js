/**
 * API Configuration for Sports and News Services
 * 
 * Instructions for getting API keys:
 * 
 * 1. NewsAPI (Optional - for enhanced sports news):
 *    - Visit: https://newsapi.org/register
 *    - Register for a free account
 *    - Copy your API key and paste it below
 *    - Free plan includes 1000 requests per month
 * 
 * 2. Reddit API (Already implemented - no key needed):
 *    - Used for trending sports topics
 *    - No API key required for read-only access
 * 
 * 3. Firebase (Already configured):
 *    - Used for user connections and hashtag trends
 *    - Already set up in your project
 */

export const API_CONFIG = {
  // NewsAPI key (optional - leave empty to use Reddit + Firebase only)
  NEWS_API_KEY: '', // Paste your NewsAPI key here if you have one
  
  // Reddit settings (no changes needed)
  REDDIT: {
    USER_AGENT: 'AthlNet-App/1.0',
    RATE_LIMIT_DELAY: 1000, // 1 second between requests
    MAX_RETRIES: 2
  },
  
  // Data refresh intervals (in milliseconds)
  REFRESH_INTERVALS: {
    TRENDING_SPORTS: 5 * 60 * 1000, // 5 minutes
    SUGGESTED_CONNECTIONS: 10 * 60 * 1000, // 10 minutes
    HASHTAGS: 2 * 60 * 1000 // 2 minutes
  },
  
  // Feature flags
  FEATURES: {
    ENABLE_REDDIT_TRENDS: true,
    ENABLE_NEWS_API: false, // Set to true if you add NEWS_API_KEY
    ENABLE_FIREBASE_HASHTAGS: true,
    ENABLE_SMART_CONNECTIONS: true,
    ENABLE_AUTO_REFRESH: false // Set to true for automatic data refresh
  }
};

/**
 * Quick setup guide:
 * 
 * 1. Basic setup (works out of the box):
 *    - No changes needed
 *    - Uses Reddit + Firebase data
 * 
 * 2. Enhanced setup (optional):
 *    - Get NewsAPI key from https://newsapi.org/register
 *    - Add key to NEWS_API_KEY above
 *    - Set ENABLE_NEWS_API to true
 * 
 * 3. Customization:
 *    - Adjust REFRESH_INTERVALS for different update frequencies
 *    - Toggle FEATURES flags to enable/disable functionality
 */

// Validate configuration
export const validateConfig = () => {
  const warnings = [];
  
  if (API_CONFIG.FEATURES.ENABLE_NEWS_API && !API_CONFIG.NEWS_API_KEY) {
    warnings.push('NewsAPI is enabled but no API key provided. Falling back to Reddit data only.');
  }
  
  if (warnings.length > 0) {
    console.warn('AthlNet Trending Config Warnings:', warnings);
  }
  
  return {
    isValid: true,
    warnings
  };
};