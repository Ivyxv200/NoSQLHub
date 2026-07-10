const connectDB = require("../config/db");
const Post = require("../models/Post");

async function generatePosts() {
    await connectDB();
    console.log("开始生成测试数据...");
    const posts = [];
    const authorId = "6a184fc73b73ee8abea3d7d8";
    for (let i = 1; i <= 100000; i++) {
        posts.push({
            title: `Redis测试帖子${i}`,
            content: `这是第${i}条测试数据，用于Redis性能测试。`,
            author: "ivy",
            authorId,
            tags: [
                "Redis",
                "性能测试"
            ],
            views: Math.floor(
                Math.random() * 1000
            ),
            likes: Math.floor(
                Math.random() * 500
            ),
            images: []
        });
        if (i % 1000 === 0) {
            console.log(
                `已生成 ${i} 条`
            );
        }
    }
    await Post.insertMany(posts);
    console.log(
        "测试数据生成完成"
    );
    process.exit();
}

generatePosts();