const mongoose = require("mongoose");

const prescriptionSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tenant",
      required: true,
    },
    prescriptionId: {
      type: String,
      required: true,
    }, // Format: {tenantId}-RX-{sequential}

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    medicines: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true }, // e.g., "500mg"
        frequency: { type: String, required: true }, // e.g., "1-0-1" (Morning-Afternoon-Night)
        duration: { type: String, required: true }, // e.g., "5 Days"
        instructions: { type: String }, // e.g., "After food"
      },
    ],

    diagnosis: { type: String }, // Optional: What is the doctor treating?
    notes: { type: String }, // Optional: General advice (e.g., "Drink water")
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);
