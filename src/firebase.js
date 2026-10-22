// Import the functions you need from the SDKs you need
// https://firebase.google.com/docs/web/setup#available-libraries
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDo6RnOQ_wWDGzCGkDyxHo0D4Qb8feFOqY',
  authDomain: 'quantaviz-2ea62.firebaseapp.com',
  projectId: 'quantaviz-2ea62',
  storageBucket: 'quantaviz-2ea62.firebasestorage.app',
  messagingSenderId: '261305629371',
  appId: '1:261305629371:web:b6e4effd3a6b40e2b1479e',
  measurementId: 'G-Q0GF1GFBGY',
}

const app = initializeApp(firebaseConfig)

let analytics = null
isSupported()
  .then((ok) => {
    if (ok) analytics = getAnalytics(app)
  })
  .catch(() => {})

export { analytics }
export const auth = getAuth(app)
export const db = getFirestore(app)
export const googleProvider = new GoogleAuthProvider()
