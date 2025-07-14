const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs-extra');

const boardsRoutes = require('./routes/boards');
const threadsRoutes = require('./routes/threads');
const postsRoutes = require('./routes/posts');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const uploadsDir = path.join(__dirname, 'uploads');
fs.ensureDirSync(uploadsDir);

app.use('/api/boards', boardsRoutes);
app.use('/api/threads', threadsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://127.0.0.1:${PORT}/api/health`);
}); 