// src/hooks/use-auth.tsx (Phiên bản đầy đủ chức năng)
"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from "@/lib/firebase/firebase";
import { UserData } from "@/lib/data";

// "Thực đơn" phải có đủ tất cả các món
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, discordName: string, linkCode?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      console.log("DEBUG AUTH: onAuthStateChanged user:", authUser ? authUser.uid : null); // Log khi user auth thay đổi
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      setLoading(false);
      console.log("DEBUG AUTH: User is null, setting userData to null."); // Log khi user null
      return;
    }
    setLoading(true);
    const userDocRef = doc(db, "users", user.uid);
    const unsubscribeSnapshot = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedData = { id: snapshot.id, ...snapshot.data() } as UserData;
        setUserData(fetchedData);
        console.log("DEBUG AUTH: UserData from Firestore (exists):", fetchedData); // QUAN TRỌNG: Log dữ liệu từ Firestore
        console.log("DEBUG AUTH: UserData.clanId:", fetchedData.clanId); // QUAN TRỌNG: Log clanId cụ thể
      } else {
        setUserData(null);
        console.warn("DEBUG AUTH: UserData document does not exist for UID:", user.uid);
      }
      setLoading(false);
    });
    return () => unsubscribeSnapshot();
  }, [user]);

  const login = async (email: string, password: string) => await signInWithEmailAndPassword(auth, email, password);

  const register = async (email: string, password: string, discordName: string, linkCode?: string) => {
    const registerFunction = httpsCallable(functions, 'registerUserWithBenefits');
    const result: any = await registerFunction({ email, password, discordName, linkCode });
    if (!result.data.success) throw new Error(result.data.message || 'Đăng ký thất bại.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => await signOut(auth);

  const value: AuthContextType = { 
    user, 
    userData, 
    loading, 
    login: async (email: string, password: string) => {
      await signInWithEmailAndPassword(auth, email, password);
    },
    register, 
    logout 
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}