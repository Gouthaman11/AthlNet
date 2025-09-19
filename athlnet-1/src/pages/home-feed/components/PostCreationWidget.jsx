import React, { useState, useRef } from 'react';
import { safeLog } from '../../../utils/safeLogging';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PostCreationWidget = ({ onCreatePost }) => {
  const [postContent, setPostContent] = useState('');
  const [selectedMedia, setSelectedMedia] = useState([]);
  const [hashtags, setHashtags] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ stage: '', progress: 0 });
  const fileInputRef = useRef(null);

  const handleMediaUpload = (event) => {
    const files = Array.from(event?.target?.files);
    
    safeLog.log('📤 Media files selected:', {
      count: files.length,
      files: files.map(f => ({ name: f.name, type: f.type, size: f.size }))
    });
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for video, 10MB for images
      
      safeLog.log(`🔍 Validating file: ${file.name}`, {
        type: file.type,
        isImage,
        isVideo,
        size: file.size,
        maxSize
      });
      
      if (!isImage && !isVideo) {
        safeLog.warn(`❌ Invalid file type: ${file.name} (${file.type})`);
        alert(`${file.name} is not a valid image or video file. Please select JPG, PNG, GIF, MP4, WebM, or MOV files.`);
        return false;
      }
      
      if (file.size > maxSize) {
        safeLog.warn(`❌ File too large: ${file.name} (${file.size} bytes > ${maxSize} bytes)`);
        alert(`${file.name} is too large. Maximum size: ${isVideo ? '100MB' : '10MB'}`);
        return false;
      }
      
      safeLog.log(`✅ File validation passed: ${file.name}`);
      return true;
    });
    
    if (validFiles.length === 0) {
      safeLog.warn('⚠️ No valid files found after validation');
      return;
    }
    
    safeLog.log(`📋 Processing ${validFiles.length} valid files`);
    
    const mediaFiles = validFiles.map(file => {
      const mediaObject = {
        id: Date.now() + Math.random(),
        file,
        url: URL.createObjectURL(file),
        type: file?.type?.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        size: file.size
      };
      
      safeLog.log(`📄 Created media object:`, {
        id: mediaObject.id,
        type: mediaObject.type,
        name: mediaObject.name,
        hasUrl: !!mediaObject.url
      });
      
      return mediaObject;
    });
    
    setSelectedMedia(prev => {
      const newMedia = [...prev, ...mediaFiles];
      safeLog.log(`📊 Updated media selection: ${newMedia.length} total files`);
      return newMedia;
    });
    
    // Clear the input so the same file can be selected again
    event.target.value = '';
  };

  const removeMedia = (id) => {
    setSelectedMedia(prev => prev?.filter(media => media?.id !== id));
  };

  const handleSubmit = async () => {
    if (!postContent?.trim() && selectedMedia?.length === 0) return;

    setIsUploading(true);
    
    safeLog.log('📝 Starting post submission:', {
      contentLength: postContent?.length || 0,
      mediaCount: selectedMedia?.length || 0,
      mediaTypes: selectedMedia?.map(m => m.type) || []
    });

    try {
      const newPost = {
        id: Date.now(),
        content: postContent,
        media: selectedMedia,
        hashtags: hashtags?.split(' ')?.filter(tag => tag?.startsWith('#')),
        timestamp: new Date(),
        author: {
          name: 'Alex Rodriguez',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          verified: true,
          sport: 'Basketball'
        }
      };

      safeLog.log('🚀 Calling onCreatePost with:', {
        postId: newPost.id,
        hasContent: !!newPost.content,
        mediaCount: newPost.media?.length || 0,
        hashtagCount: newPost.hashtags?.length || 0
      });

      await onCreatePost(newPost);
      
      safeLog.log('✅ Post created successfully');
      
      // Reset form
      setPostContent('');
      setSelectedMedia([]);
      setHashtags('');
      setIsExpanded(false);
    } catch (error) {
      safeLog.error('❌ Failed to create post:', error);
      
      // Enhanced error messaging
      let errorMessage = 'Failed to create post. Please try again.';
      
      if (error.message?.includes('storage')) {
        errorMessage = 'Failed to upload media files. Please check your internet connection and try again.';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication error. Please refresh the page and try again.';
      } else if (error.message?.includes('permission')) {
        errorMessage = 'Permission error. Please make sure you\'re logged in and try again.';
      }
      
      alert(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-3 md:p-4 mb-6 card-elevation-1">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 md:w-10 md:h-10 bg-secondary rounded-full flex items-center justify-center">
            <Icon name="User" size={20} color="white" />
          </div>
        </div>
        
        <div className="flex-1">
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e?.target?.value)}
            onFocus={() => setIsExpanded(true)}
            placeholder="Share your latest achievement, training update, or sports story..."
            className="w-full p-3 md:p-3 bg-muted border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all text-base md:text-sm"
            rows={isExpanded ? 4 : 2}
          />

          {/* Media Preview */}
          {selectedMedia?.length > 0 && (
            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {selectedMedia?.map((media) => (
                <div key={media?.id} className="relative group">
                  <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center" style={{ height: '120px' }}>
                    {media?.type === 'image' ? (
                      <Image
                        src={media?.url}
                        alt="Upload preview"
                        className="rounded-lg"
                        style={{ 
                          maxHeight: '120px', 
                          maxWidth: '100%',
                          objectFit: 'contain', 
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    ) : (
                      <video
                        src={media?.url}
                        className="rounded-lg"
                        style={{ 
                          maxHeight: '120px', 
                          maxWidth: '100%',
                          objectFit: 'contain'
                        }}
                        controls
                        preload="metadata"
                        onError={(e) => {
                          safeLog.error(`❌ Video preview error for ${media?.name}:`, e);
                        }}
                        onLoadedMetadata={() => {
                          safeLog.log(`✅ Video preview loaded: ${media?.name}`);
                        }}
                      >
                        <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
                          <Icon name="Video" size={32} />
                          <span className="ml-2">Video Preview</span>
                        </div>
                      </video>
                    )}
                  </div>
                  <button
                    onClick={() => removeMedia(media?.id)}
                    className="absolute -top-2 -right-2 w-7 h-7 md:w-6 md:h-6 bg-error text-error-foreground rounded-full flex items-center justify-center opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity touch-manipulation"
                  >
                    <Icon name="X" size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hashtags Input */}
          {isExpanded && (
            <div className="mt-3">
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e?.target?.value)}
                placeholder="Add hashtags... #basketball #training #motivation"
                className="w-full p-3 md:p-2 bg-muted border border-border rounded-lg text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          )}

          {/* Action Buttons */}
          {isExpanded && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2 overflow-x-auto">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef?.current?.click()}
                  className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-h-[40px] whitespace-nowrap"
                >
                  <Icon name="Image" size={16} />
                  <span className="hidden sm:inline">Media</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-h-[40px] whitespace-nowrap">
                  <Icon name="MapPin" size={16} />
                  <span className="hidden sm:inline">Location</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors touch-manipulation min-h-[40px] whitespace-nowrap">
                  <Icon name="Users" size={16} />
                  <span className="hidden sm:inline">Tag</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsExpanded(false);
                    setPostContent('');
                    setSelectedMedia([]);
                    setHashtags('');
                  }}
                  className="touch-manipulation min-h-[44px] md:min-h-[36px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleSubmit}
                  disabled={(!postContent?.trim() && selectedMedia?.length === 0) || isUploading}
                  className="touch-manipulation min-h-[44px] md:min-h-[36px]"
                >
                  {isUploading ? (
                    <>
                      <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                      {uploadProgress.stage === 'optimizing' && (
                        <>
                          <span className="hidden sm:inline">Optimizing... {uploadProgress.progress}%</span>
                          <span className="sm:hidden">Opt...</span>
                        </>
                      )}
                      {uploadProgress.stage === 'uploading' && (
                        <>
                          <span className="hidden sm:inline">Uploading... {uploadProgress.progress}%</span>
                          <span className="sm:hidden">Up...</span>
                        </>
                      )}
                      {!uploadProgress.stage && (
                        <>
                          <span className="hidden sm:inline">Creating...</span>
                          <span className="sm:hidden">...</span>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">Share Post</span>
                      <span className="sm:hidden">Share</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostCreationWidget;