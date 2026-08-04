// Firebase Analytics — same project as the existing portfolio site
// (portfolio-411720). Client-side only; these are public client keys. Guarded
// so it no-ops during SSR/build and only initializes in a real browser.
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyAI9VVBNZ8r2Igkdn1XDODOcr9Ci3F94ws',
  authDomain: 'portfolio-411720.firebaseapp.com',
  projectId: 'portfolio-411720',
  storageBucket: 'portfolio-411720.appspot.com',
  messagingSenderId: '1082506373751',
  appId: '1:1082506373751:web:63b7c584265d69aade3472',
  measurementId: 'G-2D8TNNNPB7',
}

export function initAnalytics() {
  if (typeof window === 'undefined') return
  try {
    const app = initializeApp(firebaseConfig)
    // isSupported() avoids crashes in browsers/environments without the APIs
    isSupported().then((ok) => ok && getAnalytics(app)).catch(() => {})
  } catch {
    /* analytics is non-critical — never let it break the app */
  }
}
