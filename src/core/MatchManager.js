import redis from '../services/redisClient.js';

class MatchManager {
    constructor() {
        this.users = new Map(); // Store active User objects
    }

    async handleStart(user) {
        user.isSearching = true;
        const partnerId = await redis.popPartner();

        if (partnerId && partnerId !== user.id) {
            const partner = this.users.get(partnerId);
            
            if (partner) {
                const roomId = `room_${user.id}_${partnerId}`;
                user.setRoom(roomId);
                partner.setRoom(roomId);

                user.emit('MATCH_FOUND', { message: 'Matched!' });
                partner.emit('MATCH_FOUND', { message: 'Matched!' });
            } else {
                // Partner disconnected while in queue, user goes to queue
                await redis.joinQueue(user.id);
            }
        } else {
            await redis.joinQueue(user.id);
            user.emit('WAITING', { message: 'Searching...' });
        }
    }

    handleDisconnect(user) {
        redis.removeFromQueue(user.id);
        this.users.delete(user.id);
    }
}

export default new MatchManager();