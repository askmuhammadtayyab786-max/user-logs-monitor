import { useState } from "react";

const LEVELS = ["INFO", "WARN", "ERROR", "DEBUG"];

export default function LogForm({ onSubmit, onCancel, services }) {
  const [form, setForm] = useState({
    level: "INFO",
    service: services[0] || "app",
    message: "",
    meta: "",
  });
  const [error, setError] = useState("");

  const set = (key) => (e) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  const handleSubmit = () => {
    if (!form.message.trim()) {
      setError("Message is required");
      return;
    }
    let meta = undefined;
    if (form.meta.trim()) {
      try {
        meta = JSON.parse(form.meta);
      } catch {
        setError("Meta must be valid JSON");
        return;
      }
    }
    setError("");
    onSubmit({ ...form, meta });
  };

  return (
    <div className="log-form">
      <div className="log-form__header">
        <span className="log-form__title">// NEW LOG ENTRY</span>
        <button className="btn-icon" onClick={onCancel}>
          ✕
        </button>
      </div>

      <div className="log-form__body">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">LEVEL</label>
            <select className="filter-select" value={form.level} onChange={set("level")}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">SERVICE</label>
            <input
              className="filter-input"
              list="service-list"
              value={form.service}
              onChange={set("service")}
              placeholder="e.g. api-gateway"
            />
            <datalist id="service-list">
              {services.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">MESSAGE</label>
          <input
            className="filter-input"
            value={form.message}
            onChange={set("message")}
            placeholder="Log message..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">META (JSON optional)</label>
          <textarea
            className="filter-input filter-textarea"
            value={form.meta}
            onChange={set("meta")}
            placeholder='{"key": "value"}'
            rows={3}
          />
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="form-actions">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit}>
            Add Log
          </button>
        </div>
      </div>
    </div>
  );
}
