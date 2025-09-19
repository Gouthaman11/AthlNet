# AthlNet server

This folder contains a minimal Express server template that initializes Firebase Admin SDK securely.

Setup
- Copy your Firebase service account JSON to a secure location outside the repo.
- Set either the environment variable `GOOGLE_APPLICATION_CREDENTIALS` to point at that file, or set `FIREBASE_SERVICE_ACCOUNT_PATH` to the path.
- Set `FIREBASE_DATABASE_URL` to your realtime database URL.
- Install dependencies and run:

```
cd server
npm install
npm start
```

Endpoint
- POST /verifyToken with JSON { idToken } to verify an ID token and get decoded token info.

Security
- Never commit service account files or private keys. Add them to `.gitignore` and use environment variables for production deployments.
