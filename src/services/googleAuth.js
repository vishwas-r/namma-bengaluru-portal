/**
 * Google Authentication Service — Namma Bengaluru Portal
 * Uses Firebase Authentication for secure Google Sign-In, bypassing raw GSI origin issues.
 */

import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "./firebaseSetup.js";

const STORAGE_KEY = 'nb_user_session';

export function getCurrentUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }
}

export async function promptGoogleLogin(elementId, callback) {
  // If an element ID is provided, render a custom button instead of the Google iframe
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      el.innerHTML = `
        <button class="btn btn-outline-primary rounded-pill px-4 py-2 fw-bold shadow-sm w-100" id="firebaseAuthBtn_${elementId}">
          <i class="bi bi-google me-2"></i>Sign in with Google
        </button>
      `;
      document.getElementById(`firebaseAuthBtn_${elementId}`).addEventListener('click', (e) => {
        e.preventDefault();
        executeFirebaseLogin(callback);
      });
    }
    return;
  }

  // If no elementId, execute login directly (e.g., from a custom button click)
  executeFirebaseLogin(callback);
}

async function executeFirebaseLogin(callback) {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    const user = {
      sub: fbUser.uid,
      name: fbUser.displayName || 'Verified Citizen',
      email: fbUser.email,
      picture: fbUser.photoURL || null,
      givenName: (fbUser.displayName || '').split(' ')[0] || 'Citizen',
      authenticatedAt: new Date().toISOString()
    };
    
    setCurrentUser(user);
    if (callback) callback(user);
  } catch (error) {
    console.error("Firebase Google Auth Error:", error);
    alert("Sign-In failed: " + error.message);
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    setCurrentUser(null);
  } catch (error) {
    console.error("Sign out error", error);
    setCurrentUser(null);
  }
}
