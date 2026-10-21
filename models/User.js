const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phoneNumber: { type: String },
  gender: { type: String },
  medicalHistory: { type: String },
  createdAt: { type: Date, default: Date.now },
  diagnosisHistory: [
    {
      date: { type: Date, default: Date.now },
      symptoms: [{ type: String }],
      diagnosis: { type: String },
      recommendation: { type: String },
    }
  ]
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
