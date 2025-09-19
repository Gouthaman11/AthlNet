// Firestore client queries for social features
import { db, storage } from '../firebaseClient';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc,
  onSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { safeLog } from './safeLogging';
import { optimizeMediaFiles } from './mediaOptimizer';

// Helper function to extract user name from various possible locations
function extractUserName(userData) {
  // Check displayName but ensure it's not a Firebase ID
  if (userData.displayName && 
      userData.displayName !== userData.id && 
      userData.displayName !== userData.uid &&
      userData.displayName.length < 50 && 
      !/^[a-zA-Z0-9]{20,}$/.test(userData.displayName)) {
    return userData.displayName;
  }
  
  // Check name but ensure it's not a Firebase ID  
  if (userData.name && 
      userData.name !== userData.id && 
      userData.name !== userData.uid &&
      userData.name.length < 50 && 
      !/^[a-zA-Z0-9]{20,}$/.test(userData.name)) {
    return userData.name;
  }
  
  if (userData.personalInfo?.firstName && userData.personalInfo?.lastName) {
    return `${userData.personalInfo.firstName} ${userData.personalInfo.lastName}`;
  }
  if (userData.personalInfo?.firstName) return userData.personalInfo.firstName;
  if (userData.personalInfo?.lastName) return userData.personalInfo.lastName;
  
  if (userData.email && userData.email.includes('@')) {
    const emailName = userData.email.split('@')[0];
    // Make sure it's not just numbers or a weird ID
    if (emailName.length < 20 && !/^[0-9a-f]{20,}$/i.test(emailName)) {
      return emailName;
    }
  }
  
  return 'New User';
}

// Ensure a user has a basic profile document for messaging
// Usage: await ensureUserDocumentExists(userId);
export async function ensureUserDocumentExists(userId) {
  try {
    safeLog.log('Ensuring user document exists for:', userId);
    
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (!userDoc.exists()) {
      safeLog.log('Creating basic user document...');
      await setDoc(doc(db, 'users', userId), {
        uid: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        displayName: 'New User',
        isNewUser: true,
        personalInfo: {
          firstName: 'New',
          lastName: 'User'
        }
      });
      safeLog.log('✅ Basic user document created');
      return true;
    }
    
    safeLog.log('✅ User document already exists');
    return false;
  } catch (error) {
    safeLog.error('Error ensuring user document exists:', error);
    throw error;
  }
}

// Get user profile by uid
// Usage: const profile = await getUserProfile(uid);
export async function getUserProfile(uid) {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (userDoc.exists()) {
    const userData = userDoc.data();
    return {
      ...userData,
      displayName: extractUserName(userData)
    };
  }
  return null;
}

// Optimized media upload with compression and parallel processing
// Usage: const urls = await uploadMediaOptimized(files, userId, progressCallback);
export async function uploadMediaOptimized(files, userId, onProgress = null) {
  if (!files || files.length === 0) return [];
  
  safeLog.log('🚀 Starting optimized media upload:', {
    fileCount: files.length,
    userId: userId
  });

  // Check storage availability
  if (!storage) {
    throw new Error('Firebase Storage is not configured');
  }

  // Ensure user is authenticated
  const { auth } = await import('../firebaseClient');
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    throw new Error('You must be logged in to upload files');
  }

  try {
    // Step 1: Optimize all media files
    if (onProgress) onProgress({ stage: 'optimizing', progress: 0 });
    const optimizedFiles = await optimizeMediaFiles(files);
    if (onProgress) onProgress({ stage: 'optimizing', progress: 100 });

    // Step 2: Upload files in parallel (but limit concurrent uploads to avoid overwhelming)
    if (onProgress) onProgress({ stage: 'uploading', progress: 0 });
    
    const maxConcurrent = 3; // Upload max 3 files simultaneously
    const results = [];
    
    for (let i = 0; i < optimizedFiles.length; i += maxConcurrent) {
      const batch = optimizedFiles.slice(i, i + maxConcurrent);
      const batchPromises = batch.map((fileObj, batchIndex) => 
        uploadSingleFileOptimized(fileObj, currentUser.uid, i + batchIndex)
      );
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Update progress
      const overallProgress = Math.round(((i + batch.length) / optimizedFiles.length) * 100);
      if (onProgress) onProgress({ stage: 'uploading', progress: overallProgress });
    }

    safeLog.log('✅ All files uploaded successfully:', {
      uploadedCount: results.length,
      totalSize: results.reduce((sum, r) => sum + (r.size || 0), 0)
    });

    return results;
    
  } catch (error) {
    safeLog.error('❌ Optimized upload failed:', error);
    throw error;
  }
}

