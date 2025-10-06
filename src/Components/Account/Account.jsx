import { useEffect, useState } from "react";
import { updateUser, fetchUser } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";
import Navbar from "../../Navbar/Navbar";
import { infoToast } from "../toast";
import profile from "../../../homeImages/profileDD.jpeg";
import { FaCamera } from "react-icons/fa";

export default function Account({ toastRef }) {
  const savedUserId = JSON.parse(localStorage.getItem("userId"));
  const [imageUrl, setImageUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Fetch user details initially
  useEffect(() => {
    async function loadUser() {
      if (!savedUserId) return;
      try {
        const res = await fetchUser(savedUserId);
        if (res) {
          setImageUrl(res.image || "");
          setName(res.name || "");
          setEmail(res.email || "");
        }
      } catch (err) {
        console.log(err);
      }
    }
    loadUser();
  }, [savedUserId]);

  // Handle profile image change
  const handleImageChange = (e) => {
    if (!savedUserId) {
      infoToast("Login first");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // Update profile
  const updateProfile = async () => {
    if (!savedUserId) {
      infoToast("Login first");
      return;
    }

    try {
      // Validate password if entered
      if (password.trim() !== "") {
        const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#!%&])(?=.*\d).{8,}$/;
        if (!regEx.test(password)) {
          setError(
            "Password must include lowercase, uppercase, digit, and special character"
          );
          return;
        }
      }

      // Fetch all users for email uniqueness
      const allUsers = await fetchUser(); // Make sure this returns ALL users
      if (Array.isArray(allUsers)) {
        const emailExists = allUsers.some(
          (user) =>
            user.email === email &&
            user.id.toString() !== savedUserId.toString()
        );
        if (emailExists) {
          setError("This email is already registered by another user.");
          return;
        }
      }

      const updateData = {
        image: imageUrl,
        name,
        email,
      };
      if (password.trim() !== "") updateData.password = password;

      await updateUser(savedUserId, updateData);
      infoToast("Profile updated successfully!");
      setError("");
      setPassword("");
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      console.log(err);
      setError("Failed to update profile");
    }
  };

  useEffect(() => {
    if (error) toastRef?.current?.showToast(`${error}`);
  }, [error, toastRef]);

  return (
    <>
      <Navbar />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#fff8f0",
          fontFamily: "'San Francisco', 'Helvetica Neue', Arial, sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            backgroundColor: "#fff8f0",
            padding: "40px 35px",
            borderRadius: "28px",
            maxWidth: "480px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "25px",
          }}
        >
        

          {/* Profile Image */}
          <div style={{ position: "relative", width: "160px", height: "160px", marginBottom: "10px" }}>
            <img
              src={imageUrl || profile}
              alt="Profile"
              style={{
                width: "160px",
                height: "160px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #f0f0f5",
                boxShadow: "0 12px 24px rgba(0,0,0,0.08)",
                transition: "transform 0.3s ease",
              }}
            />
            <label
              htmlFor="imageUpload"
              style={{
                position: "absolute",
                bottom: "10px",
                right: "10px",
                background: "black",
                color: "white",
                borderRadius: "50%",
                padding: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                boxShadow: "0 3px 8px rgba(0,0,0,0.3)",
                transition: "transform 0.3s ease, background 0.3s ease",
              }}
            >
              <FaCamera size={20} />
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
            </label>
          </div>

          {/* Inputs */}
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" style={inputStyle} />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={inputStyle} />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New Password (optional)" style={inputStyle} />

          <button
            onClick={updateProfile}
            style={buttonStyle}
            onMouseOver={(e) => {
              e.target.style.opacity = "0.95";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.opacity = "1";
              e.target.style.transform = "translateY(0)";
            }}
          >
            Update Profile
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "16px",
  border: "1px solid #e0e0eb",
  fontSize: "16px",
  color: "#2c2c2e",
  fontWeight: "500",
  background: "#fff8f0",
  outline: "none",
  transition: "all 0.3s ease",
};

const buttonStyle = {
  padding: "10px 20px",
  borderRadius: "18px",
  border: "none",
  backgroundColor: "black",
  color: "white",
  fontSize: "17px",
  fontWeight: "600",
  cursor: "pointer",
  width: "100%",
  boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
  transition: "all 0.3s ease",
};
