// Signup.jsx

import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Signup.css";

function Signup() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    username: "",
    password: "",
    phone: "",
    gender: "",
    email: "",
    otp: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameStatus, setUsernameStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setUsername(value);
    setForm({ ...form, username: value }); // yahan add karein

    if (value.length > 2) {
      try {
        const res = await axios.post("http://localhost:5000/api/check-username", {
          username: value,
        });
        setUsernameStatus(res.data.exists ? "Username already taken" : "Username available");
      } catch (error) {
        setUsernameStatus("Error checking username");
      }
    } else {
      setUsernameStatus("");
    }
  };

  const checkUsername = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/check-username", {
        username: form.username,
      });
      return !res.data.exists; // agar exists false hai toh username available hai
    } catch (error) {
      alert("Error checking username");
      return false;
    }
  };

  const handleNextStep = async () => {
    const isAvailable = await checkUsername();
    if (!isAvailable) {
      alert("Username already taken");
      return;
    }
    setStep(2);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await axios.post("http://localhost:5000/api/send-otp", { email: form.email });
      alert("OTP sent to email");
      setStep(3);
    } catch {
      alert("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/verify-otp", form);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 409) {
          alert("Username already taken. Try another.");
        } else if (status === 400) {
          alert(err.response.data.message || "Invalid OTP or input");
        } else {
          alert("Signup failed due to server error");
        }
      } else {
        alert("Network error. Please try again.");
      }
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <h2>Create Your Account</h2>
        <p className="subtitle">Quick & easy signup in 3 steps</p>

        {step === 1 && (
          <div
            onKeyDown={e => {
              if (e.key === "Enter") handleNextStep();
            }}
          >
            <input
              className="input-field"
              name="username"
              placeholder="Username"
              onChange={handleUsernameChange}
              required
            />
            <div className="password-wrapper">
              <input
                className="input-field"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              <span className="toggle-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <p>{usernameStatus}</p>
            <button
              className="next-btn"
              onClick={handleNextStep}
              disabled={!form.username || !form.password}
            >
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div
            onKeyDown={e => {
              if (e.key === "Enter") handleSendOtp();
            }}
          >
            <input
              className="input-field"
              name="phone"
              placeholder="Phone Number"
              onChange={handleChange}
            />
            <select
              className="input-field"
              name="gender"
              onChange={handleChange}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <input
              className="input-field"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />
            <button
              className="next-btn"
              onClick={handleSendOtp}
              disabled={!form.email || loading}
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div
            onKeyDown={e => {
              if (e.key === "Enter") handleSignup();
            }}
          >
            <input
              className="input-field"
              name="otp"
              placeholder="Enter OTP"
              onChange={handleChange}
              required
            />
            <button
              className="next-btn"
              onClick={handleSignup}
              disabled={!form.otp}
            >
              Sign Up
            </button>
          </div>
        )}

        <p className="bottom-link">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ color: "#007bff", cursor: "pointer" }}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Signup;
