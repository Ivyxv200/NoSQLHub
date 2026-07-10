// 代码习惯：
// 1. 初始化配置
// 2. 连接数据库
// 3. 注册中间件
// 4. 注册路由
// 5. listen

const express = require("express");
const http = require("http");   // http是Node.js自带模块，用来创建真正的HTTP服务器。这里引入它是为了让Socket.IO可以挂载到同一个服务器上。
const cors = require("cors");   // 用于解决跨域问题
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");
const syncViewsToMongo = require("./jobs/viewSyncJob");
const connectDB = require("./config/db");
const redisClient = require("./config/redisClient");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const { Server } = require("socket.io");
const app = express();  // 创建一个网站服务器，app即后端网站
// 自动创建 uploads 文件夹
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("uploads folder created");
}
const server = http.createServer(app);  // 把Express应用app包装进一个真正的HTTP server里面

// 创建WebSocket服务
const io = new Server(server, { // 让Socket.IO绑定到刚才那个HTTP server上
    cors: { origin: "*" }   // 允许任意前端地址连接这个WebSocket
});

global.io = io; // 把io挂到全局对象上，让其它文件也能用

// 当浏览器连接后端 WebSocket 时，会触发
io.on("connection", async socket => {
    console.log("用户连接:", socket.id);    // socket.id是每个浏览器连接的唯一编号

    try {
        if (redisClient.isOpen) {
            await redisClient.sAdd("online_users", socket.id);
            await redisClient.sAdd("today_active_users", socket.id);
        }
    } catch (error) {
        console.log("记录在线用户失败:", error.message);
    }

    socket.on(
        "join",
        async username => {
            socket.join(username);
            console.log(username, "进入房间");

            try {
                if (redisClient.isOpen && username) {
                    await redisClient.sAdd("today_active_users", username);
                }
            } catch (error) {
                console.log("记录今日活跃用户失败:", error.message);
            }
        }
    );

    socket.on(
        "test-message",
        data => {
            console.log("收到测试消息:", data);
            socket.emit(
                "test-reply",
                {
                    message: "服务器收到消息了",
                    time: new Date().toLocaleString()
                }
            );
        }
    );

    socket.on(
        "disconnect",
        async () => {
            console.log("用户断开连接:", socket.id);

            try {
                if (redisClient.isOpen) {
                    await redisClient.sRem("online_users", socket.id);
                }
            } catch (error) {
                console.log("移除在线用户失败:", error.message);
            }
        }
    );
});





connectDB();    // 连接MongoDB

// JSON解析
app.use(express.json());    // 给整个服务器安装JSON解析功能，让后端能读取JSON请求体
// 跨域
app.use(cors());
// 路由模块
app.use("/uploads", express.static("uploads"));
app.use("/user", userRoutes);   // 用户路由
app.use("/post", postRoutes);   // 帖子路由
app.use("/comment", commentRoutes); // 评论路由
app.use("/notification", notificationRoutes);   // 通知路由
app.use("/admin", adminRoutes); // 管理员路由
// 静态文件

// 定义一个GET接口，"/"表示网站首页，即http://localhost:3000/
// 访问这个网站时，浏览器显示"Backend running"
app.get("/", (req, res) => {
    res.send("Backend running");
})

// 每1分钟同步一次Redis浏览量到MongoDB（测试阶段）
cron.schedule(
    "*/1 * * * *",
    () => {
        syncViewsToMongo();
    }
);

// 让服务器监听3000端口，运行npm run dev的时候，后端会打印"Server running"
// 一定要是server.listen，因为现在Socket.IO是绑定在server上的，如果单是app.listen的话Express可以运行单是Socket.IO可能无法正常运行
server.listen(3000, () => {
    console.log("Server running");
});