const express = require("express");
const router = express.Router();

const {
  getSeminars,
  createSeminar,
  updateSeminar,
  deleteSeminar,
} = require("./seminarController");

const { verifyToken } = require("../middleware/authMiddleware");

// GET all seminars
router.get("/", verifyToken, getSeminars);

// ✅ ADD THESE 👇

// CREATE seminar
router.post("/", verifyToken, createSeminar);

// UPDATE seminar
router.patch("/:id", verifyToken, updateSeminar);

// DELETE seminar
router.delete("/:id", verifyToken, deleteSeminar);

module.exports = router;