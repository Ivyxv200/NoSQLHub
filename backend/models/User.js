const mongoose = require("mongoose");   // 导入mongoose

// 创建一个用户结构userSchema
const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,  // 必须填写
        unique: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    profile: {
        type: String,
        default: "这个人很懒，还没有填写个人简介。"
    },

    avatar: {
        type: String,
        default: ""
    },

    // 经验值
    exp: {
        type: Number,
        default: 0
    },

    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER"
    },

    status: {
        type: String,
        enum: ["NORMAL", "BANNED"],
        default: "NORMAL"
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],

    // 收藏的帖子
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],

    // 我的关注
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    // 我的粉丝
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    history: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }]

}, {
    timestamps: true    // MongoDB自动生成createdAt、updatedAt
});

// 根据userSchema创建一个User模型，并把它导出
module.exports = mongoose.model(
    "User",
    userSchema
);