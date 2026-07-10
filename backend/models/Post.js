const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    tags: {
        type: [String],
        default: []
    },

    author: {
        type: String,
        required: true
    },

    authorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    views: {
        type: Number,
        default: 0
    },

    likes: {
        type: Number,
        default: 0
    },

    images: {
        type: [String],
        default: []
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Post",
    postSchema
);