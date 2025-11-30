const Patient = require("../models/Patient");

const registerPatient = async (req, res) => {
  try {
    // Security: Ensure we use the tenantId from the TOKEN, not the body (Tenant Isolation)
    const tenantId = req.user.tenantId;

    const { firstName, lastName, dateOfBirth, gender, contactNumber, type } =
      req.body;

    // Generate readable Patient ID
    const count = await Patient.countDocuments({ tenantId });
    const patientId = `${tenantId.toString().slice(-4)}-P-${count + 1}`;

    const patient = await Patient.create({
      tenantId,
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      contactNumber,
      type,
    });

    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatients = async (req, res) => {
  try {
    const { search, type, page = 1, limit = 10 } = req.query;

    // 1. Base Query: Always enforce Tenant Isolation
    const query = { tenantId: req.user.tenantId };

    // 2. Add Search Logic (Name, Phone, or Patient ID)
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } }, // Case-insensitive regex
        { lastName: { $regex: search, $options: "i" } },
        { contactNumber: { $regex: search, $options: "i" } },
        { patientId: { $regex: search, $options: "i" } },
      ];
    }

    // 3. Add Filter Logic (OPD vs IPD)
    if (type) {
      query.type = type;
    }

    // 4. Pagination Logic
    const skip = (page - 1) * limit;

    // 5. Execute Query
    const patients = await Patient.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .skip(Number(skip))
      .limit(Number(limit));

    // 6. Get Total Count (for frontend pagination UI)
    const total = await Patient.countDocuments(query);

    res.json({
      meta: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
      data: patients,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerPatient, getPatients };
