import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserLogin } from "../../Components/Fetch/FetchUser";
import { FaEye, FaEyeSlash } from "react-icons/fa";

function Login({ toastRef }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
    if (savedUserId) navigate("/");
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const existingUser = await fetchUserLogin(email, password);

      if (existingUser.data.length > 0) {
        const user = existingUser.data[0];

        if (user.block === true) {
          setError("Your account is blocked. Contact admin.");
          return;
        }

        localStorage.setItem("userId", JSON.stringify(user.id));
        window.dispatchEvent(new Event("profileUpdated"));
        navigate("/");
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Server error. Try again later.");
    }
  };

  // Toast trigger
  useEffect(() => {
    if (error) toastRef?.current?.showToast(`${error}`);
  }, [error, toastRef]);

  return (
    <div className="login-parent">
      <form onSubmit={submit} className="login-form">
        <h2>Welcome Back!</h2>

        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
          />
          <span
            className="eye-icon"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button type="submit">Login</button>

        <p className="register-text">
          Don’t have an account?{" "}
          <span onClick={() => navigate("/register")}>Register</span>
        </p>
      </form>

      <style>
        {`
        body, html {
          margin: 0;
          padding: 0;
          height: 100%;
          overflow: hidden; /* prevents scrolling on mobile */
        }

        .login-parent {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background: #fff8f0;
          padding: 20px;
        }

        .login-form {
          background: #fff;
          padding: 35px;
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(0,0,0,0.15);
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          gap: 15px;
          text-align: center;
        }

        .login-form h2 {
          margin-bottom: 10px;
          font-size: 24px;
          font-weight: bold;
          background: linear-gradient(135deg, #ff7eb3, #ff758c, #ff6a88);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .login-form input {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #ffd6e0;
          font-size: 16px;
          outline: none;
          background: #fff8f8;
          transition: 0.3s;
        }

        .login-form input:focus {
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

        .login-form button {
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

        .login-form button:hover {
          transform: scale(1.05);
          box-shadow: 0 6px 16px rgba(255,118,137,0.4);
        }

        .error {
          color: #ff3333;
          font-size: 14px;
        }

        .register-text {
          font-size: 14px;
          color: #555;
        }

        .register-text span {
          color: #ff6a88;
          font-weight: bold;
          cursor: pointer;
        }

        @media (max-height: 700px) {
          .login-form {
            padding: 25px;
          }
          .login-form input, .login-form button {
            padding: 10px;
            font-size: 16px;
          }
        }
        `}
      </style>
    </div>
  );
}

export default Login;
