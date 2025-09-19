// Debug utilities for testing video upload functionality
import { 
  uploadMediaFilesSimple, 
  testStorageConnection, 
  createPost, 
  getFeedPosts 
} from './firestoreSocialApi';
import { safeLog } from './safeLogging';
import { auth } from '../firebaseClient';

// Quick test for video upload issues
async function quickVideoTest() {
  safeLog.log('🚀 Running quick video upload diagnostic...');
  
  try {
    // 1. Check authentication
    const user = auth.currentUser;
    if (!user) {
      throw new Error('❌ User not logged in');
    }
    safeLog.log('✅ User authenticated:', user.uid);
    
    // 2. Check storage connection
    await testStorageConnection();
    safeLog.log('✅ Storage connection working');
    
    // 3. Check browser video support
    const videoSupport = await checkVideoSupport();
    safeLog.log('✅ Browser video support:', videoSupport);
    
    // 4. Test file input acceptance
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    const acceptsVideo = input.accept.includes('video');
    safeLog.log('✅ File input accepts video:', acceptsVideo);
    
    // 5. Check if we can create video elements
    const video = document.createElement('video');
    const canCreateVideo = video instanceof HTMLVideoElement;
    safeLog.log('✅ Can create video elements:', canCreateVideo);
    
    safeLog.log('🎉 Quick diagnostic completed - all systems appear functional');
    
    return {
      authenticated: true,
      storageWorking: true,
      browserSupport: videoSupport,
      fileInputWorking: acceptsVideo,
      videoElementsWorking: canCreateVideo
    };
    
  } catch (error) {
    safeLog.error('❌ Quick diagnostic failed:', error);
    return {
      error: error.message,
      authenticated: !!auth.currentUser
    };
  }
}

// Test if video uploads work correctly
async function testVideoUpload() {
  safeLog.log('🎬 Testing video upload functionality');
  
  try {
    // Check if user is authenticated
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to test video uploads');
    }
    
    safeLog.log('✅ User authenticated:', user.uid);
    
    // Test storage connection
    safeLog.log('📡 Testing storage connection...');
    await testStorageConnection();
    safeLog.log('✅ Storage connection successful');
    
    // Create a test video file (blob)
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    
    // Create a simple test pattern
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(0, 0, 640, 360);
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(160, 90, 320, 180);
    ctx.fillStyle = '#FFE66D';
    ctx.font = '48px Arial';
    ctx.fillText('TEST VIDEO', 200, 200);
    
    // Convert canvas to blob
    const testVideoBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png');
    });
    
    // Create a fake video file for testing
    const testVideoFile = new File([testVideoBlob], 'test-video.mp4', { 
      type: 'video/mp4' 
    });
    
    safeLog.log('📹 Created test video file:', {
      name: testVideoFile.name,
      size: testVideoFile.size,
      type: testVideoFile.type
    });
    
    // Test upload
    safeLog.log('⬆️ Starting video upload test...');
    const uploadResults = await uploadMediaFilesSimple([{
      file: testVideoFile,
      type: 'video'
    }], user.uid);
    
    safeLog.log('✅ Video upload successful:', uploadResults);
    return uploadResults;
    
  } catch (error) {
    safeLog.error('❌ Video upload test failed:', error);
    throw error;
  }
}

// Test video display in posts
async function testVideoDisplay() {
  safeLog.log('🖥️ Testing video display in posts');
  
  try {
    // Get recent posts with media
    const posts = await getFeedPosts(10);
    const videoPosts = posts.filter(post => 
      post.media && post.media.some(m => m.type === 'video')
    );
    
    safeLog.log(`📊 Found ${videoPosts.length} posts with videos out of ${posts.length} total posts`);
    
    videoPosts.forEach((post, index) => {
      safeLog.log(`Video Post ${index + 1}:`, {
        postId: post.id,
        authorId: post.authorId,
        mediaCount: post.media.length,
        videoMedia: post.media.filter(m => m.type === 'video'),
        hasValidUrls: post.media.every(m => m.url && m.url.startsWith('http'))
      });
    });
    
    return videoPosts;
    
  } catch (error) {
    safeLog.error('❌ Video display test failed:', error);
    throw error;
  }
}

// Test complete video post creation workflow
async function testVideoPostCreation() {
  safeLog.log('🎬 Testing complete video post creation workflow');
  
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in to test post creation');
    }
    
    // Create test video file
    const testVideoFile = await createTestVideoFile();
    safeLog.log('✅ Test video file created');
    
    // Upload video
    safeLog.log('⬆️ Uploading video...');
    const uploadedMedia = await uploadMediaFilesSimple([{
      file: testVideoFile,
      type: 'video'
    }], user.uid);
    
    safeLog.log('✅ Video uploaded:', uploadedMedia);
    
    // Create post with video
    safeLog.log('📝 Creating post with video...');
    const postId = await createPost(
      user.uid,
      'Test video post created by debug utility',
      uploadedMedia,
      { name: 'Test User', verified: false }
    );
    
    safeLog.log('✅ Video post created successfully with ID:', postId);
    return { postId, uploadedMedia };
    
  } catch (error) {
    safeLog.error('❌ Video post creation test failed:', error);
    throw error;
  }
}

