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

    httpServer.listen(config.PORT, '0.0.0.0', () => {
      console.log(`🚀 3. VibeChat running on port ${config.PORT}`);
    });
  } catch (err) {
    console.error('💥 Bootstrap Error:', err);
    process.exit(1);
  }
}

bootstrap();