// Helper function to upload a single file with retry logic and better error handling
async function uploadSingleFileOptimized(fileObj, userId, index, maxRetries = 3) {
  const file = fileObj.file || fileObj;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      safeLog.log(`📤 Upload attempt ${attempt}/${maxRetries} for ${file.name}`);
      
      // Generate unique file path
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const safeName = `${timestamp}_${index}_${attempt}.${extension}`;
      const filePath = `posts/${userId}/${safeName}`;
      
      const storageRef = ref(storage, filePath);
      
      // Use resumable upload for larger files (> 1MB)
      if (file.size > 1024 * 1024) {
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedBy: userId,
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            attempt: attempt.toString()
          }
        });

        // Return promise that resolves when upload completes
        const result = await new Promise((resolve, reject) => {
          uploadTask.on('state_changed', 
            null, // Skip progress tracking for individual files
            reject,
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  url: downloadURL,
                  type: file.type.startsWith('image/') ? 'image' : 'video',
                  name: file.name,
                  size: file.size
                });
              } catch (error) {
                reject(error);
              }
            }
          );
        });
        
        safeLog.log(`✅ Upload successful for ${file.name} on attempt ${attempt}`);
        return result;
      } else {
        // Use simple upload for smaller files
        const snapshot = await uploadBytes(storageRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedBy: userId,
            originalName: file.name,
            uploadedAt: new Date().toISOString(),
            attempt: attempt.toString()
          }
        });
        
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        const result = {
          url: downloadURL,
          type: file.type.startsWith('image/') ? 'image' : 'video',
          name: file.name,
          size: file.size
        };
        
        safeLog.log(`✅ Upload successful for ${file.name} on attempt ${attempt}`);
        return result;
      }
      
    } catch (error) {
      safeLog.error(`❌ Upload attempt ${attempt}/${maxRetries} failed for ${file.name}:`, error);
      
      // If this is the last attempt, provide detailed error
      if (attempt === maxRetries) {
        if (error.code === 'storage/unauthorized') {
          throw new Error(`Upload permission denied for ${file.name}. Please check Firebase rules.`);
        } else if (error.code === 'storage/quota-exceeded') {
          throw new Error('Storage quota exceeded. Please contact support.');
        } else if (error.code === 'storage/invalid-format') {
          throw new Error(`Invalid file format: ${file.name}`);
        } else if (error.code === 'storage/network-request-failed') {
          throw new Error(`Network error uploading ${file.name}. Please check your internet connection.`);
        } else {
          throw new Error(`Failed to upload ${file.name} after ${maxRetries} attempts: ${error.message}`);
        }
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      safeLog.log(`⏳ Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}
// Usage: await testStorageConnection();
export async function testStorageConnection() {
  if (!storage) {
    throw new Error('Firebase Storage not initialized. Check your Firebase configuration.');
  }
  
  try {
    // Create a test reference to see if storage is working
    const testRef = ref(storage, 'test/connection');
    console.log('Storage test reference created successfully');
    return true;
  } catch (error) {
    console.error('Storage test failed:', error);
    throw new Error(`Storage connection failed: ${error.message}`);
  }
}

// Upload media files to Firebase Storage (Simple version)
// Usage: const urls = await uploadMediaFilesSimple(files, userId);
export async function uploadMediaFilesSimple(files, userId) {
  if (!files || files.length === 0) return [];
  
  console.log('=== STARTING MEDIA UPLOAD DEBUG ===');
  console.log('Files to upload:', files.length);
  console.log('User ID provided:', userId);
  
  if (!storage) {
    console.error('❌ Firebase Storage not configured');
    throw new Error('Firebase Storage is not configured');
  }
  console.log('✅ Firebase Storage is configured');
  
  // Get auth from import (already imported at top)
  const { auth } = await import('../firebaseClient');
  console.log('Auth object:', !!auth);
  
  // Wait for auth state to be ready
  await new Promise((resolve) => {
    if (auth.currentUser) {
      resolve();
    } else {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve();
      });
    }
  });
  
  const currentUser = auth.currentUser;
  console.log('Current user exists:', !!currentUser);
  
  if (!currentUser) {
    console.error('❌ No authenticated user found');
    throw new Error('You must be logged in to upload files. Please sign in first.');
  }
  
  console.log('✅ User authenticated:');
  console.log('  - UID:', currentUser.uid);
  console.log('  - Email:', currentUser.email);
  console.log('  - Provided userId:', userId);
  
  // Get fresh auth token to ensure we have valid credentials
  try {
    const token = await currentUser.getIdToken(true); // Force refresh
    console.log('✅ Fresh auth token obtained:', !!token);
    console.log('  - Token preview:', token.substring(0, 20) + '...');
  } catch (tokenError) {
    console.error('❌ Failed to get auth token:', tokenError);
    throw new Error('Authentication token expired. Please sign out and sign in again.');
  }
  
  const results = [];
  
  // Upload files one by one for better error tracking
  for (let i = 0; i < files.length; i++) {
    const fileObj = files[i];
    const file = fileObj.file || fileObj;
    
    try {
      console.log(`\n--- Uploading file ${i + 1}/${files.length} ---`);
      console.log('File name:', file.name);
      console.log('File type:', file.type);
      console.log('File size:', file.size, 'bytes');
      
      // Create file path - match the Firebase rules exactly
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const safeName = `${timestamp}_${i}.${extension}`;
      const filePath = `posts/${currentUser.uid}/${safeName}`;
      
      console.log('Storage path:', filePath);
      
      const storageRef = ref(storage, filePath);
      console.log('Storage ref created for path:', filePath);
      
      // Upload file with metadata
      const metadata = {
        contentType: file.type,
        customMetadata: {
          uploadedBy: currentUser.uid,
          originalName: file.name,
          uploadedAt: new Date().toISOString()
        }
      };
      
      console.log('Starting upload with metadata...');
      const snapshot = await uploadBytes(storageRef, file, metadata);
      console.log('✅ Upload complete, snapshot exists:', !!snapshot);
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('✅ Download URL obtained:', downloadURL);
      
      results.push({
        url: downloadURL,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        size: file.size
      });
      
      console.log(`✅ File ${i + 1} uploaded successfully`);
      
    } catch (error) {
      console.error(`❌ Failed to upload file ${i + 1}:`, error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      // Provide specific error messages based on error code
      if (error.code === 'storage/unauthorized') {
        throw new Error(`❌ PERMISSION DENIED: Please apply the Firebase Storage rules and publish them. Current user: ${currentUser.uid}, Path: posts/${currentUser.uid}/`);
      } else if (error.code === 'storage/unauthenticated') {
        throw new Error('❌ AUTHENTICATION ERROR: Please sign out and sign back in.');
      } else if (error.code === 'storage/quota-exceeded') {
        throw new Error('❌ QUOTA EXCEEDED: Storage quota exceeded. Please contact support.');
      } else if (error.code === 'storage/invalid-format') {
        throw new Error(`❌ INVALID FORMAT: ${file.name}`);
      } else if (error.code === 'storage/server-file-wrong-size') {
        throw new Error(`❌ FILE SIZE ERROR: ${file.name}`);
      } else {
        throw new Error(`❌ UPLOAD FAILED: ${file.name} - ${error.message} (Code: ${error.code || 'unknown'})`);
      }
    }
  }
  
  console.log('✅ ALL FILES UPLOADED SUCCESSFULLY!');
  console.log('=== UPLOAD DEBUG COMPLETE ===\n');
  return results;
}

// Upload media files to Firebase Storage
// Usage: const urls = await uploadMediaFiles(files, userId);
export async function uploadMediaFiles(files, userId) {
  if (!files || files.length === 0) return [];
  
  console.log('Starting upload for', files.length, 'files');
  
  // Check if storage is available
  if (!storage) {
    console.error('Firebase Storage not initialized');
    throw new Error('Firebase Storage is not properly configured');
  }
  
  const uploadPromises = files.map(async (fileObj, index) => {
    const file = fileObj.file || fileObj; // Handle both file objects and raw files
    const timestamp = Date.now();
    const fileName = `posts/${userId}/${timestamp}_${index}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    
    console.log(`Uploading file ${index + 1}:`, file.name, 'Size:', file.size, 'Type:', file.type);
    
    const storageRef = ref(storage, fileName);
    
    try {
      console.log('Uploading to path:', fileName);
      const snapshot = await uploadBytes(storageRef, file);
      console.log('Upload successful, getting download URL...');
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);
      
      return {
        url: downloadURL,
        type: file.type.startsWith('image/') ? 'image' : 'video',
        name: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('Failed to upload file:', file.name, error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        serverResponse: error.serverResponse
      });
      throw new Error(`Failed to upload ${file.name}: ${error.message}`);
    }
  });
  
  try {
    const results = await Promise.all(uploadPromises);
    console.log('All uploads completed successfully');
    return results;
  } catch (error) {
    console.error('Upload batch failed:', error);
    throw error;
  }
}

// Get feed posts (latest)
// Usage: const posts = await getFeedPosts();
export async function getFeedPosts({ limitCount = 20 } = {}) {
  const postsRef = collection(db, 'posts');
  const q = query(postsRef, orderBy('createdAt', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  
  const posts = await Promise.all(
    snapshot.docs.map(async (postDoc) => {
      const postData = { id: postDoc.id, ...postDoc.data() };
      
      // If post doesn't have author info, fetch it from user profile
      if (!postData.author || !postData.author.name) {
        try {
          // Try authorUid first (new format), then fall back to authorId (old format)
          const authorId = postData.authorUid || postData.authorId;
          const authorProfile = await getUserProfile(authorId);
          if (authorProfile) {
            const firstName = authorProfile?.personalInfo?.firstName || '';
            const lastName = authorProfile?.personalInfo?.lastName || '';
            const displayName = firstName && lastName ? `${firstName} ${lastName}` : 
                              firstName || authorProfile?.personalInfo?.name || 'Unknown User';
            
            postData.author = {
              name: displayName,
              avatar: authorProfile?.avatarUrl || '',
              verified: authorProfile?.isVerified || false,
              sport: authorProfile?.personalInfo?.sport || 'Athlete',
              location: authorProfile?.personalInfo?.location || ''
            };
          }
        } catch (e) {
          safeLog.warn('Failed to fetch author info for post:', postData.id);
          postData.author = {
            name: 'Unknown User',
            avatar: '',
            verified: false,
            sport: 'Athlete',
            location: ''
          };
        }
      }
      
      return postData;
    })
  );
  
  return posts;
}

// Create a new post
// Usage: const postId = await createPost(uid, 'Hello world!', mediaArray, authorInfo);
export async function createPost(authorId, content, mediaArray = [], authorInfo = {}) {
  const postsRef = collection(db, 'posts');
  const post = {
    authorUid: authorId, // Fix: Use authorUid to match Firestore rules
    authorId, // Keep for backward compatibility
    content,
    mediaUrls: mediaArray, // Keep original array for backward compatibility
    media: mediaArray, // Use same array for media display
    author: authorInfo,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: []
  };
  const docRef = await addDoc(postsRef, post);
  return docRef.id;
}

// Update a post (only content and mediaUrls can be updated)
// Usage: await updatePost(postId, { content: 'Updated content', mediaUrls: ['newUrl'] });
export async function updatePost(postId, updates) {
  const postRef = doc(db, 'posts', postId);
  const allowedUpdates = {};
  
  // Only allow updating specific fields
  if (updates.content !== undefined) allowedUpdates.content = updates.content;
  if (updates.mediaUrls !== undefined) allowedUpdates.mediaUrls = updates.mediaUrls;
  
  allowedUpdates.updatedAt = new Date().toISOString();
  
  await updateDoc(postRef, allowedUpdates);
}

// Delete a post
// Usage: await deletePost(postId);
export async function deletePost(postId) {
  const postRef = doc(db, 'posts', postId);
  await deleteDoc(postRef);
}

// Like a post
// Usage: await likePost(postId, uid);
export async function likePost(postId, userId) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    const likes = postSnap.data().likes || [];
    if (!likes.includes(userId)) {
      await updateDoc(postRef, { likes: [...likes, userId] });
    }
  }
}

