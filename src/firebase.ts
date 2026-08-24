import { initializeApp, getApps } from 'firebase/app'
import type { FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import type { Auth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import type { Firestore } from 'firebase/firestore'

let app: FirebaseApp
let auth: Auth
let db: Firestore

export function initFirebase() {
  if (getApps().length > 0) return

  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }

  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
}

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    initFirebase()
  }
  return app
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initFirebase()
  }
  return auth
}

export function getFirebaseDb(): Firestore {
  if (!db) {
    initFirebase()
  }
  return db
}