// Check video support in browser
async function checkVideoSupport() {
  safeLog.log('🔍 Checking browser video support');
  
  const results = {
    canPlayMP4: false,
    canPlayWebM: false,
    canPlayOGV: false,
    supportedFormats: []
  };
  
  const video = document.createElement('video');
  
  // Check MP4 support
  if (video.canPlayType && video.canPlayType('video/mp4') !== '') {
    results.canPlayMP4 = true;
    results.supportedFormats.push('MP4');
  }
  
  // Check WebM support
  if (video.canPlayType && video.canPlayType('video/webm') !== '') {
    results.canPlayWebM = true;
    results.supportedFormats.push('WebM');
  }
  
  // Check OGV support
  if (video.canPlayType && video.canPlayType('video/ogg') !== '') {
    results.canPlayOGV = true;
    results.supportedFormats.push('OGV');
  }
  
  safeLog.log('📹 Browser video support:', results);
  
  // Test file input video accept
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'video/*';
  
  safeLog.log('📂 File input video support available:', input.accept === 'video/*');
  
  return results;
}

// Create a simple test video file
async function createTestVideoFile() {
  // Create a canvas with test pattern
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 240;
  const ctx = canvas.getContext('2d');
  
  // Create test pattern
  ctx.fillStyle = '#FF6B6B';
  ctx.fillRect(0, 0, 320, 240);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('TEST VIDEO', 160, 120);
  ctx.fillText(new Date().toLocaleTimeString(), 160, 150);
  
  // Convert to blob (using PNG as a test)
  const blob = await new Promise(resolve => {
    canvas.toBlob(resolve, 'image/png');
  });
  
  // Create file with video mime type for testing
  return new File([blob], `test-video-${Date.now()}.mp4`, { 
    type: 'video/mp4' 
  });
}

// Fix common video upload issues
async function fixVideoIssues() {
  safeLog.log('🔧 Attempting to fix video upload issues');
  
  try {
    // Check authentication
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User must be logged in');
    }
    
    safeLog.log('✅ User authenticated');
    
    // Test storage connection
    await testStorageConnection();
    safeLog.log('✅ Storage connection working');
    
    // Check storage rules by attempting a small upload
    const testFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    const uploadResult = await uploadMediaFilesSimple([{ file: testFile }], user.uid);
    
    safeLog.log('✅ Storage upload permissions working');
    safeLog.log('✅ All video upload components appear to be functioning');
    
    return {
      success: true,
      message: 'Video upload system appears to be working correctly'
    };
    
  } catch (error) {
    safeLog.error('❌ Found issues with video uploads:', error);
    
    let fixSuggestions = [];
    
    if (error.message.includes('auth')) {
      fixSuggestions.push('User needs to log in or refresh their authentication');
    }
    
    if (error.message.includes('storage')) {
      fixSuggestions.push('Firebase Storage configuration issue - check firebaseClient.js');
    }
    
    if (error.message.includes('permission')) {
      fixSuggestions.push('Storage rules may need to be updated and deployed');
    }
    
    return {
      success: false,
      error: error.message,
      suggestions: fixSuggestions
    };
  }
}

// Make utilities available globally for console debugging
window.debugVideoUploads = {
  testVideoUpload,
  testVideoDisplay,
  testVideoPostCreation,
  checkVideoSupport,
  fixVideoIssues,
  quickVideoTest
};

// Log available debugging functions
safeLog.log('🎬 Video upload debug tools loaded:');
safeLog.log('- quickVideoTest() - Fast diagnostic of video upload system');
safeLog.log('- testVideoUpload() - Test video file upload to Firebase Storage');
safeLog.log('- testVideoDisplay() - Check how videos are displayed in posts');
safeLog.log('- testVideoPostCreation() - Complete workflow test');
safeLog.log('- checkVideoSupport() - Check browser video support');
safeLog.log('- fixVideoIssues() - Diagnose and suggest fixes');

export {
  testVideoUpload,
  testVideoDisplay,
  testVideoPostCreation,
  checkVideoSupport,
  fixVideoIssues,
  quickVideoTest
};

export default {
  testVideoUpload,
  testVideoDisplay,
  testVideoPostCreation,
  checkVideoSupport,
  fixVideoIssues,
  quickVideoTest
};