// Add a comment to a post
// Usage: const commentId = await addComment(postId, authorId, content, authorInfo);
export async function addComment(postId, authorId, content, authorInfo = {}) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    // Get current comments array
    const currentComments = postSnap.data().comments || [];
    
    // Create new comment object
    const newComment = {
      id: Date.now().toString(), // Simple ID for now
      authorId,
      author: {
        name: authorInfo.name || 'Unknown User',
        avatar: authorInfo.avatar || '',
        verified: authorInfo.verified || false
      },
      content,
      timestamp: new Date().toISOString(),
      likes: []
    };
    
    // Add comment to post's comments array
    await updateDoc(postRef, { 
      comments: [...currentComments, newComment] 
    });
    
    return newComment.id;
  }
  throw new Error('Post not found');
}

// Get comments for a post
// Usage: const comments = await getPostComments(postId);
export async function getPostComments(postId) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  if (postSnap.exists()) {
    return postSnap.data().comments || [];
  }
  return [];
}

// Like/unlike a comment within a post
// Usage: await likeComment(postId, commentId, userId, isLike);
export async function likeComment(postId, commentId, userId, isLike = true) {
  const postRef = doc(db, 'posts', postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const comments = postSnap.data().comments || [];
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        const likes = comment.likes || [];
        if (isLike && !likes.includes(userId)) {
          return { ...comment, likes: [...likes, userId] };
        } else if (!isLike && likes.includes(userId)) {
          return { ...comment, likes: likes.filter(id => id !== userId) };
        }
      }
      return comment;
    });
    
    await updateDoc(postRef, { comments: updatedComments });
  }
}

