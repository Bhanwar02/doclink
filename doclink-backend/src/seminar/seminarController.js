const prisma = require("../prisma");

exports.getSeminars = async (req, res) => {
  try {
    const seminars = await prisma.healthSeminar.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      seminars,
    });
  } catch (error) {
    console.error("Get seminars error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch seminars",
    });
  }
};

// CREATE
exports.createSeminar = async (req, res) => {
  try {
    const seminar = await prisma.healthSeminar.create({
      data: {
        ...req.body,
        eventDate: new Date(req.body.eventDate), // IMPORTANT
      },
    });

    res.json({ success: true, seminar });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE
exports.updateSeminar = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("BODY:", req.body);

    const seminar = await prisma.healthSeminar.update({
      where: { id },
      data: {
        ...(req.body.title !== undefined && { title: req.body.title }),
        ...(req.body.description !== undefined && { description: req.body.description }),
        ...(req.body.isActive !== undefined && { isActive: req.body.isActive }),
      },
    });

    console.log("UPDATED:", seminar);

    res.json({ success: true, seminar });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

// DELETE
exports.deleteSeminar = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.healthSeminar.delete({
      where: { id },
    });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};