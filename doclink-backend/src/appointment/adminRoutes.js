// src/appointments/adminRoutes.js
const router = require("express").Router();
const prisma = require("../prisma");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

router.get("/admin", auth, role("ADMIN"), async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        appointment_date: "desc",
      },
    });

    // Manually attach patient email
    const appointmentsWithPatient = await Promise.all(
      appointments.map(async (apt) => {
        const patient = await prisma.user.findUnique({
          where: { id: apt.patientId },
        });

        return {
          ...apt,
          patientEmail: patient?.email || "Unknown",
        };
      })
    );

    res.json(appointmentsWithPatient);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

module.exports = router;