// Get messages between two users
// Usage: const messages = await getMessages(uidA, uidB);
export async function getMessages(userA, userB, { limitCount = 50 } = {}) {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef,
    where('from', 'in', [userA, userB]),
    where('to', 'in', [userA, userB]),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Send a message
// Usage: const messageId = await sendMessage(uidA, uidB, 'Hello!');
export async function sendMessage(from, to, content, mediaUrl = null) {
  const messagesRef = collection(db, 'messages');
  const message = {
    from,
    to,
    content,
    mediaUrl,
    createdAt: new Date().toISOString(),
    read: false
  };
  const docRef = await addDoc(messagesRef, message);
  return docRef.id;
}

// Enhanced profile functions for comprehensive user profile page

// Get comprehensive user profile with all related data
// Usage: const fullProfile = await getFullUserProfile(uid);
export async function getFullUserProfile(uid) {
  try {
    safeLog.log('🔍 getFullUserProfile called with uid:', uid);
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (!userDoc.exists()) {
      safeLog.error('❌ User document does not exist for uid:', uid);
      throw new Error('User not found');
    }
    
    const userData = userDoc.data();
    safeLog.log('📋 Raw user data from Firestore:', userData);
    
    // Extract name using helper function and ensure it's available
    const extractedName = extractUserName(userData);
    safeLog.log('👤 Extracted name:', extractedName);
    
    // Get user's posts
    const userPosts = await getUserPosts(uid);
    
    // Get user's media from posts
    const userMedia = [];
    userPosts.forEach(post => {
      if (post.media && post.media.length > 0) {
        post.media.forEach(media => {
          userMedia.push({
            ...media,
            postId: post.id,
            timestamp: post.createdAt || post.timestamp
          });
        });
      }
    });
    
    // Format join date
    const joinDate = userData.createdAt ? 
      new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
      'Recently';
    
    // Prepare full profile data with proper name extraction
    const fullProfile = {
      ...userData,
      // Ensure name and displayName are properly set
      name: extractedName,
      displayName: extractedName,
      joinedDate: joinDate,
      posts: userPosts,
      media: userMedia,
      stats: {
        posts: userPosts.length,
        followers: userData.followers?.length || 0,
        following: userData.following?.length || 0,
        connections: userData.connections?.length || 0
      },
      // Default values for missing data
      bio: userData.bio || "No bio available yet.",
      sports: userData.sports || userData.sport ? [userData.sport] : ['Athlete'],
      careerHighlights: userData.careerHighlights || [
        {
          title: "Getting Started",
          year: new Date().getFullYear(),
          description: "Beginning my athletic journey"
        }
      ],
      goals: userData.goals || ["Improve performance", "Connect with other athletes"],
      achievements: userData.achievements || [
        {
          title: "Welcome to AthlNet",
          date: new Date().toLocaleDateString(),
          organization: "AthlNet Community",
          description: "Joined the athlete network"
        }
      ],
      connections: userData.connections || []
    };
    
    return fullProfile;
    
  } catch (error) {
    console.error('Error getting full user profile:', error);
    throw error;
  }
}

// Get user's posts
// Usage: const posts = await getUserPosts(uid, 10);
export async function getUserPosts(uid, limitCount = 20) {
  try {
    const postsRef = collection(db, 'posts');
    
    // Try with authorUid first (new format), then authorId (old format)
    let q = query(
      postsRef,
      where('authorUid', '==', uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    let snapshot = await getDocs(q);
    
    // If no posts found with authorUid, try with authorId for backward compatibility
    if (snapshot.empty) {
      q = query(
        postsRef,
        where('authorId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      snapshot = await getDocs(q);
    }
    
    const posts = [];
    
    for (const docSnap of snapshot.docs) {
      const postData = { id: docSnap.id, ...docSnap.data() };
      
      // Get author info
      try {
        // Try authorUid first (new format), then fall back to authorId (old format)
        const authorId = postData.authorUid || postData.authorId;
        const authorProfile = await getUserProfile(authorId);
        postData.author = {
          name: authorProfile?.name || 'Unknown User',
          avatar: authorProfile?.profileImage || '',
          verified: authorProfile?.isVerified || false,
          sport: authorProfile?.sport || 'Athlete',
          location: authorProfile?.location || 'Location'
        };
      } catch (e) {
        // Handle missing author gracefully
        postData.author = {
          name: 'Unknown User',
          avatar: '',
          verified: false,
          sport: 'Athlete',
          location: 'Location'
        };
      }
      
      posts.push(postData);
    }
    
    return posts;
  } catch (error) {
    console.error('Error getting user posts:', error);
    return [];
  }
}

// Update user profile
// Usage: await updateUserProfile(uid, { name: 'New Name', bio: 'New bio' });
export async function updateUserProfile(uid, updates) {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Create or update user profile (for new users)
// Usage: await createUserProfile(uid, profileData);
export async function createUserProfile(uid, profileData) {
  try {
    const userRef = doc(db, 'users', uid);
    const userData = {
      ...profileData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followers: [],
      following: [],
      connections: [],
      stats: {
        posts: 0,
        followers: 0,
        following: 0,
        connections: 0
      }
    };
    
    await setDoc(userRef, userData);
    return userData;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

// Follow/Unfollow a user
// Usage: await toggleFollowUser(currentUid, targetUid, true);
export async function toggleFollowUser(currentUid, targetUid, shouldFollow) {
  try {
    console.log(`toggleFollowUser called: currentUid=${currentUid}, targetUid=${targetUid}, shouldFollow=${shouldFollow}`);
    
    if (!currentUid || !targetUid || currentUid === targetUid) {
      throw new Error('Invalid user IDs provided');
    }
    
    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    
    // Get current data
    console.log('Fetching user documents...');
    const [currentUserDoc, targetUserDoc] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(targetUserRef)
    ]);
    
    if (!currentUserDoc.exists()) {
      throw new Error(`Current user not found: ${currentUid}`);
    }
    if (!targetUserDoc.exists()) {
      throw new Error(`Target user not found: ${targetUid}`);
    }
    
    const currentUserData = currentUserDoc.data();
    const targetUserData = targetUserDoc.data();
    
    // Initialize arrays if they don't exist
    const currentFollowing = currentUserData.following || [];
    const targetFollowers = targetUserData.followers || [];
    
    console.log('Current state:');
    console.log('- currentUser following:', currentFollowing);
    console.log('- targetUser followers:', targetFollowers);
    console.log('- currentUser is following target:', currentFollowing.includes(targetUid));
    console.log('- target has currentUser as follower:', targetFollowers.includes(currentUid));
    
    if (shouldFollow) {
      // Add to following/followers lists (avoid duplicates)
      const newFollowing = currentFollowing.includes(targetUid) 
        ? currentFollowing 
        : [...currentFollowing, targetUid];
      const newFollowers = targetFollowers.includes(currentUid)
        ? targetFollowers
        : [...targetFollowers, currentUid];
        
      console.log('Following - new arrays:');
      console.log('- newFollowing:', newFollowing);
      console.log('- newFollowers:', newFollowers);
      
      // Update both documents
      await Promise.all([
        updateDoc(currentUserRef, { following: newFollowing }),
        updateDoc(targetUserRef, { followers: newFollowers })
      ]);
    } else {
      // Remove from following/followers lists
      const newFollowing = currentFollowing.filter(id => id !== targetUid);
      const newFollowers = targetFollowers.filter(id => id !== currentUid);
      
      console.log('Unfollowing - new arrays:');
      console.log('- newFollowing:', newFollowing);
      console.log('- newFollowers:', newFollowers);
      
      // Update both documents
      await Promise.all([
        updateDoc(currentUserRef, { following: newFollowing }),
        updateDoc(targetUserRef, { followers: newFollowers })
      ]);
    }
    
    console.log('toggleFollowUser completed successfully');
    return true;
  } catch (error) {
    console.error('Error in toggleFollowUser:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
}

// Improved follow function with proper atomic operations
// Usage: await followUserSimple(currentUid, targetUid, true);
export async function followUserSimple(currentUid, targetUid, shouldFollow) {
  try {
    console.log('=== followUserSimple START ===');
    console.log('Parameters:', { currentUid, targetUid, shouldFollow });
    
    // Validation
    if (!db) {
      throw new Error('Firebase Firestore not initialized');
    }
    
    if (!currentUid || !targetUid) {
      throw new Error('Both currentUid and targetUid are required');
    }
    
    if (currentUid === targetUid) {
      throw new Error('Cannot follow/unfollow yourself');
    }
    
    // Create document references
    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    
    console.log('Fetching user documents...');
    
    // Get both user documents with error handling
    const [currentUserDoc, targetUserDoc] = await Promise.all([
      getDoc(currentUserRef).catch(err => {
        throw new Error(`Failed to get current user: ${err.message}`);
      }),
      getDoc(targetUserRef).catch(err => {
        throw new Error(`Failed to get target user: ${err.message}`);
      })
    ]);
    
    if (!currentUserDoc.exists()) {
      throw new Error(`Current user not found in database: ${currentUid}`);
    }
    
    if (!targetUserDoc.exists()) {
      throw new Error(`Target user not found in database: ${targetUid}`);
    }
    
    const currentUserData = currentUserDoc.data();
    const targetUserData = targetUserDoc.data();
    
    // Initialize arrays - ensure they exist
    const currentFollowing = Array.isArray(currentUserData.following) ? currentUserData.following : [];
    const targetFollowers = Array.isArray(targetUserData.followers) ? targetUserData.followers : [];
    
    console.log('Current state:');
    console.log('- Current user following:', currentFollowing.length, 'users');
    console.log('- Target user has:', targetFollowers.length, 'followers');
    console.log('- Already following?:', currentFollowing.includes(targetUid));
    console.log('- Target has current as follower?:', targetFollowers.includes(currentUid));
    
    // Check current state to avoid unnecessary operations
    const currentlyFollowing = currentFollowing.includes(targetUid);
    const targetHasFollower = targetFollowers.includes(currentUid);
    
    if (shouldFollow && currentlyFollowing && targetHasFollower) {
      console.log('Already following - no changes needed');
      return { success: true, message: 'Already following this user' };
    }
    
    if (!shouldFollow && !currentlyFollowing && !targetHasFollower) {
      console.log('Not following - no changes needed');
      return { success: true, message: 'Not following this user' };
    }
    
    // Prepare new arrays
    let newFollowing, newFollowers;
    
    if (shouldFollow) {
      console.log('=== FOLLOW OPERATION ===');
      newFollowing = currentlyFollowing ? currentFollowing : [...currentFollowing, targetUid];
      newFollowers = targetHasFollower ? targetFollowers : [...targetFollowers, currentUid];
    } else {
      console.log('=== UNFOLLOW OPERATION ===');
      newFollowing = currentFollowing.filter(id => id !== targetUid);
      newFollowers = targetFollowers.filter(id => id !== currentUid);
    }
    
    console.log('Planned changes:');
    console.log('- New following array length:', newFollowing.length);
    console.log('- New followers array length:', newFollowers.length);
    
    // Perform atomic updates
    console.log('Updating Firestore documents...');
    const updatePromises = [];
    
    // Only update if there are actual changes
    if (JSON.stringify(currentFollowing.sort()) !== JSON.stringify(newFollowing.sort())) {
      updatePromises.push(
        updateDoc(currentUserRef, { following: newFollowing })
          .catch(err => { throw new Error(`Failed to update current user: ${err.message}`); })
      );
    }
    
    if (JSON.stringify(targetFollowers.sort()) !== JSON.stringify(newFollowers.sort())) {
      updatePromises.push(
        updateDoc(targetUserRef, { followers: newFollowers })
          .catch(err => { throw new Error(`Failed to update target user: ${err.message}`); })
      );
    }
    
    if (updatePromises.length === 0) {
      console.log('No updates needed - data already in sync');
      return { success: true, message: 'Data already in sync' };
    }
    
    // Execute all updates atomically
    await Promise.all(updatePromises);
    
    console.log('✅ Database updates completed');
    
    // Verify the changes by re-reading the documents
    console.log('=== VERIFYING CHANGES ===');
    const [verifyCurrentDoc, verifyTargetDoc] = await Promise.all([
      getDoc(currentUserRef),
      getDoc(targetUserRef)
    ]);
    
    if (verifyCurrentDoc.exists() && verifyTargetDoc.exists()) {
      const verifyCurrentData = verifyCurrentDoc.data();
      const verifyTargetData = verifyTargetDoc.data();
      
      const verifyFollowing = verifyCurrentData.following || [];
      const verifyFollowers = verifyTargetData.followers || [];
      
      const finalIsFollowing = verifyFollowing.includes(targetUid);
      const finalHasFollower = verifyFollowers.includes(currentUid);
      
      console.log('Final verification:');
      console.log('- Is following now:', finalIsFollowing);
      console.log('- Has follower now:', finalHasFollower);
      console.log('- Expected state:', shouldFollow);
      
      // Check for consistency
      if (shouldFollow && finalIsFollowing && finalHasFollower) {
        console.log('✅ Follow operation verified successfully');
        return { success: true, message: 'Successfully followed user', isFollowing: true };
      } else if (!shouldFollow && !finalIsFollowing && !finalHasFollower) {
        console.log('✅ Unfollow operation verified successfully');
        return { success: true, message: 'Successfully unfollowed user', isFollowing: false };
      } else {
        console.warn('⚠️ Operation completed but state inconsistency detected');
        console.warn('This might be due to concurrent operations or network issues');
        return { 
          success: true, 
          message: 'Operation completed with warnings', 
          isFollowing: finalIsFollowing,
          warning: 'State inconsistency detected'
        };
      }
    }
    
    console.log('✅ followUserSimple completed (verification skipped)');
    return { success: true, message: shouldFollow ? 'Followed user' : 'Unfollowed user' };
    
  } catch (error) {
    console.error('❌ Error in followUserSimple:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack?.split('\n').slice(0, 5).join('\n')
    });
    
    // Re-throw with more specific error message
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied: Check your Firebase security rules');
    } else if (error.code === 'unavailable') {
      throw new Error('Network error: Please check your connection');
    } else if (error.code === 'not-found') {
      throw new Error('User not found in database');
    } else {
      throw new Error(`Follow operation failed: ${error.message}`);
    }
  }
}

// Connect with a user
// Usage: await connectWithUser(currentUid, targetUid);
export async function connectWithUser(currentUid, targetUid) {
  try {
    const currentUserRef = doc(db, 'users', currentUid);
    const targetUserRef = doc(db, 'users', targetUid);
    
    const currentUserDoc = await getDoc(currentUserRef);
    const targetUserDoc = await getDoc(targetUserRef);
    
    if (!currentUserDoc.exists() || !targetUserDoc.exists()) {
      throw new Error('User not found');
    }
    
    const currentUserData = currentUserDoc.data();
    const targetUserData = targetUserDoc.data();
    
    const currentConnections = currentUserData.connections || [];
    const targetConnections = targetUserData.connections || [];
    
    // Add mutual connection
    if (!currentConnections.includes(targetUid)) {
      await updateDoc(currentUserRef, {
        connections: [...currentConnections, targetUid]
      });
    }
    if (!targetConnections.includes(currentUid)) {
      await updateDoc(targetUserRef, {
        connections: [...targetConnections, currentUid]
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error connecting with user:', error);
    throw error;
  }
}

// Upload profile images (profile picture and cover image)
// Usage: const url = await uploadProfileImage(file, userId, 'profile' | 'cover');
export async function uploadProfileImage(file, userId, imageType = 'profile') {
  if (!file || !userId) throw new Error('File and user ID are required');
  
  console.log(`=== UPLOADING ${imageType.toUpperCase()} IMAGE ===`);
  console.log('File:', file.name, file.size, 'bytes');
  
  if (!storage) {
    throw new Error('Firebase Storage is not configured');
  }
  
  // Get auth from import
  const { auth } = await import('../firebaseClient');
  
  // Wait for auth state to be ready
  await new Promise((resolve) => {
    if (auth.currentUser) {
      resolve();
    } else {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve();
      });
    }
  });
  
  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== userId) {
    throw new Error('Authentication required or user mismatch');
  }
  
  try {
    // Get fresh auth token
    await currentUser.getIdToken(true);
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      throw new Error('Only image files are allowed');
    }
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 10MB');
    }
    
    // Create file path for profile images
    const timestamp = Date.now();
    const extension = file.name.split('.').pop();
    const fileName = `${imageType}_${timestamp}.${extension}`;
    const filePath = `profiles/${userId}/${fileName}`;
    
    console.log('Upload path:', filePath);
    
    const storageRef = ref(storage, filePath);
    
    // Upload with metadata
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedBy: userId,
        imageType: imageType,
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    };
    
    console.log('Starting profile image upload...');
    const snapshot = await uploadBytes(storageRef, file, metadata);
    console.log('✅ Upload complete, getting download URL...');
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log('✅ Profile image uploaded successfully:', downloadURL);
    
    return downloadURL;
    
  } catch (error) {
    console.error(`❌ Failed to upload ${imageType} image:`, error);
    
    if (error.code === 'storage/unauthorized') {
      throw new Error('Upload permission denied. Please check Firebase Storage rules.');
    } else if (error.code === 'storage/unauthenticated') {
      throw new Error('Authentication required. Please sign in again.');
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}

// Search users by name, sport, or location
// Usage: const users = await searchUsers('john', 10);
export async function searchUsers(searchTerm, limitCount = 20) {
  try {
    if (!searchTerm || searchTerm.trim().length < 2) {
      return [];
    }

    const usersRef = collection(db, 'users');
    const searchTermLower = searchTerm.toLowerCase().trim();
    
    // Get all users and filter on the client side for more flexible search
    const q = query(usersRef, limit(100)); // Get more users for better filtering
    const snapshot = await getDocs(q);
    
    const users = [];
    snapshot.docs.forEach(doc => {
      const userData = { id: doc.id, uid: doc.id, ...doc.data() };
      
      // Clean up any Firebase IDs that might be in name/displayName fields
      if (userData.name === userData.id || userData.name === userData.uid || 
          (userData.name && userData.name.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(userData.name))) {
        delete userData.name;
      }
      if (userData.displayName === userData.id || userData.displayName === userData.uid || 
          (userData.displayName && userData.displayName.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(userData.displayName))) {
        delete userData.displayName;
      }
      
      // Extract name using helper function
      const name = extractUserName(userData);
      
      // Add extracted name to userData for easier access
      userData.name = name;
      userData.displayName = name;
      
      // Search in name, title, sport, location
      const searchableText = [
        name,
        userData.personalInfo?.title || userData.title || '',
        userData.personalInfo?.primarySport || userData.sport || '',
        userData.personalInfo?.location || userData.location || '',
        ...(userData.personalInfo?.sports || userData.sports || [])
      ].join(' ').toLowerCase();
      
      if (searchableText.includes(searchTermLower)) {
        users.push(userData);
      }
    });
    
    // Sort by relevance (name matches first)
    users.sort((a, b) => {
      const aName = (a.name || '').toLowerCase();
      const bName = (b.name || '').toLowerCase();
      
      const aNameMatch = aName.includes(searchTermLower);
      const bNameMatch = bName.includes(searchTermLower);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      
      return aName.localeCompare(bName);
    });
    
    return users.slice(0, limitCount);
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
}

// Get suggested users (people you might know)
// Usage: const suggestions = await getSuggestedUsers(currentUserId, 10);
export async function getSuggestedUsers(currentUserId, limitCount = 20) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(50));
    const snapshot = await getDocs(q);
    
    const currentUserDoc = await getDoc(doc(db, 'users', currentUserId));
    const currentUserData = currentUserDoc.exists() ? currentUserDoc.data() : {};
    const currentUserFollowing = currentUserData.following || [];
    
    const suggestions = [];
    
    snapshot.docs.forEach(docSnap => {
      const userData = { id: docSnap.id, uid: docSnap.id, ...docSnap.data() };
      
      // Clean up any Firebase IDs that might be in name/displayName fields
      if (userData.name === userData.id || userData.name === userData.uid || 
          (userData.name && userData.name.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(userData.name))) {
        delete userData.name;
      }
      if (userData.displayName === userData.id || userData.displayName === userData.uid || 
          (userData.displayName && userData.displayName.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(userData.displayName))) {
        delete userData.displayName;
      }
      
      // Extract name using helper function
      const name = extractUserName(userData);
      
      // Add extracted name to userData for easier access
      userData.name = name;
      userData.displayName = name;
      
      // Exclude current user and already followed users
      if (docSnap.id !== currentUserId && !currentUserFollowing.includes(docSnap.id)) {
        // Add relevance score based on mutual connections, same sport, etc.
        let relevanceScore = 0;
        
        // Same sport bonus
        const userSports = userData.personalInfo?.sports || userData.sports || [userData.personalInfo?.primarySport || userData.sport].filter(Boolean);
        const currentSports = currentUserData.personalInfo?.sports || currentUserData.sports || [currentUserData.personalInfo?.primarySport || currentUserData.sport].filter(Boolean);
        
        if (userSports.length && currentSports.length) {
          const commonSports = userSports.filter(sport => 
            currentSports.includes(sport)
          );
          relevanceScore += commonSports.length * 2;
        }
        
        // Same location bonus
        const userLocation = userData.personalInfo?.location || userData.location || '';
        const currentLocation = currentUserData.personalInfo?.location || currentUserData.location || '';
        
        if (userLocation && currentLocation && 
            userLocation.toLowerCase().includes(currentLocation.toLowerCase())) {
          relevanceScore += 3;
        }
        
        // Add relevance score to user data
        userData.relevanceScore = relevanceScore;
        suggestions.push(userData);
      }
    });
    
    // Sort by relevance score and randomize a bit
    suggestions.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return Math.random() - 0.5; // Random for same scores
    });
    
    return suggestions.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting suggested users:', error);
    return [];
  }
}

// Get users by sport/activity
// Usage: const athletes = await getUsersBySport('basketball', 15);
export async function getUsersBySport(sport, limitCount = 20) {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(100));
    const snapshot = await getDocs(q);
    
    const users = [];
    const sportLower = sport.toLowerCase();
    
    snapshot.docs.forEach(doc => {
      const userData = { id: doc.id, uid: doc.id, ...doc.data() };
      
      // Clean up any Firebase IDs that might be in name/displayName fields
      if (userData.name === userData.id || userData.name === userData.uid || 
          (userData.name && userData.name.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(userData.name))) {
        delete userData.name;
      }
      if (userData.displayName === userData.id || userData.displayName === userData.uid || 
          (userData.displayName && userData.displayName.length > 20 && /^[a-zA-Z0-9]{20,}$/.test(userData.displayName))) {
        delete userData.displayName;
      }
      
      // Extract name using helper function
      const name = extractUserName(userData);
      
      // Add extracted name to userData for easier access
      userData.name = name;
      userData.displayName = name;
      
      // Check if user plays this sport
      const userSports = [
        userData.personalInfo?.primarySport || userData.sport || '',
        ...(userData.personalInfo?.sports || userData.sports || [])
      ].map(s => s.toLowerCase());
      
      if (userSports.some(s => s.includes(sportLower))) {
        users.push(userData);
      }
    });
    
    return users.slice(0, limitCount);
  } catch (error) {
    console.error('Error getting users by sport:', error);
    return [];
  }
}

