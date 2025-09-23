/**
 * Utility functions for updating user profiles to coach status
 * Use this to manually set users as coaches for testing
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';

/**
 * Convert a user to coach status
 * @param {string} userId - User ID to convert to coach
 * @param {Object} coachInfo - Additional coach information
 * @returns {Promise<boolean>} - Success status
 */
export const convertUserToCoach = async (userId, coachInfo = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Default coach information
    const defaultCoachInfo = {
      specialization: 'General Training',
      experience: '1-2 years',
      certifications: [],
      coachingPhilosophy: 'Helping athletes reach their full potential',
      ...coachInfo
    };

    // Update user document with coach fields
    const updateData = {
      role: 'coach',
      userType: 'coach',
      isCoach: true,
      coachInfo: defaultCoachInfo,
      title: `${defaultCoachInfo.specialization} Coach`,
      updatedAt: new Date().toISOString()
    };

    await updateDoc(doc(db, 'users', userId), updateData);
    
    console.log(`✅ Successfully converted user ${userId} to coach status`);
    return true;
  } catch (error) {
    console.error('❌ Error converting user to coach:', error);
    return false;
  }
};

/**
 * Check current user's coach status in database
 * @param {string} userId - User ID to check
 * @returns {Promise<Object>} - User data with coach status
 */
export const checkUserCoachStatus = async (userId) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const userData = userDoc.data();
    const isCoachUser = userData.role === 'coach' || 
                       userData.userType === 'coach' || 
                       userData.isCoach === true;

    return {
      userId,
      isCoach: isCoachUser,
      role: userData.role,
      userType: userData.userType,
      coachFlag: userData.isCoach,
      title: userData.title,
      coachInfo: userData.coachInfo
    };
  } catch (error) {
    console.error('❌ Error checking coach status:', error);
    return null;
  }
};

/**
 * Bulk convert multiple users to coaches (for testing)
 * @param {Array<string>} userIds - Array of user IDs
 * @returns {Promise<Array>} - Results for each user
 */
export const bulkConvertToCoaches = async (userIds) => {
  const results = [];
  
  for (const userId of userIds) {
    const result = await convertUserToCoach(userId);
    results.push({ userId, success: result });
  }
  
  return results;
};

// For browser console testing
if (typeof window !== 'undefined') {
  window.coachUtils = {
    convertUserToCoach,
    checkUserCoachStatus,
    bulkConvertToCoaches
  };
}