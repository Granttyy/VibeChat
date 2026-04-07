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
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

app.get('/', (req, res) => {
  res.send('🚀 VibeChat Server is Online!');
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