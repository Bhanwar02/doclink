const express = require("express");
const router = express.Router();
const prisma = require("../prisma");
const bcrypt = require("bcryptjs");
const { verifyToken, requireRole } = require("../middleware/authMiddleware");

// GET ALL USERS (ADMIN)
router.get("/", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        email: "asc",
      },
    });

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
});

// GET CURRENT USER
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        role: true,
        doctor: {
          select: {
            id: true,
            name: true,
            specialization: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get /users/me error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
});

// UPDATE USER EMAIL / ROLE
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const isSelf = req.user.id === id;
    const isAdmin = req.user.role === "ADMIN";

    if (!isSelf && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: insufficient permissions",
      });
    }

    if (role && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Only admin can change user roles",
      });
    }

    const allowedRoles = ["ADMIN", "DOCTOR", "PATIENT"];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role value",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(email ? { email } : {}),
        ...(role ? { role } : {}),
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
});

// PATCH USER ROLE (ADMIN)
router.patch("/:id/role", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const allowedRoles = ["ADMIN", "DOCTOR", "PATIENT"];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return res.status(200).json({
      success: true,
      user: updatedUser,
      message: "User role updated successfully",
    });
  } catch (error) {
    console.error("Patch user role error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update user role",
    });
  }
});

// RESET / CHANGE USER PASSWORD (ADMIN)
router.patch("/:id/password", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update password",
    });
  }
});

// DELETE USER (ADMIN)
router.delete("/:id", verifyToken, requireRole("ADMIN"), async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.id === id) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own admin account",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        doctor: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (existingUser.doctor) {
      await prisma.feedback.deleteMany({
        where: {
          appointment: {
            doctorId: existingUser.doctor.id,
          },
        },
      });

      await prisma.prescription.deleteMany({
        where: {
          doctorId: existingUser.doctor.id,
        },
      });

      await prisma.appointment.deleteMany({
        where: {
          doctorId: existingUser.doctor.id,
        },
      });

      await prisma.doctor.delete({
        where: {
          userId: existingUser.id,
        },
      });
    }

    await prisma.orderItem.deleteMany({
      where: {
        order: {
          patientId: existingUser.id,
        },
      },
    });

    await prisma.medicineOrder.deleteMany({
      where: {
        patientId: existingUser.id,
      },
    });

    await prisma.feedback.deleteMany({
      where: {
        appointment: {
          patientId: existingUser.id,
        },
      },
    });

    await prisma.prescription.deleteMany({
      where: {
        appointment: {
          patientId: existingUser.id,
        },
      },
    });

    await prisma.appointment.deleteMany({
      where: {
        patientId: existingUser.id,
      },
    });

    await prisma.user.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
});

module.exports = router;