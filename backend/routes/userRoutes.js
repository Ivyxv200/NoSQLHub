const express = require("express"); // 导入Express
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();    // 创建一个路由对象，后续网址都写在里面

const {
    registerUser,
    loginUser,
    getUserById,
    getMyProfile,
    updateProfile,
    changePassword,
    followUser,
    unfollowUser,
    getFollowings,
    getFollowers,
    uploadAvatar,
    searchUsers
} = require("../controllers/userController");

// get：获取数据（获取帖子列表、获取用户信息、获取评论）
// post：新增数据（注册、登录、发帖子、发评论）
// put：修改数据（修改用户资料、修改帖子内容）
// delete：删除数据（删除帖子、删除评论、删除用户）
router.post("/register", registerUser); // 用户注册接口
router.post('/login', loginUser);       // 用户登录接口
router.get("/profile", authMiddleware, getMyProfile);   // 用户个人资料接口
router.put("/profile", authMiddleware, updateProfile);
router.put("/password", authMiddleware, changePassword);
router.put("/avatar", authMiddleware, upload.single("avatar"), uploadAvatar);
router.put("/follow/:id", authMiddleware, followUser);
router.put("/unfollow/:id", authMiddleware, unfollowUser);
router.get("/following", authMiddleware, getFollowings);
router.get("/followers", authMiddleware, getFollowers);
router.get("/search", searchUsers);
router.get("/:id", authMiddleware, getUserById);

module.exports = router;