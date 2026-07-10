const redis = require("redis");

const redisClient = redis.createClient({url: "redis://127.0.0.1:6379"});

redisClient.on(
    "error",
    err => {
        console.error(
            "Redis连接失败:",
            err
        );
    }
);

(async () => {
    await redisClient.connect();
    console.log("Redis Connected");
})();

module.exports = redisClient;