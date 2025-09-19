// Media optimization utilities for better upload performance
import { safeLog } from './safeLogging';

/**
 * Compress and resize image files before upload
 */
export async function optimizeImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
  return new Promise((resolve) => {
    // Don't process non-image files
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    // Skip if file is already small enough (under 500KB)
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const aspectRatio = width / height;
        
        if (width > height) {
          width = Math.min(width, maxWidth);
          height = width / aspectRatio;
        } else {
          height = Math.min(height, maxHeight);
          width = height * aspectRatio;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create optimized file
            const optimizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            
            safeLog.log('📷 Image optimized:', {
              originalSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
              newSize: `${(optimizedFile.size / 1024 / 1024).toFixed(2)}MB`,
              reduction: `${(100 - (optimizedFile.size / file.size) * 100).toFixed(1)}%`,
              dimensions: `${width}x${height}`
            });
            
            resolve(optimizedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Optimize video files by checking size and providing compression suggestions
 */
export async function optimizeVideo(file, maxSizeMB = 50) {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      resolve(file);
      return;
    }

    const fileSizeMB = file.size / 1024 / 1024;
    
    if (fileSizeMB <= maxSizeMB) {
      resolve(file);
      return;
    }

    // For now, we'll just warn about large videos
    // In a full implementation, you might want to use WebCodecs API or server-side compression
    safeLog.warn('📹 Large video file detected:', {
      name: file.name,
      size: `${fileSizeMB.toFixed(2)}MB`,
      recommendation: 'Consider compressing video before upload'
    });

    resolve(file);
  });
}

/**
 * Optimize all media files in an array
 */
export async function optimizeMediaFiles(files) {
  if (!files || files.length === 0) return [];

  safeLog.log('🔧 Starting media optimization for', files.length, 'files');
  
  const optimizationPromises = files.map(async (fileObj) => {
    const file = fileObj.file || fileObj;
    
    try {
      let optimizedFile;
      
      if (file.type.startsWith('image/')) {
        optimizedFile = await optimizeImage(file);
      } else if (file.type.startsWith('video/')) {
        optimizedFile = await optimizeVideo(file);
      } else {
        optimizedFile = file;
      }

      return {
        ...fileObj,
        file: optimizedFile,
        type: optimizedFile.type,
        size: optimizedFile.size
      };
    } catch (error) {
      safeLog.error('Failed to optimize file:', file.name, error);
      return fileObj; // Return original if optimization fails
    }
  });

  const optimizedFiles = await Promise.all(optimizationPromises);
  
  const originalSize = files.reduce((sum, f) => sum + (f.file || f).size, 0);
  const optimizedSize = optimizedFiles.reduce((sum, f) => sum + f.file.size, 0);
  const savings = ((originalSize - optimizedSize) / originalSize * 100);
  
  safeLog.log('✅ Media optimization complete:', {
    files: optimizedFiles.length,
    originalSize: `${(originalSize / 1024 / 1024).toFixed(2)}MB`,
    optimizedSize: `${(optimizedSize / 1024 / 1024).toFixed(2)}MB`,
    savings: `${savings.toFixed(1)}%`
  });

  return optimizedFiles;
}

/**
 * Generate thumbnail for images
 */
export async function generateThumbnail(file, maxWidth = 300, maxHeight = 300) {
  if (!file.type.startsWith('image/')) {
    return null;
  }

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      const { width, height } = img;
      const aspectRatio = width / height;
      
      let thumbWidth, thumbHeight;
      
      if (width > height) {
        thumbWidth = Math.min(width, maxWidth);
        thumbHeight = thumbWidth / aspectRatio;
      } else {
        thumbHeight = Math.min(height, maxHeight);
        thumbWidth = thumbHeight * aspectRatio;
      }

      canvas.width = thumbWidth;
      canvas.height = thumbHeight;

      ctx.drawImage(img, 0, 0, thumbWidth, thumbHeight);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            resolve(null);
          }
        },
        'image/jpeg',
        0.7
      );
    };

    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}