import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';

/**
 * Fix a user's profile to properly reflect their coach status
 * @param {string} userId - User ID to update
 * @param {Object} coachData - Coach information to set
 */
export const fixCoachProfile = async (userId, coachData = {}) => {
  try {
    if (!userId) {
      throw new Error('User ID is required');
    }

    // Get current profile
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      throw new Error('User profile not found');
    }

    const currentData = userDoc.data();
    
    // Prepare coach update data
    const updateData = {
      // Set role and type as coach
      role: 'coach',
      userType: 'coach',
      isCoach: true,
      
      // Update personal info to reflect coach status
      'personalInfo.userType': 'coach',
      'personalInfo.title': coachData.title || currentData.personalInfo?.title || 'Coach',
      
      // Preserve existing title if it already contains 'coach'
      title: coachData.title || 
             (currentData.title?.toLowerCase().includes('coach') ? currentData.title : 'Coach'),
      
      // Update timestamp
      updatedAt: new Date(),
      
      // Add coach-specific fields if provided
      ...(coachData.specialization && { specialization: coachData.specialization }),
      ...(coachData.experience && { experience: coachData.experience }),
      ...(coachData.certifications && { certifications: coachData.certifications }),
    };

    // Update the document
    await updateDoc(doc(db, 'users', userId), updateData);
    
    console.log('✅ Coach profile updated successfully for user:', userId);
    return true;
    
  } catch (error) {
    console.error('❌ Error updating coach profile:', error);
    throw error;
  }
};

/**
 * Quick function to fix the current logged-in coach user
 * This can be called from the browser console if needed
 */
export const fixCurrentCoachProfile = async () => {
  try {
    // Get current user from Firebase Auth
    const auth = (await import('../firebaseClient')).auth;
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No user is currently logged in');
      return false;
    }

    await fixCoachProfile(user.uid, {
      title: 'Coach',
      specialization: 'General Training'
    });
    
    console.log('✅ Current user coach profile fixed');
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing current coach profile:', error);
    return false;
  }
};