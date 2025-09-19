# Firebase Setup Instructions for AthlNet Messaging

## Prerequisites
✅ Your Firebase project "athlnet" is already created
✅ Your .env.local file has the correct Firebase configuration

## Step-by-Step Setup (Complete These in Order)

### STEP 1: Configure Firestore Security Rules
1. Go to https://console.firebase.google.com/
2. Select your project: **athlnet**  
3. In the left sidebar, click **"Firestore Database"**
4. Click the **"Rules"** tab
5. Copy the rules from `firestore-rules.txt` (in this folder)
6. Replace all existing rules with the new rules
7. Click **"Publish"** to save

### STEP 2: Configure Storage Security Rules  
1. In Firebase Console, click **"Storage"** in the left sidebar
2. Click the **"Rules"** tab
3. Copy the rules from `firebase-storage-rules.txt` (in this folder)
4. Replace all existing rules with the new rules
5. Click **"Publish"** to save

### STEP 3: Enable Authentication Methods
1. Click **"Authentication"** in the left sidebar
2. Click **"Sign-in method"** tab
3. Enable these sign-in providers:
   - ✅ **Email/Password** (should already be enabled)
   - ✅ **Google** (optional but recommended)
4. Set your authorized domains if needed

### STEP 4: Set Up Database Indexes (Important for Performance)
1. Click **"Firestore Database"** in the left sidebar
2. Click **"Indexes"** tab
3. Create the composite indexes listed in `firebase-indexes.txt`
4. Or wait for Firebase to suggest indexes when you run queries

### STEP 5: Verify Storage Bucket
1. Click **"Storage"** in the left sidebar  
2. If you see "Get started", click it and choose "Start in production mode"
3. Confirm your storage bucket is: `athlnet.firebasestorage.app`

### STEP 6: Test Your Setup
1. Run your app: `npm run dev`
2. Open browser console (F12)
3. Navigate to the messaging page
4. Look for these success messages:
   ```
   === FIREBASE CONNECTION TEST PASSED ===
   Test document created with ID: [some_id]
   ```

## Troubleshooting Common Issues

### Issue: "Missing or insufficient permissions"
**Solution:** Make sure you applied the Firestore rules correctly (Step 1)

### Issue: "Firebase Storage: User does not have permission"  
**Solution:** Make sure you applied the Storage rules correctly (Step 2)

### Issue: "The query requires an index"
**Solution:** Create the missing index as suggested by the error, or add indexes from Step 4

### Issue: "Firebase db is null or undefined"
**Solution:** Check your .env.local file has correct Firebase config values

### Issue: "Auth required" errors
**Solution:** Make sure user is logged in before sending messages

## Expected Firebase Collections After Setup:
- `users/` - User profiles and data
- `messages/` - Individual messages  
- `conversations/` - Conversation metadata
- `posts/` - Social media posts
- `test/` - Test documents (can be deleted later)

## Security Features Enabled:
✅ Only authenticated users can access data
✅ Users can only edit their own profiles  
✅ Message privacy (only sender/recipient can see messages)
✅ Secure file uploads with proper permissions
✅ Protection against unauthorized data access

Your Firebase setup should now be complete and secure! 🔥🚀