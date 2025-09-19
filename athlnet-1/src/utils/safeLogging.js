// Safe logging utilities to prevent circular JSON errors
export const safeLog = {
  // Safely stringify objects, handling circular references and Firebase objects
  stringify: (obj, spaces = 2) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      // Handle Firebase objects and functions
      if (typeof value === 'function') {
        return '[Function]';
      }
      
      // Handle Firebase references and special objects
      if (value && typeof value === 'object') {
        // Skip Firebase internal properties
        if (key.startsWith('_') || key === 'firestore' || key === 'converter') {
          return '[Firebase Internal]';
        }
        
        // Handle circular references
        if (seen.has(value)) {
          return '[Circular Reference]';
        }
        seen.add(value);
        
        // Handle Firebase Timestamp objects
        if (value.toDate && typeof value.toDate === 'function') {
          try {
            return value.toDate().toISOString();
          } catch (e) {
            return '[Firebase Timestamp]';
          }
        }
        
        // Handle Firebase DocumentReference objects
        if (value.path && value.id && value.parent) {
          return `[DocumentReference: ${value.path}]`;
        }
      }
      
      return value;
    }, spaces);
  },

  // Safe console logging
  log: (message, data) => {
    if (data === undefined) {
      console.log(message);
    } else {
      try {
        if (typeof data === 'object' && data !== null) {
          // For Firebase objects, create a clean version
          const cleanData = safeLog.cleanFirebaseObject(data);
          console.log(message, cleanData);
        } else {
          console.log(message, data);
        }
      } catch (error) {
        console.log(message, '[Object could not be logged safely]');
      }
    }
  },

  // Clean Firebase objects for logging
  cleanFirebaseObject: (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => safeLog.cleanFirebaseObject(item));
    }
    
    // Handle Firebase special objects
    if (obj.toDate && typeof obj.toDate === 'function') {
      try {
        return obj.toDate().toISOString();
      } catch (e) {
        return '[Firebase Timestamp]';
      }
    }
    
    if (obj.path && obj.id && obj.parent) {
      return `[DocumentReference: ${obj.path}]`;
    }
    
    // Clean regular objects
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip Firebase internal properties
      if (key.startsWith('_') || key === 'firestore' || key === 'converter') {
        continue;
      }
      
      if (typeof value === 'function') {
        cleaned[key] = '[Function]';
      } else if (value && typeof value === 'object') {
        cleaned[key] = safeLog.cleanFirebaseObject(value);
      } else {
        cleaned[key] = value;
      }
    }
    
    return cleaned;
  },

  // Safe error logging
  error: (message, error) => {
    console.error(message);
    if (error) {
      try {
        const errorDetails = {
          message: error.message || 'Unknown error',
          code: error.code || undefined,
          name: error.name || undefined
        };
        
        // Safely handle stack trace
        if (error.stack && typeof error.stack === 'string') {
          errorDetails.stack = error.stack.split('\n').slice(0, 5);
        } else if (error.stack) {
          errorDetails.stack = '[Stack trace not available]';
        }
        
        console.error('Error details:', errorDetails);
      } catch (loggingError) {
        console.error('Error details: [Could not safely log error details]');
        console.error('Original error:', error);
      }
    }
  },

  // Safe warning logging
  warn: (message, data) => {
    if (data === undefined) {
      console.warn(message);
    } else {
      try {
        const cleanData = safeLog.cleanFirebaseObject(data);
        console.warn(message, cleanData);
      } catch (error) {
        console.warn(message, '[Object could not be logged safely]');
      }
    }
  }
};

export default safeLog;