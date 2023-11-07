import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase/firebase-config";
import { AuthContextProps } from "../common/types";
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

type AuthProviderProps = {
  children?: React.ReactNode;
};

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [currentUser, setCurrentUser] = useState<User | null | undefined>(
    undefined
  );

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log(user);

      setCurrentUser(user);

      //~~~ By default update loading state here to false,
      //~~~ but i am doing it from my LoginForm component due to the specific cases
      //~~~ setLoading(false)
    });

    return unsubscribe;
  }, []);

  const signOut = async () => {
    setCurrentUser(null);

    try {
      await auth.signOut();
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const value: AuthContextProps = {
    loading,
    setLoading,
    currentUser,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
