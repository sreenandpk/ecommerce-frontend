// Admin/Pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../Context/AdminAuthContext";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate("/admin"); // go to dashboard
    } else {
      setError("Invalid email or password!");
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <h2 className="login-title">Admin Login</h2>
        {error && <p className="error-text">{error}</p>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input-field"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="input-field"
          />
          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>

      <style jsx="true">{`
        .admin-login-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #e0e5ec, #f5f7fa);
          padding: 20px;
        }

        .admin-login-card {
          background: #fff;
          padding: 50px 40px;
          border-radius: 30px;
          width: 100%;
          max-width: 400px;
          text-align: center;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .admin-login-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 35px 70px rgba(0, 0, 0, 0.15);
        }

        .login-title {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 25px;
          color: #111;
        }

        .error-text {
          color: #ff4d4f;
          margin-bottom: 15px;
          font-weight: 500;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-field {
          padding: 14px 18px;
          border-radius: 12px;
          border: 1px solid #d1d9e6;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .input-field:focus {
          outline: none;
          border-color: #0071e3;
          box-shadow: 0 0 8px rgba(0, 113, 227, 0.3);
        }

        .login-btn {
          padding: 14px;
          border-radius: 12px;
          background: #0071e3;
          color: #fff;
          border: none;
          font-weight: 600;
          cursor: pointer;
          font-size: 1rem;
          transition: background 0.3s, transform 0.2s;
        }

        .login-btn:hover {
          background: #005bb5;
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          .admin-login-card {
            padding: 40px 25px;
          }
          .login-title {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}
