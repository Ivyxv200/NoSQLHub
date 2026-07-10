const User = require("../models/User");

const adminMiddleware = async (req, res, next) => {
    try {
        const user = await User.findOne({
            username: req.user.username
        });
        if (!user) {
            return res.status(404).json({
                message: "用户不存在"
            });
        }
        if (user.role !== "ADMIN") {
            return res.status(403).json({
                message: "没有管理员权限"
            });
        }
        next();
    } catch(error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = adminMiddleware;