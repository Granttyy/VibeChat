import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: { connectTimeout: 60000, lazyConnect: true },
});

redisClient.on('error',   (err) => console.error('Redis error:', err));
redisClient.on('connect', ()    => console.log('Redis connected'));
redisClient.on('ready',   ()    => console.log('Redis ready'));

try {
  await redisClient.connect();
} catch (err) {
  console.error('Failed to connect to Redis:', err);
  process.exit(1); // don't run with a dead Redis connection
}

export const setupSocketEvents = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // BUG 3 FIX: track in-flight search per socket so double-clicks are ignored
    socket.data.searching = false;

    socket.on('START_SEARCH', async () => {

      // BUG 1 FIX: debounce guard — drop concurrent/duplicate START_SEARCH events
      if (socket.data.searching || socket.data.roomId) return;
      socket.data.searching = true;

      console.log(`START_SEARCH from ${socket.id}`);

      try {
        // Use the upgraded SET-based queue from RedisService, 
        // or inline with the raw client as below:
        const partnerId = await redisClient.sPop('waiting_queue');

        // Self-match guard (relevant if the SET had a stale entry for this socket)
        if (partnerId === socket.id) {
          await redisClient.sAdd('waiting_queue', partnerId);
          await redisClient.sAdd('waiting_queue', socket.id);
          socket.emit('WAITING', { status: 'pending', message: 'Waiting for a match...' });
          return;
        }

        if (partnerId) {
          // BUG 2 FIX: verify the partner socket is still alive BEFORE committing
          const partnerSocket = io.sockets.sockets.get(partnerId);

          if (!partnerSocket) {
            // Ghost partner — log it, drop them, push ourselves, tell client to wait
            console.warn(`Ghost partner ${partnerId} removed from queue`);
            // Don't re-add the ghost. Push current user instead.
            await redisClient.sAdd('waiting_queue', socket.id);

            // BUG 3 FIX: always emit WAITING so the client isn't left in limbo
            socket.emit('WAITING', { status: 'pending', message: 'Waiting for a match...' });
            return;
          }

          // Partner is alive — create the room
          const roomId = `room_${partnerId}_${socket.id}`;

          socket.join(roomId);
          partnerSocket.join(roomId);

          socket.data.roomId       = roomId;
          partnerSocket.data.roomId = roomId;

          // Clear the searching flag for both sockets
          socket.data.searching       = false;
          partnerSocket.data.searching = false;

          console.log(`MATCH_FOUND: ${roomId}`);

          io.to(roomId).emit('MATCH_FOUND', {
            status:  'success',
            message: 'You are now chatting with a stranger!',
            roomId,
          });

        } else {
          // Queue was empty — add ourselves and wait
          await redisClient.sAdd('waiting_queue', socket.id);
          socket.emit('WAITING', { status: 'pending', message: 'Waiting for a match...' });
        }

      } catch (err) {
        console.error(`START_SEARCH error for ${socket.id}:`, err);
        socket.emit('ERROR', { message: 'Search failed. Please try again.' });
      } finally {
        // Always release the lock so the user can retry after an error
        socket.data.searching = false;
      }
    });

    socket.on('SEND_MESSAGE', ({ message, sender }) => {
      const { roomId } = socket.data;
      if (!roomId) return;

      socket.to(roomId).emit('RECEIVE_MESSAGE', {
        message,
        sender: sender || socket.id,
        timestamp: new Date().toLocaleTimeString(),
      });
    });

    socket.on('LEAVE_CHAT', async () => {
      const { roomId } = socket.data;

      if (roomId) {
        socket.to(roomId).emit('PARTNER_LEFT', { message: 'Stranger disconnected.' });
        socket.leave(roomId);
        socket.data.roomId = null;
      } else {
        // Cancel while waiting — remove from SET (O(1), no scan)
        await redisClient.sRem('waiting_queue', socket.id);
      }

      socket.data.searching = false;
    });

    socket.on('disconnect', async () => {
      const { roomId } = socket.data;

      if (roomId) {
        socket.to(roomId).emit('PARTNER_LEFT', { message: 'Stranger disconnected.' });
      } else {
        await redisClient.sRem('waiting_queue', socket.id);
      }

      console.log(`User disconnected: ${socket.id}`);
    });
  });
};