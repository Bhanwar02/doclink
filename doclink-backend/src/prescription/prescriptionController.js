const prisma = require("../prisma");

exports.getPrescriptions = async (req, res) => {
  try {
    let whereClause = {};

    // ✅ If PATIENT → show their prescriptions
    if (req.user.role === "PATIENT") {
      whereClause = {
        appointment: {
          patientId: req.user.id,
        },
      };
    }

    // ✅ If DOCTOR → show prescriptions created by doctor
    if (req.user.role === "DOCTOR") {
      whereClause = {
        doctor: {
          userId: req.user.id, // 🔥 IMPORTANT FIX
        },
      };
    }

    const prescriptions = await prisma.prescription.findMany({
      where: whereClause,
      include: {
        appointment: true,
        doctor: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      prescriptions,
    });
  } catch (error) {
    console.error("Get prescriptions error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch prescriptions",
    });
  }
};

exports.createPrescription = async (req, res) => {
  try {
    const { appointmentId, doctorId, instructions } = req.body;

    if (!appointmentId || !doctorId || !instructions) {
      return res.status(400).json({
        success: false,
        message: "appointmentId, doctorId and instructions are required",
      });
    }

    const prescription = await prisma.prescription.create({
      data: {
        appointmentId,
        doctorId,
        instructions,
      },
    });

    return res.status(201).json({
      success: true,
      prescription,
    });
  } catch (error) {
    console.error("Create prescription error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create prescription",
    });
  }
};