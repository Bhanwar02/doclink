const prisma = require("../prisma");

exports.getMedicines = async (req, res) => {
  try {
    const medicines = await prisma.medicine.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      medicines,
    });
  } catch (error) {
    console.error("Get medicines error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch medicines",
    });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      description,
      price,
      stockQuantity,
      requiresPrescription,
      manufacturer,
      isAvailable,
    } = req.body;

    if (!name || !category || Number(price) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Name, category and valid price are required",
      });
    }

    const medicine = await prisma.medicine.create({
      data: {
        name,
        genericName: genericName || "",
        category,
        description: description || "",
        price: price.toString(),
        stockQuantity: Number(stockQuantity) || 0,
        requiresPrescription:
          typeof requiresPrescription === "boolean"
            ? requiresPrescription
            : true,
        manufacturer: manufacturer || "",
        isAvailable:
          typeof isAvailable === "boolean" ? isAvailable : true,
      },
    });

    return res.status(201).json({
      success: true,
      medicine,
      message: "Medicine created successfully",
    });
  } catch (error) {
    console.error("Create medicine error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create medicine",
    });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      genericName,
      category,
      description,
      price,
      stockQuantity,
      requiresPrescription,
      manufacturer,
      isAvailable,
    } = req.body;

    const existing = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        genericName: genericName ?? existing.genericName,
        category: category ?? existing.category,
        description: description ?? existing.description,
        price:
          price !== undefined ? price.toString() : existing.price,
        stockQuantity:
          stockQuantity !== undefined
            ? Number(stockQuantity)
            : existing.stockQuantity,
        requiresPrescription:
          typeof requiresPrescription === "boolean"
            ? requiresPrescription
            : existing.requiresPrescription,
        manufacturer:
          manufacturer !== undefined ? manufacturer : existing.manufacturer,
        isAvailable:
          typeof isAvailable === "boolean"
            ? isAvailable
            : existing.isAvailable,
      },
    });

    return res.status(200).json({
      success: true,
      medicine,
      message: "Medicine updated successfully",
    });
  } catch (error) {
    console.error("Update medicine error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update medicine",
    });
  }
};

exports.updateMedicineAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    const existing = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    const medicine = await prisma.medicine.update({
      where: { id },
      data: {
        isAvailable: !!isAvailable,
      },
    });

    return res.status(200).json({
      success: true,
      medicine,
      message: "Medicine availability updated successfully",
    });
  } catch (error) {
    console.error("Update medicine availability error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update medicine availability",
    });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.medicine.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Medicine not found",
      });
    }

    await prisma.orderItem.deleteMany({
      where: { medicineId: id },
    });

    await prisma.medicine.delete({
      where: { id },
    });

    return res.status(200).json({
      success: true,
      message: "Medicine deleted successfully",
    });
  } catch (error) {
    console.error("Delete medicine error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete medicine",
    });
  }
};