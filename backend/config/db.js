const mongoose = require("mongoose");   // 导入mongoose

// 定义connectDB函数（异步函数）
const connectDB = async () => {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/nosqlhub");   // 连接MongoDB数据库
        console.log("MongoDB Connected");   // 连接成功就在cmd打印"MongoDB Connected"
    } catch (error) {
        console.log(error); // 连接失败，就打印错误
    }

};

module.exports = connectDB; // 导出函数