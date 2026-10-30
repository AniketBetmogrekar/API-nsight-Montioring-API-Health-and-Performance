import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { Activity, User, Mail, Lock, ArrowRight } from "lucide-react";
import "./Register.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post("/auth/register", { name, email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      {/* Background Shapes */}
      <div className="shape-circle-mint-reg"></div>
      <div className="shape-square-blue-reg"></div>
      <div className="shape-pill-purple-reg"></div>

      <div className="register-card">
        <div className="register-brand">
          <div className="register-logo">
            <Activity size={20} />
          </div>
        </div>

        <h2 className="register-title">Create account</h2>
        <p className="register-subtitle">Get started with API Insight</p>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleRegister} className="register-form">
          <div className="register-input-group">
            <User size={18} className="register-icon" />
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="register-input"
            />
          </div>

          <div className="register-input-group">
            <Mail size={18} className="register-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="register-input"
            />
          </div>

          <div className="register-input-group">
            <Lock size={18} className="register-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="register-input"
            />
          </div>

          <button type="submit" className="register-button">
            Register <ArrowRight size={16} />
          </button>
        </form>

        <p className="register-footer-text">
          Already have an account?{" "}
          <Link to="/login" className="register-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}