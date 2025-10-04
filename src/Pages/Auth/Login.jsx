import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserLogin } from "../../Components/Fetch/FetchUser";
import { FaEye, FaEyeSlash } from "react-icons/fa";  // 👁️ import icons

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUserId = localStorage.getItem("userId");
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

  return (
    <>
      <div className="parent">
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
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                style={{ backgroundColor: "#fff8f0" }}
              />
              <span
                className="eye-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit">Login</button>

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

        {/* CSS */}
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
            font-size: 16px;
            width: 100%;
          }

          .password-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .password-wrapper input {
            width: 100%;
            padding-right: 40px; /* space for eye icon */
          }

          .eye-icon {
            position: absolute;
            right: 10px;
            cursor: pointer;
            font-size: 18px;
            color: #555;
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

          form button:hover {
            opacity: 0.9;
          }

          .error {
            color: red;
            text-align: center;
          }

          @media (max-width: 768px) {
            .parent {
              flex-direction: column;
            }
          }
        `}
        </style>
      </div>
    </>
  );
}

export default Login;
