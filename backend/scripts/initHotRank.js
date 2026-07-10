const connectDB = require("../config/db");
const redisClient = require("../config/redisClient");
const Post = require("../models/Post");

async function initHotRank() {
    try {
        await connectDB();
        console.log("开始同步排行榜...");
        const posts = await Post.find();
        for (const post of posts) {
            await redisClient.zAdd(
                "hot_posts",
                {
                    score: post.views || 0,
                    value: post._id.toString()
                }
            );
        }
        console.log(
            `同步完成，共 ${posts.length} 条帖子`
        );
        process.exit();
    } catch(error) {
        console.error(error);
        process.exit(1);
    }
}

initHotRank();