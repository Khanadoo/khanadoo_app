import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL!);

type Options = {
    limit: number;
    window: number;
};

export const rateLimit = async (
    key: string,
    { limit, window }: Options
) => {
    const current = await redis.incr(key);

    if (current === 1) {
        await redis.expire(key, window);
    }

    if (current > limit) {
        throw new Error("Rate Limit Exceeded");
    }
};