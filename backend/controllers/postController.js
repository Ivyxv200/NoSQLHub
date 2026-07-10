const Post = require("../models/Post");
const User = require("../models/User");
const Notification = require("../models/Notification");
const Report = require("../models/Report");
const redisClient = require("../config/redisClient");

// 创建帖子
const createPost = async (req, res) => {
    try {
        const title = req.body.title;
        const content = req.body.content;
        const tags = JSON.parse(req.body.tags);

        // 图片路径
        const images = req.files ? req.files.map(file => "/uploads/" + file.filename) : [];

        // 当前用户
        const user = await User.findOne({username: req.user.username});
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        if (user.status === "BANNED") {
            return res.status(403).json({
                message: "账号已被封禁，无法发帖"
            });
        }
        const newPost = await Post.create({
            title,
            content,
            tags,
            images,
            author: req.user.username,
            authorId: user._id,
            views: 0,
            likes: 0
        });

        // 发帖 +10 经验
        await redisClient.incrBy(`user_exp:${user._id}`, 10);
        await User.findByIdAndUpdate(
            user._id,
            {
                $inc: {exp: 10}
            }
        );

        res.json({
            message: "发帖成功",
            newPost
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取帖子
const getPosts = async (req, res) => {
    try {
        const limit = Number(req.query.limit) || 10;
        const cursor = req.query.cursor;
        const condition = {};
        if (cursor) {
            condition._id = {
                $lt: cursor
            };
        }
        const posts = await Post.find(condition).sort({ _id: -1 }).limit(limit + 1);
        const hasMore = posts.length > limit;
        const resultPosts = hasMore ? posts.slice(0, limit): posts;
        const nextCursor = resultPosts.length > 0 ? resultPosts[resultPosts.length - 1]._id : null;
        res.json({
            posts: resultPosts,
            nextCursor,
            hasMore
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取单个帖子
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "帖子不存在"
            });
        }
        const redisViews = await redisClient.get(`view:${post._id}`);
        const totalViews = post.views + Number(redisViews || 0);
        const result = post.toObject();
        result.views = totalViews;
        res.json(result);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 点赞帖子
const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "帖子不存在"
            });
        }
        const user = await User.findOne({username: req.user.username});
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }

        // 已点赞过
        if (user.likes.includes(post._id)) {
            return res.json({
                likes: post.likes
            });
        }

        // 点赞数+1
        post.likes++;

        // 加入用户点赞列表
        user.likes.push(post._id);

        // 给帖子作者发送通知，并给帖子作者 +1 经验
        if (post.author !== req.user.username) {
            const notification = await Notification.create({
                receiver: post.author,
                sender: req.user.username,
                type: "like",
                postId: post._id
            });

            global.io.to(post.author).emit("newNotification", notification);

            const author = await User.findOne({username: post.author});
            if (author) {
                await redisClient.incrBy(`user_exp:${author._id}`, 1);
                await User.findByIdAndUpdate(
                    author._id,
                    {
                        $inc: {exp: 1}
                    }
                );
            }
        }
        await post.save();
        await user.save();
        res.json({
            likes: post.likes
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 取消点赞
const dislikePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "帖子不存在"
            });
        }
        const user = await User.findOne({username: req.user.username});

        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }

        if (post.likes > 0) {
            post.likes --;
        }

        user.likes =  user.likes.filter(item => item.toString() !== post._id.toString());
        await post.save();
        await user.save();
        res.json({
            likes: post.likes
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 浏览量+1
const addView = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({
                message: "帖子不存在"
            });
        }
        const redisKey = `view:${postId}`;
        await redisClient.incr(redisKey);
        await redisClient.zIncrBy(
            "hot_posts",
            1,
            postId
        );
        const redisViews = await redisClient.get(redisKey);
        res.json({
            views: Number(redisViews)
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取当前用户的帖子
const getMyPosts = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 20);
        const skip = (page - 1) * limit;
        const condition = {
            author: req.user.username
        };

        const total = await Post.countDocuments(condition);
        const posts = await Post.find(condition).sort({ createdAt: -1 }).skip(skip).limit(limit);
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

// 修改帖子
const updatePost = async (req, res) => {
    try {

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "帖子不存在"
            });
        }
        if (post.author !== req.user.username) {
            return res.status(403).json({
                message: "无权限"
            });
        }

        const {
            title,
            content,
            tags
        } = req.body;
        post.title = title;
        post.content = content;
        post.tags = tags;

        await post.save();
        res.json({
            message: "修改成功"
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 删帖
const deletePost = async (req, res) => {
    const post = await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({
            message: "帖子不存在"
        });
    }
    if (post.author !== req.user.username) {
        return res.status(403).json({
            message: "无权限"
        });
    }
    await Post.findByIdAndDelete(
        req.params.id
    );
    res.json({
        message: "删除成功"
    });
};

const searchPosts = async (req, res) => {
    try {
        const keyword = (req.query.keyword || "").trim();
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 20);
        const skip = (page - 1) * limit;
        if (keyword) {
            await redisClient.zIncrBy("search_rank", 1, keyword);
        }

        const condition = keyword
            ? {
                $or: [
                    {
                        title: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        content: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        author: {
                            $regex: keyword,
                            $options: "i"
                        }
                    },
                    {
                        tags: {
                            $regex: keyword,
                            $options: "i"
                        }
                    }
                ]
            }
            : {};

        const total = await Post.countDocuments(condition);
        const posts = await Post.find(condition).sort({ createdAt: -1 }).skip(skip).limit(limit);
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

const getSearchRank = async (req, res) => {
    try {
        const result = await redisClient.zRangeWithScores(
            "search_rank",
            0,
            9,
            {
                REV: true
            }
        );

        const formatted = result.map(item => {
            return {
                keyword: item.value,
                count: item.score
            };
        });

        res.json(formatted);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const suggestPosts = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        if (!keyword) {
            return res.json([]);
        }
        const posts = await Post.find({
            title: {
                $regex: keyword,
                $options: "i"
            }
        }).limit(5);
        res.json(posts);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 收藏帖子
const favoritePost = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username});
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "帖子不存在"
            });
        }
        const alreadyFavorited = user.favorites.some(id => id.toString() === req.params.id);
        if (!alreadyFavorited) {
            user.favorites.push(req.params.id);

            // 收藏通知
            if (post.author !== req.user.username) {
                const notification = await Notification.create({
                    receiver: post.author,
                    sender: req.user.username,
                    type: "favorite",
                    postId: post._id
                });
                global.io.to(post.author).emit("newNotification",notification);
            }
            await user.save();
        }
        res.json({
            message: "收藏成功"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 取消收藏
const unfavoritePost = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username});
        if (!user) {
            return res.status(404).json({message: "用户不存在"});
        }
        user.favorites = user.favorites.filter(item => item.toString() !== req.params.id);
        await user.save();
        res.json({message: "取消收藏成功"});
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取我的点赞
const getMyLikes = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username}).populate("likes");
        if (!user) {
            return res.status(404).json({message: "用户不存在"});
        }
        res.json(user.likes);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 获取我的收藏
