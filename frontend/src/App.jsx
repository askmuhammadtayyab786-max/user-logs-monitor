import { useState, useEffect, useCallback, useRef } from "react";
import { io } from "socket.io-client";
import StatsBar from "./components/StatsBar";
import LogsTable from "./components/LogsTable";
import Filters from "./components/Filters";
import LogForm from "./components/LogForm";
import "./App.css";

const API = "http://3.104.2.196:4000/api";

export default function App() {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [services, setServices] = useState([]);
  const [filters, setFilters] = useState({
    level: "ALL",
    service: "ALL",
    search: "",
    from: "",
    to: "",
  });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(false);
  const [liveMode, setLiveMode] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState(null);
  const socketRef = useRef(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchLogs = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ ...filters, page, limit: 50 });
        const res = await fetch(`${API}/logs?${params}`);
        const data = await res.json();
        setLogs(data.logs);
        setPagination({
          page: data.page,
          pages: data.pages,
          total: data.total,
        });
      } catch (e) {
        notify("Failed to fetch logs", "error");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const fetchStats = useCallback(async () => {
    try {
      const [statsRes, servicesRes] = await Promise.all([
        fetch(`${API}/stats`),
        fetch(`${API}/services`),
      ]);
      setStats(await statsRes.json());
      setServices(await servicesRes.json());
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [fetchLogs, fetchStats]);

  useEffect(() => {
    if (!liveMode) {
      if (socketRef.current) socketRef.current.disconnect();
      return;
    }
    const socket = io("http://3.104.2.196:4000");
    socketRef.current = socket;
    socket.on("new-log", (log) => {
      setLogs((prev) => [log, ...prev].slice(0, 50));
      fetchStats();
      if (log.level === "ERROR")
        notify(`🔴 ERROR in ${log.service}: ${log.message}`, "error");
    });
    return () => socket.disconnect();
  }, [liveMode, fetchStats]);

  const handleSeed = async () => {
    await fetch(`${API}/seed`, { method: "POST" });
    fetchLogs();
    fetchStats();
    notify("50 demo logs seeded!");
  };

  const handleClear = async () => {
    if (!confirm("Clear all logs?")) return;
    await fetch(`${API}/logs`, { method: "DELETE" });
    fetchLogs();
    fetchStats();
    notify("Logs cleared");
  };

  const handleAddLog = async (data) => {
    await fetch(`${API}/logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    fetchLogs();
    fetchStats();
    setShowForm(false);
    notify("Log added");
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <span className="logo-icon">⬡</span>
            <span className="logo-text">LOGSTREAM</span>
          </div>
          <div
            className={`live-badge ${liveMode ? "active" : ""}`}
            onClick={() => setLiveMode((v) => !v)}
          >
            <span className="pulse" />
            {liveMode ? "LIVE" : "PAUSED"}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={handleSeed}>
            Seed Demo
          </button>
          <button className="btn btn-ghost btn-danger" onClick={handleClear}>
            Clear All
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm((v) => !v)}
          >
            + Add Log
          </button>
        </div>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.msg}
        </div>
      )}

      <StatsBar stats={stats} />

      <div className="main">
        <Filters
          filters={filters}
          setFilters={setFilters}
          services={services}
        />
        {showForm && (
          <LogForm
            onSubmit={handleAddLog}
            onCancel={() => setShowForm(false)}
            services={services}
          />
        )}
        <LogsTable
          logs={logs}
          loading={loading}
          pagination={pagination}
          onPageChange={(p) => fetchLogs(p)}
        />
      </div>
    </div>
  );
}
