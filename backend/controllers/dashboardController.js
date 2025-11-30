const Patient = require("../models/Patient");
const User = require("../models/User");
const Prescription = require("../models/Prescription");

// @desc    Get Dashboard Stats & Menu based on Role
// @route   GET /api/dashboard
// @access  Private
const getDashboardStats = async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const role = req.user.role;
    const userId = req.user._id;

    let stats = {};
    let menu = [];

    // --- 1. DATA AGGREGATION (Based on Role) ---

    if (role === "HOSPITAL_ADMIN") {
      // Admin sees EVERYTHING in the hospital
      const [totalPatients, opdCount, ipdCount, totalDoctors, recentPatients] =
        await Promise.all([
          Patient.countDocuments({ tenantId }),
          Patient.countDocuments({ tenantId, type: "OPD" }),
          Patient.countDocuments({ tenantId, type: "IPD" }),
          User.countDocuments({ tenantId, role: "DOCTOR" }),
          Patient.find({ tenantId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select("firstName lastName type"),
        ]);

      stats = {
        totalPatients,
        opdCount,
        ipdCount,
        totalDoctors,
        recentPatients,
      };
    } else if (role === "DOCTOR") {
      // Doctor sees mostly THEIR data
      const [myPatients, myPrescriptions, totalHospitalPatients] =
        await Promise.all([
          Patient.countDocuments({ tenantId, assignedDoctor: userId }),
          Prescription.countDocuments({ tenantId, doctor: userId }),
          Patient.countDocuments({ tenantId }), // Doctors might want to know total hospital volume
        ]);

      stats = {
        myPatients,
        myPrescriptions,
        totalHospitalPatients,
      };
    }

    // --- 2. MENU GENERATION (FR-11) ---
    // Return the allowed navigation structure so frontend can render the sidebar dynamically

    const commonMenu = [
      { title: "Dashboard", path: "/dashboard", icon: "home" },
    ];

    if (role === "HOSPITAL_ADMIN") {
      menu = [
        ...commonMenu,
        { title: "Staff Management", path: "/users", icon: "users" },
        { title: "All Patients", path: "/patients", icon: "user-plus" },
        { title: "Reports", path: "/reports", icon: "bar-chart" },
        { title: "Settings", path: "/settings", icon: "settings" },
      ];
    } else if (role === "DOCTOR") {
      menu = [
        ...commonMenu,
        { title: "My Patients", path: "/patients/my", icon: "user" },
        {
          title: "Create Prescription",
          path: "/prescriptions/create",
          icon: "file-text",
        },
        { title: "Consultation History", path: "/history", icon: "clock" },
      ];
    } else if (role === "RECEPTIONIST") {
      menu = [
        ...commonMenu,
        {
          title: "Register Patient",
          path: "/patients/register",
          icon: "user-plus",
        },
        { title: "Patient List", path: "/patients", icon: "list" },
        { title: "Appointments", path: "/appointments", icon: "calendar" },
      ];
    }

    res.json({
      role,
      stats,
      menu,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats };
