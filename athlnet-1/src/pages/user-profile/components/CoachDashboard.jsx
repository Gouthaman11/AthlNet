import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseClient';
import { 
  getCoachAthletes, 
  getAthletesSeekingCoaches,
  createTrainingRelationship,
  getAthleteContactDetails,
  sendCoachMessage 
} from '../../../utils/coachUtils';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const CoachDashboard = ({ userProfile }) => {
  const [user] = useAuthState(auth);
  const [athletes, setAthletes] = useState([]);
  const [seekingAthletes, setSeekingAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAthlete, setSelectedAthlete] = useState(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactDetails, setContactDetails] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showMessageModal, setShowMessageModal] = useState(false);

  useEffect(() => {
    if (user?.uid) {
      loadCoachData();
    }
  }, [user]);

  const loadCoachData = async () => {
    setLoading(true);
    try {
      // Load current athletes
      const myAthletes = await getCoachAthletes(user.uid);
      setAthletes(myAthletes);

      // Load athletes seeking coaches
      const sportFilter = userProfile?.sport || userProfile?.personalInfo?.sport;
      const locationFilter = userProfile?.location || userProfile?.personalInfo?.location;
      const seeking = await getAthletesSeekingCoaches(sportFilter, locationFilter);
      setSeekingAthletes(seeking);
    } catch (error) {
      console.error('Error loading coach data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTraining = async (athleteId) => {
    try {
      await createTrainingRelationship(user.uid, athleteId, {
        specialization: userProfile?.sport || 'General Training',
        goals: ['Improve performance', 'Build strength']
      });
      
      alert('Training relationship created successfully!');
      loadCoachData(); // Refresh data
    } catch (error) {
      console.error('Error creating training relationship:', error);
      alert('Failed to create training relationship. Please try again.');
    }
  };

  const handleViewContact = async (athleteId) => {
    try {
      setSelectedAthlete(athleteId);
      setShowContactModal(true);
      
      const details = await getAthleteContactDetails(athleteId, user.uid);
      setContactDetails(details);
    } catch (error) {
      console.error('Error fetching contact details:', error);
      alert('Unable to fetch contact details. Make sure you have permission to view this athlete\'s information.');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedAthlete) return;
    
    try {
      await sendCoachMessage(user.uid, selectedAthlete, messageText, 'training');
      alert('Message sent successfully!');
      setMessageText('');
      setShowMessageModal(false);
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading coach dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Coach Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Icon name="Users" size={24} className="text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Athletes</p>
              <p className="text-2xl font-bold text-gray-900">{athletes.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Icon name="Target" size={24} className="text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Training Programs</p>
              <p className="text-2xl font-bold text-gray-900">{athletes.filter(a => a.trainingStatus === 'active').length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Icon name="Award" size={24} className="text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Specialization</p>
              <p className="text-lg font-semibold text-gray-900">{userProfile?.sport || 'Multi-Sport'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Athletes */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">My Athletes</h3>
          <p className="text-gray-600">Athletes currently under your training</p>
        </div>
        <div className="p-6">
          {athletes.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Users" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">You don't have any athletes yet.</p>
              <p className="text-sm text-gray-500">Start training athletes to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {athletes.map((athlete) => (
                <div key={athlete.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Image
                      src={athlete.profileImage}
                      alt={athlete.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{athlete.name || athlete.displayName}</h4>
                      <p className="text-sm text-gray-600">{athlete.sport}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="Calendar" size={14} className="mr-2" />
                      Training since {new Date(athlete.trainingStart).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm">
                      <Icon name="Activity" size={14} className="mr-2" />
                      <span className={athlete.trainingStatus === 'active' ? 'text-green-600' : 'text-yellow-600'}>
                        {athlete.trainingStatus === 'active' ? 'Active Training' : 'Paused'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewContact(athlete.id)}
                      className="flex-1"
                    >
                      <Icon name="Phone" size={14} className="mr-1" />
                      Contact
                    </Button>
                    <Button 
                      size="sm" 
                      variant="default"
                      onClick={() => {
                        setSelectedAthlete(athlete.id);
                        setShowMessageModal(true);
                      }}
                      className="flex-1"
                    >
                      <Icon name="MessageCircle" size={14} className="mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Athletes Seeking Coaches */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Athletes Seeking Coaches</h3>
          <p className="text-gray-600">Connect with athletes looking for training</p>
        </div>
        <div className="p-6">
          {seekingAthletes.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No athletes seeking coaches in your area.</p>
              <p className="text-sm text-gray-500">Check back later for new opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {seekingAthletes.map((athlete) => (
                <div key={athlete.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3 mb-3">
                    <Image
                      src={athlete.profileImage}
                      alt={athlete.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{athlete.name}</h4>
                      <p className="text-sm text-gray-600">{athlete.sport}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="MapPin" size={14} className="mr-2" />
                      {athlete.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Icon name="BarChart" size={14} className="mr-2" />
                      {athlete.experience} level
                    </div>
                    {athlete.goals.length > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Icon name="Target" size={14} className="mr-2" />
                        {athlete.goals.slice(0, 2).join(', ')}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    size="sm" 
                    variant="default"
                    onClick={() => handleStartTraining(athlete.id)}
                    className="w-full"
                  >
                    <Icon name="UserPlus" size={14} className="mr-2" />
                    Start Training
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Contact Details Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Athlete Contact Details</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            {contactDetails ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Name</label>
                  <p className="text-gray-900">{contactDetails.name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{contactDetails.email || 'Not provided'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{contactDetails.phone || 'Not provided'}</p>
                </div>
                
                {contactDetails.emergencyContact?.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Emergency Contact</label>
                    <p className="text-gray-900">{contactDetails.emergencyContact.name}</p>
                    <p className="text-sm text-gray-600">{contactDetails.emergencyContact.phone}</p>
                  </div>
                )}
                
                {contactDetails.parentContact?.name && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Parent/Guardian</label>
                    <p className="text-gray-900">{contactDetails.parentContact.name}</p>
                    <p className="text-sm text-gray-600">{contactDetails.parentContact.phone}</p>
                  </div>
                )}
                
                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setShowContactModal(false)} className="flex-1">
                    Close
                  </Button>
                  <Button 
                    variant="default" 
                    onClick={() => {
                      if (contactDetails.phone) {
                        window.open(`tel:${contactDetails.phone}`);
                      }
                    }}
                    className="flex-1"
                  >
                    <Icon name="Phone" size={14} className="mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-600">Loading contact details...</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Send Message to Athlete</h3>
              <button 
                onClick={() => setShowMessageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="flex-1"
                >
                  <Icon name="Send" size={14} className="mr-2" />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;