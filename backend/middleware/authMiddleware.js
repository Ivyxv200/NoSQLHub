const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({
                message: "未登录"
            });
        }
        const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;
        const decoded = jwt.verify(token, "nosqlhub_secret");
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Token无效"
        });
    }
};

module.exports = authMiddleware;