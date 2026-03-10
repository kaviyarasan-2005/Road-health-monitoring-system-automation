const express = require("express");
const multer = require("multer");
const axios = require("axios");
const db = require("./db");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

app.post("/api/public/report", upload.single("image"), async (req, res) => {
  try {

    const imagePath = req.file.path;

    const aiResponse = await axios.post("http://127.0.0.1:5000/api/public/detect", {
      image: imagePath
    });

    const damage = aiResponse.data.damage_percentage;

    db.query(
      "INSERT INTO reports (image_url, damage_percentage, status) VALUES (?, ?, ?)",
      [imagePath, damage, "Pending"],
      (err, result) => {
        if (err) throw err;

        res.json({
          message: "Report stored",
          damage: damage
        });
      }
    );

  } catch (error) {
    res.status(500).json({ error: "Detection failed" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));