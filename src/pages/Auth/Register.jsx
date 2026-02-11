import { useEffect, useState } from "react";
import api from "../../api/user/axios";
import { useNavigate } from "react-router-dom";
import { useLoading } from "../../context/LoadingContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Register({ toastRef }) {
  const savedUserId = JSON.parse(localStorage.getItem("userId"));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();
  const cart = [];
  const wishlist = [];
  const RecentlyViewed = [];
  const { stopLoading } = useLoading();
  const myOrders = [];

  useEffect(() => {
    stopLoading();
  }, []);
  const booking = [];
  const payment = [];
  const block = false;
  const image = "";

  useEffect(() => {
    if (savedUserId) navigate("/");
  }, [savedUserId, navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#!%&])(?=.*\d).{8,}$/;

      if (!regEx.test(password)) {
        setError("Password must include small letter, capital letter, digit, and special character");
        return;
      }

      if (confirmPassword !== password) {
        setError("Password and Confirm Password must be same");
        return;
      }

      // 🚀 RESTORED: Using the correct backend auth endpoint
      // Backend handles unique email validation automatically.
      const res = await api.post("/accounts/auth/register/", {
        name,
        email,
        password
      });

      // Optional: auto-login after register if backend returns token (it does)
      if (res.data.access) {
        localStorage.setItem("accessToken", res.data.access);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("userId", JSON.stringify(res.data.user.id));
        window.dispatchEvent(new Event("profileUpdated"));
        navigate("/");
        return;
      }

      toastRef?.current?.showToast("Registration successful! Please login.");
      navigate("/login");
    } catch (err) {
      console.error("Register Error:", err.response?.data);

      const errorData = err.response?.data;
      let message = "Error registering user";

      if (errorData) {
        if (typeof errorData === "string") {
          message = errorData;
        } else if (errorData.detail) {
          message = Array.isArray(errorData.detail) ? errorData.detail[0] : errorData.detail;
        } else if (errorData.email) {
          // Specific case for "This email is already in use"
          message = Array.isArray(errorData.email) ? errorData.email[0] : errorData.email;
        } else if (errorData.message) {
          message = errorData.message;
        } else {
          // Handle field-level errors
          const fieldErrors = Object.entries(errorData)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
            .join(" | ");
          if (fieldErrors) message = fieldErrors;
        }
      }

      setError(message);
    }
  };

  useEffect(() => {
    if (error) toastRef?.current?.showToast(`${error}`);
  }, [error, toastRef]);

  return (
    <div className="register-parent">
      <form onSubmit={submit} className="register-form">
        <h2>Create Account</h2>

        <input
          type="text"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
          placeholder="Full Name"
        />

        <input
          type="email"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="Email Address"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            required
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
          />
          <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <div className="password-wrapper">
          <input
            type={showConfirmPassword ? "text" : "password"}
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
            value={confirmPassword}
            placeholder="Confirm Password"
          />
          <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Register</button>

        <p className="login-text">
          Already have an account? <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>

      {/* Styles */}
      <style>
        {`
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden; /* prevents scrolling on mobile */
        }

        .register-parent {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #fff8f0;
          padding: 20px;
        }

        .register-form {
          background: #fff;
          padding: 30px;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 400px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }

        .register-form h2 {
          margin-bottom: 10px;
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #ff7eb3, #ff758c, #ff6a88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .register-form input {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #ffd6e0;
          font-size: 16px;
          outline: none;
          background: #fff8f8;
          transition: 0.3s;
        }

        .register-form input:focus {
          border-color: #ff6a88;
          box-shadow: 0 0 6px rgba(255,106,136,0.4);
        }

        .password-wrapper {
          position: relative;
        }

        .password-wrapper input {
          width: 100%;
          padding-right: 40px;
        }

        .eye-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 18px;
          color: #888;
          cursor: pointer;
          transition: 0.3s;
        }

        .eye-icon:hover {
          color: #ff6a88;
        }

        .register-form button {
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #ff758c, #ff7eb3, #ff9a9e);
          color: white;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: 0.3s;
        }

        .register-form button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(255,118,137,0.4);
        }

        .error {
          color: #ff3333;
          font-size: 14px;
          margin-bottom: 12px;
          text-align: center;
          font-weight: bold;
        }

        .login-text {
          font-size: 14px;
          color: #555;
        }

        .login-text span {
          color: #ff6a88;
          font-weight: bold;
          cursor: pointer;
        }

        /* Responsive adjustments */
        @media (max-height: 700px) {
          .register-form {
            padding: 20px;
          }
          .register-form input, .register-form button {
            padding: 10px;
            font-size: 16px;
          }
        }
        `}
      </style>
    </div>
  );
}

export default Register;



