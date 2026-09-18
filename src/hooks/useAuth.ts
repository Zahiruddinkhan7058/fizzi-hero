"use client";

import { useEffect, useState } from "react";
import {
  getCurrentUser,
  logoutUser,
} from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const logout = () => {
    logoutUser();
    setUser(null);
    window.location.href = "/";
  };

  return {
    user,
    loading,
    isLoggedIn: !!user,
    logout,
  };
}