import redis from 'redis';
import bluebird from 'bluebird';

const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const client = redis.createClient(redisUrl);

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// if we want to quickly erase the database
if (process.env.NODE_ENV === 'test') {
    client.flushall();
}

export default client;
