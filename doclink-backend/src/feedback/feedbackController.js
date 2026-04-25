const prisma = require("../prisma");

exports.addFeedback = async (req, res) => {
  try {
    const { appointmentId, rating, comments } = req.body;

    console.log("Incoming feedback:", req.body);

    // ✅ Validation
    if (!appointmentId || !rating) {
      return res.status(400).json({
        message: "appointmentId and rating are required",
      });
    }

    // ✅ Check appointment exists
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found",
      });
    }

    // ✅ Prevent duplicate feedback
    const existing = await prisma.feedback.findFirst({
      where: { appointmentId },
    });

    if (existing) {
      return res.status(400).json({
        message: "Feedback already submitted",
      });
    }

    // ✅ Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        appointmentId,
        rating,
        comments: comments || "Good consultation",
      },
    });

    res.status(201).json(feedback);

  } catch (error) {
    console.error("Feedback error:", error);

    res.status(500).json({
      message: "Failed to save feedback",
      error: error.message,
    });
  }
};

exports.getFeedback = async (req, res) => {
  const feedbacks = await prisma.feedback.findMany();
  res.json(feedbacks);
};