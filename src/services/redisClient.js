import { createClient } from 'redis';

class RedisService {
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    // 1. SAFE CONNECT GUARD — deduplicates concurrent connect() calls
    this._connectPromise = null;

    this.client.on('error',       (err) => console.error('❌ Redis error:', err.message));
    this.client.on('connect',     ()    => console.log('✅ Connected to Redis'));
    this.client.on('reconnecting',()    => console.warn('🔄 Redis reconnecting...'));
    this.client.on('end',         ()    => console.warn('🔌 Redis connection closed'));
  }

  // 2. SAFE CONNECT — only one connect() runs at a time, all callers await the same promise
  async connect() {
    if (this.client.isOpen) return;

    if (!this._connectPromise) {
      this._connectPromise = this.client
        .connect()
        .finally(() => {
          this._connectPromise = null; // reset so reconnect works after a failure
        });
    }

    return this._connectPromise;
  }

  // 3. HELPER — auto-connect before any operation
  async #cmd(fn) {
    await this.connect();
    return fn();
  }

  // 4. UPGRADED QUEUE — LIST → SET
  //    sAdd is idempotent (no duplicates) and O(1)
  async joinQueue(userId) {
    return this.#cmd(() => this.client.sAdd('waiting_queue', userId));
  }

  // sRem is O(1) — no full-list scan like lRem
  async removeFromQueue(userId) {
    return this.#cmd(() => this.client.sRem('waiting_queue', userId));
  }

  // sPop picks a random member and removes it atomically
  // Pass the requesting userId to guard against self-matching
  async popPartner(excludeId = null) {
    return this.#cmd(async () => {
      const partner = await this.client.sPop('waiting_queue');

      // Self-match: put them back and return null
      if (partner && partner === excludeId) {
        await this.client.sAdd('waiting_queue', partner);
        return null;
      }

      return partner ?? null;
    });
  }

  async ping() {
    return this.#cmd(() => this.client.ping());
  }

  async disconnect() {
    if (this.client.isOpen) {
      await this.client.quit();
      console.log('👋 Redis disconnected gracefully');
    }
  }
}

export default new RedisService();