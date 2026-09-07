import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/AdminContext";

function AdminLogin() {
  const navigate = useNavigate();

  const { login } = useAdmin();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const data = await login(email, password);

      if (data.success) {
        setMessage("Login successful");

        navigate("/");
      }
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>Admin Login</h1>
          <p>Sign in to manage UploadStore products</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              placeholder="Enter admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}

          <button
            type="submit"
            className="primary-btn"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;