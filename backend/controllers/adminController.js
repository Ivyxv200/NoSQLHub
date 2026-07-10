const Post = require("../models/Post");
const Comment = require("../models/Comment");
const User = require("../models/User");
const Report = require("../models/Report");
const Notification = require("../models/Notification");
const Announcement = require("../models/Announcement");
const redisClient = require("../config/redisClient");

// 获取所有帖子（分页）
const getAllPosts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 20);
        const skip = (page - 1) * limit;
        const total = await Post.countDocuments();
        const posts = await Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.json({
            posts,
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

// 删除帖子
const deletePost = async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);

        await Comment.deleteMany({
            postId: req.params.id
        });

        res.json({
            message: "帖子删除成功"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取所有评论（分页）
const getAllComments = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 20);
        const skip = (page - 1) * limit;
        const total = await Comment.countDocuments();
        const comments = await Comment.find().populate("postId", "title").sort({ createdAt: -1 }).skip(skip).limit(limit);

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

// 删除评论
const deleteComment = async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);

        res.json({
            message: "评论删除成功"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取所有用户（分页）
const getAllUsers = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 20);
        const skip = (page - 1) * limit;
        const total = await User.countDocuments();
        const users = await User.find().select("-password").sort({ createdAt: -1 }).skip(skip).limit(limit);

        res.json({
            users,
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

// 封禁用户
const banUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                status: "BANNED"
            },
            {
                new: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }

        const notification = await Notification.create({
            receiver: user.username,
            sender: "系统",
            type: "ban"
        });

        if (redisClient.isOpen) {
            await redisClient.incr(`notification:${user.username}`);
        }

        if (global.io) {
            global.io.to(user.username).emit("newNotification", notification);
        }

        res.json({
            message: "用户已封禁，并已发送通知"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 恢复用户
const unbanUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                status: "NORMAL"
            },
            {
                new: true
            }
        );

        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }

        const notification = await Notification.create({
            receiver: user.username,
            sender: "系统",
            type: "unban"
        });

        if (redisClient.isOpen) {
            await redisClient.incr(`notification:${user.username}`);
        }

        if (global.io) {
            global.io.to(user.username).emit(
                "newNotification",
                notification
            );
        }

        res.json({
            message: "用户已恢复，并已发送通知"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取待处理举报
const getReports = async (req, res) => {
    try {
        const reports = await Report.find({ status: "待处理" })
            .populate("post", "title content author")
            .populate("reporter", "username")
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reports
        });
    } catch(error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// 通过举报并删除帖子
const deleteReportedPost = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate("reporter", "username");

        if (!report) {
            return res.status(404).json({
                message: "举报记录不存在"
            });
        }

        await Post.findByIdAndDelete(report.post);

        await Comment.deleteMany({
            postId: report.post
        });

        report.status = "已删除帖子";

        await report.save();

        const notification = await Notification.create({
            receiver: report.reporter.username,
            sender: "系统管理员",
            type: "reportAccepted",
            postId: report.post
        });

        if (redisClient.isOpen) {
            await redisClient.incr(`notification:${report.reporter.username}`);
        }

        if (global.io) {
            global.io.to(report.reporter.username).emit("newNotification", notification);
        }

        res.json({
            message: "帖子已删除，已通知举报用户"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 驳回举报
const rejectReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id).populate("reporter", "username");

        if (!report) {
            return res.status(404).json({
                message: "举报记录不存在"
            });
        }

        report.status = "已驳回";

        await report.save();

        const notification = await Notification.create({
            receiver: report.reporter.username,
            sender: "系统管理员",
            type: "reportReject",
            postId: report.post
        });

        if (redisClient.isOpen) {
            await redisClient.incr(`notification:${report.reporter.username}`);
        }

        if (global.io) {
            global.io.to(report.reporter.username).emit("newNotification", notification);
        }

        res.json({
            message: "举报已驳回，并已通知举报用户"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 发布系统公告
const createAnnouncement = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "公告标题和内容不能为空"
            });
        }

        const announcement = await Announcement.create({
            title,
            content,
            publisher: req.user.username
        });

        const users = await User.find({
            role: {
                $ne: "ADMIN"
            }
        });

        const notifications = users.map(user => {
            return {
                receiver: user.username,
                sender: "系统",
                type: "system",
                title,
                content,
                announcementId: announcement._id
            };
        });

        if (notifications.length > 0) {
            await Notification.insertMany(notifications);

            if (redisClient.isOpen) {
                for (const user of users) {
                    await redisClient.incr(`notification:${user.username}`);
                }
            }
        }

        if (global.io) {
            users.forEach(user => {
                global.io.to(user.username).emit("newNotification", {
                    sender: "系统",
                    type: "system",
                    title,
                    content,
                    announcementId: announcement._id
                });
            });
        }

        res.json({
            message: "系统公告发布成功"
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 根据 ID 获取系统公告详情
const getAnnouncementById = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                message: "公告不存在"
            });
        }

        res.json(announcement);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取所有系统公告
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find()
            .sort({ createdAt: -1 });

        res.json(announcements);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 删除系统公告
const deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);

        if (!announcement) {
            return res.status(404).json({
                message: "公告不存在"
            });
        }

        await Announcement.findByIdAndDelete(req.params.id);

        await Notification.deleteMany({
            announcementId: req.params.id
        });

        res.json({
            message: "公告删除成功"
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取后台统计数据
const getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalPosts = await Post.countDocuments();
        const totalComments = await Comment.countDocuments();

        let onlineUsers = 0;
        let todayActiveUsers = 0;

        if (redisClient.isOpen) {
            onlineUsers = await redisClient.sCard("online_users");
            todayActiveUsers = await redisClient.sCard("today_active_users");
        }

        res.json({
            success: true,
            data: {
                totalUsers,
                totalPosts,
                totalComments,
                todayActiveUsers,
                onlineUsers
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getAllPosts,
    deletePost,
    getAllComments,
    deleteComment,
    getAllUsers,
    banUser,
    unbanUser,
    getReports,
    deleteReportedPost,
    rejectReport,
    createAnnouncement,
    getAnnouncementById,
    getAnnouncements,
    deleteAnnouncement,
    getStats
};