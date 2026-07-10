const connectDB = require("../config/db");
const redisClient = require("../config/redisClient");
const Post = require("../models/Post");

async function testPerformance() {
    await connectDB();
    const keyword = "Redis";
    console.log("");
    console.log("======== MongoDB测试 ========");
    const mongoStart = Date.now();
    for (let i = 0; i < 100; i++) {
        await Post.find({
            title: {
                $regex: keyword,
                $options: "i"
            }
        });

    }
    const mongoEnd = Date.now();
    const mongoTime = mongoEnd - mongoStart;
    console.log("MongoDB耗时:", mongoTime, "ms");
    console.log("");
    console.log("======== Redis测试 ========");
    const cacheKey = "benchmark:redis";
    const posts = await Post.find({
        title: {
            $regex: keyword,
            $options: "i"
        }
    });
    await redisClient.set(cacheKey, JSON.stringify(posts));
    const redisStart = Date.now();
    for (let i = 0; i < 100; i++) {
        await redisClient.get(
            cacheKey
        );
    }
    const redisEnd = Date.now();
    const redisTime = redisEnd - redisStart;
    console.log("Redis耗时:", redisTime, "ms");
    console.log("");
    console.log("======== 性能对比 ========");

    console.log("性能提升:", (mongoTime / redisTime).toFixed(2), "倍");
    process.exit();
}

testPerformance();