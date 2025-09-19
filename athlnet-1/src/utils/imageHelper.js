// Utility functions for handling user images and Firebase Storage URLs

/**
 * Helper function to get a proper image URL, handling Firebase Storage references
 * @param {Object} user - User object containing profile image data
 * @param {number} size - Size for the fallback avatar (default: 64)
 * @returns {string} - Valid image URL or fallback avatar URL
 */
export const getImageURL = (user, size = 64) => {
  let imageUrl = user.profileImage || user.photoURL || user.avatar;
  
  // If the URL starts with gs://, it's a Firebase Storage reference, skip it
  if (imageUrl && imageUrl.startsWith('gs://')) {
    console.warn('Firebase Storage reference found in profileImage:', imageUrl);
    imageUrl = null;
  }
  
  // If the URL is just a Firebase user ID or looks like one, skip it
  if (imageUrl && (
    imageUrl === user.id || 
    imageUrl === user.uid || 
    (imageUrl.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(imageUrl))
  )) {
    console.warn('Firebase user ID found in profileImage:', imageUrl);
    imageUrl = null;
  }
  
  // If it's a very long string that looks like a Firebase storage path, skip it
  if (imageUrl && imageUrl.length > 100 && !imageUrl.startsWith('http')) {
    console.warn('Long non-HTTP string found in profileImage:', imageUrl);
    imageUrl = null;
  }
  
  // Return a working URL or fallback to avatar generator
  const fallbackName = getUserDisplayName(user);
  return imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=3b82f6&color=ffffff&size=${size}`;
};

/**
 * Helper function to get a proper display name for users
 * @param {Object} user - User object containing name data
 * @returns {string} - User display name or fallback
 */
export const getUserDisplayName = (user) => {
  // Check displayName but ensure it's not a Firebase ID
  if (user.displayName && 
      user.displayName !== user.id && 
      user.displayName !== user.uid &&
      user.displayName.length < 50 && 
      !/^[a-zA-Z0-9]{20,}$/.test(user.displayName)) {
    return user.displayName;
  }
  
  // Check name but ensure it's not a Firebase ID  
  if (user.name && 
      user.name !== user.id && 
      user.name !== user.uid &&
      user.name.length < 50 && 
      !/^[a-zA-Z0-9]{20,}$/.test(user.name)) {
    return user.name;
  }
  
  // Try to construct name from personal info
  if (user.personalInfo?.firstName && user.personalInfo?.lastName) {
    return `${user.personalInfo.firstName} ${user.personalInfo.lastName}`;
  }
  if (user.personalInfo?.firstName) {
    return user.personalInfo.firstName;
  }
  
  // Try email without domain
  if (user.email && user.email.includes('@')) {
    const emailName = user.email.split('@')[0];
    // Make sure it's not just numbers or a weird ID
    if (emailName.length < 20 && !/^[0-9a-f]{20,}$/i.test(emailName)) {
      return emailName;
    }
  }
  
  // Try to extract a readable username if it looks like one
  if (user.username && user.username !== user.id && user.username !== user.uid) {
    return user.username;
  }
  
  // Fallback to a more user-friendly anonymous name
  return 'New User';
};

/**
 * Helper function to safely get user field values, preventing Firebase IDs from showing
 * @param {Object} user - User object
 * @param {string} fieldName - Field name to extract
 * @param {number} maxLength - Maximum allowed length for the field
 * @returns {string|null} - Safe field value or null if it looks like a Firebase ID
 */
export const getSafeUserField = (user, fieldName, maxLength = 100) => {
  const value = user[fieldName];
  
  if (!value || typeof value !== 'string') {
    return null;
  }
  
  // Check if it's a Firebase user ID
  if (value === user.id || value === user.uid) {
    console.warn(`Firebase user ID found in ${fieldName}:`, value);
    return null;
  }
  
  // Check if it matches the specific problematic ID
  if (value === 'LlFbpIGRl6SdNMf42k8sQHpHXUk1aAkHoeltpzPQecnENIkeMN6KGks2') {
    console.warn(`Specific problematic Firebase ID found in ${fieldName}:`, value);
    return null;
  }
  
  // Check if it's too long or looks like a Firebase ID
  if (value.length > maxLength || (value.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(value))) {
    console.warn(`Firebase ID-like string found in ${fieldName}:`, value);
    return null;
  }
  
  return value;
};

/**
 * Debug function to log user data structure
 * @param {Object} user - User object to debug
 * @param {string} context - Context for logging (e.g., "SearchResults", "Discovery")
 */
export const debugUserData = (user, context = 'Unknown') => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${context}] User data structure:`, {
      id: user.id,
      uid: user.uid,
      name: user.name,
      displayName: user.displayName,
      profileImage: user.profileImage,
      photoURL: user.photoURL,
      title: user.title,
      location: user.location,
      sports: user.sports,
      sport: user.sport
    });
  }
};