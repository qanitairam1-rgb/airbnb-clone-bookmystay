const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor } = require("../middleware.js");
const { uploadReviewMedia } = require("../utils/multerConfig.js");
const fs = require("fs");
const path = require("path");

const validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);

  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

// Helper to map uploaded files to the review media format
const mapFilesToMedia = (files) =>
  files.map((file) => ({
    url: `/uploads/reviews/${file.filename}`,
    filename: file.filename,
  }));

// Post Reviews Route
router.post(
    "/",
    isLoggedIn,
    uploadReviewMedia,
    validateReview,
    wrapAsync(async (req, res) => {

        let listing = await Listing.findById(req.params.id);

        let review = new Review(req.body.review);

        review.author = req.user._id;

        // Attach uploaded images (if any)
        if (req.files && req.files.images && req.files.images.length > 0) {
            review.images = mapFilesToMedia(req.files.images);
        }

        // Attach uploaded videos (if any)
        if (req.files && req.files.videos && req.files.videos.length > 0) {
            review.videos = mapFilesToMedia(req.files.videos);
        }

        await review.save();

        listing.reviews.push(review._id);

        await listing.save();

        req.flash("success", "Review Created!");

        res.redirect(`/listings/${listing._id}`);
    })
);

//Delete Review Route
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;

    // Remove any uploaded media files from disk before deleting the review
    const review = await Review.findById(reviewId);
    if (review) {
      const mediaFiles = [
        ...(review.images || []),
        ...(review.videos || []),
      ];
      mediaFiles.forEach((media) => {
        if (media && media.filename) {
          const filePath = path.join(
            __dirname,
            "..",
            "public",
            "uploads",
            "reviews",
            media.filename
          );
          fs.promises.unlink(filePath).catch(() => {
            // Ignore errors if the file is already gone
          });
        }
      });
    }

    await Listing.findByIdAndUpdate(id, {
      $pull: { reviews: reviewId },
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
  })
);

module.exports = router;