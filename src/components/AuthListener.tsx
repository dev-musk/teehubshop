"use client";

import { useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "@/firebase/config";

export default function AuthListener() {
  useEffect(() => {
    const auth = getAuth(app);

    // ✅ Auto-login persistence with proper data structure
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // ✅ Store user data in a consistent format
        const userData = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || "",
          name: firebaseUser.displayName || "",
          phone: firebaseUser.phoneNumber || "",
          photoURL: firebaseUser.photoURL || "",
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("✅ User logged in:", userData.email);
      } else {
        localStorage.removeItem("user");
        console.log("❌ User logged out");
      }
    });

    // ✅ Auto-refresh token every 30 min
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        await user.getIdToken(true);
        console.log("🔄 Token refreshed");
      }
    }, 30 * 60 * 1000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return null;
}