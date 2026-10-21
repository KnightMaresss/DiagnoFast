const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User'); 
const bcrypt = require("bcryptjs");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("./middleware/authMiddleware");
const Symptom = require('./models/Symptom'); 
const Diagnosis = require('./models/Diagnosis'); 
const axios = require('axios'); // ✅ ADDED FOR FLASK

const app = express(); 
app.use(express.json()); 
const cors = require('cors');
app.use(cors());

console.log("Loaded JWT_SECRET:", process.env.JWT_SECRET);

mongoose.connect('mongodb://localhost:27017/medicalApp')
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error("MongoDB connection error:", err));

const JWT_SECRET = "your_secret_key"; 

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// ── AUTH ROUTES ──────────────────────────────────────────────
app.post("/register", async (req, res) => {
    try {
        const { name, phoneNumber, email, password, gender } = req.body;
        let existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const newUser = new User({ name, phoneNumber, email, password: hashedPassword, gender });
        await newUser.save();
        res.json({ message: "User registered successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/users/me", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/users/:id", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        await user.deleteOne();
        res.json({ message: "User deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put("/users/:id", authMiddleware, async (req, res) => {
    try {
        const { name, age, phoneNumber, gender, medicalHistory } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.userId,
            { name, age, phoneNumber, gender, medicalHistory },
            { new: true, runValidators: true }
        );
        if (!updatedUser) return res.status(404).json({ message: "User not found" });
        res.json({ message: "User updated successfully!", updatedUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── SYMPTOM ROUTES ───────────────────────────────────────────
app.post('/add-symptom', async (req, res) => {
    try {
        const newSymptom = new Symptom({
            name: req.body.name,
            description: req.body.description,
            severity: req.body.severity,
            userId: req.body.userId
        });
        await newSymptom.save();
        res.json({ message: "Symptom added successfully!", newSymptom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/symptoms', async (req, res) => {
    try {
        const symptoms = await Symptom.find().populate('userId', 'name email');
        res.json(symptoms);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/symptoms/:id', async (req, res) => {
    try {
        const symptom = await Symptom.findByIdAndDelete(req.params.id);
        if (!symptom) return res.status(404).json({ message: "Symptom not found" });
        res.json({ message: "Symptom deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/symptoms/:id', async (req, res) => {
    try {
        const updatedSymptom = await Symptom.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedSymptom) return res.status(404).json({ message: "Symptom not found" });
        res.json({ message: "Symptom updated successfully!", updatedSymptom });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── DIAGNOSIS ROUTES ─────────────────────────────────────────
app.post('/add-diagnosis', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        const newDiagnosis = { symptoms: req.body.symptoms, diagnosis: req.body.diagnosis, recommendation: req.body.recommendation };
        user.diagnosisHistory.push(newDiagnosis);
        await user.save();
        res.json({ message: "Diagnosis added successfully!", newDiagnosis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/diagnoses', async (req, res) => {
    try {
        const diagnoses = await Diagnosis.find()
            .populate('userId', 'name email')
            .populate({ path: 'symptoms', model: 'Symptom', select: 'name severity description' });
        res.json(diagnoses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/diagnoses/:id', async (req, res) => {
    try {
        const diagnosis = await Diagnosis.findByIdAndDelete(req.params.id);
        if (!diagnosis) return res.status(404).json({ message: "Diagnosis not found" });
        res.json({ message: "Diagnosis deleted successfully!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/diagnoses/:id', async (req, res) => {
    try {
        const updatedDiagnosis = await Diagnosis.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedDiagnosis) return res.status(404).json({ message: "Diagnosis not found" });
        res.json({ message: "Diagnosis updated successfully!", updatedDiagnosis });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/users/save-diagnosis", authMiddleware, async (req, res) => {
    try {
        const { symptoms, diagnosis, recommendation } = req.body;
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: "User not found" });
        user.diagnosisHistory.push({ symptoms, diagnosis, recommendation, date: new Date() });
        await user.save();
        res.json({ message: "Diagnosis saved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get("/users/diagnosis-history", authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("diagnosisHistory");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user.diagnosisHistory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete("/delete-diagnosis/:id", authMiddleware, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { diagnosisHistory: { _id: req.params.id } } },
      { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found." });
    res.json({ message: "Diagnosis deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete diagnosis" });
  }
});

// ── NEW: FLASK PREDICTION & PERSISTENCE ──────────────────────
app.post('/predict', authMiddleware, async (req, res) => {
    try {
        const { text } = req.body; // Accepts TEXT instead of symptoms array
        if (!text) {
            return res.status(400).json({ error: 'No text provided' });
        }

        // 1. Call Flask
        let flaskRes;
        try {
            flaskRes = await axios.post('http://localhost:8001/predict', { text });
        } catch (flaskError) {
            // ✅ PASS FLASK VALIDATION ERRORS DIRECTLY TO FRONTEND
            if (flaskError.response && flaskError.response.data) {
                return res.status(flaskError.response.status).json({ 
                    error: flaskError.response.data.error 
                });
            }
            throw flaskError; // If it's a real crash, throw it
        }
        
        const result = flaskRes.data;

        if (!result.predictions || !result.predictions.length) {
            return res.json(result); 
        }

        // 2. Persist to MongoDB
        const top = result.predictions[0];
        const diagnosisDoc = await Diagnosis.create({
            userId: req.userId,
            symptoms: [{ name: text, severity: "moderate" }], // Save raw text as symptom
            predictions: result.predictions.map(p => ({
                disease: p.disease,
                probability: parseFloat(p.probability),
            })),
            topDisease: top.disease,
            topConfidence: parseFloat(top.probability),
            boostPct: 0, // No boost for NLP currently
            precautions: ["Consult a doctor for accurate diagnosis"], // NLP dataset lacks precautions
            suggestedSymptoms: [],
        });

        // 3. Mirror into User history
        await User.findByIdAndUpdate(req.userId, {
            $push: {
                diagnosisHistory: {
                    date: new Date(),
                    symptoms: [text],
                    diagnosis: top.disease,
                    recommendation: "Consult a doctor for accurate diagnosis",
                },
            },
        });

        // 4. Return result
        res.json({ ...result, diagnosisId: diagnosisDoc._id });
       } catch (err) {
        console.error('Predict error:', err.message); // Keeps the error in YOUR terminal for debugging
        res.status(500).json({ error: 'Prediction service failed. Please try again later.' }); // Sends a safe message to the user
    }
});
app.get('/diagnoses/high-confidence', authMiddleware, async (req, res) => {
    try {
        const threshold = parseFloat(req.query.min) || 80;
        const docs = await Diagnosis.find({
            userId: req.userId,
            topConfidence: { $gte: threshold },
        }).sort({ diagnosedAt: -1 }).limit(50);
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── SERVER START ─────────────────────────────────────────────
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});