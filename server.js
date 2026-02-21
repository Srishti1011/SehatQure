require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(express.json());

const OpenAI = require("openai");
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

/* =============================
   SIMPLE IN-MEMORY DATABASE
============================= */

let patients = [];
let doctors = [];

/* =============================
   FILE UPLOAD CONFIG
============================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      cb(new Error("Only PDFs allowed"));
    } else {
      cb(null, true);
    }
  }
});

/* =============================
   ROUTES
============================= */

// Patient Login (Phone + OTP - simulated)
app.post("/patient-login", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "Phone required" });

  res.json({ message: "OTP Sent (Simulated)" });
});

// Doctor Login
app.post("/doctor-login", (req, res) => {
  const { hospitalId, doctorId } = req.body;
  if (hospitalId && doctorId) {
    res.json({ message: "Doctor Login Successful" });
  } else {
    res.status(400).json({ message: "Invalid Credentials" });
  }
});

// Save Patient Details
app.post("/save-patient-details", (req, res) => {
  patients.push(req.body);
  res.json({ message: "Patient details saved successfully" });
});

// Upload Reports
app.post("/upload-reports", upload.array("reports", 5), (req, res) => {
  res.json({ message: "Reports uploaded successfully", files: req.files });
});

//AI
app.post("/chat", async (req, res) => {
  try {
    console.log("Incoming message:", req.body);

    const { message } = req.body;

    if (!message) {
      console.log("No message received");
      return res.status(400).json({ reply: "No message sent." });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are SehatQure AI." },
        { role: "user", content: message }
      ]
    });

    console.log("AI reply:", response.choices[0].message.content);

    res.json({ reply: response.choices[0].message.content });

  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ reply: "AI is currently unavailable." });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});

