const mongoose = require("mongoose");

const notificationSchema =
    new mongoose.Schema({

        receiver: {
            type: String,
            required: true
        },

        sender: {
            type: String,
            required: true
        },

        type: {
            type: String,
            enum: [
                "like",
                "comment",
                "comment_like",
                "favorite",
                "reply",
                "reportReject",
                "reportAccepted",
                "ban",
                "unban",
                "system"
            ]
        },

        // 系统公告标题
        title: {
            type: String,
            default: ""
        },

        // 系统公告内容
        content: {
            type: String,
            default: ""
        },

        // 系统公告ID
        announcementId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Announcement"
        },

        postId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post"
        },

        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Comment"
        },

        isRead: {
            type: Boolean,
            default: false
        }

    }, {
        timestamps: true
    });

module.exports = mongoose.model(
    "Notification",
    notificationSchema
);