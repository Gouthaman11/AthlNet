import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const PostCard = ({ post, onLike, onComment, onShare, onEdit, onDelete, currentUser, showFullComments = false }) => {
  const navigate = useNavigate();
  
  // Initialize isLiked based on whether current user has liked the post
  const [isLiked, setIsLiked] = useState(() => {
    if (!currentUser?.uid || !post?.likes) return false;
    return post.likes.includes(currentUser.uid);
  });
  
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [likeCount, setLikeCount] = useState(post?.likes?.length || 0);
  const [isLiking, setIsLiking] = useState(false); // Add loading state for like button
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const dropdownRef = React.useRef(null);

  const isAuthor = currentUser?.uid === post?.authorId || currentUser?.uid === post?.authorUid;

  // Update local state when post prop changes (important for real-time updates)
  React.useEffect(() => {
    if (currentUser?.uid && post?.likes) {
      setIsLiked(post.likes.includes(currentUser.uid));
      setLikeCount(post.likes.length);
    }
  }, [post?.likes, currentUser?.uid]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLike = async () => {
    if (isLiking || !currentUser?.uid) return; // Prevent double-clicking and ensure user is logged in
    
    setIsLiking(true);
    
    // Store original state for rollback
    const originalIsLiked = isLiked;
    const originalLikeCount = likeCount;
    
    // Optimistic update
    const newIsLiked = !isLiked;
    const newLikeCount = newIsLiked ? likeCount + 1 : likeCount - 1;
    
    setIsLiked(newIsLiked);
    setLikeCount(newLikeCount);
    
    try {
      const result = await onLike?.(post?.id, originalIsLiked);
      
      // If the API returns different values, use those (for consistency)
      if (result && typeof result === 'object') {
        setIsLiked(result.isLiked);
        setLikeCount(result.likeCount);
      }
    } catch (error) {
      console.error('Like failed:', error);
      // Rollback optimistic update on error
      setIsLiked(originalIsLiked);
      setLikeCount(originalLikeCount);
      
      // Optional: show user-friendly error message
      // You could add a toast notification here
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!commentText?.trim()) return;
    try {
      await onComment?.(post?.id, commentText);
      setCommentText('');
      // If comments are expanded, keep them expanded to show the new comment
      if (showAllComments) {
        // The parent component should handle refreshing the post data
        // For now, we'll keep the current state
      }
    } catch (e) {
      alert('Failed to add comment');
    }
  };

  const handleAuthorClick = () => {
    const authorId = post?.authorId || post?.authorUid || post?.author?.id || post?.author?.uid;
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleEdit = async () => {
    if (!editContent?.trim()) return;
    try {
      await onEdit?.(post?.id, { content: editContent });
      setIsEditing(false);
    } catch (e) {
      alert('Failed to update post');
      setEditContent(post?.content || '');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(post?.content || '');
  };

  const handleDelete = async () => {
    const confirmMessage = 'Are you sure you want to delete this post? This action cannot be undone.';
    
    if (window.confirm(confirmMessage)) {
      try {
        console.log('🗑️ PostCard: Initiating delete for post:', post?.id);
        setShowDropdown(false); // Close dropdown immediately
        
        // Show loading state (optional: you could add a loading state)
        // setIsDeleting(true);
        
        await onDelete?.(post?.id);
        console.log('✅ PostCard: Delete completed successfully');
        
      } catch (e) {
        console.error('❌ PostCard: Delete failed:', e);
        const errorMessage = e?.message || 'Failed to delete post';
        alert(`Delete failed: ${errorMessage}`);
        
        // Re-open dropdown on error so user can try again
        setShowDropdown(true);
      }
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diff = now - postTime;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    if (weeks < 4) return `${weeks}w`;
    return postTime.toLocaleDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg card-elevation-1 hover:card-elevation-2 transition-all duration-200">
      {/* Post Header */}
      <div className="p-4 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Image
                src={post?.author?.avatar}
                alt={post?.author?.name}
                className="w-10 h-10 rounded-full object-cover"
              />
              {post?.author?.verified && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                  <Icon name="Check" size={10} color="white" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-foreground hover:underline cursor-pointer" onClick={handleAuthorClick}>
                  {post?.author?.name || 'Unknown User'}
                </h3>
                {post?.author?.verified && (
                  <Icon name="BadgeCheck" size={16} className="text-primary" />
                )}
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground hover:underline cursor-pointer">
                  {formatTimeAgo(post?.createdAt || post?.timestamp)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {post?.author?.sport || 'Athlete'} • {post?.author?.location || 'Location'}
              </p>
            </div>
          </div>
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <Icon name="MoreHorizontal" size={16} className="text-muted-foreground" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-card border border-border rounded-lg shadow-lg z-10 min-w-[120px]">
                {isAuthor && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center space-x-2"
                    >
                      <Icon name="Edit" size={14} />
                      <span>Edit post</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center space-x-2 text-destructive hover:text-destructive"
                    >
                      <Icon name="Trash2" size={14} />
                      <span>Delete post</span>
                    </button>
                    <div className="border-t border-border my-1"></div>
                  </>
                )}
                <button
                  onClick={() => setShowDropdown(false)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex items-center space-x-2"
                >
                  <Icon name="Flag" size={14} />
                  <span>Report</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Post Content */}
      <div className="px-4 pb-3">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 bg-muted border border-border rounded-lg text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              rows="3"
              placeholder="What's on your mind?"
            />
            <div className="flex items-center justify-end space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleEdit}
                disabled={!editContent?.trim() || editContent === post?.content}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-foreground leading-relaxed">{post?.content}</p>
            {post?.updatedAt && post?.updatedAt !== post?.createdAt && (
              <p className="text-xs text-muted-foreground mt-1 italic">Edited</p>
            )}
          </>
        )}
        
        {!isEditing && post?.hashtags && post?.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {post?.hashtags?.map((tag, index) => (
              <span key={index} className="text-primary text-sm hover:underline cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* Post Media */}
      {post?.media && post?.media?.length > 0 && (
        <div className="px-4 pb-3">
          {post?.media?.length === 1 ? (
            <div className="rounded-lg overflow-hidden bg-muted flex items-center justify-center" style={{ minHeight: '200px', maxHeight: '500px' }}>
              {post?.media?.[0]?.type === 'image' ? (
                <Image
                  src={post?.media?.[0]?.url}
                  alt="Post media"
                  className="w-full h-auto rounded-lg"
                  style={{ 
                    maxHeight: '500px', 
                    maxWidth: '100%',
                    objectFit: 'contain', 
                    backgroundColor: '#f8f9fa'
                  }}
                />
              ) : (
                <video
                  src={post?.media?.[0]?.url}
                  controls
                  className="w-full h-auto rounded-lg"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                  preload="metadata"
                  onError={(e) => {
                    console.error('Video playback error:', e);
                    e.target.style.display = 'none';
                    // Show fallback content
                    const fallback = document.createElement('div');
                    fallback.className = 'flex items-center justify-center h-64 bg-gray-100 text-gray-500 rounded-lg';
                    fallback.innerHTML = '<span>Video could not be loaded</span>';
                    e.target.parentNode?.appendChild(fallback);
                  }}
                  onLoadStart={() => {
                    console.log('Video loading started for:', post?.media?.[0]?.url);
                  }}
                />
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {post?.media?.slice(0, 4)?.map((media, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden bg-muted flex items-center justify-center" style={{ height: '200px' }}>
                  {media?.type === 'image' ? (
                    <Image
                      src={media?.url}
                      alt={`Post media ${index + 1}`}
                      className="rounded-lg"
                      style={{ 
                        maxHeight: '200px', 
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
                        maxHeight: '200px', 
                        maxWidth: '100%',
                        objectFit: 'contain'
                      }}
                      muted
                    />
                  )}
                  {index === 3 && post?.media?.length > 4 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <span className="text-white font-semibold">+{post?.media?.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Engagement Stats */}
      <div className="px-4 py-2 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>{likeCount} likes</span>
            <span>{post?.comments?.length || 0} comments</span>
            <span>{post?.shares || 0} shares</span>
          </div>
          <span>{post?.views || 0} views</span>
        </div>
      </div>
      {/* Action Buttons */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isLiked 
                ? 'text-error bg-error/10 hover:bg-error/20' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Icon 
              name={isLiked ? "Heart" : "Heart"} 
              size={18} 
              fill={isLiked ? "currentColor" : "none"}
              className={isLiking ? 'animate-pulse' : ''}
            />
            <span className="text-sm font-medium">
              {isLiking ? 'Liking...' : 'Like'}
            </span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="MessageCircle" size={18} />
            <span className="text-sm font-medium">Comment</span>
          </button>
          
          <button
            onClick={() => onShare?.(post?.id)}
            className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <Icon name="Share" size={18} />
            <span className="text-sm font-medium">Share</span>
          </button>
          
          <button className="flex items-center space-x-2 px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
            <Icon name="Bookmark" size={18} />
            <span className="text-sm font-medium">Save</span>
          </button>
        </div>
      </div>
      {/* Comments Section - Different behavior based on context */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-border">
          {(showFullComments || showAllComments) ? (
            /* Full comments view for dedicated comments section or when expanded */
            <div className="mt-4 space-y-3">
              {!showFullComments && (
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">Comments ({post?.comments?.length || 0})</span>
                  <button 
                    onClick={() => setShowAllComments(false)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Hide comments
                  </button>
                </div>
              )}
              {post?.comments && post?.comments?.length > 0 ? (
                post?.comments?.map((comment, index) => (
                  <div key={comment?.id || index} className="flex items-start space-x-3">
                    <Image
                      src={comment?.author?.avatar || ''}
                      alt={comment?.author?.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover bg-muted"
                    />
                    <div className="flex-1">
                      <div className="bg-muted rounded-lg p-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-sm">{comment?.author?.name || 'Unknown User'}</span>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(comment?.timestamp)}</span>
                        </div>
                        <p className="text-sm text-foreground">{comment?.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground italic">No comments yet</p>
              )}
            </div>
          ) : (
            /* Home feed view - just show comment count with expand option */
            post?.comments && post?.comments?.length > 0 && (
              <div className="mt-4 mb-3">
                <button 
                  onClick={() => setShowAllComments(true)}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:underline"
                >
                  View all {post?.comments?.length} comments
                </button>
              </div>
            )
          )}
          
          {/* Add Comment - Always show */}
          <div className="flex items-center space-x-3 mt-4">
            <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
              {currentUser?.photoURL ? (
                <Image
                  src={currentUser.photoURL}
                  alt="Your avatar"
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <Icon name="User" size={16} color="white" />
              )}
            </div>
            <div className="flex-1 flex items-center space-x-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e?.target?.value)}
                placeholder="Write a comment..."
                className="flex-1 p-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                onKeyPress={(e) => e?.key === 'Enter' && handleComment()}
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleComment}
                disabled={!commentText?.trim()}
              >
                <Icon name="Send" size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;