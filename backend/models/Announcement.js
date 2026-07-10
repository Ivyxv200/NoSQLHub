const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true,
            trim: true
        },

        publisher: {
            type: String,
            default: "系统"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Announcement",
    announcementSchema
);