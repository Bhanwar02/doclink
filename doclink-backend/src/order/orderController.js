const prisma = require("../prisma");

exports.createOrder = async (req, res) => {
  try {
    const { items, phoneNumber, deliveryAddress } = req.body;

    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!phoneNumber || !deliveryAddress) {
      return res.status(400).json({
        message: "Phone number and delivery address are required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Order items are required" });
    }

    let totalAmount = 0;
    const preparedItems = [];

    for (const item of items) {
      const medicine = await prisma.medicine.findUnique({
        where: { id: item.medicineId },
      });

      if (!medicine) {
        return res.status(404).json({
          message: `Medicine not found: ${item.medicineId}`,
        });
      }

      const quantity = Number(item.quantity) || 0;

      if (quantity <= 0) {
        return res.status(400).json({ message: "Invalid item quantity" });
      }

      totalAmount += Number(medicine.price) * quantity;

      preparedItems.push({
        medicineId: medicine.id,
        quantity,
        price: medicine.price,
      });
    }

    const order = await prisma.medicineOrder.create({
      data: {
        patientId: req.user.id,
        phoneNumber,
        deliveryAddress,
        totalAmount: totalAmount.toFixed(2),
        status: "PENDING",
        items: {
          create: preparedItems,
        },
      },
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
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Failed to create order" });
  }
};