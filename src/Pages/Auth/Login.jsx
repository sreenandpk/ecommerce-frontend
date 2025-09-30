import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserLogin } from "../../Components/Fetch/FetchUser";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId"); // ✅ only check userId
    if (savedUserId) {
      navigate("/");
    }
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
        // ✅ store only id
        localStorage.setItem("userId", JSON.stringify(user.id));
        navigate("/");
      } else {
        setError("Invalid email or password");
      }
    } catch {
      setError("Server error. Try again later.");
    }
  };

  return (
    <>
      <div className="parent">
        {/* Left side - Animation */}
        {/* Right side - Form */}
        <div className="right">
          <form onSubmit={submit} style={{ background: "#fff8f0" }}>
            <h2>Login</h2>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{ backgroundColor: "#fff8f0" }}
            />
            <label htmlFor="password">Password:</label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              style={{ backgroundColor: "#fff8f0" }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide Password" : "👁️ Show Password"}
            </button>
            <button type="submit ">Login</button>
            {error && <p className="error">{error}</p>}
            <p
              style={{
                textAlign: "center",
                marginTop: "10px",
                fontSize: "14px",
                color: "#555",
              }}
            >
              Don’t have an account?{" "}
              <span
                style={{
                  color: "#2575fc",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => navigate("/register")}
              >
                Register
              </span>
            </p>
          </form>
        </div>
        {/* CSS styles */}
        <style>
          {`
      .parent {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 40px;
        padding: 20px;
        min-height: 100vh;
        flex-wrap: wrap;
      }

      .left, .right {
        flex: 1 1 400px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .left lottie-player, .left div {
        width: 100%;
        max-width: 350px;
        height: auto;
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 15px;
        padding: 30px;
        border-radius: 12px;
        background-color: white;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        width: 100%;
        max-width: 350px;
      }

      form h2 {
        text-align: center;
        margin-bottom: 10px;
        color: #333;
      }

      form input {
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-size: 14px;
      }

      form button {
        padding: 12px;
        border-radius: 8px;
        border: none;
        background: linear-gradient(135deg, #2b2726ff, #1d1d1eff);
        color: white;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: 0.3s;
      }

      form button[type="button"] {
        background: #f0f0f0;
        color: #333;
        font-size: 14px;
      }

      form button:hover {
        opacity: 0.9;
      }

      .error {
        color: red;
        text-align: center;
      }

      /* Mobile Responsive */
      @media (max-width: 768px) {
        .parent {
          flex-direction: column;
        }

        .left, .right {
          flex: unset;
          width: 100%;
        }

        .left lottie-player, .left div {
          max-width: 300px; /* animation size on mobile */
          margin-bottom: 20px;
        }
      }
    `}
        </style>
      </div>
    </>
  );
}

export default Login;
