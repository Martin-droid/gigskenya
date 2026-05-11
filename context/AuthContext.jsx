import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createUserProfile, getUserProfile } from '../lib/firestore';

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          // Try to get the profile — may fail if rules are strict or offline
          let p = null;
          try {
            p = await getUserProfile(u.uid);
          } catch { /* silent — Firestore rules or network */ }

          // If no profile exists yet (truly new sign-in before registration completes),
          // do NOT create one here with a hardcoded role — the registration flow owns that.
          // Just build a minimal in-memory profile so the UI doesn't break.
          setProfile(prev => {
            // Don't regress a valid role to null if the profile write hasn't landed yet.
            // This prevents the onAuthStateChanged race overwriting a role that
            // signInGoogle or signUpEmail already set correctly.
            if (prev?.role && !p?.role) return prev;
            return p || {
              id:          u.uid,
              displayName: u.displayName || u.email?.split('@')[0] || '',
              email:       u.email || '',
              photoURL:    u.photoURL || null,
              role:        null, // unknown until registration writes it
            };
          });
        } else {
          setProfile(null);
        }
      } catch (err) {
        // Last-resort: don't crash. Keep user logged in with auth data only.
        if (u) {
          setProfile(prev => prev?.role ? prev : {
            id:          u.uid,
            displayName: u.displayName || '',
            email:       u.email || '',
            photoURL:    u.photoURL || null,
            role:        null, // will be set correctly once Firestore is reachable
          });
        }
      } finally {
        setLoading(false);
      }
    });
  }, []);

  // signInGoogle — auth only, no Firestore write.
  // Register.js owns the full profile write (role, phone, terms, etc.).
  // Login.js reads the role from Firestore after auth and verifies it matches.
  const signInGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    return cred;
  };

  // signUpEmail — auth only, no Firestore write.
  // Register.js calls saveUserProfile after this returns, which owns the
  // role write. Removing the createUserProfile call here was the fix for
  // new talent users being silently assigned role:'hirer' on sign-up.
  const signUpEmail = async (email, password, name) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });
    return cred;
  };

  const signInEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  // uidOverride lets callers (e.g. Register.jsx) pass the uid from the
  // auth credential directly, bypassing the stale React closure where
  // `user` is still null because the component hasn't re-rendered yet
  // after onAuthStateChanged fired.
  const refreshProfile = async (uidOverride) => {
    const uid = uidOverride ?? user?.uid;
    if (!uid) return;
    try {
      const p = await getUserProfile(uid).catch(() => null);
      if (p) setProfile(p);
    } catch { /* silent */ }
  };

  return (
    <Ctx.Provider value={{
      user,
      profile,
      loading,
      isAuthenticated: !!user,
      isTalent: profile?.role === 'talent',
      isHirer:  profile?.role === 'hirer',
      signInGoogle,
      signUpEmail,
      signInEmail,
      logout,
      refreshProfile,
    }}>
      {loading ? (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--grey-200)', borderTopColor: 'var(--green)', animation: 'spin .7s linear infinite' }} />
        </div>
      ) : children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAuth must be inside AuthProvider');
  return c;
};