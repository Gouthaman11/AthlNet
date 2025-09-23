import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  limit, 
  where 
} from 'firebase/firestore';
import { db, isConfigured, initError } from '../firebaseClient';

/**
 * Check if Firebase is properly configured and connected
 */
const checkFirebaseConnection = () => {
  if (!isConfigured) {
    throw new Error(`Firebase not configured: ${initError}`);
  }
  if (!db) {
    throw new Error('Firebase database not initialized');
  }
};

/**
 * Clean user profile data by removing unwanted/invalid fields
 * @param {Object} rawUserData - Raw user data from Firestore
 * @returns {Object} - Cleaned user profile data
 */
export const cleanUserProfile = (rawUserData) => {
  if (!rawUserData) return null;

  const userId = rawUserData.id || rawUserData.uid;
  
  // Helper function to check if a value looks like a Firebase ID
  const isFirebaseId = (value) => {
    if (!value || typeof value !== 'string') return false;
    return value === userId || 
           value.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(value);
  };

  // Extract clean personal information
  const personalInfo = rawUserData.personalInfo || {};
  
  // Get clean name
  const getCleanName = () => {
    if (personalInfo.firstName && personalInfo.lastName) {
      return `${personalInfo.firstName} ${personalInfo.lastName}`;
    }
    if (personalInfo.firstName) return personalInfo.firstName;
    if (rawUserData.displayName && !isFirebaseId(rawUserData.displayName)) {
      return rawUserData.displayName;
    }
    if (rawUserData.name && !isFirebaseId(rawUserData.name)) {
      return rawUserData.name;
    }
    if (rawUserData.email && rawUserData.email.includes('@')) {
      const emailName = rawUserData.email.split('@')[0];
      if (emailName.length < 20) return emailName;
    }
    return 'User';
  };

  // Get clean profile image
  const getCleanProfileImage = () => {
    const profileImage = rawUserData.profileImage || rawUserData.photoURL;
    if (!profileImage || isFirebaseId(profileImage) || profileImage.startsWith('gs://')) {
      return null;
    }
    return profileImage;
  };

  // Get clean location
  const getCleanLocation = () => {
    const location = personalInfo.location || rawUserData.location;
    if (location && !isFirebaseId(location) && location.length < 100) {
      return location;
    }
    return null;
  };

  // Get clean title/role
  const getCleanTitle = () => {
    const title = personalInfo.title || rawUserData.title || personalInfo.role;
    if (title && !isFirebaseId(title) && title.length < 50) {
      return title;
    }
    return null;
  };

  // Get clean sports
  const getCleanSports = () => {
    const sports = personalInfo.sports || rawUserData.sports || [];
    const primarySport = personalInfo.primarySport || rawUserData.sport;
    
    let allSports = [...sports];
    if (primarySport && !allSports.includes(primarySport)) {
      allSports.unshift(primarySport);
    }

    return allSports.filter(sport => 
      sport && 
      typeof sport === 'string' && 
      !isFirebaseId(sport) && 
      sport.length < 30
    ).slice(0, 5); // Limit to 5 sports
  };

  // Return cleaned user profile
  return {
    id: userId,
    uid: userId,
    name: getCleanName(),
    displayName: getCleanName(),
    profileImage: getCleanProfileImage(),
    location: getCleanLocation(),
    title: getCleanTitle(),
    sports: getCleanSports(),
    
    // Role and user type information
    role: rawUserData.role || null,
    userType: rawUserData.userType || null,
    isCoach: rawUserData.isCoach || rawUserData.role === 'coach' || rawUserData.userType === 'coach',
    
    // Additional clean fields
    email: rawUserData.email || null,
    verified: Boolean(rawUserData.verified),
    isOnline: Boolean(rawUserData.isOnline),
    createdAt: rawUserData.createdAt,
    
    // Stats
    connections: rawUserData.connections || rawUserData.followersCount || 0,
    achievements: rawUserData.achievements || rawUserData.achievementsCount || 0,
    
    // Bio/Description
    bio: personalInfo.bio && !isFirebaseId(personalInfo.bio) && personalInfo.bio.length < 500 
         ? personalInfo.bio 
         : null,

    // Social links (cleaned)
    socialLinks: rawUserData.socialLinks || {},
    
    // Following status (will be set by caller)
    isFollowing: false,
    
    // Keep original personal info for profile editing
    personalInfo: personalInfo
  };
};

