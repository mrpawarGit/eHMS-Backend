const Tenant = require("../models/Tenant");
const User = require("../models/User");

// @desc    Register a new Hospital (Tenant)
// @route   POST /api/tenants/onboard
// @access  Public
const registerTenant = async (req, res) => {
  const {
    name,
    domain,
    licenseNumber,
    address,
    adminEmail,
    adminPassword,
    contactPhone,
  } = req.body;

  try {
    // 1. Validate License Uniqueness
    const tenantExists = await Tenant.findOne({ licenseNumber });
    if (tenantExists) {
      return res
        .status(400)
        .json({ message: "License number already registered" });
    }

    // 2. Create Tenant
    const tenant = await Tenant.create({
      name,
      domain,
      licenseNumber,
      address,
      contactEmail: adminEmail,
      status: "ACTIVE", // skipping email verification for this demo
    });

    // 3. Create Hospital Admin (The first user)
    const adminUser = await User.create({
      tenantId: tenant._id,
      firstName: "Admin",
      lastName: "User",
      email: adminEmail,
      password: adminPassword, // Will be hashed by model pre-save
      role: "HOSPITAL_ADMIN",
      department: "Administration",
    });

    res.status(201).json({
      message: "Hospital onboarded successfully",
      tenantId: tenant._id,
      adminId: adminUser._id,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerTenant };
