import Redis from 'ioredis';

const redis = new Redis({
  host: 'localhost',
  port: 6379,
  password: 'redis123'
});

async function testRedisConnection() {
  try {
    // Test connection
    await redis.ping();
    console.log('✅ Redis connection successful!');

    // Test set and get
    await redis.set('test-key', 'test-value');
    const value = await redis.get('test-key');
    console.log('✅ Redis set/get test successful:', value);

    // Clean up
    await redis.del('test-key');
    console.log('✅ Redis cleanup successful!');
  } catch (error) {
    console.error('❌ Redis test failed:', error);
  } finally {
    // Close the connection
    await redis.quit();
  }
}

// Run the test
testRedisConnection(); 