const router = require("express").Router();
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

const {
  addFeedback,
  getFeedback,
} = require("./feedbackController");

router.post("/", verifyToken, requireRole("PATIENT"), addFeedback);
router.get("/", verifyToken, getFeedback);

module.exports = router;