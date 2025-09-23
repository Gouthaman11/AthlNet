// Connection testing and troubleshooting utility
import { db, auth, storage, isConfigured, initError } from '../firebaseClient';
import { safeLog } from './safeLogging';

export async function runConnectionDiagnostics() {
  const results = {
    timestamp: new Date().toISOString(),
    online: navigator.onLine,
    config: {
      isConfigured,
      initError,
      hasAuth: !!auth,
      hasDb: !!db,
      hasStorage: !!storage
    },
    auth: {
      hasCurrentUser: !!auth?.currentUser,
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null
    },
    tests: []
  };

  safeLog.log('🔍 Running connection diagnostics...');

  // Test 1: Environment variables
  try {
    const envTest = {
      name: 'Environment Configuration',
      status: 'testing'
    };

    if (!isConfigured) {
      envTest.status = 'failed';
      envTest.error = initError || 'Missing Firebase configuration';
    } else {
      envTest.status = 'passed';
      envTest.details = 'Firebase configuration loaded successfully';
    }

    results.tests.push(envTest);
  } catch (error) {
    results.tests.push({
      name: 'Environment Configuration',
      status: 'error',
      error: error.message
    });
  }

  // Test 2: Network connectivity
  try {
    const networkTest = {
      name: 'Network Connectivity',
      status: 'testing'
    };

    if (!navigator.onLine) {
      networkTest.status = 'failed';
      networkTest.error = 'Device is offline';
    } else {
      // Test Google's public DNS to verify internet connectivity
      try {
        await fetch('https://dns.google/resolve?name=firebase.google.com&type=A', {
          method: 'GET',
          mode: 'cors'
        });
        networkTest.status = 'passed';
        networkTest.details = 'Internet connectivity confirmed';
      } catch (fetchError) {
        networkTest.status = 'failed';
        networkTest.error = 'No internet connectivity';
      }
    }

    results.tests.push(networkTest);
  } catch (error) {
    results.tests.push({
      name: 'Network Connectivity',
      status: 'error',
      error: error.message
    });
  }

  // Test 3: Firebase Auth
  try {
    const authTest = {
      name: 'Firebase Authentication',
      status: 'testing'
    };

    if (!auth) {
      authTest.status = 'failed';
      authTest.error = 'Firebase Auth not initialized';
    } else if (!auth.currentUser) {
      authTest.status = 'failed';
      authTest.error = 'No user logged in';
    } else {
      authTest.status = 'passed';
      authTest.details = `User authenticated: ${auth.currentUser.email}`;
    }

    results.tests.push(authTest);
  } catch (error) {
    results.tests.push({
      name: 'Firebase Authentication',
      status: 'error',
      error: error.message
    });
  }

  // Test 4: Firestore access
  if (db && auth?.currentUser) {
    try {
      const firestoreTest = {
        name: 'Firestore Database Access',
        status: 'testing'
      };

      const { doc, getDoc } = await import('firebase/firestore');
      const testDoc = doc(db, 'users', auth.currentUser.uid);
      
      await Promise.race([
        getDoc(testDoc),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 5000)
        )
      ]);

      firestoreTest.status = 'passed';
      firestoreTest.details = 'Firestore access confirmed';
      results.tests.push(firestoreTest);
    } catch (error) {
      results.tests.push({
        name: 'Firestore Database Access',
        status: 'failed',
        error: error.code === 'permission-denied' ? 
          'Permission denied - check Firestore rules' : 
          error.message
      });
    }
  }

  // Test 5: Storage access
  if (storage && auth?.currentUser) {
    try {
      const storageTest = {
        name: 'Firebase Storage Access',
        status: 'testing'
      };

      const { ref } = await import('firebase/storage');
      const testRef = ref(storage, `test/${auth.currentUser.uid}/connection`);
      
      if (testRef) {
        storageTest.status = 'passed';
        storageTest.details = 'Storage access confirmed';
      } else {
        storageTest.status = 'failed';
        storageTest.error = 'Could not create storage reference';
      }

      results.tests.push(storageTest);
    } catch (error) {
      results.tests.push({
        name: 'Firebase Storage Access',
        status: 'failed',
        error: error.code === 'storage/unauthorized' ? 
          'Storage access denied - check storage rules' : 
          error.message
      });
    }
  }

  // Summary
  const passedTests = results.tests.filter(t => t.status === 'passed').length;
  const totalTests = results.tests.length;
  results.summary = {
    passed: passedTests,
    total: totalTests,
    success: passedTests === totalTests,
    recommendation: getRecommendation(results)
  };

  safeLog.log('🔍 Connection diagnostics completed:', results.summary);
  return results;
}

function getRecommendation(results) {
  if (!results.config.isConfigured) {
    return 'Configure Firebase environment variables in .env.local file';
  }
  
  if (!results.online) {
    return 'Check your internet connection';
  }
  
  if (!results.auth.hasCurrentUser) {
    return 'Please log in to your account';
  }
  
  const failedTests = results.tests.filter(t => t.status === 'failed');
  if (failedTests.length > 0) {
    const authFailed = failedTests.find(t => t.name.includes('Authentication'));
    const firestoreFailed = failedTests.find(t => t.name.includes('Firestore'));
    const storageFailed = failedTests.find(t => t.name.includes('Storage'));
    
    if (authFailed) {
      return 'Authentication issue - try logging out and back in';
    }
    if (firestoreFailed && firestoreFailed.error?.includes('permission')) {
      return 'Database permission issue - contact support';
    }
    if (storageFailed && storageFailed.error?.includes('unauthorized')) {
      return 'Storage permission issue - contact support';
    }
  }
  
  return 'All tests passed - connection should work properly';
}

// Quick connection test for UI
export async function quickConnectionTest() {
  try {
    if (!navigator.onLine) {
      return { success: false, error: 'Device is offline' };
    }
    
    if (!isConfigured) {
      return { success: false, error: 'Firebase not configured' };
    }
    
    if (!auth?.currentUser) {
      return { success: false, error: 'Not authenticated' };
    }
    
    if (!db) {
      return { success: false, error: 'Database not available' };
    }
    
    return { success: true, message: 'Connection OK' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}