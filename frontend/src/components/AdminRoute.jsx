import React from "react";
import { Navigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

function AdminRoute({ children }) {
  const { admin, loading } = useAdmin();

  if (loading) {
    return <div>Checking admin access...</div>;
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminRoute;