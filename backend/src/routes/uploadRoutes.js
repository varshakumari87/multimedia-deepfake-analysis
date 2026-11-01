
const express = require("express");
const multer = require("multer");
const pool = require("../config/db");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Create uploads folder if it does not exist
const uploadDirectory = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, { recursive: true });
}

// Configure file storage
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, uploadDirectory);
    },

    filename: (req, file, callback) => {
        const uniqueName =
            Date.now() + "-" +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        callback(null, uniqueName);
    }
});

// Allow image, video and audio files
const fileFilter = (req, file, callback) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "audio/ogg"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error("Unsupported file type"));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024
    }
});

// Upload endpoint
router.post("/upload", (req, res) => {
    upload.single("media")(req, res, (error) => {
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please select a file"
            });
        }

        const { originalname, filename, mimetype, size } = req.file;

pool.query(
    `INSERT INTO media_uploads
    (original_name, stored_name, file_type, file_size)
    VALUES ($1, $2, $3, $4)
    RETURNING id, upload_date`,
    [originalname, filename, mimetype, size]
)
.then((result) => {
    return res.status(200).json({
        success: true,
        message: "File uploaded and saved to database successfully",
        file: {
            id: result.rows[0].id,
            originalName: originalname,
            filename,
            mimetype,
            size,
            uploadDate: result.rows[0].upload_date
        }
    });
})
.catch((error) => {
    console.error("Database save error:", error.message);

    return res.status(500).json({
        success: false,
        message: "File uploaded, but database save failed"
    });
});
    });
});

module.exports = router;