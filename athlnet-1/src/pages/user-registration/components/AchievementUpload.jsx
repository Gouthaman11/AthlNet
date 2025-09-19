import React, { useState } from 'react';
import Button from 'components/ui/Button';
import Input from 'components/ui/Input';
import Icon from 'components/AppIcon';
import Image from 'components/AppImage';

const AchievementUpload = ({ achievements, onAchievementsChange, errors }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFiles(e?.dataTransfer?.files);
    }
  };

  const handleFiles = (files) => {
    Array.from(files)?.forEach(file => {
      if (file?.type?.startsWith('image/') || file?.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newAchievement = {
            id: Date.now() + Math.random(),
            title: '',
            description: '',
            date: '',
            file: file,
            preview: e?.target?.result,
            type: file?.type?.startsWith('image/') ? 'image' : 'document'
          };
          onAchievementsChange([...achievements, newAchievement]);
        };
        reader?.readAsDataURL(file);
      }
    });
  };

  const handleFileInput = (e) => {
    if (e?.target?.files) {
      handleFiles(e?.target?.files);
    }
  };

  const updateAchievement = (id, field, value) => {
    const updated = achievements?.map(achievement =>
      achievement?.id === id ? { ...achievement, [field]: value } : achievement
    );
    onAchievementsChange(updated);
  };

  const removeAchievement = (id) => {
    const filtered = achievements?.filter(achievement => achievement?.id !== id);
    onAchievementsChange(filtered);
  };

  const addManualAchievement = () => {
    const newAchievement = {
      id: Date.now(),
      title: '',
      description: '',
      date: '',
      file: null,
      preview: null,
      type: 'manual'
    };
    onAchievementsChange([...achievements, newAchievement]);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          Achievements & Documents
        </h3>
        <p className="text-muted-foreground">
          Upload certificates, awards, or add achievements manually
        </p>
      </div>
      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-smooth ${
          dragActive
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept="image/*,.pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="space-y-4">
          <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
            <Icon name="Upload" size={32} className="text-muted-foreground" />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-foreground">
              Drop files here or click to upload
            </h4>
            <p className="text-sm text-muted-foreground">
              Supports: Images (JPG, PNG) and PDF documents
            </p>
          </div>
          
          <Button variant="outline" size="sm">
            <Icon name="Plus" size={16} className="mr-2" />
            Choose Files
          </Button>
        </div>
      </div>
      {/* Manual Achievement Button */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={addManualAchievement}
          className="text-primary hover:text-primary/80"
        >
          <Icon name="Plus" size={16} className="mr-2" />
          Add Achievement Manually
        </Button>
      </div>
      {/* Achievement List */}
      {achievements?.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Your Achievements</h4>
          
          {achievements?.map((achievement) => (
            <div key={achievement?.id} className="p-4 border border-border rounded-lg space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  {achievement?.type === 'image' && achievement?.preview && (
                    <div className="w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={achievement?.preview}
                        alt="Achievement preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {achievement?.type === 'document' && (
                    <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Icon name="FileText" size={20} className="text-muted-foreground" />
                    </div>
                  )}
                  {achievement?.type === 'manual' && (
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Award" size={20} className="text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">
                      {achievement?.file ? achievement?.file?.name : 'Manual Entry'}
                    </p>
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAchievement(achievement?.id)}
                  className="text-muted-foreground hover:text-error"
                >
                  <Icon name="Trash2" size={16} />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Achievement Title"
                  type="text"
                  placeholder="e.g., State Championship Winner"
                  value={achievement?.title}
                  onChange={(e) => updateAchievement(achievement?.id, 'title', e?.target?.value)}
                  required
                />
                
                <Input
                  label="Date Achieved"
                  type="date"
                  value={achievement?.date}
                  onChange={(e) => updateAchievement(achievement?.id, 'date', e?.target?.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  placeholder="Describe this achievement and its significance..."
                  value={achievement?.description}
                  onChange={(e) => updateAchievement(achievement?.id, 'description', e?.target?.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-border rounded-lg resize-none transition-smooth focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {errors?.achievements && (
        <p className="text-sm text-error flex items-center">
          <Icon name="AlertCircle" size={16} className="mr-1" />
          {errors?.achievements}
        </p>
      )}
    </div>
  );
};

export default AchievementUpload;