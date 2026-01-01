import { Eye, EyeOff, Link } from "lucide-react";
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 Add state to toggle visibility
  const navigate = useNavigate();
  const [, setAuthUser] = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.post(
        "https://neromax-ai-assistant-3.onrender.com/api/v1/user/login",
        {
          email: formData.email,
          password: formData.password,
        },
        { withCredentials: true }
      );
      alert(data.message || "Login Succeeded");
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
      setAuthUser(data.token);
      navigate("/");
    } catch (error) {
      const msg = error?.response?.data?.errors || "Login Failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="bg-[#1e1e1e] text-white w-full max-w-md rounded-2xl p-6 shadow-lg">
        <h1 className="text-white text-center">Login</h1>

        {/* Email */}
        <div className="mb-4 mt-2">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus-ring-[#7a6ff0]"
            type="text"
            name="email"
            placeholder="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="mb-4 mt-2 relative">
          <input
            className="w-full bg-transparent border border-gray-600 rounded-md px-4 py-3 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus-ring-[#7a6ff0]"
            type={showPassword ? "text" : "password"} // 👈 toggle visibility
            name="password"
            placeholder="password"
            value={formData.password}
            onChange={handleChange}
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-400"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Error */}
        {error && <span className="text-red-600 text-sm mb-4 block">{error}</span>}

        {/* Terms */}
        <p className="text-xs text-gray-400 mt-4 mb-6">
          By signing up or logging in, you consent to NeroMax's{" "}
          <a className="underline" href="#">
            Terms of Use
          </a>{" "}
          and{" "}
          <a className="underline" href="#">
            Privacy Policy
          </a>
          .
        </p>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-[#7a6ff6] hover:bg-[#6c61a6] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Logging In..." : "Login"}
        </button>

        {/* Links */}
        <div className="flex justify-between mt-4 text-sm">
          <p className="text-[#ffffff] " href="#">
            Haven't account?
          </p>
          <a className="text-[#7a6ff6] hover:underline" href="/signup">
            Signup
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
