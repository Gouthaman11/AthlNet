# Firebase Deployment Instructions

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase project: `firebase init` (select Firestore, Hosting, Storage)

## Deploy Security Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules  
firebase deploy --only storage

# Deploy everything
firebase deploy
```

## Important Notes
- The firestore.rules file contains security rules for follow/unfollow functionality
- Make sure your Firebase project is properly configured
- The rules allow users to update their own following array and others' followers arrays when they follow/unfollow

## Testing
After deploying the rules, test the follow/unfollow functionality:
1. Follow a user
2. Reload the page
3. Verify the follow state persists
4. Check that profile stats update correctly