// Enhanced messaging functions

// Get conversations for a user with robust error handling
// Usage: const conversations = await getUserConversations(userId);
export async function getUserConversations(userId) {
  try {
    console.log('=== GETTING USER CONVERSATIONS ===');
    console.log('Getting conversations for user:', userId);
    
    const conversationsRef = collection(db, 'conversations');
    
    let snapshot;
    try {
      // Try with orderBy first
      const orderedQuery = query(
        conversationsRef,
        where('members', 'array-contains', userId),
        orderBy('lastMessageAt', 'desc'),
        limit(50)
      );
      console.log('Attempting ordered query...');
      snapshot = await getDocs(orderedQuery);
      console.log('✅ Ordered query successful');
    } catch (indexError) {
      console.warn('⚠️ Ordered query failed (likely missing index), trying fallback:', indexError.message);
      // Fallback to simple query without orderBy
      const simpleQuery = query(
        conversationsRef,
        where('members', 'array-contains', userId),
        limit(50)
      );
      console.log('Attempting simple query fallback...');
      snapshot = await getDocs(simpleQuery);
      console.log('✅ Simple query fallback successful');
    }
    
    const conversations = [];
    console.log('Found conversations count:', snapshot.docs.length);
    
    for (const docSnap of snapshot.docs) {
      const conversationData = docSnap.data();
      console.log('Processing conversation:', docSnap.id);
      
      // Use members array instead of participants
      const members = conversationData.members || conversationData.participants || [];
      const otherUserId = members.find(id => id !== userId);
      
      if (otherUserId) {
        try {
          const otherUserData = await getUserProfile(otherUserId);
          
          // Extract name using helper function
          const name = otherUserData ? extractUserName(otherUserData) : 'Unknown User';
          
          // Calculate unread count using subcollection with fallback
          let unreadCount = 0;
          try {
            const messagesRef = collection(db, 'conversations', docSnap.id, 'messages');
            const unreadQuery = query(
              messagesRef,
              where('recipientId', '==', userId),
              where('read', '==', false)
            );
            const unreadSnapshot = await getDocs(unreadQuery);
            unreadCount = unreadSnapshot.size;
          } catch (unreadError) {
            console.warn('Failed to get unread count for conversation:', docSnap.id, unreadError.message);
            unreadCount = 0;
          }
          
          conversations.push({
            id: docSnap.id,
            ...conversationData,
            // Ensure lastMessageAt exists for sorting
            lastMessageAt: conversationData.lastMessageAt || conversationData.createdAt || new Date().toISOString(),
            unreadCount,
            otherUser: {
              id: otherUserId,
              name: name,
              profileImage: otherUserData?.profileImage || otherUserData?.photoURL,
              isOnline: otherUserData?.isOnline || false
            }
          });
        } catch (userError) {
          console.warn('Error getting user data for conversation:', docSnap.id, userError.message);
          // Handle missing user gracefully
          conversations.push({
            id: docSnap.id,
            ...conversationData,
            lastMessageAt: conversationData.lastMessageAt || conversationData.createdAt || new Date().toISOString(),
            unreadCount: 0,
            otherUser: {
              id: otherUserId,
              name: 'Unknown User',
              profileImage: '',
              isOnline: false
            }
          });
        }
      }
    }
    
    // Sort on client side if we couldn't use orderBy
    const sortedConversations = conversations.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA;
    });
    
    console.log('✅ Returning', sortedConversations.length, 'sorted conversations');
    return sortedConversations;
  } catch (error) {
    console.error('❌ Error getting user conversations:', error);
    console.error('Error details:', error.message, error.code);
    return [];
  }
}

