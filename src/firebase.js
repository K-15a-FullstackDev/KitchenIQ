import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const config = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

let app = null;

// Only init if we have an apiKey (prevents crashes if env not set yet)
if (config.apiKey) {
  if (!firebase.apps.length) {
    app = firebase.initializeApp(config);
  } else {
    app = firebase.app();
  }
} else {
  // Allowed by our ESLint rule: console.warn
  console.warn("Firebase config missing. Skipping init (dev).");
}

export const auth = app ? firebase.auth() : null;
export const db = app ? firebase.firestore() : null;
export default app;
