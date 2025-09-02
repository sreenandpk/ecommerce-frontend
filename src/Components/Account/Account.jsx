import { useEffect, useState } from "react";
import { updateUser } from "../Fetch/FetchUser";
import Footer from "../Home/Footer";
import Navbar from "../../Navbar/Navbar";
import { infoToast } from "../toast";
import profile from "../../../homeImages/profileDD.jpeg";
export default function Account() {
  const savedUser = JSON.parse(localStorage.getItem("existingUser"));
  const [imageUrl, setImageUrl] = useState(savedUser?.image || "");
  const [name, setName] = useState(savedUser?.name || "");
  const [email, setEmail] = useState(savedUser?.email || "");
  const [error, setError] = useState("");

  const imageFn = async function () {
    try {
      if(savedUser){
      await updateUser(savedUser.id, { image: imageUrl, name, email });
      localStorage.setItem(
        "existingUser",
        JSON.stringify({ ...savedUser, image: imageUrl, name, email })
      );
      infoToast("Profile updated successfully!");
    }else{
      infoToast("login first")
    }
    } catch {
      setError("Failed to update profile");
    }
  };

  const handleImageChange = (e) => {
    if(savedUser){
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  }else{
    infoToast("login first")
  }
  }
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
        <h2
          style={{
            color: "#2c2c2e",
            fontSize: "28px",
            fontWeight: "600",
            marginBottom: "5px",
          }}
        >
          Your Account
        </h2>

        {error && (
          <p
            style={{
              color: "#ff375f",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            {error}
          </p>
        )}

        {/* Profile Image */}
        <div
          style={{
            position: "relative",
            width: "160px",
            height: "160px",
            marginBottom: "10px",
          }}
        >
          <img
            src={
              imageUrl ||
              profile
            }
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
          <input
            type="file"
            onChange={handleImageChange}
            style={{
              position: "absolute",
              bottom: "0",
              left: "50%",
              transform: "translateX(-50%)",
              opacity: 0,
              width: "160px",
              height: "160px",
              cursor: "pointer",
              
            }}
          />
        </div>

        {/* Name Input */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid #e0e0eb",
            fontSize: "16px",
            color: "#2c2c2e",
            fontWeight: "500",
            background:'#fff8f0',
            outline: "none",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.2)")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{
            width: "100%",
            padding: "14px 16px",
            borderRadius: "16px",
            border: "1px solid #e0e0eb",
            fontSize: "16px",
            color: "#2c2c2e",
            fontWeight: "500",
           background:'#fff8f0',
            outline: "none",
            transition: "all 0.3s ease",
          }}
          onFocus={(e) =>
            (e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.2)")
          }
          onBlur={(e) => (e.target.style.boxShadow = "none")}
        />

        {/* Update Button */}
        <button
          onClick={imageFn}
          style={{
            padding: "14px 20px",
            borderRadius: "18px",
            border: "none",
          backgroundColor:'black',
            color: "white",
            fontSize: "17px",
            fontWeight: "600",
            cursor: "pointer",
            width: "100%",
            boxShadow: "0 6px 16px rgba(99, 102, 241, 0.3)",
            transition: "all 0.3s ease",
          }}
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
