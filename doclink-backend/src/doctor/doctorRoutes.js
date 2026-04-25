const express = require("express");
const router = express.Router();

const {
  createDoctor,
  getDoctors,
  updateDoctor,
  updateDoctorAvailability,
  updateDoctorStatus,
  deleteDoctor,
} = require("./doctorController");

const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// ✅ GET all doctors
router.get("/", verifyToken, getDoctors);

// ✅ CREATE doctor (ADMIN only)
router.post("/", verifyToken, requireRole("ADMIN"), createDoctor);

// ✅ DOCTOR updates ONLY their availability
router.patch(
  "/me/availability",   // 🔥 KEEP THIS ABOVE /:id
  verifyToken,
  requireRole("DOCTOR"),
  updateDoctorAvailability
);

// ✅ ADMIN updates full doctor profile
router.put("/:id", verifyToken, requireRole("ADMIN"), updateDoctor);

// ✅ ADMIN toggle active/inactive
router.patch("/:id/status", verifyToken, requireRole("ADMIN"), updateDoctorStatus);

// ✅ ADMIN delete doctor
router.delete("/:id", verifyToken, requireRole("ADMIN"), deleteDoctor);

module.exports = router;