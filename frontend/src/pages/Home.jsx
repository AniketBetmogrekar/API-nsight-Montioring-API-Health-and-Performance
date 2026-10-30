import React from "react";
import { Link } from "react-router-dom";
import { Activity, ShieldCheck, Zap, BarChart2, ArrowRight } from "lucide-react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      {/* Solid Light Background Shapes */}
      <div className="shape-circle-mint"></div>
      <div className="shape-square-blue"></div>
      <div className="shape-pill-purple"></div>

      {/* Navbar */}
      <nav className="home-nav">
        <div className="nav-brand">
          <div className="nav-logo">
            <Activity size={18} />
          </div>
          <span>API Insight</span>
        </div>
        <div className="nav-actions">
          <Link to="/login" className="btn-secondary">Sign In</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero Banner */}
      <header className="hero-section">
        
        <h1 className="hero-title">
          Monitor your APIs with <span>complete clarity</span>
        </h1>
        <p className="hero-subtitle">
          Organize your endpoint targets, schedule health checks, and review response statuses in a clean workspace.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn-primary btn-lg">
            Get Started <ArrowRight size={16} />
          </Link>
        </div>
      </header>

      {/* Feature Cards */}
      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon-box">
            <Zap size={22} />
          </div>
          <h3>Scheduled Pings</h3>
          <p>Configure custom ping frequencies for your API targets and inspect status responses.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <BarChart2 size={22} />
          </div>
          <h3>Structured Metrics</h3>
          <p>View organized logs and track endpoint response data across your services.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon-box">
            <ShieldCheck size={22} />
          </div>
          <h3>Protected Access</h3>
          <p>JWT-secured route protection keeps your dashboard and settings private.</p>
        </div>
      </section>
    </div>
  );
}