const User = require("../models/User");

// @desc    Create a new user (Doctor, Nurse, etc.)
// @route   POST /api/users
// @access  Private (Hospital Admin only)
const createUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      department,
      specialization,
    } = req.body;

    // Ensure the requester is an Admin (Double check)
    if (req.user.role !== "HOSPITAL_ADMIN") {
      return res.status(403).json({ message: "Only Admins can create users" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Force the new user into the Admin's tenant
    const tenantId = req.user.tenantId;

    const user = await User.create({
      tenantId,
      firstName,
      lastName,
      email,
      password, // Model will hash this
      role,
      department,
      specialization,
    });

    res.status(201).json({
      _id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users for this hospital
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ tenantId: req.user.tenantId }).select(
      "-password"
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createUser, getUsers };
