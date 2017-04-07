import redis from 'redis';
import bluebird from 'bluebird';

const client = redis.createClient();

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// client.flushall();

export default client;
