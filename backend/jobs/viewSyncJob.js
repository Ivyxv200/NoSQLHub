const Post = require("../models/Post");
const redisClient = require("../config/redisClient");

async function syncViewsToMongo() {
    try {
        console.log("开始同步浏览量...");
        const keys = await redisClient.keys("view:*");
        for (const key of keys) {
            const postId = key.replace("view:", "");
            const views = Number(await redisClient.get(key));
            if (views <= 0) {
                continue;
            }
            await Post.findByIdAndUpdate(
                postId,
                {
                    $inc: {
                        views: views
                    }
                }
            );
            await redisClient.del(key);
            console.log(
                `同步帖子 ${postId} 浏览量 ${views}`
            );
        }
        console.log("浏览量同步完成");
    } catch(error) {
        console.error(
            "同步失败:",
            error
        );
    }
}

module.exports = syncViewsToMongo;