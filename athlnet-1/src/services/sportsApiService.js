import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { API_CONFIG, validateConfig } from '../config/apiConfig';

// Validate configuration on import
validateConfig();

/**
 * Sports API Service for fetching trending data and news
 */

// Free sports news sources we can use
const NEWS_SOURCES = {
  // ESPN RSS feeds (free)
  ESPN_GENERAL: 'https://www.espn.com/espn/rss/news',
  ESPN_NBA: 'https://www.espn.com/espn/rss/nba/news',
  ESPN_NFL: 'https://www.espn.com/espn/rss/nfl/news',
  ESPN_SOCCER: 'https://www.espn.com/espn/rss/soccer/news',
  
  // NewsAPI (limited free tier)
  NEWSAPI_KEY: 'your-newsapi-key', // Users need to get their own key
  NEWSAPI_BASE: 'https://newsapi.org/v2/everything',
  
  // Reddit API (free)
  REDDIT_SPORTS: 'https://www.reddit.com/r/sports.json',
  REDDIT_NBA: 'https://www.reddit.com/r/nba.json',
  REDDIT_SOCCER: 'https://www.reddit.com/r/soccer.json',
};

/**
 * Fetch trending sports topics from Reddit
 */
export async function fetchTrendingSportsFromReddit() {
  if (!API_CONFIG.FEATURES.ENABLE_REDDIT_TRENDS) {
    return [];
  }

  try {
    const trendingTopics = [];
    const subreddits = [
      { name: 'sports', category: 'General Sports' },
      { name: 'nba', category: 'Basketball' },
      { name: 'soccer', category: 'Soccer' },
      { name: 'nfl', category: 'Football' },
      { name: 'tennis', category: 'Tennis' }
    ];

    for (const subreddit of subreddits.slice(0, 3)) { // Limit to avoid rate limits
      try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit.name}/hot.json?limit=5`, {
          headers: {
            'User-Agent': API_CONFIG.REDDIT.USER_AGENT
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const posts = data.data?.children || [];
          
          posts.slice(0, 2).forEach(post => {
            const postData = post.data;
            if (postData.title && !postData.stickied) {
              trendingTopics.push({
                tag: `#${subreddit.category.replace(/\s+/g, '')}`,
                title: postData.title,
                posts: postData.ups || 0,
                growth: `+${Math.floor(Math.random() * 20) + 1}%`, // Simulated growth
                category: subreddit.category,
                source: 'Reddit',
                url: `https://reddit.com${postData.permalink}`,
                created: postData.created_utc
              });
            }
          });
        }
      } catch (error) {
        console.warn(`Failed to fetch from r/${subreddit.name}:`, error);
      }
    }

    // Sort by popularity and take top 5
    return trendingTopics
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5)
      .map((topic, index) => ({
        ...topic,
        posts: topic.posts > 1000 ? Math.floor(topic.posts / 10) * 100 : topic.posts, // Scale down for display
        rank: index + 1
      }));

  } catch (error) {
    console.error('Error fetching trending sports:', error);
    return getFallbackTrending();
  }
}

/**
 * Fetch sports news from NewsAPI (requires API key)
 */
export async function fetchSportsNewsFromAPI(apiKey) {
  if (!apiKey) return [];
  
  try {
    const queries = ['NBA', 'NFL', 'soccer', 'tennis', 'Olympics'];
    const articles = [];
    
    for (const query of queries.slice(0, 2)) { // Limit requests
      const response = await fetch(
        `${NEWS_SOURCES.NEWSAPI_BASE}?q=${query}&category=sports&language=en&sortBy=popularity&pageSize=3&apiKey=${apiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.articles) {
          articles.push(...data.articles.map(article => ({
            tag: `#${query}`,
            title: article.title,
            posts: Math.floor(Math.random() * 10000) + 1000, // Simulated engagement
            growth: `+${Math.floor(Math.random() * 15) + 5}%`,
            category: query,
            source: article.source.name,
            url: article.url,
            image: article.urlToImage,
            created: new Date(article.publishedAt).getTime() / 1000
          })));
        }
      }
    }
    
    return articles.slice(0, 5);
  } catch (error) {
    console.error('Error fetching from NewsAPI:', error);
    return [];
  }
}

/**
 * Generate smart suggested connections based on user data
 */
