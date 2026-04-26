# ⬡ LogStream Monitor

A real-time log monitoring application built with **React**, **Node.js (Express)**, **MongoDB**, and **Socket.IO**.

## Features

- 📡 **Real-time updates** via WebSocket (Socket.IO)
- 🔍 **Filter logs** by level, service, message search, and date range
- 📊 **Stats dashboard** (total logs, per-level counts, errors in last hour)
- ➕ **Add logs manually** via UI form
- 🌱 **Seed demo data** (50 random logs across services)
- 🗑️ **Clear logs** with one click
- 📄 **Pagination** for large log sets
- 🔔 **Error notifications** for live incoming ERROR logs

## Tech Stack

| Layer    | Tech                        |
|----------|-----------------------------|
| Frontend | React 18 + Vite             |
| Backend  | Node.js + Express           |
| Database | MongoDB + Mongoose          |
| Realtime | Socket.IO                   |
| Styling  | Pure CSS (no UI library)    |

---

## Quick Start

### Option A: Docker Compose (Recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- MongoDB: localhost:27017

### Option B: Manual Setup

**Prerequisites:** Node.js 18+, MongoDB running locally

**Backend:**
```bash
cd backend
npm install
npm start          # Starts on port 4000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev        # Starts on port 3000
```

---

## API Reference

| Method | Endpoint       | Description                        |
|--------|----------------|------------------------------------|
| GET    | /api/logs      | Get logs (filter: level, service, search, from, to, page) |
| POST   | /api/logs      | Create a log entry                 |
| DELETE | /api/logs      | Delete logs (filter: level, before)|
| GET    | /api/stats     | Get statistics                     |
| GET    | /api/services  | List distinct services             |
| POST   | /api/seed      | Seed 50 demo logs                  |

### Log Schema
```json
{
  "level": "INFO | WARN | ERROR | DEBUG",
  "message": "string",
  "service": "string",
  "timestamp": "ISO date (auto)",
  "meta": { "any": "object" }
}
```

### WebSocket Events
- `new-log` — emitted whenever a new log is saved

---

## Project Structure

```
logs-monitor/
├── backend/
│   ├── server.js          # Express + Mongoose + Socket.IO
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── components/
│   │       ├── StatsBar.jsx
│   │       ├── Filters.jsx
│   │       ├── LogsTable.jsx
│   │       └── LogForm.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```