const getMyFavorites = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username}).populate("favorites");
        if (!user) {
            return res.status(404).json({message: "用户不存在"});
        }
        res.json(user.favorites);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 增加浏览历史
const addHistory = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const postId = req.params.id;
        user.history = user.history.filter(id => id.toString() !== postId);
        user.history.unshift(postId);
        if (user.history.length > 50) {
            user.history = user.history.slice(0, 50);
        }
        await user.save();
        res.json({message: "记录成功"});
    } catch(error) {
        res.status(500).json({
            message:error.message
        });
    }
};

// 查询历史
const getMyHistory = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Math.min(Number(req.query.limit) || 10, 20);
        const skip = (page - 1) * limit;
        const user = await User.findOne({
            username: req.user.username
        }).populate({
            path: "history",
            options: {
                sort: {
                    createdAt: -1
                }
            }
        });

        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        const total = user.history.length;
        const posts = user.history.slice(skip, skip + limit);
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

// 删除单条历史记录
const deleteHistory = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username});
        if (!user) {
            return res.status(404).json({message: "用户不存在"});
        }
        const postId = req.params.id;
        user.history = user.history.filter(item => item.toString() !== postId);
        await user.save();
        res.json({message: "删除成功"});
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 清空历史记录
const clearHistory = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username});
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        user.history = [];
        await user.save();
        res.json({
            message: "历史记录已清空"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getPostsByUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        const posts = await Post.find({author: user.username}).sort({createdAt: -1});
        res.json(posts);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const uploadImages = async (req, res) => {
    try {
        const imageUrls = req.files.map(file => `http://localhost:3000/uploads/${file.filename}`);
        res.json(imageUrls);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getHotPosts = async (req, res) => {
    try {
        const postIds = await redisClient.zRange(
            "hot_posts",
            0,
            2,
            {
                REV: true
            }
        );
        const posts = [];
        for (const id of postIds) {
            const post = await Post.findById(id);
            if (post) {
                const redisViews = await redisClient.get(`view:${post._id}`);
                const result = post.toObject();
                result.views = result.views + Number(redisViews || 0);
                posts.push(result);
            }
        }
        res.json(posts);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 举报帖子
const reportPost = async (req, res) => {
    try {
        const { reason } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                message: "帖子不存在"
            });
        }
        const user = await User.findOne({
            username: req.user.username
        });
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        // 防止重复举报
        const exist = await Report.findOne({
            post: post._id,
            reporter: user._id,
            status: "待处理"
        });
        if (exist) {
            return res.status(400).json({
                message: "你已经举报过该帖子"
            });
        }
        await Report.create({
            post: post._id,
            reporter: user._id,
            reason
        });
        res.json({
            message: "举报成功，等待管理员审核"
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
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
};