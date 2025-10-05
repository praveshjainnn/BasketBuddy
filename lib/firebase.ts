// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app"
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendEmailVerification,
  updateProfile
} from "firebase/auth"
import { getFirestore, doc, setDoc } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOcbPRppkZfYCH6RDtzydvcYGSw_WgzHY",
  authDomain: "basketbuddy-e05b9.firebaseapp.com",
  projectId: "basketbuddy-e05b9",
  storageBucket: "basketbuddy-e05b9.appspot.com",
  messagingSenderId: "686386507353",
  appId: "1:686386507353:web:0bcb23ddfaa4da37da8b48",
  measurementId: "G-Z40ZE9Q4NR"
}

// Initialize Firebase only if it hasn't been initialized already and we're in the browser
const apps = getApps()
const app = apps.length ? apps[0] : initializeApp(firebaseConfig)

// Initialize Firebase services - only in browser environment
let auth, firestore, googleProvider

// Check if we're in the browser environment
if (typeof window !== 'undefined') {
  auth = getAuth(app)
  firestore = getFirestore(app)
  googleProvider = new GoogleAuthProvider()
}

// Auth helper functions
const signInWithGoogle = () => {
  if (!auth || !googleProvider) return Promise.reject("Auth not initialized")
  return signInWithPopup(auth, googleProvider)
}

const signUpWithEmail = async (email: string, password: string, displayName: string) => {
  if (!auth) throw new Error("Auth not initialized")
  
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName })
  
  // Create user document in Firestore
  if (firestore) {
    await setDoc(doc(firestore, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: displayName,
      photoURL: userCredential.user.photoURL || '',
      createdAt: new Date().toISOString(),
    })
  }
  
  // Send email verification
  await sendEmailVerification(userCredential.user)
  
  return userCredential.user
}

const signInWithEmail = (email: string, password: string) => {
  if (!auth) return Promise.reject("Auth not initialized")
  return signInWithEmailAndPassword(auth, email, password)
}

const signOutUser = () => {
  if (!auth) return Promise.reject("Auth not initialized")
  return signOut(auth)
}

export { 
  auth, 
  firestore, 
  googleProvider,
  signInWithGoogle,
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  onAuthStateChanged
}
