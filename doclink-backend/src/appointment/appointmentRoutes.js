const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");
const appointmentController = require("./appointmentController");

router.post("/", verifyToken, appointmentController.createAppointment);
router.get("/", verifyToken, appointmentController.getAppointments);
router.patch("/:id/status", verifyToken, appointmentController.updateAppointmentStatus);

module.exports = router;