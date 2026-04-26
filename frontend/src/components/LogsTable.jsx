import { useState } from "react";

const LEVEL_COLOR = {
  INFO: "var(--blue)",
  WARN: "var(--yellow)",
  ERROR: "var(--red)",
  DEBUG: "var(--purple)",
};

function formatTs(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function LogsTable({ logs, loading, pagination, onPageChange }) {
  const [expanded, setExpanded] = useState(null);

  if (loading) {
    return (
      <div className="table-wrap">
        <div className="table-loading">
          <span className="spinner" /> Loading logs…
        </div>
      </div>
    );
  }

  if (!logs.length) {
    return (
      <div className="table-wrap">
        <div className="table-empty">
          <span>◈</span>
          <p>No logs found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="logs-table">
        <thead>
          <tr>
            <th>TIMESTAMP</th>
            <th>LEVEL</th>
            <th>SERVICE</th>
            <th>MESSAGE</th>
            <th>META</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => {
            const isOpen = expanded === log._id;
            return (
              <>
                <tr
                  key={log._id}
                  className={`log-row log-row--${log.level?.toLowerCase()} ${isOpen ? "open" : ""}`}
                  onClick={() => setExpanded(isOpen ? null : log._id)}
                >
                  <td className="col-ts">{formatTs(log.timestamp)}</td>
                  <td className="col-level">
                    <span
                      className="level-badge"
                      style={{ color: LEVEL_COLOR[log.level] }}
                    >
                      {log.level}
                    </span>
                  </td>
                  <td className="col-service">{log.service}</td>
                  <td className="col-msg">{log.message}</td>
                  <td className="col-meta">
                    {log.meta ? (
                      <span className="meta-hint">+meta</span>
                    ) : null}
                  </td>
                </tr>
                {isOpen && log.meta && (
                  <tr key={`${log._id}-detail`} className="log-detail">
                    <td colSpan={5}>
                      <pre className="meta-pre">
                        {JSON.stringify(log.meta, null, 2)}
                      </pre>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            className="btn btn-ghost btn-sm"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange(pagination.page - 1)}
          >
            ← Prev
          </button>
          <span className="page-info">
            Page {pagination.page} / {pagination.pages}
            <span className="page-total"> ({pagination.total} total)</span>
          </span>
          <button
            className="btn btn-ghost btn-sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
