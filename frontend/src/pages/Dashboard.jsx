import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import {
  Activity,
  LayoutDashboard,
  Globe,
  Key,
  BarChart2,
  Sparkles,
  Settings,
  LogOut,
  Search,
  Zap,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Download,
  Trash2,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "./Dashboard.css";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [endpoints, setEndpoints] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isRealtime, setIsRealtime] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiInsights, setAiInsights] = useState([]);

  // Target Form State
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [method, setMethod] = useState("GET");
  const [frequency, setFrequency] = useState(60);

  const [stats, setStats] = useState({
    totalRequests: 0,
    avgResponseTime: "0ms",
    errorRate: "0.00%",
    successRate: "100.00%",
  });

  const [trafficData, setTrafficData] = useState([]);
  const [topEndpoints, setTopEndpoints] = useState([]);
  const [methodData, setMethodData] = useState([]);

  const navigate = useNavigate();

  const user = (() => {
    try {
      const rawUser = localStorage.getItem("user");
      return rawUser && rawUser !== "undefined" ? JSON.parse(rawUser) : {};
    } catch (e) {
      return {};
    }
  })();

  const displayName = user.name || (user.email ? user.email.split("@")[0] : "User");
  const displayEmail = user.email || "";
  const displayInitial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    fetchEndpoints();
    fetchStats();
    fetchChartAnalytics();
  }, []);

  // Auto-polling every 10 seconds in Realtime mode
  useEffect(() => {
    if (!isRealtime) return;
    const interval = setInterval(() => {
      fetchStats();
      fetchChartAnalytics();
      fetchEndpoints();
    }, 10000);
    return () => clearInterval(interval);
  }, [isRealtime]);

  const fetchEndpoints = async () => {
    try {
      const { data } = await API.get("/endpoints");
      setEndpoints(data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await API.get("/endpoints/stats");
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
    }
  };

  const fetchChartAnalytics = async () => {
    try {
      const { data } = await API.get("/endpoints/chart-data");
      setTrafficData(data.trafficOverview || []);
      setTopEndpoints(data.topEndpoints || []);
      setMethodData(data.methodDistribution || []);
    } catch (err) {
      console.error("Failed to fetch chart analytics:", err);
    }
  };

  const triggerAiAnalysis = async () => {
    setShowAiModal(true);
    try {
      const { data } = await API.post("/ai/analyze");
      setAiInsights(data.insights || []);
    } catch (err) {
      console.error("Failed to run AI diagnostics", err);
    }
  };

  const exportCsvReport = () => {
    const csvRows = [
      ["Endpoint Name", "Target URL", "Method", "Frequency (s)", "Status"],
      ...endpoints.map((e) => [e.name, e.url, e.method, e.frequency, e.status || "PENDING"]),
    ];
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `API_Insight_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddEndpoint = async (e) => {
    e.preventDefault();
    try {
      await API.post("/endpoints", {
        name,
        url,
        method,
        frequency: Number(frequency),
      });
      setName("");
      setUrl("");
      setShowAddForm(false);
      fetchEndpoints();
      fetchStats();
      fetchChartAnalytics();
    } catch (err) {
      alert("Failed to add endpoint");
    }
  };

  const handleDeleteEndpoint = async (id) => {
    if (!window.confirm("Delete this endpoint?")) return;
    try {
      await API.delete(`/endpoints/${id}`);
      fetchEndpoints();
      fetchStats();
      fetchChartAnalytics();
    } catch (err) {
      alert("Failed to delete endpoint");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const filteredEndpoints = endpoints.filter(
    (ep) =>
      ep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ep.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const COLORS = ["#2563eb", "#00b87c", "#f59e0b", "#ef4444"];

  return (
    <div className="dashboard-container">
      {/* Sidebar Nav */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <Activity size={18} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>API Insight</div>
              <div style={{ fontSize: "11px", color: "#9ca3af" }}>Production Mode</div>
            </div>
          </div>

          <nav className="sidebar-menu">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`menu-btn ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <LayoutDashboard size={18} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab("endpoints")}
              className={`menu-btn ${activeTab === "endpoints" ? "active" : ""}`}
            >
              <Globe size={18} /> API Endpoints
            </button>
            <button
              onClick={() => setActiveTab("keys")}
              className={`menu-btn ${activeTab === "keys" ? "active" : ""}`}
            >
              <Key size={18} /> API Keys
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`menu-btn ${activeTab === "analytics" ? "active" : ""}`}
            >
              <BarChart2 size={18} /> Analytics
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              className={`menu-btn ${activeTab === "settings" ? "active" : ""}`}
            >
              <Settings size={18} /> Settings
            </button>
          </nav>
        </div>

        <div>
          {/* Single AI Trigger Button */}
          <button className="ask-ai-btn" onClick={triggerAiAnalysis}>
            <Sparkles size={16} /> Ask AI Insights <span className="red-dot"></span>
          </button>

          <div className="sidebar-user">
            <div className="user-info">
              <div className="user-avatar">{displayInitial}</div>
              <div style={{ fontSize: "12px", overflow: "hidden" }}>
                <div style={{ fontWeight: "700" }}>{displayName}</div>
                <div style={{ color: "#6b7280", fontSize: "10px" }}>{displayEmail}</div>
              </div>
            </div>
            <button onClick={handleLogout} className="delete-action-btn" title="Logout">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <header className="top-nav">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search APIs, endpoints, logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="nav-actions">
            <button
              onClick={() => setIsRealtime(!isRealtime)}
              className="action-pill"
              style={{ background: isRealtime ? "#e6f8f2" : "#ffffff", color: isRealtime ? "#00b87c" : "#334155" }}
            >
              <Calendar size={14} /> {isRealtime ? "Realtime Active" : "Paused"}
            </button>
            <button className="action-pill" onClick={() => setShowAddForm(!showAddForm)}>
              + Add Endpoint
            </button>
            <button className="btn-black" onClick={exportCsvReport}>
              <Download size={14} /> Export Report
            </button>
          </div>
        </header>

        {/* API Keys Tab View */}
        {activeTab === "keys" && (
          <div className="content-card" style={{ marginTop: "24px" }}>
            <h3>API Keys Management</h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
              Generate bearer tokens to expose API Insight telemetry to external services.
            </p>
            <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "8px", fontFamily: "monospace", fontSize: "13px", color: "#334155", border: "1px solid #e2e8f0" }}>
              api_insight_live_sec_8923489127391823719
            </div>
          </div>
        )}

        {/* Settings Tab View */}
        {activeTab === "settings" && (
          <div className="content-card" style={{ marginTop: "24px" }}>
            <h3>Account & Alerting Settings</h3>
            <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
              Manage notification email thresholds and webhook integrations.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "320px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600" }}>Alert Email</label>
              <input type="email" defaultValue={displayEmail} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "13px" }} />
            </div>
          </div>
        )}

        {/* Dashboard / Analytics / Endpoints Tab View */}
        {(activeTab === "dashboard" || activeTab === "analytics" || activeTab === "endpoints") && (
          <>
            <div style={{ margin: "20px 0" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#111827" }}>API Analytics</h2>
              <p style={{ color: "#6b7280", fontSize: "13px" }}>
                Live performance and status telemetry connected directly to your database
              </p>
            </div>

            {/* Metric Summary Cards */}
            <section className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon" style={{ background: "#e6f8f2", color: "#00b87c" }}>
                    <Zap size={16} />
                  </div>
                  <span className="stat-pill-up" style={{ background: "#e6f8f2", color: "#00b87c" }}>Live</span>
                </div>
                <div>
                  <div className="stat-value">{stats.totalRequests}</div>
                  <div className="stat-label">Total Requests</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                    <Clock size={16} />
                  </div>
                  <span className="stat-pill-up" style={{ background: "#eff6ff", color: "#2563eb" }}>Latency</span>
                </div>
                <div>
                  <div className="stat-value">{stats.avgResponseTime}</div>
                  <div className="stat-label">Avg Response Time</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon" style={{ background: "#fef2f2", color: "#ef4444" }}>
                    <AlertTriangle size={16} />
                  </div>
                  <span className="stat-pill-up" style={{ background: "#fef2f2", color: "#ef4444" }}>Errors</span>
                </div>
                <div>
                  <div className="stat-value">{stats.errorRate}</div>
                  <div className="stat-label">Error Rate</div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-header">
                  <div className="stat-icon" style={{ background: "#f3e8ff", color: "#9333ea" }}>
                    <CheckCircle2 size={16} />
                  </div>
                  <span className="stat-pill-up" style={{ background: "#f3e8ff", color: "#9333ea" }}>Health</span>
                </div>
                <div>
                  <div className="stat-value">{stats.successRate}</div>
                  <div className="stat-label">Success Rate</div>
                </div>
              </div>
            </section>

            {/* Add Target Form Card */}
            {showAddForm && (
              <div className="content-card" style={{ margin: "20px 0" }}>
                <h3>Register Target Endpoint</h3>
                <form onSubmit={handleAddEndpoint} style={{ display: "grid", gridTemplateColumns: "2fr 3fr 1fr 1fr auto", gap: "12px", marginTop: "16px" }}>
                  <input type="text" placeholder="API Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <input type="url" placeholder="https://jsonplaceholder.typicode.com/todos/1" value={url} onChange={(e) => setUrl(e.target.value)} required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <input type="number" value={frequency} onChange={(e) => setFrequency(e.target.value)} min="10" required style={{ padding: "10px", borderRadius: "8px", border: "1px solid #e5e7eb" }} />
                  <button type="submit" className="btn-black">Save Target</button>
                </form>
              </div>
            )}

            {/* Realtime Charts */}
            {(activeTab === "dashboard" || activeTab === "analytics") && (
              <section className="content-card" style={{ margin: "24px 0" }}>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>🌐 Real-time API Traffic Logs</h3>
                  <p style={{ fontSize: "12px", color: "#6b7280" }}>Live latency timestamps from MongoDB</p>
                </div>

                <div style={{ width: "100%", height: 240 }}>
                  {trafficData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={trafficData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis dataKey="time" stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#0f172a", borderRadius: "8px", color: "#fff", border: "none" }} />
                        <Bar dataKey="responseTime" name="Response Time (ms)" fill="#00b87c" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ textAlign: "center", padding: "60px 0", color: "#9ca3af" }}>
                      No telemetry logs recorded yet. Add an endpoint to begin monitoring!
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Monitored Endpoints Table */}
            <section className="content-card" style={{ marginTop: "24px" }}>
              <div className="content-card-header" style={{ marginBottom: "16px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700" }}>Monitored Endpoints</h3>
              </div>
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>METHOD</th>
                    <th>NAME</th>
                    <th>TARGET URL</th>
                    <th>INTERVAL</th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEndpoints.map((ep) => (
                    <tr key={ep._id}>
                      <td>
                        <span className="method-tag">{ep.method}</span>
                      </td>
                      <td style={{ fontWeight: "700" }}>{ep.name}</td>
                      <td style={{ color: "#6b7280", fontFamily: "monospace" }}>{ep.url}</td>
                      <td>{ep.frequency}s</td>
                      <td>
                        <span className="status-badge-active">
                          <CheckCircle2 size={14} /> {ep.status || "PENDING"}
                        </span>
                      </td>
                      <td>
                        <button onClick={() => handleDeleteEndpoint(ep._id)} className="delete-action-btn">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}

        {/* Modal Overlay for AI Insights */}
        {showAiModal && (
          <div className="modal-overlay" onClick={() => setShowAiModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700" }}>🤖 AI Diagnostic Engine</h3>
                <button onClick={() => setShowAiModal(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#64748b" }}>
                  <X size={18} />
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#6b7280", marginBottom: "16px" }}>
                Automated telemetry root-cause analysis from MongoDB
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {aiInsights.length > 0 ? (
                  aiInsights.map((insight, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "12px",
                        borderRadius: "8px",
                        background: insight.type === "CRITICAL" ? "#fef2f2" : "#f8fafc",
                        borderLeft: `4px solid ${insight.type === "CRITICAL" ? "#ef4444" : "#2563eb"}`,
                      }}
                    >
                      <div style={{ fontWeight: "700", fontSize: "13px", color: "#0f172a" }}>{insight.title}</div>
                      <div style={{ fontSize: "12px", color: "#4b5563", marginTop: "4px" }}>{insight.description}</div>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: "12px", color: "#9ca3af", textAlign: "center", padding: "20px 0" }}>
                    Running AI diagnostics against recent logs...
                  </div>
                )}
              </div>
              <button className="btn-black" style={{ marginTop: "20px", width: "100%", justifyContent: "center" }} onClick={() => setShowAiModal(false)}>
                Close Diagnostic Panel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}