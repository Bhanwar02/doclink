const express = require("express");
const router = express.Router();
const {
  getPrescriptions,
  createPrescription,
} = require("./prescriptionController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/", verifyToken, getPrescriptions);
router.post("/", verifyToken, createPrescription);

module.exports = router;