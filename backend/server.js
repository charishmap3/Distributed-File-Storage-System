const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const authRoutes = require('./routes/authRoutes');
const { ensureLocalChunkSchema } = require('./database/migrateSchema');
const downloadRoutes = require('./routes/downloadRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'distributed-file-storage-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api', downloadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File exceeds the configured maximum upload size.' });
  }

  console.error(error);
  return res.status(500).json({
    message: error.message || 'Something went wrong on the server.'
  });
});

const startServer = async () => {
  try {
    await ensureLocalChunkSchema();

    app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on port ${port}`);
    });

  } catch (error) {
    console.error('Unable to start server:', error.message);
    process.exit(1);
  }
};

startServer();
