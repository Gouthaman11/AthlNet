import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc,
  query, 
  where,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import { sendCoachingRequestNotification, sendCoachingAcceptedNotification } from './notificationUtils';

/**
 * Check if user is a coach
 * @param {Object} userProfile - User profile data
 * @returns {boolean} - True if user is a coach
 */
export const isCoach = (userProfile) => {
  if (!userProfile) {
    return false;
  }
  
  // Check various fields where coach status might be stored
  const userType = userProfile.userType || userProfile.personalInfo?.userType || userProfile.role;
  const title = userProfile.title || userProfile.personalInfo?.title || '';
  const sport = userProfile.sport || userProfile.personalInfo?.sport || '';
  
  // Multiple ways to identify a coach
  const isCoachByType = userType?.toLowerCase() === 'coach';
  const isCoachByTitle = title.toLowerCase().includes('coach');
  const isCoachBySport = sport.toLowerCase().includes('coach');
  const isCoachByFlag = userProfile.isCoach === true;
  
  return isCoachByType || isCoachByTitle || isCoachBySport || isCoachByFlag;
};

/**
 * Get coach's certifications and qualifications
 * @param {string} coachId - Coach's user ID
 * @returns {Array} - Array of certifications
 */
export const getCoachCertifications = async (coachId) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', coachId));
    if (!userDoc.exists()) return [];
    
    const userData = userDoc.data();
    return userData.certifications || userData.personalInfo?.certifications || [];
  } catch (error) {
    console.error('Error fetching coach certifications:', error);
    return [];
  }
};

/**
 * Get athletes trained by a coach
 * @param {string} coachId - Coach's user ID
 * @returns {Array} - Array of athletes
 */
export const getCoachAthletes = async (coachId) => {
  try {
    // Check for training relationships
    const trainingRef = collection(db, 'training_relationships');
    const q = query(trainingRef, where('coachId', '==', coachId));
    const snapshot = await getDocs(q);
    
    const athletes = [];
    for (const docSnap of snapshot.docs) {
      const relationship = docSnap.data();
      const athleteDoc = await getDoc(doc(db, 'users', relationship.athleteId));
      
      if (athleteDoc.exists()) {
        const athleteData = athleteDoc.data();
        athletes.push({
          id: athleteDoc.id,
          ...athleteData,
          trainingStart: relationship.startDate,
          trainingStatus: relationship.status || 'active',
          relationshipId: docSnap.id
        });
      }
    }
    
    return athletes;
  } catch (error) {
    console.error('Error fetching coach athletes:', error);
    return [];
  }
};

/**
 * Create training relationship between coach and athlete
 * @param {string} coachId - Coach's user ID
 * @param {string} athleteId - Athlete's user ID
 * @param {Object} details - Training details
 * @returns {string} - Relationship ID
 */
