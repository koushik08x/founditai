import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, isFirebaseConfigured } from '../config/firebase';
import { onAuthStateChanged, signOut as fbSignOut } from 'firebase/auth';
import { Profile } from '../types';

export interface DemoUser {
  id: string;
  display_name: string;
  email: string;
  role: 'student' | 'staff';
}

export const DEMO_USERS: DemoUser[] = [
  {
    id: 'user-demo-alice',
    display_name: 'Alice Johnson (Student)',
    email: 'alice.johnson@campus.edu',
    role: 'student'
  },
  {
    id: 'user-demo-bob',
    display_name: 'Bob Miller (Campus Staff)',
    email: 'bob.miller@campus.edu',
    role: 'staff'
  },
  {
    id: 'user-demo-carol',
    display_name: 'Carol Davis (Student)',
    email: 'carol.davis@campus.edu',
    role: 'student'
  }
];

interface AuthContextType {
  user: { id: string; email?: string } | null;
  profile: Profile | null;
  isLoading: boolean;
  isDemoMode: boolean;
  demoUsers: DemoUser[];
  activeDemoUser: DemoUser;
  switchDemoUser: (user: DemoUser) => void;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email?: string } | null>({
    id: DEMO_USERS[0].id,
    email: DEMO_USERS[0].email
  });
  const [profile, setProfile] = useState<Profile | null>({
    id: DEMO_USERS[0].id,
    display_name: DEMO_USERS[0].display_name,
    email: DEMO_USERS[0].email,
    created_at: new Date().toISOString()
  });
  const [activeDemoUser, setActiveDemoUser] = useState<DemoUser>(DEMO_USERS[0]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isDemoMode = !isFirebaseConfigured();

  useEffect(() => {
    if (isFirebaseConfigured() && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          setUser({ id: fbUser.uid, email: fbUser.email || undefined });
          setProfile({
            id: fbUser.uid,
            display_name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
            email: fbUser.email || undefined,
            created_at: new Date().toISOString()
          });
        } else {
          setUser(null);
          setProfile(null);
        }
        setIsLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Demo mode defaults to Alice Johnson
      setUser({ id: activeDemoUser.id, email: activeDemoUser.email });
      setProfile({
        id: activeDemoUser.id,
        display_name: activeDemoUser.display_name,
        email: activeDemoUser.email,
        created_at: new Date().toISOString()
      });
      setIsLoading(false);
    }
  }, [activeDemoUser]);

  const switchDemoUser = (newUser: DemoUser) => {
    setActiveDemoUser(newUser);
    setUser({ id: newUser.id, email: newUser.email });
    setProfile({
      id: newUser.id,
      display_name: newUser.display_name,
      email: newUser.email,
      created_at: new Date().toISOString()
    });
  };

  const signInWithEmail = async (email: string) => {
    const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      switchDemoUser(found);
    } else {
      const customUser: DemoUser = {
        id: `user-${Date.now()}`,
        display_name: email.split('@')[0],
        email,
        role: 'student'
      };
      switchDemoUser(customUser);
    }
  };

  const signOut = async () => {
    if (isFirebaseConfigured() && auth) {
      await fbSignOut(auth);
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isDemoMode,
        demoUsers: DEMO_USERS,
        activeDemoUser,
        switchDemoUser,
        signInWithEmail,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
