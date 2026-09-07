import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api";

const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check existing Flask login session
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await api.get("/api/admin/me");

        if (response.data.success) {
          setAdmin(response.data.admin);
        }
      } catch (error) {
        setAdmin(null);
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, []);

  const login = async (email, password) => {
    const response = await api.post("/api/admin/login", {
      email,
      password,
    });

    if (response.data.success) {
      setAdmin(response.data.admin);
    }

    return response.data;
  };

  const logout = async () => {
    try {
      await api.post("/api/admin/logout");
    } finally {
      setAdmin(null);
    }
  };

  return (
    <AdminContext.Provider
      value={{
        admin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}