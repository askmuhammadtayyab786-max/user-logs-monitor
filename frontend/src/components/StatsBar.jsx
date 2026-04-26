export default function StatsBar({ stats }) {
  if (!stats) {
    return (
      <div className="stats-bar">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card skeleton" />
        ))}
      </div>
    );
  }

  const byLevel = Object.fromEntries(
    (stats.byLevel || []).map((b) => [b._id, b.count])
  );

  const cards = [
    { label: "TOTAL LOGS", value: stats.total ?? 0, color: "var(--text)", icon: "▤" },
    { label: "ERRORS (1h)", value: stats.recentErrors ?? 0, color: "var(--red)", icon: "✕" },
    { label: "WARNINGS", value: byLevel.WARN ?? 0, color: "var(--yellow)", icon: "⚠" },
    { label: "INFO", value: byLevel.INFO ?? 0, color: "var(--blue)", icon: "ℹ" },
  ];

  return (
    <div className="stats-bar">
      {cards.map(({ label, value, color, icon }) => (
        <div key={label} className="stat-card">
          <div className="stat-icon" style={{ color }}>
            {icon}
          </div>
          <div className="stat-body">
            <div className="stat-value" style={{ color }}>
              {value.toLocaleString()}
            </div>
            <div className="stat-label">{label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
