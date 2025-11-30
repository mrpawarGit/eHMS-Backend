const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Generate JWT with Tenant Context
const generateToken = (id, tenantId, role) => {
  return jwt.sign({ id, tenantId, role }, process.env.JWT_SECRET, {
    expiresIn: "1h", // FR-3 requirement
  });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        role: user.role,
        tenantId: user.tenantId,
        token: generateToken(user._id, user.tenantId, user.role),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { loginUser };
