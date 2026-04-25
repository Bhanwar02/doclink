const router = require("express").Router();

const {
  upsertPatientProfile,
  getPatientProfile,
} = require("./patientController");

const { verifyToken } = require("../middleware/authMiddleware");

// GET profile
router.get("/profile", verifyToken, getPatientProfile);

// SAVE profile
router.post("/profile", verifyToken, upsertPatientProfile);

module.exports = router;