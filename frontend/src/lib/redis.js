// Redis client singleton with reconnection handling
import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class RedisClient {
  constructor() {
    this.client = null;
    this.isReady = false;
  }

  async connect() {
    if (this.client && this.isReady) {
      return this.client;
    }

    if (!this.client) {
      this.client = createClient({
        url: REDIS_URL,
      });

      this.client.on('error', (err) => {
        console.error('Redis client error:', err);
        this.isReady = false;
      });

      this.client.on('ready', () => {
        this.isReady = true;
      });

      this.client.on('reconnecting', () => {
        console.log('Redis client reconnecting...');
      });

      this.client.on('end', () => {
        console.log('Redis client disconnected');
        this.isReady = false;
      });
    }

    if (!this.isReady && !this.client.isOpen) {
      try {
        await this.client.connect();
        this.isReady = true;
      } catch (err) {
        console.error('Failed to connect to Redis:', err);
        // If connection fails due to socket already opened, mark as ready
        if (err.message.includes('Socket already opened')) {
          this.isReady = true;
        } else {
          throw err;
        }
      }
    }

    return this.client;
  }

  async disconnect() {
    if (this.client && this.isReady) {
      await this.client.quit();
      this.isReady = false;
      this.client = null;
    }
  }
}

// Create a singleton instance
const redisClientInstance = new RedisClient();

// Function to get the Redis client
export async function getRedisClient() {
  return await redisClientInstance.connect();
}

// Graceful shutdown helper
export async function closeRedisConnection() {
  await redisClientInstance.disconnect();
}