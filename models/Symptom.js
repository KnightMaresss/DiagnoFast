const mongoose = require('mongoose');

const SymptomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    severity: { type: String, enum: ["low", "moderate", "high"], required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedAt: { type: Date, default: Date.now }
});

const Symptom = mongoose.model('Symptom', SymptomSchema);
module.exports = Symptom;
