const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./auth/authRoutes");
const userRoutes = require("./user/userRoutes");
const appointmentRoutes = require("./appointment/appointmentRoutes");
const doctorRoutes = require("./doctor/doctorRoutes");
const medicineRoutes = require("./medicine/medicineRoutes");
const seminarRoutes = require("./seminar/seminarRoutes");
const prescriptionRoutes = require("./prescription/prescriptionRoutes");
const orderRoutes = require("./order/orderRoutes");
const patientRoutes = require("./patient/patientRoutes");
const feedbackRoutes = require("./feedback/feedbackRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "DocLink backend is running",
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/doctors", doctorRoutes);
app.use("/medicines", medicineRoutes);
app.use("/seminars", seminarRoutes);
app.use("/prescriptions", prescriptionRoutes);
app.use("/orders", orderRoutes);
app.use("/patient", patientRoutes);
app.use("/feedback", feedbackRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`DocLink backend running on port ${PORT}`);
});