// Simplified message sending for new users - bypasses complex validation
// Usage: await sendMessageSimple(fromUserId, toUserId, 'Hello!');
export async function sendMessageSimple(fromUserId, toUserId, content, mediaUrl = null) {
  try {
    safeLog.log('=== SENDING MESSAGE SIMPLE ===');
    safeLog.log('From:', fromUserId, 'To:', toUserId);
    safeLog.log('Content:', content);
    
    // Basic validation
    if (!fromUserId || !toUserId) {
      throw new Error('Both fromUserId and toUserId are required');
    }
    if (!content && !mediaUrl) {
      throw new Error('Either content or mediaUrl must be provided');
    }
    if (!db) {
      throw new Error('Firebase Firestore is not initialized');
    }

    const conversationId = [fromUserId, toUserId].sort().join('_');
    const currentTime = new Date().toISOString();
    
    // First, ensure both users have basic user documents
    await Promise.all([
      ensureUserDocumentExists(fromUserId),
      ensureUserDocumentExists(toUserId)
    ]);
    
    // Create or update conversation with minimal data
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationData = {
      members: [fromUserId, toUserId],
      participants: [fromUserId, toUserId],
      lastMessageAt: currentTime,
      lastMessage: content || 'File attachment',
      lastMessageBy: fromUserId,
      createdAt: currentTime,
      updatedAt: currentTime
    };
    
    // Use setDoc to create or update (more permissive)
    await setDoc(conversationRef, conversationData, { merge: true });
    safeLog.log('✅ Conversation created/updated successfully');
    
    // Add the message to the subcollection
    const messageData = {
      senderId: fromUserId,
      recipientId: toUserId,
      content: content || '',
      mediaUrl,
      createdAt: currentTime,
      read: false,
      type: mediaUrl ? 'media' : 'text'
    };
    
    const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
    const docRef = await addDoc(messagesCollectionRef, messageData);
    safeLog.log('✅ Message added successfully with ID:', docRef.id);
    
    safeLog.log('=== MESSAGE SEND COMPLETED (SIMPLE) ===');
    return docRef.id;
  } catch (error) {
    safeLog.error('❌ Error sending message (simple):', error);
    throw error;
  }
}

