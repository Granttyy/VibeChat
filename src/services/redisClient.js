import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => {
      console.error('❌ Redis Connection Error:', err.message);
    });

    this.client.on('connect', () => {
      console.log('✅ Connected to Redis');
    });

    this.client.on('reconnecting', () => {
      console.warn('🔄 Redis reconnecting...');
    });

    this.client.on('end', () => {
      console.warn('🔌 Redis connection closed');
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      await this.client.connect();
    }
  }

  // Push user to the waiting list
  async joinQueue(userId) {
    return await this.client.lPush('vibe_queue', userId);
  }

  // Pull a random partner
  async popPartner() {
    return await this.client.rPop('vibe_queue');
  }

  // Remove user if they cancel/disconnect while waiting
  async removeFromQueue(userId) {
    return await this.client.lRem('vibe_queue', 0, userId);
  }

  // Graceful shutdown
  async disconnect() {
    if (this.client.isOpen) {
      await this.client.quit();
      console.log('👋 Redis disconnected gracefully');
    }
  }
}

export default new RedisService();