const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
    getNotifications,
    markAsRead,
    getUnreadCount,
    clearUnreadCount
} = require("../controllers/notificationController");

// get：获取数据（获取帖子列表、获取用户信息、获取评论）
// post：新增数据（注册、登录、发帖子、发评论）
// put：修改数据（修改用户资料、修改帖子内容）
// delete：删除数据（删除帖子、删除评论、删除用户）
router.get("/", authMiddleware, getNotifications);
router.put("/read/:id", authMiddleware, markAsRead);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.put("/unread-count/clear", authMiddleware, clearUnreadCount);

module.exports = router;