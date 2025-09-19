# Firestore Schema for Social Features

## Collections

### users
- id (uid, string)
- displayName
- email
- role
- personalInfo: { firstName, lastName, phone, dateOfBirth, gender, city, country, bio }
- achievements: [ { title, description, fileUrl } ]
- privacySettings: { acceptTerms, acceptPrivacy, ageConfirmation }
- photoURL
- createdAt
- connections: [uid]
- followers: [uid]
- following: [uid]

### posts
- id (auto)
- authorId (uid)
- content (text)
- mediaUrls: [string]
- createdAt
- likes: [uid]
- comments: [commentId]

### comments
- id (auto)
- postId
- authorId
- content
- createdAt
- likes: [uid]

### messages
- id (auto)
- from (uid)
- to (uid)
- content
- mediaUrl
- createdAt
- read: boolean

### notifications
- id (auto)
- userId
- type
- data
- createdAt

## Storage Structure
- profiles/{uid}/avatar
- posts/{postId}/media/{filename}
- achievements/{uid}/{filename}

## Notes
- All user profile updates should update the `users/{uid}` document.
- Posts, comments, messages, and notifications are separate collections for scalability.
- Media files are stored in Firebase Storage and referenced by URL in Firestore.
