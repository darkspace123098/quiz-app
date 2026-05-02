import React, { createContext, useContext, useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface AdminData {
  username: string;
  role: string;
  allowedClasses: string[];
}

interface AdminContextType {
  admin: AdminData | null;
  loading: boolean;
  login: (data: AdminData) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<AdminData | null>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await apiFetch("/api/admin/role");
      if (res.ok) {
        const data = await res.json();
        setAdmin(data);
        return data;
      } else {
        setAdmin(null);
        return null;
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setAdmin(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (data: AdminData) => {
    setAdmin(data);
  };

  const logout = async () => {
    try {
      await apiFetch("/api/admin/logout", { method: "POST" });
      setAdmin(null);
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, checkAuth }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};
