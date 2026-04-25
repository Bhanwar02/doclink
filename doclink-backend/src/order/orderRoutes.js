const router = require("express").Router();
const { verifyToken } = require("../middleware/authMiddleware");
const prisma = require("../prisma");
const { createOrder } = require("./orderController");

router.post("/", verifyToken, createOrder);

router.get("/", verifyToken, async (req, res) => {
  try {
    let orders = [];

    if (req.user.role === "PATIENT") {
      orders = await prisma.medicineOrder.findMany({
        where: { patientId: req.user.id },
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          items: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  genericName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } else {
      orders = await prisma.medicineOrder.findMany({
        include: {
          patient: {
            select: {
              id: true,
              email: true,
              role: true,
            },
          },
          items: {
            include: {
              medicine: {
                select: {
                  id: true,
                  name: true,
                  genericName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    res.json(orders);
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

router.patch("/:id/status", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await prisma.medicineOrder.update({
      where: { id },
      data: { status },
    });

    res.json(updatedOrder);
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
});

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });

    await prisma.medicineOrder.delete({
      where: { id },
    });

    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ message: "Failed to delete order" });
  }
});

module.exports = router;