import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseClient';
import { createTrainingPlan, getTrainingPlans, updateTrainingPlan } from '../../../utils/coachUtils';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const AthleteTraining = ({ athleteId, athleteName, userProfile, onBack }) => {
  const [user] = useAuthState(auth);
  const [trainingPlans, setTrainingPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    duration: '',
    category: 'strength',
    exercises: []
  });
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: '',
    instructions: ''
  });
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    if (user?.uid && athleteId) {
      loadTrainingPlans();
    }
  }, [user, athleteId]);

  const loadTrainingPlans = async () => {
    setLoading(true);
    try {
      const plans = await getTrainingPlans(athleteId, user.uid);
      setTrainingPlans(plans);
    } catch (error) {
      console.error('Error loading training plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.title.trim()) return;

    try {
      const planData = {
        title: newPlan.title,
        description: newPlan.description,
        duration: newPlan.duration,
        category: newPlan.category,
        exercises: newPlan.exercises,
        coachId: user.uid,
        athleteId: athleteId,
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      await createTrainingPlan(athleteId, user.uid, planData);
      alert('Training plan created successfully!');
      
      // Reset form
      setNewPlan({
        title: '',
        description: '',
        duration: '',
        category: 'strength',
        exercises: []
      });
      setShowCreateModal(false);
      loadTrainingPlans(); // Refresh the list
    } catch (error) {
      console.error('Error creating training plan:', error);
      alert('Failed to create training plan. Please try again.');
    }
  };

  const handleAddExercise = () => {
    if (!newExercise.name.trim()) return;

    setNewPlan(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...newExercise, id: Date.now().toString() }]
    }));

    setNewExercise({
      name: '',
      sets: '',
      reps: '',
      weight: '',
      instructions: ''
    });
  };

  const handleRemoveExercise = (exerciseId) => {
    setNewPlan(prev => ({
      ...prev,
      exercises: prev.exercises.filter(ex => ex.id !== exerciseId)
    }));
  };

  const handleUpdatePlanStatus = async (planId, newStatus) => {
    try {
      await updateTrainingPlan(athleteId, planId, { status: newStatus });
      loadTrainingPlans(); // Refresh the list
    } catch (error) {
      console.error('Error updating training plan:', error);
      alert('Failed to update training plan status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'completed': return 'text-blue-600 bg-blue-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'strength': return 'Zap';
      case 'cardio': return 'Heart';
      case 'flexibility': return 'Minimize';
      case 'skill': return 'Target';
      default: return 'Activity';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading training plans...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={onBack}>
            <Icon name="ArrowLeft" size={16} className="mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Training Plans</h2>
            <p className="text-gray-600">Managing training for {athleteName}</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Icon name="Plus" size={16} className="mr-2" />
          New Plan
        </Button>
      </div>

      {/* Training Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trainingPlans.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-lg border">
            <Icon name="FileText" size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Training Plans Yet</h3>
            <p className="text-gray-600 mb-4">Create your first training plan to get started.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Icon name="Plus" size={16} className="mr-2" />
              Create Training Plan
            </Button>
          </div>
        ) : (
          trainingPlans.map((plan) => (
            <div key={plan.id} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Icon name={getCategoryIcon(plan.category)} size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                    <p className="text-sm text-gray-600 capitalize">{plan.category} Training</p>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(plan.status)}`}>
                  {plan.status}
                </span>
              </div>

              <p className="text-gray-700 mb-4">{plan.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Icon name="Clock" size={14} className="mr-2" />
                  Duration: {plan.duration}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Icon name="List" size={14} className="mr-2" />
                  {plan.exercises?.length || 0} exercises
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Icon name="Calendar" size={14} className="mr-2" />
                  Created: {new Date(plan.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedPlan(plan)}
                  className="flex-1"
                >
                  <Icon name="Eye" size={14} className="mr-1" />
                  View Details
                </Button>
                
                {plan.status === 'active' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdatePlanStatus(plan.id, 'completed')}
                  >
                    <Icon name="Check" size={14} className="mr-1" />
                    Complete
                  </Button>
                )}
                
                {plan.status === 'paused' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUpdatePlanStatus(plan.id, 'active')}
                  >
                    <Icon name="Play" size={14} className="mr-1" />
                    Resume
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Plan Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold">Create Training Plan</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plan Title</label>
                  <Input
                    value={newPlan.title}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Strength Building Program"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <Input
                    value={newPlan.duration}
                    onChange={(e) => setNewPlan(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 4 weeks"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newPlan.category}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="strength">Strength Training</option>
                  <option value="cardio">Cardio Training</option>
                  <option value="flexibility">Flexibility</option>
                  <option value="skill">Skill Development</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the training plan goals and approach..."
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Exercise Builder */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Exercises</h4>
                
                {/* Add New Exercise Form */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input
                      placeholder="Exercise name"
                      value={newExercise.name}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Sets"
                        value={newExercise.sets}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, sets: e.target.value }))}
                      />
                      <Input
                        placeholder="Reps"
                        value={newExercise.reps}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, reps: e.target.value }))}
                      />
                      <Input
                        placeholder="Weight"
                        value={newExercise.weight}
                        onChange={(e) => setNewExercise(prev => ({ ...prev, weight: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Special instructions (optional)"
                      value={newExercise.instructions}
                      onChange={(e) => setNewExercise(prev => ({ ...prev, instructions: e.target.value }))}
                      className="flex-1"
                    />
                    <Button onClick={handleAddExercise} disabled={!newExercise.name.trim()}>
                      <Icon name="Plus" size={14} />
                    </Button>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-3">
                  {newPlan.exercises.map((exercise, index) => (
                    <div key={exercise.id} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">{exercise.name}</span>
                          <span className="text-sm text-gray-600">
                            {exercise.sets} sets × {exercise.reps} reps
                          </span>
                          {exercise.weight && (
                            <span className="text-sm text-gray-600">@ {exercise.weight}</span>
                          )}
                        </div>
                        {exercise.instructions && (
                          <p className="text-sm text-gray-600 mt-1">{exercise.instructions}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveExercise(exercise.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Icon name="Trash2" size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreatePlan}
                disabled={!newPlan.title.trim()}
                className="flex-1"
              >
                Create Training Plan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Details Modal */}
      {selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">{selectedPlan.title}</h3>
                  <p className="text-gray-600 capitalize">{selectedPlan.category} Training</p>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{selectedPlan.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Duration</h4>
                  <p className="text-gray-700">{selectedPlan.duration}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Status</h4>
                  <span className={`px-2 py-1 text-sm font-medium rounded-full capitalize ${getStatusColor(selectedPlan.status)}`}>
                    {selectedPlan.status}
                  </span>
                </div>
              </div>

              {selectedPlan.exercises && selectedPlan.exercises.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Exercises</h4>
                  <div className="space-y-3">
                    {selectedPlan.exercises.map((exercise, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{exercise.name}</h5>
                          <div className="text-sm text-gray-600">
                            {exercise.sets} sets × {exercise.reps} reps
                            {exercise.weight && ` @ ${exercise.weight}`}
                          </div>
                        </div>
                        {exercise.instructions && (
                          <p className="text-sm text-gray-600">{exercise.instructions}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t">
              <Button onClick={() => setSelectedPlan(null)} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AthleteTraining;