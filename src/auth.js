// client/src/auth.js
//
// 🔐 Tiny auth helper shared across the client.
// The JWT + user profile are stored in localStorage by the OAuth callback.
// A custom event keeps the navbar (and any component) in sync without a router
// reload.

import { useEffect, useState } from 'react';

const EVENT = 'albioner-auth-changed';

export function getToken() {
  return localStorage.getItem('token');
}

export function getUser() {
  const raw = localStorage.getItem('user');
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  if (user) localStorage.setItem('user', JSON.stringify(user));
  window.dispatchEvent(new Event(EVENT));
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event(EVENT));
}

// React hook: re-renders when the auth state changes (login/logout/other tab).
export function useAuth() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    const sync = () => {
      setLoggedIn(isLoggedIn());
      setUser(getUser());
    };
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  return { loggedIn, user, logout };
}
