import { createClient } from 'redis';

// Initialize the Redis Client
const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 60000,
    lazyConnect: true,
  }
});

redisClient.on('error', (err) => console.error('Redis connection error:', err));
redisClient.on('connect', () => console.log('Redis connected successfully'));
redisClient.on('ready', () => console.log('Redis client ready'));

// Connect to Redis
try {
  await redisClient.connect();
  console.log('Redis client initialized');
} catch (error) {
  console.error('Failed to connect to Redis:', error);
}

export const setupSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Feature 1 & 2: Click Start & Match with Stranger
    socket.on('START_SEARCH', async () => {
      console.log(`START_SEARCH received from ${socket.id}`);
      try {
        // Attempt to pull a waiting user from the right side of the Redis list
        const partnerId = await redisClient.rPop('waiting_queue');
        console.log(`Popped partnerId: ${partnerId} for user ${socket.id}`);

        if (partnerId && partnerId !== socket.id) {
          // Partner found. Verify their socket is still actively connected.
          const partnerSocket = io.sockets.sockets.get(partnerId);
          console.log(`Partner socket found: ${!!partnerSocket} for partnerId: ${partnerId}`);

          if (partnerSocket) {
            // Create a secure, isolated Room ID
            const roomId = `room_${partnerId}_${socket.id}`;

            socket.join(roomId);
            partnerSocket.join(roomId);

            // Store room state directly on the socket instance for quick reference
            socket.data.roomId = roomId;
            partnerSocket.data.roomId = roomId;

            console.log(`MATCH_FOUND: Created room ${roomId} for users ${socket.id} and ${partnerId}`);

            // Broadcast to the room that a match occurred
            io.to(roomId).emit('MATCH_FOUND', {
              status: 'success',
              message: 'You are now chatting with a stranger!',
              roomId,
            });
          } else {
            // Partner dropped out while in queue. Push the current user into the queue instead.
            console.log(`Partner ${partnerId} not found, pushing ${socket.id} to queue`);
            await redisClient.lPush('waiting_queue', socket.id);
          }
        } else {
          // Queue is empty. Push this user to the left side of the list.
          console.log(`No partner found, pushing ${socket.id} to waiting queue`);
          await redisClient.lPush('waiting_queue', socket.id);
          socket.emit('WAITING', { status: 'pending', message: 'Waiting for a match...' });
        }
      } catch (error) {
        console.error(`Error in START_SEARCH for ${socket.id}:`, error);
      }
    });

    // Feature 3: Chat in Real-Time
    socket.on('SEND_MESSAGE', (messageData) => {
      const roomId = socket.data.roomId;
      if (roomId) {
        socket.to(roomId).emit('RECEIVE_MESSAGE', {
          message: messageData.message,
          sender: messageData.sender || socket.id,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    });

    // Feature 4: Disconnect / Find New Partner
    socket.on('LEAVE_CHAT', async () => {
      const roomId = socket.data.roomId;
      
      if (roomId) {
        // Inform the partner that the chat has ended
        socket.to(roomId).emit('PARTNER_LEFT', { message: 'Stranger disconnected.' });
        
        // Remove current user from the room
        socket.leave(roomId);
        socket.data.roomId = null;
      } else {
        // If the user cancels while actively waiting in the queue, remove their ID
        await redisClient.lRem('waiting_queue', 0, socket.id);
      }
    });

    // Global Cleanup: Handle abrupt browser closures
    socket.on('disconnect', async () => {
      const roomId = socket.data.roomId;
      
      if (roomId) {
        socket.to(roomId).emit('PARTNER_LEFT', { message: 'Stranger disconnected.' });
      } else {
        await redisClient.lRem('waiting_queue', 0, socket.id);
      }
      
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};