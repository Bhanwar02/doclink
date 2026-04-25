const express = require("express");
const router = express.Router();
const {
  getMedicines,
  createMedicine,
  updateMedicine,
  updateMedicineAvailability,
  deleteMedicine,
} = require("./medicineController");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getMedicines);

router.post("/", verifyToken, requireRole("ADMIN"), createMedicine);
router.put("/:id", verifyToken, requireRole("ADMIN"), updateMedicine);
router.patch(
  "/:id/availability",
  verifyToken,
  requireRole("ADMIN"),
  updateMedicineAvailability
);
router.delete("/:id", verifyToken, requireRole("ADMIN"), deleteMedicine);

module.exports = router;