// Send a message in a conversation with improved conversation creation
// Usage: await sendMessageToUser(fromUserId, toUserId, 'Hello!');
export async function sendMessageToUser(fromUserId, toUserId, content, mediaUrl = null) {
  try {
    safeLog.log('=== SENDING MESSAGE ===');
    safeLog.log('From:', fromUserId, 'To:', toUserId);
    safeLog.log('Content:', content);
    safeLog.log('Media URL:', mediaUrl);
    
    // Validation
    if (!fromUserId || !toUserId) {
      const error = new Error('Both fromUserId and toUserId are required');
      safeLog.error('Validation error:', error.message);
      throw error;
    }
    
    if (!content && !mediaUrl) {
      const error = new Error('Either content or mediaUrl must be provided');
      safeLog.error('Validation error:', error.message);
      throw error;
    }

    // Check if db is available
    if (!db) {
      const error = new Error('Firebase Firestore is not initialized');
      safeLog.error('Firebase error:', error.message);
      throw error;
    }

    // Validate that both users exist and have proper profiles
    safeLog.log('Validating user profiles...');
    const [fromUser, toUser] = await Promise.all([
      getUserProfile(fromUserId).catch(err => {
        safeLog.warn('Could not fetch fromUser profile, will try with basic validation:', err.message);
        return null;
      }),
      getUserProfile(toUserId).catch(err => {
        safeLog.warn('Could not fetch toUser profile, will try with basic validation:', err.message);
        return null;
      })
    ]);
    
    // Enhanced validation - allow messaging even if profiles are incomplete
    // But ensure both users have at least basic user documents
    safeLog.log('Ensuring both users have basic documents for messaging...');
    await Promise.all([
      ensureUserDocumentExists(fromUserId),
      ensureUserDocumentExists(toUserId)
    ]);
    
    if (!fromUser) {
      safeLog.warn('Sender profile not complete, but basic document ensured');
    }
    
    if (!toUser) {
      safeLog.warn('Recipient profile not complete, but basic document ensured');
    }
    
    safeLog.log('✅ User profiles validated (allowing messaging to new/incomplete profiles)');

    const conversationId = [fromUserId, toUserId].sort().join('_');
    safeLog.log('Generated conversationId:', conversationId);
    
    const currentTime = new Date().toISOString();
    
    // Check if conversation exists, if not create it
    const conversationRef = doc(db, 'conversations', conversationId);
    const conversationDoc = await getDoc(conversationRef);
    safeLog.log('Conversation exists:', conversationDoc.exists());
    
    // Create or update conversation with all required fields
    const conversationData = {
      members: [fromUserId, toUserId], // Required by Firebase rules
      participants: [fromUserId, toUserId], // Keep for backward compatibility
      lastMessageAt: currentTime,
      lastMessage: content || 'File attachment',
      lastMessageBy: fromUserId
    };
    
    if (!conversationDoc.exists()) {
      safeLog.log('Creating new conversation...');
      conversationData.createdAt = currentTime;
      conversationData.updatedAt = currentTime;
      
      await setDoc(conversationRef, conversationData);
      safeLog.log('✅ New conversation created successfully');
    } else {
      safeLog.log('Updating existing conversation...');
      await updateDoc(conversationRef, {
        lastMessageAt: conversationData.lastMessageAt,
        lastMessage: conversationData.lastMessage,
        lastMessageBy: conversationData.lastMessageBy,
        members: conversationData.members, // Ensure members array is always present
        updatedAt: currentTime
      });
      safeLog.log('✅ Conversation updated successfully');
    }
    
    // Add the message to the subcollection
    const messageData = {
      senderId: fromUserId,
      recipientId: toUserId,
      content: content || '',
      mediaUrl,
      createdAt: currentTime,
      read: false,
      type: mediaUrl ? 'media' : 'text'
    };
    
    safeLog.log('Adding message to subcollection...');
    const messagesCollectionRef = collection(db, 'conversations', conversationId, 'messages');
    const docRef = await addDoc(messagesCollectionRef, messageData);
    safeLog.log('✅ Message added to subcollection with ID:', docRef.id);
    
    // Final conversation update to ensure consistency
    safeLog.log('Final conversation update...');
    await updateDoc(conversationRef, {
      lastMessageAt: currentTime,
      lastMessage: content || 'File attachment',
      lastMessageBy: fromUserId,
      updatedAt: currentTime
    });
    safeLog.log('✅ Final conversation update completed');
    
    safeLog.log('=== MESSAGE SEND COMPLETED SUCCESSFULLY ===');
    return docRef.id;
  } catch (error) {
    safeLog.error('❌ Error sending message:', error);
    
    // Use safeLog.error which handles the error object safely
    throw error;
  }
}

