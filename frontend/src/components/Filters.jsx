export default function Filters({ filters, setFilters, services }) {
  const set = (key) => (e) =>
    setFilters((prev) => ({ ...prev, [key]: e.target.value }));

  const reset = () =>
    setFilters({ level: "ALL", service: "ALL", search: "", from: "", to: "" });

  const levels = ["ALL", "INFO", "WARN", "ERROR", "DEBUG"];

  const levelColor = {
    ALL: "var(--text2)",
    INFO: "var(--blue)",
    WARN: "var(--yellow)",
    ERROR: "var(--red)",
    DEBUG: "var(--purple)",
  };

  return (
    <div className="filters">
      <div className="filter-group">
        <label className="filter-label">LEVEL</label>
        <div className="level-pills">
          {levels.map((l) => (
            <button
              key={l}
              className={`level-pill ${filters.level === l ? "active" : ""}`}
              style={
                filters.level === l
                  ? { borderColor: levelColor[l], color: levelColor[l] }
                  : {}
              }
              onClick={() => setFilters((p) => ({ ...p, level: l }))}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <label className="filter-label">SERVICE</label>
        <select
          className="filter-select"
          value={filters.service}
          onChange={set("service")}
        >
          <option value="ALL">ALL SERVICES</option>
          {services.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group filter-group--search">
        <label className="filter-label">SEARCH</label>
        <input
          className="filter-input"
          placeholder="Search messages..."
          value={filters.search}
          onChange={set("search")}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">FROM</label>
        <input
          className="filter-input"
          type="datetime-local"
          value={filters.from}
          onChange={set("from")}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">TO</label>
        <input
          className="filter-input"
          type="datetime-local"
          value={filters.to}
          onChange={set("to")}
        />
      </div>

      <button className="btn btn-ghost btn-sm" onClick={reset}>
        Reset
      </button>
    </div>
  );
}
