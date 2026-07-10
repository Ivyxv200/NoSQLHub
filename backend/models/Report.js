const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
{
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },

    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    reason: {
        type: String,
        enum: ["广告", "辱骂", "违法"],
        required: true
    },

    status: {
        type: String,
        enum: ["待处理", "已驳回", "已删除帖子"],
        default: "待处理"
    }
},
{
    timestamps: true
}
);

module.exports = mongoose.model("Report", reportSchema);