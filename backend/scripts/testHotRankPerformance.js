const connectDB = require("../config/db");
const redisClient = require("../config/redisClient");
const Post = require("../models/Post");

async function testHotRankPerformance() {
    await connectDB();
    console.log("");
    console.log("======== 热门排行榜性能测试 ========");
    console.log("数据规模：100000 条左右");
    console.log("测试次数：1000 次");
    console.log("");
    console.log("======== MongoDB 排行榜测试 ========");

    const mongoStart = Date.now();
    for (let i = 0; i < 1000; i++) {
        await Post.find().sort({views: -1}).limit(10);
    }

    const mongoEnd = Date.now();
    const mongoTime = mongoEnd - mongoStart;
    console.log("MongoDB排行榜耗时:", mongoTime, "ms");
    console.log("");
    console.log("======== Redis ZSet 排行榜测试 ========");
    const redisStart = Date.now();
    for (let i = 0; i < 1000; i++) {
        await redisClient.zRange(
            "hot_posts",
            0,
            9,
            {
                REV: true
            }
        );
    }

    const redisEnd = Date.now();
    const redisTime = redisEnd - redisStart;
    console.log("Redis排行榜耗时:", redisTime, "ms");
    console.log("");
    console.log("======== 性能对比 ========");
    console.log("性能提升:", (mongoTime / redisTime).toFixed(2), "倍");
    process.exit();
}

testHotRankPerformance();