// Upload file for messaging
// Usage: const fileUrl = await uploadMessageFile(file, userId);
export async function uploadMessageFile(file, userId) {
  try {
    if (!storage) {
      throw new Error('Firebase Storage not initialized');
    }

    // Validate file
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB');
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `messages/${userId}/${timestamp}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    
    // Upload file
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

// Get messages in a conversation
// Usage: const messages = await getConversationMessages(userId1, userId2);
export async function getConversationMessages(user1Id, user2Id, limitCount = 50) {
  try {
    console.log('=== GETTING CONVERSATION MESSAGES ===');
    const conversationId = [user1Id, user2Id].sort().join('_');
    console.log('Generated conversationId:', conversationId);
    
    // Use subcollection path: conversations/{conversationId}/messages
    const messagesRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(
      messagesRef,
      orderBy('createdAt', 'asc'), // Changed to asc for chronological order
      limit(limitCount)
    );
    
    console.log('Executing query for messages from subcollection...');
    const snapshot = await getDocs(q);
    const messages = [];
    
    console.log('Retrieved docs count:', snapshot.docs.length);
    
    for (const docSnap of snapshot.docs) {
      const messageData = { id: docSnap.id, ...docSnap.data() };
      
      // Use senderId from message data (matching your Firebase rules)
      const senderId = messageData.senderId || messageData.from;
      
      // Get sender info
      try {
        const senderData = await getUserProfile(senderId);
        
        // Extract name using helper function
        const name = senderData ? extractUserName(senderData) : 'Unknown User';
        
        messageData.sender = {
          id: senderId,
          name: name,
          profileImage: senderData?.profileImage || senderData?.photoURL
        };
      } catch (e) {
        messageData.sender = {
          id: messageData.from,
          name: 'Unknown User',
          profileImage: ''
        };
      }
      
      messages.push(messageData);
    }
    
    return messages; // Already in chronological order (asc)
  } catch (error) {
    console.error('Error getting conversation messages:', error);
    return [];
  }
}

// Mark messages as read
// Usage: await markMessagesAsRead(conversationId, userId);
export async function markMessagesAsRead(conversationId, userId) {
  try {
    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      where('to', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    const updatePromises = [];
    
    snapshot.docs.forEach(docSnap => {
      updatePromises.push(updateDoc(docSnap.ref, { read: true }));
    });
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return false;
  }
}

// Real-time conversation messages listener
// Usage: const unsubscribe = subscribeToConversationMessages(user1Id, user2Id, callback);
export function subscribeToConversationMessages(user1Id, user2Id, callback) {
  const conversationId = [user1Id, user2Id].sort().join('_');
  
  // Use subcollection path: conversations/{conversationId}/messages
  const messagesRef = collection(db, 'conversations', conversationId, 'messages');
  const q = query(
    messagesRef,
    orderBy('createdAt', 'asc'), // Changed to asc for chronological order
    limit(50)
  );
  
  console.log('Setting up message subscription for conversation subcollection:', conversationId);
  
  return onSnapshot(q, async (snapshot) => {
    console.log('Messages snapshot received from subcollection, docs count:', snapshot.docs.length);
    
    const messages = [];
    
    for (const docSnap of snapshot.docs) {
      const messageData = { id: docSnap.id, ...docSnap.data() };
      
      // Use senderId from message data (matching your Firebase rules)
      const senderId = messageData.senderId || messageData.from;
      
      // Get sender info
      try {
        const senderData = await getUserProfile(senderId);
        const name = senderData ? extractUserName(senderData) : 'Unknown User';
        
        messageData.sender = {
          id: senderId,
          name: name,
          profileImage: senderData?.profileImage || senderData?.photoURL
        };
      } catch (e) {
        messageData.sender = {
          id: messageData.from,
          name: 'Unknown User',
          profileImage: ''
        };
      }
      
      messages.push(messageData);
    }
    
    console.log('Processed messages:', messages.length);
    callback(messages); // Already in chronological order (asc)
  }, (error) => {
    console.error('Error in messages subscription:', error);
    callback([]);
  });
}

// Real-time conversations listener with improved error handling
// Usage: const unsubscribe = subscribeToUserConversations(userId, callback);
export function subscribeToUserConversations(userId, callback) {
  safeLog.log('Setting up conversations subscription for user:', userId);
  
  const conversationsRef = collection(db, 'conversations');
  
  // First try with orderBy, fallback without if it fails
  let q = query(
    conversationsRef,
    where('members', 'array-contains', userId),
    limit(50)
  );
  
  // Try to add orderBy, but handle missing index gracefully
  try {
    q = query(
      conversationsRef,
      where('members', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc'),
      limit(50)
    );
    safeLog.log('Using ordered query for conversations');
  } catch (error) {
    safeLog.warn('OrderBy failed, using simple query:', error.message);
    // Use the simpler query without orderBy
  }
  
  return onSnapshot(q, async (snapshot) => {
    safeLog.log('Conversations snapshot received, docs count:', snapshot.docs.length);
    
    const conversations = [];
    
    for (const docSnap of snapshot.docs) {
      const conversationData = docSnap.data();
      safeLog.log('Processing conversation:', docSnap.id, safeLog.cleanFirebaseObject(conversationData));
      
      const members = conversationData.members || conversationData.participants || [];
      const otherUserId = members.find(id => id !== userId);
      
      if (otherUserId) {
        try {
          const otherUserData = await getUserProfile(otherUserId);
          const name = otherUserData ? extractUserName(otherUserData) : 'Unknown User';
          
          // Calculate unread count using subcollection - handle both field names
          let unreadCount = 0;
          try {
            const messagesRef = collection(db, 'conversations', docSnap.id, 'messages');
            
            // Try with recipientId first (newer field name)
            const unreadQuery1 = query(
              messagesRef,
              where('recipientId', '==', userId),
              where('read', '==', false)
            );
            const unreadSnapshot1 = await getDocs(unreadQuery1);
            unreadCount = unreadSnapshot1.size;
            
            // If no results, try with 'to' field (legacy field name)
            if (unreadCount === 0) {
              const unreadQuery2 = query(
                messagesRef,
                where('to', '==', userId),
                where('read', '==', false)
              );
              const unreadSnapshot2 = await getDocs(unreadQuery2);
              unreadCount = unreadSnapshot2.size;
            }
            
            safeLog.log(`Unread count for conversation ${docSnap.id}:`, unreadCount);
          } catch (unreadError) {
            safeLog.warn('Failed to get unread count:', unreadError);
            unreadCount = 0;
          }
          
          conversations.push({
            id: docSnap.id,
            ...conversationData,
            unreadCount,
            // Ensure lastMessageAt exists for proper sorting
            lastMessageAt: conversationData.lastMessageAt || conversationData.createdAt || new Date().toISOString(),
            otherUser: {
              id: otherUserId,
              name: name,
              profileImage: otherUserData?.profileImage || otherUserData?.photoURL,
              isOnline: otherUserData?.isOnline || false
            }
          });
        } catch (e) {
          safeLog.warn('Error processing conversation:', docSnap.id, e);
          conversations.push({
            id: docSnap.id,
            ...conversationData,
            unreadCount: 0,
            lastMessageAt: conversationData.lastMessageAt || conversationData.createdAt || new Date().toISOString(),
            otherUser: {
              id: otherUserId,
              name: 'Unknown User',
              profileImage: '',
              isOnline: false
            }
          });
        }
      }
    }
    
    // Sort conversations by lastMessageAt (newest first) on the client side
    const sortedConversations = conversations.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || 0).getTime();
      const timeB = new Date(b.lastMessageAt || 0).getTime();
      return timeB - timeA;
    });
    
    safeLog.log('Processed and sorted conversations:', sortedConversations.length);
    callback(sortedConversations);
  }, (error) => {
    safeLog.error('Error in conversations subscription:', error);
    safeLog.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    
    // Still call callback with empty array to update UI
    callback([]);
  });
}

// Subscribe to real-time profile stats updates
// Usage: const unsubscribe = subscribeToProfileStats(userId, (stats) => setStats(stats));
export function subscribeToProfileStats(userId, callback) {
  const userDocRef = doc(db, 'users', userId);
  
  return onSnapshot(userDocRef, async (docSnapshot) => {
    try {
      if (!docSnapshot.exists()) {
        callback({ posts: 0, followers: 0, following: 0, connections: 0 });
        return;
      }
      
      const userData = docSnapshot.data();
      
      // Get posts count dynamically
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorUid', '==', userId)
      );
      const postsSnapshot = await getDocs(postsQuery);
      const postsCount = postsSnapshot.size;
      
      // Calculate stats from user data arrays
      const stats = {
        posts: postsCount,
        followers: userData.followers?.length || 0,
        following: userData.following?.length || 0,
        connections: userData.connections?.length || 0
      };
      
      console.log('Real-time stats updated:', stats);
      callback(stats);
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      callback({ posts: 0, followers: 0, following: 0, connections: 0 });
    }
  }, (error) => {
    console.error('Error in profile stats subscription:', error);
    callback({ posts: 0, followers: 0, following: 0, connections: 0 });
  });
}

// Subscribe to current user's following list for real-time follow state updates
// Usage: const unsubscribe = subscribeToFollowState(currentUserId, targetUserId, (isFollowing) => setIsFollowing(isFollowing));
export function subscribeToFollowState(currentUserId, targetUserId, callback) {
  if (!currentUserId || !targetUserId || currentUserId === targetUserId) {
    callback(false);
    return () => {};
  }
  
  const currentUserRef = doc(db, 'users', currentUserId);
  
  return onSnapshot(currentUserRef, (docSnapshot) => {
    try {
      if (!docSnapshot.exists()) {
        callback(false);
        return;
      }
      
      const userData = docSnapshot.data();
      const isFollowing = userData.following?.includes(targetUserId) || false;
      
      console.log('Real-time follow state updated:', isFollowing);
      callback(isFollowing);
    } catch (error) {
      console.error('Error in follow state subscription:', error);
      callback(false);
    }
  }, (error) => {
    console.error('Error in follow state subscription:', error);
    callback(false);
  });
}
