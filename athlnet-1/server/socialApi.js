// Node.js backend API for social features
const express = require('express');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const router = express.Router();

// Profile update
router.post('/profile/update', async (req, res) => {
  const { uid, data } = req.body;
  const db = getFirestore();
  await db.collection('users').doc(uid).set(data, { merge: true });
  res.json({ success: true });
});

// Get feed posts
router.get('/feed', async (req, res) => {
  const db = getFirestore();
  const postsSnap = await db.collection('posts').orderBy('createdAt', 'desc').limit(20).get();
  const posts = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(posts);
});

// Create post
router.post('/posts/create', async (req, res) => {
  const { authorId, content, mediaUrls = [] } = req.body;
  const db = getFirestore();
  const post = {
    authorId,
    content,
    mediaUrls,
    createdAt: new Date().toISOString(),
    likes: [],
    comments: []
  };
  const docRef = await db.collection('posts').add(post);
  res.json({ success: true, postId: docRef.id });
});

// Like post
router.post('/posts/:postId/like', async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;
  const db = getFirestore();
  const postRef = db.collection('posts').doc(postId);
  const postSnap = await postRef.get();
  if (postSnap.exists) {
    const likes = postSnap.data().likes || [];
    if (!likes.includes(userId)) {
      await postRef.update({ likes: [...likes, userId] });
    }
  }
  res.json({ success: true });
});

// Add comment
router.post('/posts/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { authorId, content } = req.body;
  const db = getFirestore();
  const comment = {
    postId,
    authorId,
    content,
    createdAt: new Date().toISOString(),
    likes: []
  };
  const commentRef = await db.collection('comments').add(comment);
  // Optionally update post's comments array
  const postRef = db.collection('posts').doc(postId);
  const postSnap = await postRef.get();
  if (postSnap.exists) {
    const comments = postSnap.data().comments || [];
    await postRef.update({ comments: [...comments, commentRef.id] });
  }
  res.json({ success: true, commentId: commentRef.id });
});

// Get messages between two users
router.get('/messages', async (req, res) => {
  const { userA, userB } = req.query;
  const db = getFirestore();
  const messagesSnap = await db.collection('messages')
    .where('from', 'in', [userA, userB])
    .where('to', 'in', [userA, userB])
    .orderBy('createdAt', 'desc')
    .limit(50)
    .get();
  const messages = messagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  res.json(messages);
});

// Send message
router.post('/messages/send', async (req, res) => {
  const { from, to, content, mediaUrl = null } = req.body;
  const db = getFirestore();
  const message = {
    from,
    to,
    content,
    mediaUrl,
    createdAt: new Date().toISOString(),
    read: false
  };
  const docRef = await db.collection('messages').add(message);
  res.json({ success: true, messageId: docRef.id });
});

// Follow user
router.post('/users/:uid/follow', async (req, res) => {
  const { uid } = req.params;
  const { targetUid } = req.body;
  const db = getFirestore();
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if (userSnap.exists) {
    const following = userSnap.data().following || [];
    if (!following.includes(targetUid)) {
      await userRef.update({ following: [...following, targetUid] });
    }
  }
  const targetRef = db.collection('users').doc(targetUid);
  const targetSnap = await targetRef.get();
  if (targetSnap.exists) {
    const followers = targetSnap.data().followers || [];
    if (!followers.includes(uid)) {
      await targetRef.update({ followers: [...followers, uid] });
    }
  }
  res.json({ success: true });
});

// Media upload (stub)
router.post('/media/upload', async (req, res) => {
  // ...handle file upload, store in Firebase Storage...
  res.json({ success: true, url: 'uploaded-file-url' });
});

module.exports = router;
