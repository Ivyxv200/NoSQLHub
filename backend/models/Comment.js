const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({

    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },

    author: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    likes: {
        type: Number,
        default: 0
    },

    likedUsers: {
        type: [String],
        default: []
    },

    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Comment",
    commentSchema
);