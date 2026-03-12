const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const db = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// File upload setup
const upload = multer({ dest: "uploads/" });

/* =============================
   AUTH ROUTES
============================= */
app.use("/api/auth", authRoutes);

/* =============================
   REPORT ROUTES
============================= */
app.post("/api/public/report", upload.single("image"), async (req, res) => {
  try {
    const imagePath = req.file.path;

    // Call AI model API
    const aiResponse = await axios.post(
      "http://127.0.0.1:5000/api/public/detect",
      {
        image: imagePath,
      }
    );

    const damage = aiResponse.data.damage_percentage;

    // Store report in database
    db.query(
      "INSERT INTO reports (image_url, damage_percentage, status) VALUES (?, ?, ?)",
      [imagePath, damage, "Pending"],
      (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          message: "Report stored successfully",
          damage_percentage: damage,
        });
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Detection failed" });
  }
});

/* =============================
   TEST ROUTE
============================= */
app.get("/", (req, res) => {
  res.send("Backend Server Running 🚀");
});

/* =============================
   START SERVER
============================= */
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});