import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import redisService from './services/redisClient.js';
import { setupSocketEvents } from './services/socketServer.js';
import { config } from './config.js';

const app = express();
const httpServer = createServer(app);

// Parse allowed origins from comma-separated list
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://vibechattt.vercel.app,http://localhost:3000,http://localhost:3001')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

console.log('Allowed CORS Origins:', allowedOrigins);

// Add CORS headers middleware for HTTP requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const isAllowed = allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin);
  
  if (isAllowed) {
    // Always set the origin header to the requested origin
    res.header('Access-Control-Allow-Origin', origin || allowedOrigins[0] || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Socket-ID');
    res.header('Access-Control-Expose-Headers', 'Content-Length, X-JSON-Response');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const io = new Server(httpServer, {
  transports: ['websocket', 'polling'],  // WebSocket first, then polling fallback
  cors: {
    origin: (origin, callback) => {
      if (allowedOrigins.includes('*') || !origin || allowedOrigins.includes(origin)) {
        console.log(`✅ CORS allowed for origin: ${origin}`);
        callback(null, true);
      } else {
        console.error(`❌ CORS rejected origin: ${origin}`);
        callback(new Error('CORS not allowed'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
    allowEIO3: true,  // Support Socket.IO v3 clients
  },
  // Polling configuration for Render compatibility
  pingInterval: 25000,  // Send ping every 25s
  pingTimeout: 60000,   // Wait 60s for pong before considering disconnected
  upgradeTimeout: 10000, // Timeout for WebSocket upgrade attempt
  maxHttpBufferSize: 1e6,
});
// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit, just log
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit, just log
});
app.get('/', (req, res) => {
  res.send('🚀 VibeChat Server is Online!');
});

// Simple health check for Render
app.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

// Comprehensive health check
app.get('/health', async (req, res) => {
  try {
    // Test Redis connection
    await redisService.ping();
    res.json({
      status: 'healthy',
      redis: 'connected',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Health check failed:', error);
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

    // Setup socket events with error handling
    try {
      setupSocketEvents(io);
      console.log('3. Socket events setup complete');
    } catch (socketError) {
      console.error('Error setting up socket events:', socketError);
      // Continue anyway - socket setup failure shouldn't crash the server
    }

    const PORT = process.env.PORT || 3000;
    console.log(`Starting server on port ${PORT}...`);

    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 3. VibeChat running on port ${PORT}`);
      console.log(`Server listening on 0.0.0.0:${PORT}`);
    });

    // Handle server errors
    httpServer.on('error', (error) => {
      console.error('Server error:', error);
      // Don't exit, just log the error
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received, shutting down gracefully');
      httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('💥 Bootstrap Error:', err);
    // Don't exit, try to keep server running
  }
}

bootstrap();