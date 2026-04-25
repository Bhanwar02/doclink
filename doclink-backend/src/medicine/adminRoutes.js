const router = require("express").Router();
const prisma = require("../prisma");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Get all medicines
router.get("/", auth, role("ADMIN"), async (req, res) => {
  const medicines = await prisma.medicine.findMany({
    orderBy: { createdAt: "desc" },
  });
  res.json(medicines);
});

// Create medicine
router.post("/", auth, role("ADMIN"), async (req, res) => {
  const medicine = await prisma.medicine.create({
    data: req.body,
  });
  res.json(medicine);
});

// Update medicine
router.put("/:id", auth, role("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const updated = await prisma.medicine.update({
    where: { id },
    data: req.body,
  });
  res.json(updated);
});

// Delete medicine
router.delete("/:id", auth, role("ADMIN"), async (req, res) => {
  const { id } = req.params;
  await prisma.medicine.delete({
    where: { id },
  });
  res.json({ message: "Deleted" });
});

module.exports = router;