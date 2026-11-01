
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();
const uploadRoutes = require("./routes/uploadRoutes");
const pool = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api", uploadRoutes);

// Health-check endpoint
app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "SafeLens AI backend is running",
        timestamp: new Date().toISOString()
    });
});

// Database connection test
app.get("/api/db-health", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database_name, current_user AS username"
        );

        res.json({
            success: true,
            message: "PostgreSQL connection successful",
            database: result.rows[0].database_name,
            user: result.rows[0].username
        });
    } catch (error) {
        console.error("Database connection failed:", error.message);

        res.status(500).json({
            success: false,
            message: "Database connection failed"
        });
    }
});

// Project information endpoint
app.get("/", (req, res) => {
    res.json({
        project: "SafeLens AI",
        description: "AI-Based Multimodal Deepfake Detection System",
        status: "running"
    });
});

app.listen(PORT, () => {
    console.log(`SafeLens AI backend running at http://localhost:${PORT}`);
});
