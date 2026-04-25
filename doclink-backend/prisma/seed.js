const prisma = require("../src/prisma");
const bcrypt = require("bcryptjs");

async function main() {
  console.log("Seeding DocLink data...");

  const hashedPassword = await bcrypt.hash("123456", 10);

  // =========================
  // ADMIN
  // =========================
  const adminEmail = "admin@doclink.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });
    console.log("Created admin: admin@doclink.com");
  } else {
    console.log("Skipping existing admin: admin@doclink.com");
  }

  // =========================
  // DOCTORS
  // =========================
  const doctors = [
    {
      name: "Dr. John Smith",
      email: "john.smith@doclink.com",
      specialization: "Cardiology",
    },
    {
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@doclink.com",
      specialization: "Dermatology",
    },
    {
      name: "Dr. Michael Lee",
      email: "michael.lee@doclink.com",
      specialization: "Neurology",
    },
    {
      name: "Dr. Emily Brown",
      email: "emily.brown@doclink.com",
      specialization: "Pediatrics",
    },
    {
      name: "Dr. David Wilson",
      email: "david.wilson@doclink.com",
      specialization: "Orthopedics",
    },
  ];

  const createdDoctors = [];

  for (const doc of doctors) {
    let user = await prisma.user.findUnique({
      where: { email: doc.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: doc.email,
          password: hashedPassword,
          role: "DOCTOR",
        },
      });
      console.log(`Created doctor user: ${doc.email}`);
    } else {
      console.log(`Skipping existing doctor user: ${doc.email}`);
    }

    let doctor = await prisma.doctor.findUnique({
      where: { userId: user.id },
    });

    if (!doctor) {
      doctor = await prisma.doctor.create({
        data: {
          name: doc.name,
          specialization: doc.specialization,
          userId: user.id,
        },
      });
      console.log(`Created doctor profile: ${doc.name}`);
    } else {
      console.log(`Skipping existing doctor profile: ${doc.name}`);
    }

    createdDoctors.push(doctor);
  }

  // =========================
  // PATIENTS
  // =========================
  const patients = [
    { email: "parth.patient@doclink.com" },
    { email: "emma.patient@doclink.com" },
    { email: "liam.patient@doclink.com" },
    { email: "olivia.patient@doclink.com" },
    { email: "noah.patient@doclink.com" },
  ];

  const createdPatients = [];

  for (const pat of patients) {
    let user = await prisma.user.findUnique({
      where: { email: pat.email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: pat.email,
          password: hashedPassword,
          role: "PATIENT",
        },
      });
      console.log(`Created patient: ${pat.email}`);
    } else {
      console.log(`Skipping existing patient: ${pat.email}`);
    }

    createdPatients.push(user);
  }

  // =========================
  // MEDICINES
  // =========================
  const medicines = [
    {
      name: "Tylenol",
      genericName: "Acetaminophen",
      category: "Pain Relief",
      description: "Used to relieve fever and mild to moderate pain.",
      price: "8.99",
      stockQuantity: 120,
      requiresPrescription: false,
      manufacturer: "Johnson & Johnson",
      isAvailable: true,
    },
    {
      name: "Advil",
      genericName: "Ibuprofen",
      category: "Pain Relief",
      description: "Anti-inflammatory medicine for pain, swelling, and fever.",
      price: "9.49",
      stockQuantity: 100,
      requiresPrescription: false,
      manufacturer: "Pfizer",
      isAvailable: true,
    },
    {
      name: "Amoxil",
      genericName: "Amoxicillin",
      category: "Antibiotics",
      description: "Antibiotic used for common bacterial infections.",
      price: "14.99",
      stockQuantity: 60,
      requiresPrescription: true,
      manufacturer: "GlaxoSmithKline",
      isAvailable: true,
    },
    {
      name: "Zithromax",
      genericName: "Azithromycin",
      category: "Antibiotics",
      description: "Used to treat respiratory and skin bacterial infections.",
      price: "18.50",
      stockQuantity: 45,
      requiresPrescription: true,
      manufacturer: "Pfizer",
      isAvailable: true,
    },
    {
      name: "Glucophage",
      genericName: "Metformin",
      category: "Diabetes",
      description: "Helps control blood sugar in type 2 diabetes.",
      price: "12.75",
      stockQuantity: 90,
      requiresPrescription: true,
      manufacturer: "Bristol Myers Squibb",
      isAvailable: true,
    },
    {
      name: "Lipitor",
      genericName: "Atorvastatin",
      category: "Cardiovascular",
      description: "Used to lower cholesterol and support heart health.",
      price: "22.99",
      stockQuantity: 70,
      requiresPrescription: true,
      manufacturer: "Pfizer",
      isAvailable: true,
    },
    {
      name: "Ventolin",
      genericName: "Salbutamol",
      category: "Respiratory",
      description: "Helps relieve asthma symptoms and breathing difficulty.",
      price: "19.99",
      stockQuantity: 55,
      requiresPrescription: true,
      manufacturer: "GlaxoSmithKline",
      isAvailable: true,
    },
    {
      name: "Claritin",
      genericName: "Loratadine",
      category: "Allergy",
      description: "Non-drowsy allergy medicine for sneezing and itching.",
      price: "11.99",
      stockQuantity: 85,
      requiresPrescription: false,
      manufacturer: "Bayer",
      isAvailable: true,
    },
    {
      name: "Benadryl",
      genericName: "Diphenhydramine",
      category: "Allergy",
      description: "Used for allergy relief and itch control.",
      price: "10.49",
      stockQuantity: 75,
      requiresPrescription: false,
      manufacturer: "Johnson & Johnson",
      isAvailable: true,
    },
    {
      name: "Prilosec",
      genericName: "Omeprazole",
      category: "Digestive",
      description: "Reduces stomach acid and helps with acid reflux.",
      price: "13.25",
      stockQuantity: 80,
      requiresPrescription: false,
      manufacturer: "AstraZeneca",
      isAvailable: true,
    },
    {
      name: "Pantoloc",
      genericName: "Pantoprazole",
      category: "Digestive",
      description: "Used for reflux, acidity, and stomach ulcer treatment.",
      price: "16.80",
      stockQuantity: 50,
      requiresPrescription: true,
      manufacturer: "Takeda",
      isAvailable: true,
    },
    {
      name: "Vitamin D3",
      genericName: "Cholecalciferol",
      category: "Vitamins",
      description: "Supports bone strength and immune system health.",
      price: "7.99",
      stockQuantity: 140,
      requiresPrescription: false,
      manufacturer: "Jamieson",
      isAvailable: true,
    },
    {
      name: "Vitamin C",
      genericName: "Ascorbic Acid",
      category: "Vitamins",
      description: "Supplement commonly used for immune support.",
      price: "6.99",
      stockQuantity: 150,
      requiresPrescription: false,
      manufacturer: "Jamieson",
      isAvailable: true,
    },
    {
      name: "Hydrocortisone Cream",
      genericName: "Hydrocortisone",
      category: "Skin Care",
      description: "Used for skin irritation, itching, and redness.",
      price: "9.99",
      stockQuantity: 65,
      requiresPrescription: false,
      manufacturer: "Pfizer",
      isAvailable: true,
    },
    {
      name: "Zoloft",
      genericName: "Sertraline",
      category: "Mental Health",
      description: "Prescription medicine used for depression and anxiety.",
      price: "20.99",
      stockQuantity: 35,
      requiresPrescription: true,
      manufacturer: "Pfizer",
      isAvailable: true,
    },
  ];

  const createdMedicines = [];

  for (const med of medicines) {
    let medicine = await prisma.medicine.findFirst({
      where: { name: med.name },
    });

    if (!medicine) {
      medicine = await prisma.medicine.create({
        data: {
          name: med.name,
          genericName: med.genericName,
          category: med.category,
          description: med.description,
          price: med.price,
          stockQuantity: med.stockQuantity,
          requiresPrescription: med.requiresPrescription,
          manufacturer: med.manufacturer,
          isAvailable: med.isAvailable,
        },
      });
      console.log(`Created medicine: ${med.name}`);
    } else {
      console.log(`Skipping existing medicine: ${med.name}`);
    }

    createdMedicines.push(medicine);
  }

  // =========================
  // HEALTH SEMINARS
  // =========================
  const seminars = [
    {
      title: "Heart Health Awareness",
      description: "Learn how to maintain a healthy heart and prevent cardiovascular disease.",
      speakerName: "Dr. John Smith",
      speakerTitle: "Cardiologist",
      eventDate: new Date("2026-04-10"),
      eventTime: "10:00 AM",
      durationMinutes: 60,
      topicCategory: "Cardiology",
      meetingLink: "https://meet.google.com/heart-health-awareness",
      maxAttendees: 100,
      isActive: true,
    },
    {
      title: "Skin Care Basics",
      description: "Daily skincare routine and practical tips for healthy skin.",
      speakerName: "Dr. Sarah Johnson",
      speakerTitle: "Dermatologist",
      eventDate: new Date("2026-04-12"),
      eventTime: "2:00 PM",
      durationMinutes: 45,
      topicCategory: "Dermatology",
      meetingLink: "https://meet.google.com/skin-care-basics",
      maxAttendees: 80,
      isActive: true,
    },
    {
      title: "Brain Health and Stress Management",
      description: "Understand stress, sleep, and habits that support better brain health.",
      speakerName: "Dr. Michael Lee",
      speakerTitle: "Neurologist",
      eventDate: new Date("2026-04-15"),
      eventTime: "6:00 PM",
      durationMinutes: 60,
      topicCategory: "Neurology",
      meetingLink: "https://meet.google.com/brain-health-stress",
      maxAttendees: 120,
      isActive: true,
    },
    {
      title: "Child Nutrition Essentials",
      description: "Healthy diet and growth tips for infants, children, and teens.",
      speakerName: "Dr. Emily Brown",
      speakerTitle: "Pediatrician",
      eventDate: new Date("2026-04-18"),
      eventTime: "11:00 AM",
      durationMinutes: 50,
      topicCategory: "Pediatrics",
      meetingLink: "https://meet.google.com/child-nutrition-essentials",
      maxAttendees: 90,
      isActive: true,
    },
    {
      title: "Bone and Joint Care",
      description: "Learn how to protect your joints and improve bone strength.",
      speakerName: "Dr. David Wilson",
      speakerTitle: "Orthopedic Specialist",
      eventDate: new Date("2026-04-20"),
      eventTime: "4:00 PM",
      durationMinutes: 60,
      topicCategory: "Orthopedics",
      meetingLink: "https://meet.google.com/bone-joint-care",
      maxAttendees: 75,
      isActive: true,
    },
    {
      title: "Managing Diabetes Effectively",
      description: "Practical ways to monitor and manage diabetes in daily life.",
      speakerName: "Dr. John Smith",
      speakerTitle: "Guest Health Speaker",
      eventDate: new Date("2026-04-24"),
      eventTime: "1:00 PM",
      durationMinutes: 55,
      topicCategory: "Diabetes",
      meetingLink: "https://meet.google.com/managing-diabetes-effectively",
      maxAttendees: 110,
      isActive: true,
    },
  ];

  for (const sem of seminars) {
    const existingSeminar = await prisma.healthSeminar.findFirst({
      where: { title: sem.title },
    });

    if (!existingSeminar) {
      await prisma.healthSeminar.create({
        data: sem,
      });
      console.log(`Created seminar: ${sem.title}`);
    } else {
      console.log(`Skipping existing seminar: ${sem.title}`);
    }
  }

  // =========================
  // APPOINTMENTS
  // =========================
  if (createdPatients.length > 0 && createdDoctors.length > 0) {
    const sampleAppointments = [
      {
        patientId: createdPatients[0].id,
        doctorId: createdDoctors[0].id,
        appointment_date: new Date("2026-04-05"),
        appointment_time: "10:30 AM",
        status: "CONFIRMED",
        symptoms: "Chest discomfort and shortness of breath.",
        notes: "First consultation.",
      },
      {
        patientId: createdPatients[1].id,
        doctorId: createdDoctors[1].id,
        appointment_date: new Date("2026-04-07"),
        appointment_time: "1:00 PM",
        status: "PENDING",
        symptoms: "Skin rash and irritation for one week.",
        notes: "Needs dermatology review.",
      },
      {
        patientId: createdPatients[2].id,
        doctorId: createdDoctors[2].id,
        appointment_date: new Date("2026-04-09"),
        appointment_time: "3:15 PM",
        status: "COMPLETED",
        symptoms: "Frequent headaches and dizziness.",
        notes: "Follow-up after initial scans.",
      },
    ];

    for (const appt of sampleAppointments) {
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          patientId: appt.patientId,
          doctorId: appt.doctorId,
          appointment_date: appt.appointment_date,
          appointment_time: appt.appointment_time,
        },
      });

      if (!existingAppointment) {
        await prisma.appointment.create({
          data: appt,
        });
        console.log(
          `Created appointment for patient ${appt.patientId} with doctor ${appt.doctorId}`
        );
      } else {
        console.log(
          `Skipping existing appointment for patient ${appt.patientId}`
        );
      }
    }
  }

