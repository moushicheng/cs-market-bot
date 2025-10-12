import { createClient, RedisClientType, RedisDefaultModules } from "redis";

let redisClient: RedisClientType<RedisDefaultModules & any> | undefined =
  undefined;
let clientPromise: Promise<void> | undefined;

async function create() {
  const client = createClient();

  client.on("error", (err: any) => console.log("Redis Client Error", err));

  clientPromise = client
    .connect()
    .then(() => {
      redisClient = client as any;
    })
    .catch((err) => {
      console.error("Failed to connect to Redis", err);
    });
}

// 创建 Redis 客户端
create();

// 获取 Redis 客户端的函数
export async function getRedisClient(): Promise<
  RedisClientType<RedisDefaultModules & any>
> {
  if (!clientPromise) {
    throw new Error("Redis client is not being created.");
  }
  await clientPromise; // 等待客户端创建完成
  if (!redisClient) {
    throw new Error("Redis client is not initialized.");
  }

  return redisClient;
}

export async function setRedisJson(key: string, value: any, seconds= 120) {
  const  redisClient = await getRedisClient();
  if(seconds > 0) {
    await redisClient.setEx(key, seconds, JSON.stringify(value));
  } else {
    await redisClient.set(key, JSON.stringify(value));
  }
}


export async function getRedisJson(key: string) {
  const redisClient = await getRedisClient();
  const value = await redisClient.get(key);
  if(!value || typeof value !== 'string'){
    return null;
  }
  return JSON.parse(value);
}

export async function setRedis(key: string, value: any, seconds= 120) {
  const redisClient = await getRedisClient();
  if(seconds > 0) {
    await redisClient.setEx(key, seconds, value);
  } else {
    await redisClient.set(key, value);
  }
}
export async function getRedis(key: string) {
  const redisClient = await getRedisClient();
  const value = await redisClient.get(key);
  if(!value || typeof value !== 'string'){
    return null;
  }
  return value;
}

export async function deleteRedisKey(key: string) {
  const redisClient = await getRedisClient();
  await redisClient.del(key);
}

// Redis Set 操作函数
export async function addToRedisSet(key: string, member: string, seconds?: number) {
  const redisClient = await getRedisClient();
  await redisClient.sAdd(key, member);
  if (seconds && seconds > 0) {
    await redisClient.expire(key, seconds);
  }
}

export async function removeFromRedisSet(key: string, member: string) {
  const redisClient = await getRedisClient();
  await redisClient.sRem(key, member);
}

export async function getRedisSetMembers(key: string): Promise<string[]> {
  const redisClient = await getRedisClient();
  return await redisClient.sMembers(key);
}

export async function isRedisSetMember(key: string, member: string): Promise<boolean> {
  const redisClient = await getRedisClient();
  const result = await redisClient.sIsMember(key, member);
  return Boolean(result);
}