const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Notification = require("../models/Notification");
const User = require("../models/User");
const redisClient = require("../config/redisClient");

// 发表评论
const createComment = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.user.username
        });
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        if (user.status === "BANNED") {
            return res.status(403).json({
                message: "账号已被封禁，无法发表评论"
            });
        }
        const { postId, content } = req.body;
        const comment = await Comment.create({
            postId,
            content,
            author: req.user.username
        });

        // 评论 +2 经验
        await redisClient.incrBy(`user_exp:${user._id}`, 2);
        await User.findByIdAndUpdate(
            user._id,
            {
                $inc: {
                    exp: 2
                }
            }
        );

        // 查找帖子
        const post = await Post.findById(postId);

        // 给帖子作者发通知
        if (post && post.author !== req.user.username) {
            const notification = await Notification.create({
                receiver: post.author,
                sender: req.user.username,
                type: "comment",
                postId: post._id
            });
            global.io.to(post.author).emit("newNotification",notification);
        }
        res.json({
            message: "评论成功",
            comment
        });
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// 获取评论
const getComments = async (req, res) => {
    try {

        const comments = await Comment.find({postId: req.params.postId}).sort({createdAt: -1});
        const token = req.headers.authorization;
        let username = null;
        if (token) {
            try {
                const jwt = require("jsonwebtoken");
                const decoded = jwt.verify(token, "nosqlhub_secret");
                username = decoded.username;
            } catch (error) {
                username = null;
            }
        }

        const result = comments.map(comment => ({
            ...comment.toObject(),
            isLiked: username && comment.likedUsers.includes(username)
        }));
        res.json(result);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// 点赞评论
const likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({
                message: "评论不存在"
            });
        }

        const username = req.user.username;
        if (!comment.likedUsers.includes(username)) {
            comment.likes ++;
            comment.likedUsers.push(username);

            if (comment.author !== username) {
                const notification = await Notification.create({
                    receiver: comment.author,
                    sender: username,
                    type: "comment_like",
                    postId: comment.postId,
                    commentId: comment._id
                });
                global.io.to(comment.author).emit("newNotification", notification);
            }
            await comment.save();
        }
        res.json({
            likes: comment.likes,
            isLiked: true
        });
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

// 取消点赞
const dislikeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({message: "评论不存在"});
        }
        const username = req.user.username;
        if (comment.likedUsers.includes(username)) {
            comment.likes --;
            comment.likedUsers = comment.likedUsers.filter(user => user !== username);
            await comment.save();
        }
        res.json({
            likes: comment.likes,
            isLiked: false
        });
    } catch(error) {
        res.status(500).json({message: error.message});
    }
};

// 回复评论
const replyComment = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.user.username
        });
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        if (user.status === "BANNED") {
            return res.status(403).json({
                message: "账号已被封禁，无法回复评论"
            });
        }
        const { parentComment, content } = req.body;
        const comment = await Comment.create({
            postId: req.body.postId,
            author: req.user.username,
            content,
            parentComment
        });

        // 回复评论 +2 经验
        await redisClient.incrBy(`user_exp:${user._id}`, 2);
        await User.findByIdAndUpdate(
            user._id,
            {
                $inc: {
                    exp: 2
                }
            }
        );

        const parent = await Comment.findById(parentComment);
        if (parent && parent.author !== req.user.username) {
            const notification = await Notification.create({
                receiver: parent.author,
                sender: req.user.username,
                type: "reply",
                postId: req.body.postId,
                commentId: parent._id
            });
            global.io.to(parent.author).emit("newNotification", notification);
        }
        res.json(comment);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 删除评论
const deleteComment = async (req, res) => {
    await Comment.findByIdAndDelete(
        req.params.id
    );
    res.json({
        message: "删除成功"
    });
};

const getMyComments = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 20);
        const skip = (page - 1) * limit;
        const condition = {
            author: req.user.username
        };

        const total = await Comment.countDocuments(condition);
        const comments = await Comment.find(condition).populate("postId", "title").sort({ createdAt: -1 }).skip(skip).limit(limit);
        res.json({
            comments,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.status(404).json({message: "评论不存在"});
        }
        if (comment.author !== req.user.username) {
            return res.status(403).json({message: "无权限修改"});
        }
        comment.content = req.body.content;
        await comment.save();
        res.json({message: "修改成功"});
    } catch(error) {
        res.status(500).json({message: error.message});
    }

};

module.exports = {
    createComment,
    getComments,
    likeComment,
    dislikeComment,
    replyComment,
    deleteComment,
    getMyComments,
    updateComment
};