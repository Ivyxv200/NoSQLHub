const Notification = require("../models/Notification");
const redisClient = require("../config/redisClient");

const getNotifications = async (req,res) => {
    try {
        const notifications = await Notification.find({
            receiver: req.user.username
        }).sort({createdAt:-1});

        res.json(notifications);
    } catch(error) {
        res.status(500).json({
            message:error.message
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                message: "通知不存在"
            });
        }

        notification.isRead = true;

        await notification.save();

        res.json({
            message: "已读"
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        const username = req.user.username;

        let count = 0;

        if (redisClient.isOpen) {
            count = await redisClient.get(`notification:${username}`);
        }

        res.json({
            count: Number(count) || 0
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const clearUnreadCount = async (req, res) => {
    try {
        const username = req.user.username;

        if (redisClient.isOpen) {
            await redisClient.del(`notification:${username}`);
        }

        res.json({
            message: "未读消息已清零"
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    getUnreadCount,
    clearUnreadCount
};