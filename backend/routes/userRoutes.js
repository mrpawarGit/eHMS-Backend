const express = require("express");
const router = express.Router();
const { createUser, getUsers } = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.use(protect); // All routes protected

// Only Hospital Admin can create/view users
router.post("/", authorize("HOSPITAL_ADMIN"), createUser);
router.get("/", authorize("HOSPITAL_ADMIN"), getUsers);

module.exports = router;
