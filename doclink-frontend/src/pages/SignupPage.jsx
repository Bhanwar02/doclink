// src/pages/SignupPage.jsx
// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "PATIENT",
  });
const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleSignup = async () => {
    try {
      setError("");
      setSuccess("");

      if (!form.email || !form.password) {
        setError("All fields are required");
        return;
      }

      if (form.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setIsLoading(true);

      await axios.post("http://localhost:5000/auth/register", form);

      setSuccess("Account created successfully 🎉");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Signup failed. Try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        {success && (
          <p className="text-green-600 text-sm mb-3 text-center">{success}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          value={form.email}
          onChange={(e) =>
            setForm({ ...form, email: e.target.value })
          }
        />

        <div className="relative mb-3">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    className="w-full border p-2 pr-10 rounded"
    value={form.password}
    onChange={(e) =>
      setForm({ ...form, password: e.target.value })
    }
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
  >
    {showPassword ? "🙈" : "👁️"}
  </span>
</div>

        <p className="text-sm text-gray-500 mb-4">
  Account type: <span className="font-medium">Patient</span>
</p>
        <button
          onClick={handleSignup}
          disabled={isLoading}
          className="w-full bg-teal-600 text-white py-2 rounded hover:bg-teal-700"
        >
          {isLoading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-sm text-center mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-teal-600 cursor-pointer"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;