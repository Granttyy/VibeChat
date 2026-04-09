import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import redisService from './services/redisClient.js';
import { setupSocketEvents } from './services/socketServer.js';
import { config } from './config.js';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('🚀 VibeChat Server is Online!');
});

// Simple health check for Render
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

app.get('/health', async (req, res) => {
  try {
    // Test Redis connection
    await redisService.ping();
    res.json({
      status: 'healthy',
      redis: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      redis: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

async function bootstrap() {
  try {
    console.log('1. Connecting to Redis...');
    await redisService.connect();
    console.log('2. Redis connected!');

    setupSocketEvents(io);

    const PORT = process.env.PORT || 3000;
    console.log(`Starting server on port ${PORT}...`);

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 3. VibeChat running on port ${PORT}`);
      console.log(`Server listening on 0.0.0.0:${PORT}`);
    });

    // Handle server errors
    httpServer.on('error', (error) => {
      console.error('Server error:', error);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('💥 Bootstrap Error:', err);
    process.exit(1);
  }
}

bootstrap();