// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDoctorError, setIsDoctorError] = useState(false);

  const handleReset = async () => {
  setMessage("");
  setIsSuccess(false);
  setIsDoctorError(false);

  // ❌ Frontend validation (REQUIRED FIELDS)
  if (!email || !newPassword) {
    setMessage("All fields are required");
    return;
  }

  if (newPassword.length < 6) {
    setMessage("Password must be at least 6 characters");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:5000/auth/forgot-password",
      { email, newPassword }
    );

    // ✅ SUCCESS
    setIsSuccess(true);
    setMessage(res.data.message);

    setTimeout(() => {
      navigate("/login");
    }, 2000);

  } catch (err) {
    const errorMsg =
      err.response?.data?.message || "Something went wrong";

    // 👨‍⚕️ Doctor-specific check ONLY
    if (errorMsg.toLowerCase().includes("doctor")) {
      setIsDoctorError(true);
    }

    // ❌ All errors stay red
    setIsSuccess(false);
    setMessage(errorMsg);
  }
};

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-xl w-80">
        <h2 className="text-xl font-bold mb-4 text-center">
          Reset Password
        </h2>

        {message && (
  <p
    className={`text-sm text-center mb-3 ${
      isSuccess ? "text-green-600" : "text-red-500"
    }`}
  >
    {message}
  </p>
)}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 mb-4 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button
          onClick={handleReset}
          className="w-full bg-teal-600 text-white py-2 rounded"
        >
          Reset Password
        </button>

        {/* 🔗 Doctor case */}
        {isDoctorError && (
          <p
            onClick={() => navigate("/login")}
            className="text-center text-sm text-teal-600 mt-4 cursor-pointer hover:underline"
          >
            ← Back to Login
          </p>
        )}
      </div>
    </div>
  );
}