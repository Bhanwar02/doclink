const prisma = require("../prisma");

exports.createAppointment = async (req, res) => {
  try {
    const { doctorId, appointment_date, appointment_time, symptoms, notes } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!doctorId || !appointment_date || !appointment_time || !symptoms) {
      return res.status(400).json({
        message: "doctorId, appointment_date, appointment_time, and symptoms are required",
      });
    }

    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId: req.user.id,
        doctorId,
        appointment_date: new Date(appointment_date),
        appointment_time,
        symptoms,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        doctor: {
          include: {
            user: {
              select: {
                email: true,
              },
            },
          },
        },
        patient: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.status(201).json(appointment);
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ message: "Failed to create appointment" });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    if (!req.user || !req.user.id || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let appointments = [];

    if (req.user.role === "PATIENT") {
      appointments = await prisma.appointment.findMany({
        where: { patientId: req.user.id },
        include: {
          doctor: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
        },
        orderBy: {
          appointment_date: "desc",
        },
      });
    } else if (req.user.role === "DOCTOR") {
      const doctor = await prisma.doctor.findUnique({
        where: { userId: req.user.id },
      });

      if (!doctor) {
        return res.json([]);
      }

      appointments = await prisma.appointment.findMany({
        where: { doctorId: doctor.id },
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          doctor: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
        },
        orderBy: {
          appointment_date: "desc",
        },
      });
    } else if (req.user.role === "ADMIN") {
      appointments = await prisma.appointment.findMany({
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          doctor: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
        },
        orderBy: {
          appointment_date: "desc",
        },
      });
    } else {
      return res.status(403).json({ message: "Invalid role" });
    }

    res.json(appointments);
  } catch (error) {
    console.error("Get appointments error:", error);
    res.status(500).json({ message: "Failed to fetch appointments" });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, meetingLink } = req.body;

    const data = { status };

    if (meetingLink !== undefined) {
      data.meetingLink = meetingLink;
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (error) {
    console.error("Update appointment status error:", error);
    res.status(500).json({ message: "Failed to update appointment status" });
  }
};