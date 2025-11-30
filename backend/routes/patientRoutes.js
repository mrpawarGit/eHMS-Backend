const express = require("express");
const router = express.Router();
const {
  registerPatient,
  getPatients,
} = require("../controllers/patientController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All patient routes require Login
router.use(protect);

router.post("/", authorize("DOCTOR", "RECEPTIONIST"), registerPatient);
router.get(
  "/",
  authorize("DOCTOR", "NURSE", "RECEPTIONIST", "HOSPITAL_ADMIN"),
  getPatients
);

module.exports = router;
