const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongo:27017/logsmonitor')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

// Log Schema
const logSchema = new mongoose.Schema({
  level: { type: String, enum: ['INFO', 'WARN', 'ERROR', 'DEBUG'], required: true },
  message: { type: String, required: true },
  service: { type: String, default: 'app' },
  timestamp: { type: Date, default: Date.now },
  meta: { type: mongoose.Schema.Types.Mixed }
});

logSchema.index({ timestamp: -1 });
logSchema.index({ level: 1 });
logSchema.index({ service: 1 });

const Log = mongoose.model('Log', logSchema);

// Routes
// GET logs with filters
app.get('/api/logs', async (req, res) => {
  try {
    const { level, service, search, limit = 100, page = 1, from, to } = req.query;
    const filter = {};
    if (level && level !== 'ALL') filter.level = level;
    if (service && service !== 'ALL') filter.service = service;
    if (search) filter.message = { $regex: search, $options: 'i' };
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const total = await Log.countDocuments(filter);
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ logs, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new log
app.post('/api/logs', async (req, res) => {
  try {
    const log = new Log(req.body);
    await log.save();
    io.emit('new-log', log);
    res.status(201).json(log);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE logs
app.delete('/api/logs', async (req, res) => {
  try {
    const { level, before } = req.query;
    const filter = {};
    if (level && level !== 'ALL') filter.level = level;
    if (before) filter.timestamp = { $lt: new Date(before) };
    const result = await Log.deleteMany(filter);
    res.json({ deleted: result.deletedCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats
app.get('/api/stats', async (req, res) => {
  try {
    const [total, byLevel, byService, recentErrors] = await Promise.all([
      Log.countDocuments(),
      Log.aggregate([{ $group: { _id: '$level', count: { $sum: 1 } } }]),
      Log.aggregate([{ $group: { _id: '$service', count: { $sum: 1 } } }]),
      Log.countDocuments({ level: 'ERROR', timestamp: { $gte: new Date(Date.now() - 3600000) } })
    ]);
    res.json({ total, byLevel, byService, recentErrors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET services list
app.get('/api/services', async (req, res) => {
  try {
    const services = await Log.distinct('service');
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Seed demo logs
app.post('/api/seed', async (req, res) => {
  try {
    const services = ['api-gateway', 'auth-service', 'payment-svc', 'user-service', 'mailer'];
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const messages = {
      INFO: ['Request completed successfully', 'User logged in', 'Cache updated', 'Service started', 'Scheduled job ran'],
      WARN: ['High memory usage detected', 'Slow query > 500ms', 'Rate limit approaching', 'Deprecated API used', 'Retry attempt 2/3'],
      ERROR: ['Database connection failed', 'Unhandled exception thrown', 'Payment declined', 'Timeout after 30s', 'Auth token invalid'],
      DEBUG: ['Entering function processOrder()', 'DB query: SELECT * FROM users', 'Cache miss for key: user:123', 'Webhook received', 'Config loaded']
    };

    const logs = Array.from({ length: 50 }, (_, i) => {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const service = services[Math.floor(Math.random() * services.length)];
      const msg = messages[level];
      return {
        level,
        service,
        message: msg[Math.floor(Math.random() * msg.length)],
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 3),
        meta: { requestId: `req-${Math.random().toString(36).slice(2, 10)}`, latency: Math.floor(Math.random() * 2000) }
      };
    });

    await Log.insertMany(logs);
    res.json({ seeded: logs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
