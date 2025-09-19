const express = require('express');
const bodyParser = require('body-parser');
const { initAdmin, admin } = require('./firebaseAdmin');

const app = express();
app.use(bodyParser.json());

try {
  initAdmin();
} catch (err) {
  console.error('Firebase admin initialization error:', err.message);
}

// Simple endpoint to verify Firebase ID tokens sent from frontend
app.post('/verifyToken', async (req, res) => {
  const idToken = req.body?.idToken || req.headers?.authorization?.split('Bearer ')[1];
  if (!idToken) return res.status(400).json({ error: 'Missing idToken' });

  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return res.json({ uid: decoded.uid, decoded });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token', details: err.message });
  }
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Server listening on ${port}`));
