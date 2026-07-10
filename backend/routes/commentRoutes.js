const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
    createComment,
    getComments,
    likeComment,
    dislikeComment,
    replyComment,
    deleteComment,
    getMyComments,
    updateComment
} = require("../controllers/commentController");

// get：获取数据（获取帖子列表、获取用户信息、获取评论）
// post：新增数据（注册、登录、发帖子、发评论）
// put：修改数据（修改用户资料、修改帖子内容）
// delete：删除数据（删除帖子、删除评论、删除用户）
router.post("/", authMiddleware, createComment);    // 发表评论
router.get("/user/mycomments",authMiddleware, getMyComments);
router.get("/:postId", getComments);    // 获取评论
router.put("/like/:id", authMiddleware, likeComment);   // 点赞评论
router.put("/dislike/:id", authMiddleware, dislikeComment); // 取消点赞评论
router.post("/reply", authMiddleware, replyComment);    // 回复评论
router.delete("/:id", authMiddleware, deleteComment);   // 删除评论
router.put("/:id", authMiddleware, updateComment);      // 修改评论

module.exports = router;