export const createTrainingRelationship = async (coachId, athleteId, details = {}) => {
  try {
    const trainingRef = collection(db, 'training_relationships');
    const relationship = {
      coachId,
      athleteId,
      startDate: new Date().toISOString(),
      status: 'active',
      specialization: details.specialization || '',
      goals: details.goals || [],
      notes: details.notes || '',
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(trainingRef, relationship);
    
    // Update both coach and athlete profiles
    await updateCoachStats(coachId);
    await updateAthleteCoach(athleteId, coachId);
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating training relationship:', error);
    throw error;
  }
};

/**
 * Update coach statistics
 * @param {string} coachId - Coach's user ID
 */
const updateCoachStats = async (coachId) => {
  try {
    const athletes = await getCoachAthletes(coachId);
    const coachRef = doc(db, 'users', coachId);
    
    await updateDoc(coachRef, {
      'stats.athletes': athletes.length,
      'stats.activeTraining': athletes.filter(a => a.trainingStatus === 'active').length
    });
  } catch (error) {
    console.error('Error updating coach stats:', error);
  }
};

/**
 * Update athlete's coach information
 * @param {string} athleteId - Athlete's user ID
 * @param {string} coachId - Coach's user ID
 */
const updateAthleteCoach = async (athleteId, coachId) => {
  try {
    const athleteRef = doc(db, 'users', athleteId);
    await updateDoc(athleteRef, {
      'personalInfo.currentCoach': coachId,
      'personalInfo.hasCoach': true
    });
  } catch (error) {
    console.error('Error updating athlete coach info:', error);
  }
};

/**
 * Get athlete contact details for coaches
 * @param {string} athleteId - Athlete's user ID
 * @param {string} coachId - Coach requesting the info
 * @returns {Object} - Contact details if authorized
 */
export const getAthleteContactDetails = async (athleteId, coachId) => {
  try {
    // Check if coach has permission to view athlete details
    const hasPermission = await verifyCoachAthleteRelationship(coachId, athleteId);
    if (!hasPermission) {
      throw new Error('Unauthorized: Coach does not have permission to view this athlete\'s contact details');
    }
    
    const athleteDoc = await getDoc(doc(db, 'users', athleteId));
    if (!athleteDoc.exists()) {
      throw new Error('Athlete not found');
    }
    
    const athleteData = athleteDoc.data();
    const personalInfo = athleteData.personalInfo || {};
    
    return {
      name: athleteData.name || athleteData.displayName,
      email: athleteData.email,
      phone: personalInfo.phone || personalInfo.mobile || personalInfo.phoneNumber,
      emergencyContact: personalInfo.emergencyContact || {},
      address: personalInfo.address || {},
      dateOfBirth: personalInfo.dateOfBirth,
      medicalInfo: personalInfo.medicalInfo || 'Not provided',
      parentContact: personalInfo.parentContact || {} // For minor athletes
    };
  } catch (error) {
    console.error('Error fetching athlete contact details:', error);
    throw error;
  }
};

/**
 * Verify coach-athlete relationship
 * @param {string} coachId - Coach's user ID
 * @param {string} athleteId - Athlete's user ID
 * @returns {boolean} - True if relationship exists
 */
export const verifyCoachAthleteRelationship = async (coachId, athleteId) => {
  try {
    const trainingRef = collection(db, 'training_relationships');
    const q = query(trainingRef, 
      where('coachId', '==', coachId),
      where('athleteId', '==', athleteId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error verifying coach-athlete relationship:', error);
    return false;
  }
};

/**
 * Create training plan for athlete
 * @param {string} coachId - Coach's user ID
 * @param {string} athleteId - Athlete's user ID
 * @param {Object} plan - Training plan details
 * @returns {string} - Plan ID
 */
export const createTrainingPlan = async (coachId, athleteId, plan) => {
  try {
    const hasPermission = await verifyCoachAthleteRelationship(coachId, athleteId);
    if (!hasPermission) {
      throw new Error('Unauthorized: Coach does not have permission to create training plans for this athlete');
    }
    
    const plansRef = collection(db, 'training_plans');
    const trainingPlan = {
      coachId,
      athleteId,
      title: plan.title || 'Training Plan',
      description: plan.description || '',
      duration: plan.duration || '4 weeks',
      exercises: plan.exercises || [],
      schedule: plan.schedule || {},
      goals: plan.goals || [],
      notes: plan.notes || '',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(plansRef, trainingPlan);
    return docRef.id;
  } catch (error) {
    console.error('Error creating training plan:', error);
    throw error;
  }
};

/**
 * Get training plans for an athlete
 * @param {string} athleteId - Athlete's user ID
 * @param {string} coachId - Coach's user ID (optional, for verification)
 * @returns {Array} - Array of training plans
 */
export const getTrainingPlans = async (athleteId, coachId = null) => {
  try {
    const plansRef = collection(db, 'training_plans');
    let q;
    
    if (coachId) {
      q = query(plansRef, 
        where('athleteId', '==', athleteId),
        where('coachId', '==', coachId),
        orderBy('createdAt', 'desc')
      );
    } else {
      q = query(plansRef, 
        where('athleteId', '==', athleteId),
        orderBy('createdAt', 'desc')
      );
    }
    
    const snapshot = await getDocs(q);
    const plans = [];
    
    snapshot.docs.forEach(docSnap => {
      plans.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    
    return plans;
  } catch (error) {
    console.error('Error fetching training plans:', error);
    return [];
  }
};

/**
 * Send message to athlete with coaching context
 * @param {string} coachId - Coach's user ID
 * @param {string} athleteId - Athlete's user ID
 * @param {string} message - Message content
 * @param {string} type - Message type ('training', 'feedback', 'general')
 * @returns {string} - Message ID
 */
export const sendCoachMessage = async (coachId, athleteId, message, type = 'general') => {
  try {
    const messagesRef = collection(db, 'messages');
    const coachMessage = {
      from: coachId,
      to: athleteId,
      content: message,
      type,
      isCoachMessage: true,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    const docRef = await addDoc(messagesRef, coachMessage);
    
    // Update athlete notification
    await createNotification(athleteId, {
      type: 'coach_message',
      title: 'Message from your Coach',
      message: message.substring(0, 100) + (message.length > 100 ? '...' : ''),
      from: coachId,
      timestamp: new Date().toISOString()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error sending coach message:', error);
    throw error;
  }
};

/**
 * Create notification for user
 * @param {string} userId - User ID to notify
 * @param {Object} notification - Notification details
 */
const createNotification = async (userId, notification) => {
  try {
    const notificationsRef = collection(db, 'notifications');
    await addDoc(notificationsRef, {
      userId,
      ...notification,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

/**
 * Get athletes looking for coaches
 * @param {string} sport - Sport specialization
 * @param {string} location - Location filter
 * @returns {Array} - Array of athletes seeking coaches
 */
export const getAthletesSeekingCoaches = async (sport = null, location = null) => {
  try {
    const usersRef = collection(db, 'users');
    let q = query(usersRef, 
      where('personalInfo.seekingCoach', '==', true),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    const athletes = [];
    
    snapshot.docs.forEach(docSnap => {
      const athleteData = docSnap.data();
      const athleteSport = athleteData.sport || athleteData.personalInfo?.sport;
      const athleteLocation = athleteData.location || athleteData.personalInfo?.location;
      
      // Apply filters
      if (sport && athleteSport?.toLowerCase() !== sport.toLowerCase()) return;
      if (location && !athleteLocation?.toLowerCase().includes(location.toLowerCase())) return;
      
      athletes.push({
        id: docSnap.id,
        name: athleteData.name || athleteData.displayName,
        sport: athleteSport,
        location: athleteLocation,
        experience: athleteData.personalInfo?.experience || 'Beginner',
        goals: athleteData.personalInfo?.goals || [],
        profileImage: athleteData.profileImage || athleteData.photoURL
      });
    });
    
    return athletes;
  } catch (error) {
    console.error('Error fetching athletes seeking coaches:', error);
    return [];
  }
};

/**
 * Request to coach an athlete (send coaching request)
 * @param {string} coachId - Coach user ID
 * @param {string} athleteId - Athlete user ID
 * @param {Object} requestData - Additional request information
 * @returns {Promise<boolean>} - Success status
 */
export const requestToCoachAthlete = async (coachId, athleteId, requestData = {}) => {
  try {
    if (!coachId || !athleteId) {
      throw new Error('Coach ID and Athlete ID are required');
    }

    if (coachId === athleteId) {
      throw new Error('Coach cannot coach themselves');
    }

    // Get coach and athlete profiles
    const [coachDoc, athleteDoc] = await Promise.all([
      getDoc(doc(db, 'users', coachId)),
      getDoc(doc(db, 'users', athleteId))
    ]);

    if (!coachDoc.exists() || !athleteDoc.exists()) {
      throw new Error('Coach or athlete not found');
    }

    const coachData = coachDoc.data();
    const athleteData = athleteDoc.data();

    // Verify coach status
    if (!isCoach(coachData)) {
      throw new Error('User is not a coach');
    }

    // Check if relationship already exists
    const existingRelationshipQuery = query(
      collection(db, 'training_relationships'),
      where('coachId', '==', coachId),
      where('athleteId', '==', athleteId)
    );
    const existingRelationships = await getDocs(existingRelationshipQuery);

    if (!existingRelationships.empty) {
      throw new Error('Coaching relationship already exists');
    }

    // Create coaching request
    const coachingRequest = {
      coachId,
      athleteId,
      coachName: coachData.name || coachData.displayName || 'Unknown Coach',
      athleteName: athleteData.name || athleteData.displayName || 'Unknown Athlete',
      specialization: requestData.specialization || coachData.sport || coachData.personalInfo?.sport || 'General Training',
      message: requestData.message || `Hi! I'd like to coach you and help you reach your athletic goals.`,
      status: 'pending',
      createdAt: serverTimestamp(),
      requestedAt: serverTimestamp()
    };

    // Save the request
    const requestRef = await addDoc(collection(db, 'coaching_requests'), coachingRequest);

    // Add to coach's pending requests
    await updateDoc(doc(db, 'users', coachId), {
      pendingCoachingRequests: arrayUnion({
        id: requestRef.id,
        athleteId,
        athleteName: athleteData.name || athleteData.displayName,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
    });

    // Add to athlete's incoming requests
    await updateDoc(doc(db, 'users', athleteId), {
      incomingCoachingRequests: arrayUnion({
        id: requestRef.id,
        coachId,
        coachName: coachData.name || coachData.displayName,
        specialization: coachingRequest.specialization,
        status: 'pending',
        createdAt: new Date().toISOString()
      })
    });

    // Send notification to athlete
    await sendCoachingRequestNotification(athleteId, coachId, {
      name: coachData.name || coachData.displayName,
      specialization: coachingRequest.specialization,
      profileImage: coachData.profileImage || coachData.photoURL
    });

    console.log('✅ Coaching request sent successfully');
    return true;

  } catch (error) {
    console.error('❌ Error requesting to coach athlete:', error);
    throw error;
  }
};

/**
 * Accept a coaching request (athlete accepts coach)
 * @param {string} requestId - Coaching request ID
 * @param {string} athleteId - Athlete user ID
 * @returns {Promise<boolean>} - Success status
 */
export const acceptCoachingRequest = async (requestId, athleteId) => {
  try {
    if (!requestId || !athleteId) {
      throw new Error('Request ID and Athlete ID are required');
    }

    // Get the coaching request
    const requestDoc = await getDoc(doc(db, 'coaching_requests', requestId));
    if (!requestDoc.exists()) {
      throw new Error('Coaching request not found');
    }

    const requestData = requestDoc.data();
    if (requestData.athleteId !== athleteId) {
      throw new Error('Unauthorized to accept this request');
    }

    if (requestData.status !== 'pending') {
      throw new Error('Request is no longer pending');
    }

    // Create training relationship
    const trainingRelationship = {
      coachId: requestData.coachId,
      athleteId: requestData.athleteId,
      specialization: requestData.specialization,
      status: 'active',
      createdAt: serverTimestamp(),
      acceptedAt: serverTimestamp(),
      goals: [],
      notes: '',
      trainingPlans: []
    };

    const relationshipRef = await addDoc(collection(db, 'training_relationships'), trainingRelationship);

    // Update coaching request status
    await updateDoc(doc(db, 'coaching_requests', requestId), {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      relationshipId: relationshipRef.id
    });

    // Update coach's profile
    const coachDoc = await getDoc(doc(db, 'users', requestData.coachId));
    const coachData = coachDoc.data();
    
    await updateDoc(doc(db, 'users', requestData.coachId), {
      athletes: arrayUnion({
        id: requestData.athleteId,
        name: requestData.athleteName,
        relationshipId: relationshipRef.id,
        addedAt: new Date().toISOString()
      }),
      // Remove from pending requests
      pendingCoachingRequests: arrayRemove({
        id: requestId,
        athleteId: requestData.athleteId,
        athleteName: requestData.athleteName,
        status: 'pending',
        createdAt: requestData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    });

    // Update athlete's profile - add coach information
    const athleteDoc = await getDoc(doc(db, 'users', requestData.athleteId));
    const athleteData = athleteDoc.data();
    
    await updateDoc(doc(db, 'users', requestData.athleteId), {
      coaches: arrayUnion({
        id: requestData.coachId,
        name: requestData.coachName,
        specialization: requestData.specialization,
        relationshipId: relationshipRef.id,
        addedAt: new Date().toISOString()
      }),
      currentCoach: {
        id: requestData.coachId,
        name: requestData.coachName,
        specialization: requestData.specialization
      },
      // Remove from incoming requests
      incomingCoachingRequests: arrayRemove({
        id: requestId,
        coachId: requestData.coachId,
        coachName: requestData.coachName,
        specialization: requestData.specialization,
        status: 'pending',
        createdAt: requestData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      })
    });

    // Send acceptance notification to coach
    await sendCoachingAcceptedNotification(requestData.coachId, requestData.athleteId, {
      name: requestData.athleteName,
      sport: athleteData.sport || athleteData.personalInfo?.sport,
      profileImage: athleteData.profileImage || athleteData.photoURL
    });

    console.log('✅ Coaching request accepted successfully');
    return true;

  } catch (error) {
    console.error('❌ Error accepting coaching request:', error);
    throw error;
  }
};

/**
 * Check if coach can add an athlete (no existing relationship)
 * @param {string} coachId - Coach user ID
 * @param {string} athleteId - Athlete user ID
 * @returns {Promise<boolean>} - True if coach can add athlete
 */
export const canCoachAddAthlete = async (coachId, athleteId) => {
  try {
    if (!coachId || !athleteId || coachId === athleteId) {
      return false;
    }

    // Check for existing relationship
    const relationshipQuery = query(
      collection(db, 'training_relationships'),
      where('coachId', '==', coachId),
      where('athleteId', '==', athleteId)
    );
    const relationships = await getDocs(relationshipQuery);
    if (!relationships.empty) {
      return false; // Already has relationship
    }

    // Check for pending request
    const requestQuery = query(
      collection(db, 'coaching_requests'),
      where('coachId', '==', coachId),
      where('athleteId', '==', athleteId),
      where('status', '==', 'pending')
    );
    const requests = await getDocs(requestQuery);
    if (!requests.empty) {
      return false; // Already has pending request
    }

    return true;
  } catch (error) {
    console.error('❌ Error checking if coach can add athlete:', error);
    return false;
  }
};