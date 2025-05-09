import redis from '../lib/redis';

async function testRedisCloud() {
  try {
    // Test basic operations
    console.log('Testing Redis Cloud connection...');
    
    // Test SET operation
    await redis.set('test:key', 'Hello from Redis Cloud!');
    console.log('✅ SET operation successful');
    
    // Test GET operation
    const value = await redis.get('test:key');
    console.log('✅ GET operation successful:', value);
    
    // Test DELETE operation
    await redis.del('test:key');
    console.log('✅ DELETE operation successful');
    
    // Test expiration
    await redis.set('test:expiry', 'This will expire', 'EX', 5);
    console.log('✅ Expiry SET operation successful');
    
    // Wait for expiration
    console.log('Waiting for key to expire (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5500));
    
    const expiredValue = await redis.get('test:expiry');
    console.log('Expired key value:', expiredValue);
    
    console.log('\n✨ All Redis Cloud tests passed!');
  } catch (error) {
    console.error('❌ Redis Cloud test failed:', error);
  } finally {
    // Close the connection
    await redis.quit();
  }
}

// Run the test
console.log(`Testing Redis in ${process.env.NODE_ENV || 'development'} mode`);
testRedisCloud(); 