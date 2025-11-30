const Prescription = require("../models/Prescription");
const Patient = require("../models/Patient");

// @desc    Create a new Prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor Only)
const createPrescription = async (req, res) => {
  try {
    const { patientId, medicines, diagnosis, notes } = req.body;
    const tenantId = req.user.tenantId;

    // 1. Verify Patient exists and belongs to this Tenant
    const patient = await Patient.findById(patientId);
    if (!patient || patient.tenantId.toString() !== tenantId.toString()) {
      return res
        .status(404)
        .json({ message: "Patient not found in your hospital" });
    }

    // 2. Generate Custom Prescription ID (FR-10)
    // Format: {Last 4 of TenantID}-RX-{Count}
    const count = await Prescription.countDocuments({ tenantId });
    const rxId = `${tenantId.toString().slice(-4)}-RX-${count + 1}`;

    // 3. Create the Prescription
    const prescription = await Prescription.create({
      tenantId,
      prescriptionId: rxId,
      doctor: req.user._id, // The logged-in doctor
      patient: patientId,
      medicines,
      diagnosis,
      notes,
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all prescriptions for a specific patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Doctor, Nurse, Pharmacist)
const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    // Security Check: Ensure patient belongs to requester's tenant
    const patient = await Patient.findById(patientId);
    if (
      !patient ||
      patient.tenantId.toString() !== req.user.tenantId.toString()
    ) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const prescriptions = await Prescription.find({ patient: patientId })
      .populate("doctor", "firstName lastName specialization") // Show doctor details
      .sort({ createdAt: -1 }); // Newest first

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createPrescription, getPatientPrescriptions };
