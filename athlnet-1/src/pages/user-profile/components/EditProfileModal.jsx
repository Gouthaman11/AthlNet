import React, { useState, useRef } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseClient';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { uploadProfileImage } from '../../../utils/firestoreSocialApi';

const EditProfileModal = ({ userProfile, onSave, onClose }) => {
  const [currentUser] = useAuthState(auth);
  const [form, setForm] = useState({
    name: userProfile?.name || userProfile?.displayName || '',
    title: userProfile?.title || userProfile?.sport || '',
    bio: userProfile?.bio || '',
    location: userProfile?.location || '',
    sports: userProfile?.sports?.join(', ') || userProfile?.sport || '',
    profileImage: userProfile?.profileImage || userProfile?.photoURL || '',
    coverImage: userProfile?.coverImage || '',
    goals: userProfile?.goals?.join('\n') || ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  const profileFileRef = useRef(null);
  const coverFileRef = useRef(null);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleImageUpload = async (file, type) => {
    if (!file || !currentUser) return null;
    
    try {
      setUploading(true);
      console.log(`Uploading ${type} image:`, file.name);
      
      // Upload to Firebase Storage using specialized profile image function
      const downloadURL = await uploadProfileImage(file, currentUser.uid, type);
      
      console.log(`${type} upload successful:`, downloadURL);
      return downloadURL;
      
    } catch (error) {
      console.error(`Failed to upload ${type} image:`, error);
      alert(`Failed to upload ${type} image: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleProfileImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size must be less than 10MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setProfilePreview(previewUrl);
    
    // Upload to Firebase
    const uploadedUrl = await handleImageUpload(file, 'profile');
    if (uploadedUrl) {
      setForm(f => ({ ...f, profileImage: uploadedUrl }));
    } else {
      // Reset preview if upload failed
      setProfilePreview(null);
    }
    
    // Clear file input
    event.target.value = '';
  };

  const handleCoverImageSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      alert('Image size must be less than 10MB');
      return;
    }

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    
    // Upload to Firebase
    const uploadedUrl = await handleImageUpload(file, 'cover');
    if (uploadedUrl) {
      setForm(f => ({ ...f, coverImage: uploadedUrl }));
    } else {
      // Reset preview if upload failed
      setCoverPreview(null);
    }
    
    // Clear file input
    event.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updateData = {
        ...form,
        sports: form.sports.split(',').map(s => s.trim()).filter(s => s),
        goals: form.goals.split('\n').map(g => g.trim()).filter(g => g)
      };
      
      await onSave(updateData);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  // Close modal when clicking backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">Edit Profile</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="X" size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name *
                </label>
                <Input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Professional Title
                </label>
                <Input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Professional Basketball Player"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-foreground mb-2">
                Location
              </label>
              <Input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Los Angeles, CA"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Biography
            </label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder="Tell your story... Share your athletic journey, achievements, and what drives you."
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              rows="4"
            />
          </div>

          {/* Sports */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Sports & Activities
            </label>
            <Input
              name="sports"
              value={form.sports}
              onChange={handleChange}
              placeholder="e.g., Basketball, Tennis, Swimming (comma separated)"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Separate multiple sports with commas
            </p>
          </div>

          {/* Goals */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Goals & Aspirations
            </label>
            <textarea
              name="goals"
              value={form.goals}
              onChange={handleChange}
              placeholder="Enter your goals, one per line..."
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              rows="3"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter each goal on a new line
            </p>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Profile Images</h3>
            <div className="space-y-6">
              
              {/* Profile Picture */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  {/* Current/Preview Image */}
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-muted border-2 border-border">
                      <Image
                        src={profilePreview || form.profileImage || '/assets/images/no_image.png'}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {(profilePreview || form.profileImage) && (
                      <button
                        type="button"
                        onClick={() => {
                          setForm(f => ({ ...f, profileImage: '' }));
                          setProfilePreview(null);
                        }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-error text-error-foreground rounded-full flex items-center justify-center text-xs hover:bg-error/90 transition-colors"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="flex-1">
                    <input
                      ref={profileFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => profileFileRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Icon name="Upload" size={16} className="mr-2" />
                          Upload Profile Picture
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Square image, max 10MB
                    </p>
                  </div>
                </div>
                
                {/* Optional URL input */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Or paste image URL
                  </label>
                  <Input
                    name="profileImage"
                    value={form.profileImage}
                    onChange={handleChange}
                    placeholder="https://example.com/your-profile-picture.jpg"
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Cover Image
                </label>
                <div className="space-y-3">
                  {/* Current/Preview Image */}
                  {(coverPreview || form.coverImage) && (
                    <div className="relative">
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-muted border-2 border-border">
                        <Image
                          src={coverPreview || form.coverImage}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setForm(f => ({ ...f, coverImage: '' }));
                          setCoverPreview(null);
                        }}
                        className="absolute top-2 right-2 w-6 h-6 bg-error text-error-foreground rounded-full flex items-center justify-center text-xs hover:bg-error/90 transition-colors"
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div>
                    <input
                      ref={coverFileRef}
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => coverFileRef.current?.click()}
                      disabled={uploading}
                      className="w-full"
                    >
                      {uploading ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Icon name="Upload" size={16} className="mr-2" />
                          Upload Cover Image
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Wide landscape image, max 10MB
                    </p>
                  </div>
                  
                  {/* Optional URL input */}
                  <div>
                    <label className="block text-xs font-medium text-muted-foreground mb-1">
                      Or paste image URL
                    </label>
                    <Input
                      name="coverImage"
                      value={form.coverImage}
                      onChange={handleChange}
                      placeholder="https://example.com/your-cover-image.jpg"
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-6 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleSave} 
              disabled={saving || !form.name.trim()}
            >
              {saving ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
