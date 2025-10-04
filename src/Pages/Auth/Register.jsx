import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../Components/Fetch/FetchUser";
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
  const recentlyViewed = [];
  const myOrders = [];
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

      const existing = await axios.get(`${BASE_URL}/users?email=${email}`);
      if (existing.data.length > 0) {
        setError("User with this email already exists");
        return;
      }

      const res = await axios.post(`${BASE_URL}/users`, {
        name, email, password, cart, wishlist, recentlyViewed, myOrders, booking, payment, block, image
      });

      localStorage.setItem("userId", JSON.stringify(res.data.id)); 
      setEmail("");
      setName("");
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Error registering user";
      setError(errorMessage);
    }
  };
 toastRef?.current?.showToast(`${error}`);
  return (
    <>
      <div className="register-parent">
       
        

        {/* Form */}
        <form onSubmit={submit} className="register-form">
          <h2> Create Account</h2>

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

          {/* Password */}
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              required
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              placeholder="Password"
            />
            <span
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          {/* Confirm Password */}
          <div className="password-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              required
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              placeholder="Confirm Password"
            />
            <span
              className="eye-icon"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <button type="submit">Register</button>

          <p className="login-text">
            Already have an account?{" "}
            <span onClick={() => navigate("/login")}>Login</span>
          </p>
        </form>

        {/* CSS */}
        <style>
          {`
          .register-parent {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background:  #fff8f0;
            padding: 20px;
          }

          @keyframes gradientMove {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
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
        `}
        </style>
      </div>
    </>
  );
}

export default Register;