/**
 * Fetch a single user profile by ID
 * @param {string} userId - User ID to fetch
 * @returns {Object|null} - Clean user profile or null
 */
export const fetchUserProfile = async (userId) => {
  try {
    checkFirebaseConnection();
    
    if (!userId) {
      console.warn('fetchUserProfile: No userId provided');
      return null;
    }
    
    console.log('🔍 Fetching user profile:', userId);
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      console.warn('🚫 User profile not found:', userId);
      return null;
    }
    
    const rawData = { id: userDoc.id, uid: userDoc.id, ...userDoc.data() };
    const cleanedProfile = cleanUserProfile(rawData);
    console.log('✅ User profile fetched and cleaned:', cleanedProfile?.name || 'Unknown');
    return cleanedProfile;
    
  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    return null;
  }
};

/**
 * Fetch suggested users for discovery
 * @param {string} currentUserId - Current user's ID
 * @param {number} limitCount - Number of users to fetch
 * @returns {Array} - Array of clean user profiles
 */
export const fetchSuggestedUsers = async (currentUserId, limitCount = 12) => {
  try {
    checkFirebaseConnection();
    
    if (!currentUserId) {
      console.warn('fetchSuggestedUsers: No currentUserId provided');
      return [];
    }

    console.log('🔍 Fetching suggested users for:', currentUserId, '(limit:', limitCount + ')');
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(limitCount + 10)); // Fetch extra to account for filtering
    const snapshot = await getDocs(q);
    
    console.log('📋 Raw users fetched:', snapshot.docs.length);
    
    const users = [];
    
    // Get current user's following list
    let following = [];
    try {
      const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
      const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : {};
      following = currentUserData.following || [];
      console.log('👥 Current user following count:', following.length);
    } catch (followError) {
      console.warn('⚠️ Could not fetch following list:', followError);
    }
    
    snapshot.docs.forEach(docSnap => {
      const userId = docSnap.id;
      
      // Skip current user and users already followed
      if (userId === currentUserId || following.includes(userId)) {
        return;
      }
      
      const rawData = { id: userId, uid: userId, ...docSnap.data() };
      const cleanProfile = cleanUserProfile(rawData);
      
      if (cleanProfile && cleanProfile.name !== 'User') { // Filter out profiles with no real data
        users.push(cleanProfile);
      }
    });
    
    console.log('🧹 Cleaned users available:', users.length);
    
    // Shuffle for variety and return limited count
    const shuffled = users.sort(() => Math.random() - 0.5);
    const finalResults = shuffled.slice(0, limitCount);
    
    console.log('✅ Returning suggested users:', finalResults.length);
    return finalResults;
    
  } catch (error) {
    console.error('❌ Error fetching suggested users:', error);
    throw error; // Re-throw so caller can handle fallback
  }
};

/**
 * Search users by query
 * @param {string} searchQuery - Search term
 * @param {number} limitCount - Number of results to return
 * @returns {Array} - Array of matching user profiles
 */
export const searchUserProfiles = async (searchQuery, limitCount = 20) => {
  try {
    if (!searchQuery?.trim()) return [];
    
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(50)); // Get more to search through
    const snapshot = await getDocs(q);
    
    const searchTerm = searchQuery.toLowerCase().trim();
    const results = [];
    
    snapshot.docs.forEach(docSnap => {
      const rawData = { id: docSnap.id, uid: docSnap.id, ...docSnap.data() };
      const cleanProfile = cleanUserProfile(rawData);
      
      if (cleanProfile) {
        // Check if profile matches search
        const searchableText = [
          cleanProfile.name,
          cleanProfile.title,
          cleanProfile.location,
          ...cleanProfile.sports
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (searchableText.includes(searchTerm)) {
          results.push(cleanProfile);
        }
      }
    });
    
    return results.slice(0, limitCount);
    
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};