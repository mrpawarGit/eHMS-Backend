const express = require("express");
const router = express.Router();
const {
  createPrescription,
  getPatientPrescriptions,
} = require("../controllers/prescriptionController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All routes here require login
router.use(protect);

// Create: Only DOCTOR
router.post("/", authorize("DOCTOR"), createPrescription);

// View: DOCTOR, NURSE, PHARMACIST, HOSPITAL_ADMIN
router.get(
  "/patient/:patientId",
  authorize("DOCTOR", "NURSE", "PHARMACIST", "HOSPITAL_ADMIN"),
  getPatientPrescriptions
);

module.exports = router;
