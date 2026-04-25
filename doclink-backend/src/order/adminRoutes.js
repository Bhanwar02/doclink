const router = require("express").Router();
const prisma = require("../prisma");
const auth = require("../middleware/authMiddleware");
const role = require("../middleware/roleMiddleware");

// Get all orders
router.get("/admin", auth, role("ADMIN"), async (req, res) => {
  const orders = await prisma.medicineOrder.findMany({
    include: {
      patient: true,
      items: {
        include: {
          medicine: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  res.json(orders);
});

// Update order status
router.put("/:id/status", auth, role("ADMIN"), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const updated = await prisma.medicineOrder.update({
    where: { id },
    data: { status },
  });

  res.json(updated);
});

module.exports = router;