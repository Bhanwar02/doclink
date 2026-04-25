const prisma = require("../prisma");

const upsertPatientProfile = async (req, res) => {
  try {
    const formData = req.body;

    // 🔐 safety check
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        message: "Unauthorized - missing user",
      });
    }

    // validation
    if (!formData.phone || !formData.gender || !formData.blood_group) {
      return res.status(400).json({
        message: "Phone, Gender and Blood Group are required",
      });
    }

    const profileData = {
  full_name: formData.full_name,   // ✅ ADD THIS
  phone: formData.phone,
  date_of_birth: formData.date_of_birth
    ? new Date(formData.date_of_birth)
    : null,
  gender: formData.gender,
  address: formData.address || null,
  emergency_contact: formData.emergency_contact || null,
  medical_history: formData.medical_history || null,
  allergies: formData.allergies || null,
  blood_group: formData.blood_group,
};

    const profile = await prisma.patientProfile.upsert({
      where: { userId: req.user.id },
      update: profileData,
      create: {
        userId: req.user.id,
        ...profileData,
      },
    });

    return res.status(200).json({
      message: "Profile saved successfully",
      data: profile,
    });
  } catch (error) {
    console.error("Upsert Patient Profile Error:", error);

    return res.status(500).json({
      message: "Error saving profile",
    });
  }
};

const getPatientProfile = async (req, res) => {
  try {
    const profile = await prisma.patientProfile.findUnique({
      where: {
        userId: req.user.id,
      },
      include: {
        user: true, // 👈 important for name/email/avatar
      },
    });

    if (!profile) {
      return res.json({
        user: null,
        profile: null,
      });
    }

    return res.json({
      user: profile.user,
      profile: profile,
    });

  } catch (error) {
    return res.status(500).json({ message: "Error fetching profile" });
  }
};


module.exports = { upsertPatientProfile, getPatientProfile };