import React from "react";
import {
  BrowserRouter,
  Link,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Home from "./pages/Home";
import ProductForm from "./pages/ProductForm";
import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/AdminLogin";

import AdminRoute from "./components/AdminRoute";
import { useAdmin } from "./context/AdminContext";

function AppContent() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <>
      <header className="topbar">
        <div className="container topbar-inner">
          <Link className="brand" to="/">
            Storebackend processing
          </Link>

          <nav className="nav-links">
            <Link to="/">Home</Link>

            {admin ? (
              <>
                <Link to="/add-product">
                  Add Product
                </Link>

                <span className="admin-name">
                  {admin.name}
                </span>

                <button
                  type="button"
                  className="logout-btn"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/admin/login">
                Admin Login
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="container">
        <Routes>

          {/* Public Home */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Public Product Detail */}
          <Route
            path="/products/:id"
            element={<ProductDetail />}
          />

          {/* Admin Login */}
          <Route
            path="/admin/login"
            element={<AdminLogin />}
          />

          {/* Admin Only - Add Product */}
          <Route
            path="/add-product"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />

          {/* Admin Only - Edit Product */}
          <Route
            path="/products/:id/edit"
            element={
              <AdminRoute>
                <ProductForm />
              </AdminRoute>
            }
          />

        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;