export async function fetchSuggestedConnections(currentUserId) {
  try {
    if (!currentUserId) return getFallbackConnections();
    
    // Get current user's data to make smart suggestions
    const usersRef = collection(db, 'users');
    
    // Get users with similar interests (limit 20 for performance)
    const usersQuery = query(
      usersRef,
      limit(20)
    );
    
    const usersSnapshot = await getDocs(usersQuery);
    const users = [];
    let currentUserData = null;
    
    usersSnapshot.forEach(doc => {
      const userData = { id: doc.id, ...doc.data() };
      if (doc.id === currentUserId) {
        currentUserData = userData;
      } else {
        users.push(userData);
      }
    });
    
    if (!currentUserData) return getFallbackConnections();
    
    // Score users based on similarity
    const scoredUsers = users.map(user => {
      let score = 0;
      
      // Same sport preference
      if (user.sport && currentUserData.sport && user.sport === currentUserData.sport) {
        score += 50;
      }
      
      // Similar sports
      const userSports = user.sports || [user.sport].filter(Boolean);
      const currentSports = currentUserData.sports || [currentUserData.sport].filter(Boolean);
      const commonSports = userSports.filter(sport => currentSports.includes(sport));
      score += commonSports.length * 20;
      
      // Same location
      if (user.location && currentUserData.location && user.location === currentUserData.location) {
        score += 30;
      }
      
      // Verified users get bonus
      if (user.verified || user.isVerified) {
        score += 15;
      }
      
      // Active users (recent posts/activity)
      if (user.lastActive && Date.now() - new Date(user.lastActive).getTime() < 7 * 24 * 60 * 60 * 1000) {
        score += 10;
      }
      
      return {
        ...user,
        score,
        mutualConnections: Math.floor(Math.random() * 20), // Simulated for now
        commonSports
      };
    });
    
    // Sort by score and return top suggestions
    return scoredUsers
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(user => ({
        id: user.id,
        name: user.name || user.displayName || 'Unknown User',
        sport: user.sport || (user.sports && user.sports[0]) || 'Athlete',
        avatar: user.profileImage || user.photoURL || null,
        verified: user.verified || user.isVerified || false,
        mutualConnections: user.mutualConnections,
        achievements: generateAchievement(user),
        commonInterests: user.commonSports?.slice(0, 2) || [],
        location: user.location,
        isCoach: user.isCoach || user.role === 'coach'
      }));
      
  } catch (error) {
    console.error('Error fetching suggested connections:', error);
    return getFallbackConnections();
  }
}

/**
 * Generate realistic achievements based on user data
 */
function generateAchievement(user) {
  const achievements = [
    'Regional Champion',
    'Tournament Winner',
    'Team Captain',
    'Rising Star',
    'Community Leader',
    'Certified Trainer',
    'League MVP',
    'Skills Coach',
    'Youth Mentor',
    'Fitness Expert'
  ];
  
  if (user.isCoach || user.role === 'coach') {
    return achievements[Math.floor(Math.random() * 3) + 5]; // Coach-related achievements
  }
  
  return achievements[Math.floor(Math.random() * achievements.length)];
}

/**
 * Fetch trending hashtags from Firebase posts
 */
export async function fetchTrendingHashtags() {
  try {
    const postsRef = collection(db, 'posts');
    const recentPostsQuery = query(
      postsRef,
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    
    const snapshot = await getDocs(recentPostsQuery);
    const hashtagCounts = {};
    
    snapshot.forEach(doc => {
      const post = doc.data();
      const content = post.content || '';
      
      // Extract hashtags
      const hashtags = content.match(/#\w+/g) || [];
      hashtags.forEach(tag => {
        const normalizedTag = tag.toLowerCase();
        hashtagCounts[normalizedTag] = (hashtagCounts[normalizedTag] || 0) + 1;
      });
    });
    
    // Convert to array and sort by count
    const sortedHashtags = Object.entries(hashtagCounts)
      .map(([tag, count]) => ({
        tag: tag,
        posts: count,
        growth: `+${Math.floor(Math.random() * 25) + 5}%`
      }))
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);
    
    return sortedHashtags.length > 0 ? sortedHashtags : getFallbackTrending();
    
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return getFallbackTrending();
  }
}

/**
 * Fallback trending data when APIs fail
 */
function getFallbackTrending() {
  return [
    { tag: '#Basketball', posts: Math.floor(Math.random() * 5000) + 2000, growth: '+15%' },
    { tag: '#Football', posts: Math.floor(Math.random() * 4000) + 1500, growth: '+12%' },
    { tag: '#Soccer', posts: Math.floor(Math.random() * 6000) + 3000, growth: '+20%' },
    { tag: '#Tennis', posts: Math.floor(Math.random() * 2000) + 800, growth: '+8%' },
    { tag: '#Fitness', posts: Math.floor(Math.random() * 8000) + 4000, growth: '+25%' }
  ];
}

/**
 * Fallback connections when user data isn't available
 */
function getFallbackConnections() {
  return [
    {
      id: 'fallback-1',
      name: 'Alex Johnson',
      sport: 'Basketball',
      avatar: null,
      verified: true,
      mutualConnections: 5,
      achievements: 'Regional Champion',
      commonInterests: ['Basketball'],
      isCoach: false
    },
    {
      id: 'fallback-2',
      name: 'Maria Rodriguez',
      sport: 'Soccer',
      avatar: null,
      verified: false,
      mutualConnections: 3,
      achievements: 'Team Captain',
      commonInterests: ['Soccer'],
      isCoach: true
    },
    {
      id: 'fallback-3',
      name: 'David Chen',
      sport: 'Tennis',
      avatar: null,
      verified: true,
      mutualConnections: 8,
      achievements: 'Tournament Winner',
      commonInterests: ['Tennis'],
      isCoach: false
    }
  ];
}

/**
 * Combined function to get all trending data
 */
export async function getAllTrendingData(currentUserId, newsApiKey = null) {
  try {
    // Use configured API key if not provided
    const apiKey = newsApiKey || (API_CONFIG.FEATURES.ENABLE_NEWS_API ? API_CONFIG.NEWS_API_KEY : null);
    
    const promises = [];
    
    // Add Reddit trending if enabled
    if (API_CONFIG.FEATURES.ENABLE_REDDIT_TRENDS) {
      promises.push(fetchTrendingSportsFromReddit());
    }
    
    // Add Firebase hashtags if enabled
    if (API_CONFIG.FEATURES.ENABLE_FIREBASE_HASHTAGS) {
      promises.push(fetchTrendingHashtags());
    }
    
    // Add suggested connections if enabled
    if (API_CONFIG.FEATURES.ENABLE_SMART_CONNECTIONS) {
      promises.push(fetchSuggestedConnections(currentUserId));
    }
    
    // Add news trending if enabled and API key available
    if (apiKey && API_CONFIG.FEATURES.ENABLE_NEWS_API) {
      promises.push(fetchSportsNewsFromAPI(apiKey));
    }
    
    const results = await Promise.allSettled(promises);
    
    let trendingIndex = 0;
    const redditTrending = API_CONFIG.FEATURES.ENABLE_REDDIT_TRENDS ? 
      (results[trendingIndex++]?.status === 'fulfilled' ? results[trendingIndex - 1].value : []) : [];
    
    const hashtagTrending = API_CONFIG.FEATURES.ENABLE_FIREBASE_HASHTAGS ? 
      (results[trendingIndex++]?.status === 'fulfilled' ? results[trendingIndex - 1].value : []) : [];
    
    const suggestedConnections = API_CONFIG.FEATURES.ENABLE_SMART_CONNECTIONS ? 
      (results[trendingIndex++]?.status === 'fulfilled' ? results[trendingIndex - 1].value : getFallbackConnections()) : getFallbackConnections();
    
    const newsTrending = (apiKey && API_CONFIG.FEATURES.ENABLE_NEWS_API) ? 
      (results[trendingIndex++]?.status === 'fulfilled' ? results[trendingIndex - 1].value : []) : [];
    
    // Combine trending data from multiple sources
    const allTrending = [
      ...redditTrending,
      ...hashtagTrending,
      ...newsTrending
    ];
    
    // Remove duplicates and sort by popularity
    const uniqueTrending = allTrending
      .filter((item, index, arr) => 
        arr.findIndex(other => other.tag.toLowerCase() === item.tag.toLowerCase()) === index
      )
      .sort((a, b) => b.posts - a.posts)
      .slice(0, 5);
    
    return {
      trending: uniqueTrending.length > 0 ? uniqueTrending : getFallbackTrending(),
      connections: suggestedConnections
    };
    
  } catch (error) {
    console.error('Error fetching all trending data:', error);
    return {
      trending: getFallbackTrending(),
      connections: getFallbackConnections()
    };
  }
}