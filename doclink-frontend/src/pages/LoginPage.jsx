// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../lib/AuthContext";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setIsLoggingIn(true);

      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Login response is incomplete");
      }

      loginUser(user, token);

      navigate("/", { replace: true });

      setTimeout(() => {
        window.location.href = "/";
      }, 50);
    } catch (err) {
      console.error("Login error:", err);
      setError(
        err.response?.data?.message || err.message || "Invalid email or password"
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {error && (
          <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-3 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="relative mb-4">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    className="w-full border p-2 pr-10 rounded"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    onKeyDown={handleKeyDown}
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
  >
    {showPassword ? "🙈" : "👁️"}
  </span>
</div>

<p
  onClick={() => navigate("/forgot-password")}
  className="text-sm text-teal-600 cursor-pointer mt-2 text-right"
>
  Forgot Password?
</p>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 disabled:opacity-60"
        >
          {isLoggingIn ? "Logging in..." : "Login"}
        </button>
        <p className="text-sm text-center mt-4 text-gray-600">
  Don't have an account?{" "}
  <span
    onClick={() => navigate("/signup")}
    className="text-teal-600 font-medium cursor-pointer hover:underline"
  >
    Sign Up
  </span>
</p>
      </div>
    </div>
  );
};

export default LoginPage;