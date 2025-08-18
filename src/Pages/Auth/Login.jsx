import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = localStorage.getItem("existingUser");
    if (savedUser) {
      navigate("/");
    }
  }, [navigate]);

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const existingUser = await axios.get(
        `http://localhost:5000/users?email=${email}&password=${password}`
      );

      if (existingUser.data.length > 0) {
        localStorage.setItem("existingUser", JSON.stringify(existingUser.data[0]));
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
      <h2>Login Page</h2>

      <form onSubmit={submit}>
        <label htmlFor="email">Email: </label>
        <input
          type="email"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
          placeholder="email"
          id="email"
        />

        <label htmlFor="password">Password: </label>
        <input
          type={showPassword ? "text" : "password"}
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
          placeholder="password"
          id="password"
        />

        <button
          onClick={() => setShowPassword(!showPassword)}
          type="button"
        >
          {showPassword ? "Hide" : "See"}
        </button>

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div>dont have an account? <span style={{color:'blue',cursor:'pointer'}}onClick={function(){
        navigate("/register")
      }}>Register</span> </div>
    </>
  );
}

export default Login;
