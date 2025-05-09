import Redis from 'ioredis';

// Redis Cloud URL for production
const REDIS_URL = process.env.REDIS_URL!;

// Initialize Redis client with error handling
const redis = process.env.NODE_ENV === 'production' 
  ? new Redis(REDIS_URL, {
      tls: {
        rejectUnauthorized: false // Required for Redis Cloud
      },
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 2000);
        return delay;
      },
      maxRetriesPerRequest: 5,
      enableOfflineQueue: true,
      connectTimeout: 10000,
      lazyConnect: true,
      enableReadyCheck: true
    })
  : new Redis({
      host: 'localhost',
      port: 6379,
      password: 'redis123',
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      lazyConnect: true,
      enableReadyCheck: true,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 100, 2000);
        console.log(`Redis connection retry attempt ${times}`);
        return delay;
      }
    });

// Add event listeners for connection status
redis.on('error', (error) => {
  console.error('Redis Error:', error);
});

redis.on('connect', () => {
  console.log('Redis connected successfully');
});

redis.on('ready', () => {
  console.log('Redis client ready');
});

// Cache TTL in seconds (24 hours)
const CACHE_TTL = 24 * 60 * 60;

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  address: string;
  additional_info: string;
  face_image?: string;
  thumb_image?: string;
}

export interface SearchResult {
  match: boolean;
  user?: User;
  faceDistance?: number;
  thumbDistance?: number;
  confidence?: number;
}

export type SearchType = 'face' | 'thumb' | 'combined';

export async function cacheImageHash(imageData: string, type: SearchType, hash: string) {
  try {
    const key = `image:${type}:${Buffer.from(imageData).toString('base64').slice(0, 32)}`;
    await redis.set(key, hash, 'EX', CACHE_TTL);
    console.log('Image hash cached successfully');
    return key;
  } catch (error) {
    console.error('Error caching image hash:', error);
    return null;
  }
}

export async function getCachedImageHash(imageData: string, type: SearchType): Promise<string | null> {
  try {
    const key = `image:${type}:${Buffer.from(imageData).toString('base64').slice(0, 32)}`;
    const hash = await redis.get(key);
    console.log('Image hash retrieved successfully');
    return hash;
  } catch (error) {
    console.error('Error getting cached image hash:', error);
    return null;
  }
}

export async function cacheSearchResult(searchHash: string, type: SearchType, result: SearchResult) {
  try {
    const key = `search:${type}:${searchHash}`;
    await redis.set(key, JSON.stringify(result), 'EX', CACHE_TTL);
    console.log('Search result cached successfully');
  } catch (error) {
    console.error('Error caching search result:', error);
  }
}

export async function getCachedSearchResult(searchHash: string, type: SearchType): Promise<SearchResult | null> {
  try {
    const key = `search:${type}:${searchHash}`;
    const cached = await redis.get(key);
    console.log('Search result retrieved successfully');
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Error getting cached search result:', error);
    return null;
  }
}

// Invalidate cache for a specific user when their data is updated
export async function invalidateUserCache(userId: string) {
  try {
    const keys = await redis.keys(`search:*:*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    // Also invalidate any cached hashes for this user's images
    const userKeys = await redis.keys(`image:*:${userId}:*`);
    if (userKeys.length > 0) {
      await redis.del(...userKeys);
    }
  } catch (error) {
    console.error('Error invalidating user cache:', error);
  }
}

export default redis; 