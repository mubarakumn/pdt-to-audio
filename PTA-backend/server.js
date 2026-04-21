const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const path = require("path");
const gTTS = require("gtts");

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

// ===== File Upload Setup =====
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// ===== Route: Upload & Convert =====
app.post("/convert", upload.single("pdf"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const filePath = req.file.path;

    // Read PDF
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);

    const text = pdfData.text.slice(0, 2000);

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        error: "PDF contains no readable text",
      });
    }

    const audioFile = `audio-${Date.now()}.mp3`;
    const audioPath = path.join("audio", audioFile);

    // ✅ Correct TTS usage
    const gtts = new gTTS(text, "en");

    gtts.save(audioPath, function (err) {
      if (err) {
        return res.status(500).json({ error: "Audio generation failed" });
      }

      return res.json({
        message: "Conversion successful",
        audio: `https://pdt-to-audio-8hzu.vercel.app/audio/${audioFile}`,
      });
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// ===== Serve Audio Files =====
app.use("/audio", express.static("audio"));

// ===== Start Server =====
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on https://pdt-to-audio-8hzu.vercel.app:${PORT}`);
});