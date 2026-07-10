const User = require("../models/User"); // 导入User模型
const Post = require("../models/Post");
const redisClient = require("../config/redisClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 注册函数registerUser
const registerUser = async (req, res) => {
    try {

        // 获取前端发送的数据
        const { username, email, password } = req.body;

        // 邮箱检查
        const emailExists = await User.findOne({
            email
        });
        if (emailExists) {
            return res.status(400).json({
                message: "邮箱已被注册"
            });
        }

        // 用户名检查
        const usernameExists = await User.findOne({
            username
        });
        if (usernameExists) {
            return res.status(400).json({
                message: "用户名已存在"
            });
        }
        
        // 加密密码
        const hashedPassword = await bcrypt.hash(password, 10);

        // 创建新用户 + 保存到MongoDB数据库
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // 返回成功结果
        res.json({
            message: "注册成功",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// 登录函数
const loginUser = async (req, res) => {
    try {

        // 获取前端发送的数据
        const { username, password } = req.body;
        // 查找用户
        const user = await User.findOne({username});
        if (!user) {
            return res.status(400).json({
                message: "用户不存在"
            });
        }
        // 验证密码
        const isPasswordCorrect = await bcrypt.compare( password, user.password );
        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "密码错误"
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username
            },
            "nosqlhub_secret",
            {
                expiresIn: "7d"
            }
        );

        res.json({
            message: "登录成功",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });        

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const targetUser = await User.findById(req.params.id);
        if (!targetUser) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        const me = await User.findOne({username: req.user.username});
        const isFollowing = me.following.some(id => id.toString() === targetUser._id.toString());
        res.json({
            _id: targetUser._id,
            username: targetUser.username,
            profile: targetUser.profile,
            followingCount: targetUser.following.length,
            followersCount: targetUser.followers.length,
            isFollowing
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findOne({
            username: req.user.username
        });
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        let exp = await redisClient.get(`user_exp:${user._id}`);
        if (exp === null) {
            exp = user.exp || 0;
            // Redis没有数据时，用MongoDB恢复
            await redisClient.set(`user_exp:${user._id}`, exp);
        } else {
            exp = Number(exp);
        }
        const level = Math.floor(exp / 100) + 1;
        
        res.json({
            username: user.username,
            email: user.email,
            profile: user.profile,
            avatar: user.avatar,
            role: user.role,
            status: user.status,
            exp,
            level,
            followingCount: user.following.length,
            followersCount: user.followers.length
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username});
        user.profile = req.body.profile;
        await user.save();
        res.json({
            message: "简介修改成功"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const followUser = async (req, res) => {
    try {
        const me = await User.findOne({username: req.user.username});
        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        if (me._id.toString() === target._id.toString()) {
            return res.status(400).json({
                message: "不能关注自己"
            });
        }
        if (!me.following.includes(target._id)) {
            me.following.push(target._id);
            target.followers.push(me._id);
            await me.save();
            await target.save();
        }
        res.json({message: "关注成功"});
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const unfollowUser = async (req, res) => {
    try {
        const me = await User.findOne({username: req.user.username});
        const target = await User.findById(req.params.id);
        if (!target) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        me.following = me.following.filter(id => id.toString() !== target._id.toString());
        target.followers = target.followers.filter(id => id.toString() !== me._id.toString());
        await me.save();
        await target.save();
        res.json({
            message: "取消关注成功"
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getFollowings = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username}).populate("following", "username email");
        res.json(user.following);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getFollowers = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username}).populate("followers", "username profile");
        res.json(user.followers);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const uploadAvatar = async (req, res) => {
    try {
        const user = await User.findOne({username: req.user.username});
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        if (!req.file) {
            return res.status(400).json({
                message: "请选择头像图片"
            });
        }
        user.avatar = "/uploads/" + req.file.filename;
        await user.save();
        res.json({
            message: "头像上传成功",
            avatar: user.avatar
        });
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const searchUsers = async (req, res) => {
    try {
        const keyword = (req.query.keyword || "").trim();
        if (!keyword) {
            return res.json([]);
        }
        const users = await User.find({
            username: {
                $regex: keyword,
                $options: "i"
            }
        }).select("username avatar profile followers");

        const result = await Promise.all(
            users.map(async user => {
                const postsCount = await Post.countDocuments({
                    authorId: user._id
                });

                return {
                    _id: user._id,
                    username: user.username,
                    avatar: user.avatar,
                    profile: user.profile,
                    followersCount: user.followers.length,
                    postsCount
                };
            })
        );
        res.json(result);
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;

        if (!oldPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                message: "请填写完整信息"
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                message: "两次输入的新密码不一致"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "新密码长度不能少于6位"
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

        const isOldPasswordCorrect = await bcrypt.compare(
            oldPassword,
            user.password
        );

        if (!isOldPasswordCorrect) {
            return res.status(400).json({
                message: "原密码错误"
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);

        await user.save();

        res.json({
            message: "密码修改成功，请重新登录"
        });

    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
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
};