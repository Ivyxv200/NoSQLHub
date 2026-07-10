const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

const {
    createPost,
    getPosts,
    getPostById,
    likePost,
    dislikePost,
    addView,
    getMyPosts,
    updatePost,
    deletePost,
    searchPosts,
    getSearchRank,
    suggestPosts,
    favoritePost,
    unfavoritePost,
    getMyLikes,
    getMyFavorites,
    addHistory,
    getMyHistory,
    deleteHistory,
    clearHistory,
    getPostsByUser,
    uploadImages,
    getHotPosts,
    reportPost
} = require("../controllers/postController");

// get：获取数据（获取帖子列表、获取用户信息、获取评论）
// post：新增数据（注册、登录、发帖子、发评论）
// put：修改数据（修改用户资料、修改帖子内容）
// delete：删除数据（删除帖子、删除评论、删除用户）
router.post("/", authMiddleware, upload.array("images", 5), createPost);    // 发帖

router.get("/", getPosts);          // 获取所有帖子
router.get("/search", searchPosts); // 搜索帖子
router.get("/search-rank", getSearchRank);  // 获取热门搜索
router.get("/suggest", suggestPosts);   // 搜索推荐
router.get("/hot", getHotPosts);    // 热门帖子

router.get("/user/myposts", authMiddleware, getMyPosts); // 获取自己的帖子
router.get("/user/likes", authMiddleware, getMyLikes);  // 获取点赞
router.get("/user/favorites", authMiddleware, getMyFavorites);  // 获取收藏
router.get("/user/history", authMiddleware, getMyHistory);  // 获取浏览历史
router.get("/user/:id", authMiddleware, getPostsByUser);

router.get("/:id", getPostById);    // 获取单个帖子
router.post("/:id/report", authMiddleware, reportPost);  // 举报帖子

router.put("/favorite/:id", authMiddleware, favoritePost);  // 收藏
router.put("/unfavorite/:id", authMiddleware, unfavoritePost);  // 取消收藏
router.put("/like/:id", authMiddleware, likePost);  // 点赞帖子
router.put("/dislike/:id", authMiddleware, dislikePost);  // 点赞帖子
router.put('/view/:id', addView);   // 增加浏览量
router.put("/history/:id", authMiddleware, addHistory); // 增加浏览历史
router.put("/:id", authMiddleware, updatePost);     // 修改帖子

router.delete("/history/clear", authMiddleware, clearHistory);  // 清空历史
router.delete("/history/:id", authMiddleware, deleteHistory);   // 删除单条历史
router.delete("/:id", authMiddleware, deletePost);  // 删帖

router.post("/upload", authMiddleware, upload.array("images", 5), uploadImages);    // 上传

module.exports = router;