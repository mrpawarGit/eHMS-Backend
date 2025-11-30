const express = require("express");
const router = express.Router();
const { registerTenant } = require("../controllers/tenantController");

router.post("/onboard", registerTenant);

module.exports = router;
