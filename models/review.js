const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,

    rating: {
        type: Number,
        min: 1,
        max: 5,
    },

    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    // Images uploaded by the user as part of their review
    images: [
        {
            url: String,
            filename: String,
        },
    ],

    // Videos uploaded by the user as part of their review
    videos: [
        {
            url: String,
            filename: String,
        },
    ],

    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Listing",
    },
});

module.exports = mongoose.model("Review", reviewSchema);