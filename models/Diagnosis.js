const mongoose = require('mongoose');

const PredictionSchema = new mongoose.Schema({
    disease: { type: String, required: true },
    probability: { type: Number, required: true }, // store as number, e.g. 87.5
}, { _id: false });

const DiagnosisSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    symptoms: [{
        name: { type: String, required: true },
        severity: { type: String, enum: ['low', 'moderate', 'severe'], default: 'moderate' },
    }],
    predictions: [PredictionSchema],          // top 3
    topDisease: { type: String, required: true },
    topConfidence: { type: Number, required: true },
    boostPct: { type: Number, default: 0 },
    precautions: [String],
    suggestedSymptoms: [String],
    diagnosedAt: { type: Date, default: Date.now, index: true },
});

// Virtual for "high confidence" queries
DiagnosisSchema.index({ userId: 1, diagnosedAt: -1 });
DiagnosisSchema.index({ userId: 1, topConfidence: -1 });

const Diagnosis = mongoose.model('Diagnosis', DiagnosisSchema);
module.exports = Diagnosis;