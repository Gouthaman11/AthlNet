// Complete Coach Profile Fix Script
// Run this in the browser console (F12 -> Console tab)

async function completeCoachFix() {
  try {
    console.log('🔧 Starting complete coach profile fix...');
    
    // Import Firebase functions  
    const { doc, updateDoc, getDoc } = await import('firebase/firestore');
    const { db, auth } = await import('./firebaseClient');
    
    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No user is currently logged in');
      return false;
    }

    console.log('� Current user:', user.uid);
    
    // Get current profile data
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User profile not found in database');
      return false;
    }
    
    const currentData = userDoc.data();
    console.log('📋 Current profile data:', currentData);

    // Comprehensive coach update
    const coachUpdateData = {
      // Primary coach identifiers
      role: 'coach',
      userType: 'coach', 
      isCoach: true,
      
      // Personal info updates
      'personalInfo.userType': 'coach',
      'personalInfo.title': 'Coach',
      'personalInfo.role': 'coach',
      
      // Title field
      title: 'Coach',
      
      // Sport/specialization
      sport: currentData.sport || 'General Training',
      
      // Update timestamp
      updatedAt: new Date(),
      
      // Ensure profile is properly indexed for coach searches
      searchKeywords: [...(currentData.searchKeywords || []), 'coach', 'training'],
    };

    console.log('📝 Updating profile with:', coachUpdateData);
    
    // Update the profile
    await updateDoc(userRef, coachUpdateData);
    
    console.log('✅ Coach profile updated successfully!');
    console.log('🔄 Refreshing page in 2 seconds to apply changes...');
    
    // Wait 2 seconds then refresh
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return true;
    
  } catch (error) {
    console.error('❌ Error fixing coach profile:', error);
    console.log('💡 Try running this command manually in the console:');
    console.log(`
    import('firebase/firestore').then(({ doc, updateDoc }) => {
      import('./firebaseClient').then(({ db, auth }) => {
        const user = auth.currentUser;
        const userRef = doc(db, 'users', user.uid);
        return updateDoc(userRef, {
          role: 'coach',
          userType: 'coach',
          isCoach: true,
          'personalInfo.userType': 'coach',
          'personalInfo.title': 'Coach',
          title: 'Coach',
          updatedAt: new Date()
        });
      });
    }).then(() => {
      console.log('✅ Fixed! Refresh the page.');
      setTimeout(() => window.location.reload(), 1000);
    });
    `);
    return false;
  }
}

// Auto-run the fix
completeCoachFix();