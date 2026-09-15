ggconst multer = require("multer");
const path = require("path");
const fs = require("fs");

// Directory where review media will be stored
const uploadDir = path.join(__dirname, "..", "public", "uploads", "reviews");

// Ensure the upload directory exists
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed mime types for images and videos
const imageMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/jpg",
];

const videoMimeTypes = [
    "video/mp4",
    "video/webm",
    "video/ogg",
    "video/quicktime",
    "video/x-msvideo",
];

// Storage engine configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter to accept only images and videos
const fileFilter = (req, file, cb) => {
    if (
        imageMimeTypes.includes(file.mimetype) ||
        videoMimeTypes.includes(file.mimetype)
    ) {
        return cb(null, true);
    }
    cb(
        new Error(
            "Invalid file type. Only images (jpeg, png, gif, webp) and videos (mp4, webm, ogg, mov, avi) are allowed."
        )
    );
};

// Multer upload instance
// - images: up to 5 files, 5MB each
// - videos: up to 2 files, 50MB each
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB max per file
    },
});

// Middleware that accepts both images and videos fields
const uploadReviewMedia = upload.fields([
    { name: "images", maxCount: 5 },
    { name: "videos", maxCount: 2 },
]);

module.exports = { upload, uploadReviewMedia, uploadDir };