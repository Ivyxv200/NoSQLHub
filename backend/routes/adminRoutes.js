const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const {
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
} = require("../controllers/adminController");

// get：获取数据（获取帖子列表、获取用户信息、获取评论）
// post：新增数据（注册、登录、发帖子、发评论）
// put：修改数据（修改用户资料、修改帖子内容）
// delete：删除数据（删除帖子、删除评论、删除用户）

// 管理帖子
router.get("/posts", authMiddleware, adminMiddleware, getAllPosts);
router.delete("/posts/:id", authMiddleware, adminMiddleware, deletePost);

// 管理评论
router.get("/comments", authMiddleware, adminMiddleware, getAllComments);
router.delete("/comments/:id", authMiddleware, adminMiddleware, deleteComment);

// 管理用户
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.put("/users/:id/ban", authMiddleware, adminMiddleware, banUser);
router.put("/users/:id/unban", authMiddleware, adminMiddleware, unbanUser);

// 举报管理
router.get("/reports", authMiddleware, adminMiddleware, getReports);
router.put("/report/:id/delete", authMiddleware, adminMiddleware, deleteReportedPost);
router.put("/report/:id/reject", authMiddleware, adminMiddleware, rejectReport);

// 系统公告
router.post("/announcement", authMiddleware, adminMiddleware, createAnnouncement);

// 获取系统公告列表（所有登录用户）
router.get("/announcements", authMiddleware, getAnnouncements);

// 查看公告详情（所有登录用户都可以）
router.get("/announcement/:id", authMiddleware, getAnnouncementById);

// 删除公告（管理员）
router.delete("/announcement/:id", authMiddleware, adminMiddleware, deleteAnnouncement);

// 数据统计
router.get("/stats", authMiddleware, adminMiddleware, getStats);

module.exports = router;