const express = require("express");
const cors = require("cors");
const multer = require("multer");
const axios = require("axios");
const db = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const reportRoutes = require("./routes/reportRoutes");
const FormData = require("form-data");
const fs = require("fs");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// File upload setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

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
    const description = req.body.description;
    const location = req.body.location;

    // Send image to AI model
    const formData = new FormData();
    formData.append("image", fs.createReadStream(imagePath));

    const aiResponse = await axios.post(
      "http://127.0.0.1:5000/api/public/detect",
      formData,
      {
        headers: formData.getHeaders()
      }
    );

    const damage = aiResponse.data.damage_percentage;

    // Store report in database
    db.query(
      "INSERT INTO reports (image_url, description, location, damage_percentage, status) VALUES (?, ?, ?, ?, ?)",
      [imagePath, description, location, damage, "Pending"],
      (err, result) => {

        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Database error" });
        }

        res.json({
          message: "Report stored successfully",
          damage_percentage: damage
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