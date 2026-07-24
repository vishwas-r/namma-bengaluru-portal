/**
 * Google Authentication Service — Namma Bengaluru Portal
 * Uses Google Identity Services SDK (GIS) for verified 1-click citizen login.
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const STORAGE_KEY = 'nb_user_session';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

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

export function initGoogleAuth(callback) {
  if (typeof window === 'undefined') return;

  const handleCredentialResponse = (response) => {
    if (!response || !response.credential) return;
    const payload = parseJwt(response.credential);
    if (payload) {
      const user = {
        sub: payload.sub,
        name: payload.name || payload.given_name || 'Verified Citizen',
        email: payload.email,
        picture: payload.picture || null,
        givenName: payload.given_name || payload.name || 'Citizen',
        authenticatedAt: new Date().toISOString()
      };
      setCurrentUser(user);
      if (callback) callback(user);
    }
  };

  if (window.google?.accounts?.id) {
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredentialResponse,
      auto_select: false,
    });
  } else {
    // Retry script initialization if script loading is delayed
    const timer = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(timer);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });
      }
    }, 300);
  }
}

export function promptGoogleLogin(elementId, callback) {
  initGoogleAuth(callback);
  if (window.google?.accounts?.id) {
    if (elementId && document.getElementById(elementId)) {
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        { theme: 'outline', size: 'large', type: 'standard', text: 'continue_with', shape: 'pill' }
      );
    } else {
      window.google.accounts.id.prompt();
    }
  }
}

export function signOutUser() {
  setCurrentUser(null);
  if (window.google?.accounts?.id) {
    window.google.accounts.id.disableAutoSelect();
  }
}

// Fallback Demo Login for local testing if Google Auth fails
export function demoSignIn(name = 'Verified Citizen') {
  const demoUser = {
    sub: 'demo_user_' + Math.random().toString(36).slice(2, 9),
    name: name,
    email: 'citizen@nammabengaluru.online',
    picture: null,
    givenName: name.split(' ')[0],
    isDemo: true,
    authenticatedAt: new Date().toISOString()
  };
  setCurrentUser(demoUser);
  return demoUser;
}
