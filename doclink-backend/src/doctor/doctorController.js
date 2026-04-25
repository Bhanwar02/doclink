const prisma = require("../prisma");
const bcrypt = require("bcryptjs");


// ================= CREATE DOCTOR =================
exports.createDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      specialty,
      specialization,
      experienceYears,
      qualification,
      bio,
      consultationFee,
      isActive,
      availableDays,
      availableHoursStart,
      availableHoursEnd,
      userId,
    } = req.body;

    const finalSpecialization = specialty || specialization;

    if (!name || !finalSpecialization) {
      return res.status(400).json({
        success: false,
        message: "Name and specialization are required",
      });
    }

    let user = null;

    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email } });

      if (!user) {
        const hashedPassword = await bcrypt.hash("123456", 10);

        user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            role: "DOCTOR",
          },
        });
      }
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Valid userId or email is required",
      });
    }

    const existingDoctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (existingDoctor) {
      return res.status(400).json({
        success: false,
        message: "Doctor profile already exists",
      });
    }

    const doctor = await prisma.doctor.create({
      data: {
        name,
        specialization: finalSpecialization,
        experienceYears: Number(experienceYears) || 0,
        qualification: qualification || "",
        bio: bio || "",
        consultationFee: consultationFee?.toString() || "0",
        isActive: typeof isActive === "boolean" ? isActive : true,
        availableDays: Array.isArray(availableDays) ? availableDays : [],
        availableHoursStart: availableHoursStart || "09:00",
        availableHoursEnd: availableHoursEnd || "17:00",
        userId: user.id,
      },
      include: {
        user: { select: { id: true, email: true, role: true } },
      },
    });

    return res.status(201).json({
      success: true,
      doctor: normalizeDoctor(doctor),
      message: "Doctor created successfully",
    });
  } catch (error) {
    console.error("Create doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "Create failed",
    });
  }
};


// ================= GET DOCTORS =================
exports.getDoctors = async (req, res) => {
  try {
    const doctors = await prisma.doctor.findMany({
      include: {
        user: {
          select: { id: true, email: true, role: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      success: true,
      doctors: doctors.map(normalizeDoctor),
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch doctors",
    });
  }
};


// ================= ADMIN UPDATE (FULL UPDATE) =================
exports.updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      specialty,
      specialization,
      experienceYears,
      qualification,
      bio,
      consultationFee,
      isActive,
      availableDays,
      availableHoursStart,
      availableHoursEnd,
    } = req.body;

    const existingDoctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!existingDoctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(specialty || specialization
          ? { specialization: specialty || specialization }
          : {}),
        ...(experienceYears !== undefined && {
          experienceYears: Number(experienceYears) || 0,
        }),
        ...(qualification !== undefined && { qualification }),
        ...(bio !== undefined && { bio }),
        ...(consultationFee !== undefined && {
          consultationFee: consultationFee.toString(),
        }),
        ...(typeof isActive === "boolean" && { isActive }),

        // availability (admin can also update if needed)
        ...(availableDays !== undefined && {
          availableDays: Array.isArray(availableDays) ? availableDays : [],
        }),
        ...(availableHoursStart !== undefined && { availableHoursStart }),
        ...(availableHoursEnd !== undefined && { availableHoursEnd }),
      },
    });

    return res.status(200).json({
      success: true,
      doctor: normalizeDoctor(updatedDoctor),
      message: "Doctor updated successfully",
    });
  } catch (error) {
    console.error("Update doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "Update failed",
    });
  }
};


// ================= DOCTOR ONLY AVAILABILITY =================
exports.updateDoctorAvailability = async (req, res) => {
  try {
    console.log("📥 HIT API"); // 👈 ADD THIS
    console.log("BODY:", req.body); // 👈 ADD THIS

    const { availableDays, availableHoursStart, availableHoursEnd } = req.body;

    const doctor = await prisma.doctor.findUnique({
      where: { userId: req.user.id },
    });

    console.log("FOUND DOCTOR:", doctor); // 👈 ADD

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor profile not found",
      });
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id: doctor.id },
      data: {
        availableDays,
        availableHoursStart,
        availableHoursEnd,
      },
    });

    console.log("UPDATED:", updatedDoctor); // 👈 ADD

    return res.status(200).json({
      success: true,
      message: "Availability updated",
      doctor: updatedDoctor,
    });
  } catch (error) {
    console.error("❌ ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update availability",
    });
  }
};


// ================= STATUS =================
exports.updateDoctorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const doctor = await prisma.doctor.update({
      where: { id },
      data: { isActive: !!isActive },
      include: { user: { select: { id: true, email: true, role: true } } },
    });

    return res.status(200).json({
      success: true,
      doctor: normalizeDoctor(doctor),
      message: "Doctor status updated successfully",
    });
  } catch (error) {
    console.error("Status update error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update status",
    });
  }
};


// ================= DELETE =================
exports.deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    await prisma.feedback.deleteMany({
      where: { appointment: { doctorId: doctor.id } },
    });

    await prisma.prescription.deleteMany({
      where: { doctorId: doctor.id },
    });

    await prisma.appointment.deleteMany({
      where: { doctorId: doctor.id },
    });

    await prisma.doctor.delete({ where: { id } });

    if (doctor.userId) {
      await prisma.user.delete({ where: { id: doctor.userId } });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete doctor",
    });
  }
};


// ================= HELPER =================
function normalizeDoctor(doctor) {
  return {
    ...doctor,
    specialty: doctor.specialization,
    consultationFee: Number(doctor.consultationFee || 0),

    // 🔥 frontend friendly
    available_days: doctor.availableDays || [],
    available_hours_start: doctor.availableHoursStart || "09:00",
    available_hours_end: doctor.availableHoursEnd || "17:00",

    experience_years: doctor.experienceYears ?? 0,
    consultation_fee: Number(doctor.consultationFee || 0),
  };
}