// =========================
// MEDICINE ORDERS
// =========================

if (createdPatients.length > 0 && createdMedicines.length > 0) {
  console.log("Seeding medicine orders...");

  const orders = [
    {
      patient: createdPatients[0],
      items: [
        { medicine: createdMedicines[0], quantity: 2 },
        { medicine: createdMedicines[1], quantity: 1 },
      ],
      phoneNumber: "6471234567",
      deliveryAddress: "123 Main St, Toronto, ON",
      status: "CONFIRMED",
    },
    {
      patient: createdPatients[1],
      items: [
        { medicine: createdMedicines[2], quantity: 1 },
        { medicine: createdMedicines[3], quantity: 2 },
      ],
      phoneNumber: "6479876543",
      deliveryAddress: "456 Queen St, Brampton, ON",
      status: "PROCESSING",
    },
    {
      patient: createdPatients[2],
      items: [
        { medicine: createdMedicines[4], quantity: 1 },
        { medicine: createdMedicines[5], quantity: 1 },
      ],
      phoneNumber: "6475558888",
      deliveryAddress: "789 King St, Mississauga, ON",
      status: "DELIVERED",
    },
  ];

  for (const orderData of orders) {
    // Calculate total
    let total = 0;

    for (const item of orderData.items) {
      total += Number(item.medicine.price) * item.quantity;
    }

    // Create order
    const order = await prisma.medicineOrder.create({
      data: {
        patientId: orderData.patient.id,
        phoneNumber: orderData.phoneNumber,
        deliveryAddress: orderData.deliveryAddress,
        totalAmount: total.toFixed(2),
        status: orderData.status,
      },
    });

    // Create items
    for (const item of orderData.items) {
      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          medicineId: item.medicine.id,
          quantity: item.quantity,
          price: item.medicine.price,
        },
      });
    }

    console.log(`Created order for patient ${orderData.patient.email}`);
  }
  const testPatient = await prisma.user.findFirst({
  where: { role: "PATIENT" }
});

const testMedicine = await prisma.medicine.findFirst();

if (testPatient && testMedicine) {
  const order = await prisma.medicineOrder.create({
    data: {
      patientId: testPatient.id,
      phoneNumber: "6471112222",
      deliveryAddress: "Test Address, Brampton",
      totalAmount: "20.00",
      status: "CONFIRMED"
    }
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      medicineId: testMedicine.id,
      quantity: 2,
      price: testMedicine.price
    }
  });

  console.log("🔥 Test order created");
}
}


  console.log("DocLink seeding completed successfully.");
  console.log("Default password for all seeded users: 123456");
}

main()
  .catch((error) => {
    console.error("Seed error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });