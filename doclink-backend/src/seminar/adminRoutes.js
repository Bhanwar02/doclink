const router = require("express").Router();
const prisma = require("../prisma");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Get all seminars
router.get("/", auth, role("ADMIN"), async (req, res) => {
  const seminars = await prisma.healthSeminar.findMany({
    orderBy: { eventDate: "desc" },
  });
  res.json(seminars);
});

// Create seminar
router.post("/", auth, role("ADMIN"), async (req, res) => {
  const seminar = await prisma.healthSeminar.create({
    data: req.body,
  });
  res.json(seminar);
});

// Update seminar
router.put("/:id", auth, role("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.healthSeminar.update({
    where: { id },
    data: req.body,
  });
  res.json(updated);
});

// Delete seminar
router.delete("/:id", auth, role("ADMIN"), async (req, res) => {
  const { id } = req.params;
  await prisma.healthSeminar.delete({
    where: { id },
  });
  res.json({ message: "Deleted" });
});

module.exports = router;