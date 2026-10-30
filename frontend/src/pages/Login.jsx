import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { Activity, Mail, Lock, ArrowRight } from "lucide-react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/login", { email, password });
      
      localStorage.setItem("token", data.token);

      // Extract user name cleanly or fall back to email prefix
      const userName = data.user?.name || email.split("@")[0];
      const userObj = {
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: data.user?.email || email,
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="auth-container">
      <div className="shape-circle-mint-auth"></div>
      <div className="shape-square-blue-auth"></div>
      <div className="shape-pill-purple-auth"></div>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <Activity size={20} />
          </div>
        </div>

        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Sign in to your API Insight account</p>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <div className="auth-input-group">
            <Mail size={18} className="auth-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <div className="auth-input-group">
            <Lock size={18} className="auth-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-button">
            Sign In <ArrowRight size={16} />
          </button>
        </form>

        <p className="auth-footer-text">
          Don't have an account?{" "}
          <Link to="/register" className="auth-link">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}