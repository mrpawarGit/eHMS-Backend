const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    patientId: { type: String, required: true }, // Custom ID: {tenantId}-P-{seq}
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    contactNumber: { type: String, required: true },
    type: { type: String, enum: ["OPD", "IPD"], required: true },
    assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);
