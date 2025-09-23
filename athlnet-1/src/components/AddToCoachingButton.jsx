import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebaseClient';
import { isCoach, requestToCoachAthlete, canCoachAddAthlete } from '../utils/coachUtils';
import { getFullUserProfile } from '../utils/firestoreSocialApi';
import Button from './ui/Button';
import Icon from './AppIcon';

const AddToCoachingButton = ({ athleteProfile, onSuccess, className = "" }) => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(false);
  const [canAdd, setCanAdd] = useState(false);
  const [userIsCoach, setUserIsCoach] = useState(false);
  const [fullUserProfile, setFullUserProfile] = useState(null);

  useEffect(() => {
    const checkCoachStatus = async () => {
      if (!user?.uid || !athleteProfile?.uid) return;

      try {
        // Get full user profile data
        const userProfile = await getFullUserProfile(user.uid);
        setFullUserProfile(userProfile);

        // Check if current user is a coach
        const coachStatus = isCoach(userProfile);
        setUserIsCoach(coachStatus);

        // Debug logging - temporary
        console.log('🔍 AddToCoachingButton Debug:', {
          userUid: user.uid,
          athleteUid: athleteProfile.uid,
          userProfile,
          isCoach: coachStatus,
          sameUser: user.uid === athleteProfile.uid
        });

        if (coachStatus && user.uid !== athleteProfile.uid) {
          // Check if coach can add this athlete
          const canAddAthlete = await canCoachAddAthlete(user.uid, athleteProfile.uid);
          setCanAdd(canAddAthlete);
          
          console.log('✅ Can add athlete:', canAddAthlete);
        } else {
          console.log('❌ Cannot show button - not coach or same user');
          setCanAdd(false);
        }
      } catch (error) {
        console.error('Error checking coach status:', error);
        setCanAdd(false);
      }
    };

    checkCoachStatus();
  }, [user, athleteProfile]);

  const handleAddToCoaching = async () => {
    if (!user?.uid || !athleteProfile?.uid) return;

    setLoading(true);
    try {
      await requestToCoachAthlete(user.uid, athleteProfile.uid, {
        specialization: fullUserProfile?.sport || fullUserProfile?.personalInfo?.sport || 'General Training',
        message: `Hi ${athleteProfile.name}! I'd like to coach you and help you reach your athletic goals. Let's work together to unlock your potential!`
      });

      // Update button state
      setCanAdd(false);

      // Show success message
      if (onSuccess) {
        onSuccess({
          type: 'success',
          title: 'Coaching Request Sent!',
          message: `Your coaching request has been sent to ${athleteProfile.name}. They will be notified and can accept or decline your request.`
        });
      }

    } catch (error) {
      console.error('Error sending coaching request:', error);
      
      // Show error message
      if (onSuccess) {
        onSuccess({
          type: 'error',
          title: 'Request Failed',
          message: error.message || 'Failed to send coaching request. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if:
  // - User is not logged in
  // - User is not a coach
  // - User is viewing their own profile
  // - Coach cannot add this athlete (already coaching or pending request)
  if (!user || !userIsCoach || user.uid === athleteProfile?.uid || !canAdd) {
    return null;
  }

  return (
    <Button
      variant="default"
      size={className.includes('xs') ? 'xs' : 'sm'}
      onClick={handleAddToCoaching}
      disabled={loading}
      loading={loading}
      className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
    >
      <Icon name="UserPlus" size={className.includes('xs') ? 12 : 16} className="mr-1" />
      {loading ? 'Sending...' : (className.includes('xs') ? 'Coach' : 'Add to Coaching')}
    </Button>
  );
};

export default AddToCoachingButton;