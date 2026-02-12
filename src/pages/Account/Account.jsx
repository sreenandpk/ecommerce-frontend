import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLoading } from "../../context/LoadingContext";
import { updateUser, fetchUser } from "../../components/Fetch/FetchUser";
import Footer from "../../components/Layout/Footer";
import profile from "../../homeImages/profileDD.jpeg";
import { Camera, User, Mail, Lock, AlertCircle, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Account({ toastRef }) {
  const { user: authUser } = useAuth();
  const { stopLoading } = useLoading();
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const savedUserId = authUser?.id || JSON.parse(localStorage.getItem("userId"));

  useEffect(() => {
    if (authUser) {
      setImageUrl(authUser.image || profile);
      setName(authUser.name || "");
      setEmail(authUser.email || "");
      stopLoading();
    } else if (savedUserId) {
      async function loadUser() {
        try {
          const res = await fetchUser(savedUserId);
          if (res) {
            setImageUrl(res.image || profile);
            setName(res.name || "");
            setEmail(res.email || "");
          }
        } finally {
          stopLoading();
        }
      }
      loadUser();
    } else {
      stopLoading();
    }
  }, [authUser, savedUserId]);

  const handleImageChange = (e) => {
    if (!savedUserId) {
      toastRef?.current?.showToast("Login first");
      return;
    }
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const updateProfile = async () => {
    if (!savedUserId) {
      toastRef?.current?.showToast("Login first");
      return;
    }

    try {
      if (password.trim() !== "") {
        const regEx = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[@#!%&])(?=.*\d).{8,}$/;
        if (!regEx.test(password)) {
          setError("Password must include lowercase, uppercase, digit, and special character");
          return;
        }
      }

      setIsUpdating(true);
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (imageFile) formData.append("image", imageFile);
      if (password.trim() !== "") formData.append("password", password);

      await updateUser(savedUserId, formData);
      toastRef?.current?.showToast("Profile updated successfully!");
      setError("");
      setPassword("");
      setImageFile(null); // Reset file after success
      window.dispatchEvent(new Event("profileUpdated"));
    } catch (err) {
      console.error(err);
      setError("Failed to update profile");
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (error) toastRef?.current?.showToast(`${error}`);
  }, [error, toastRef]);

  return (
    <>
      <div style={{ height: "80px" }} className="d-none d-md-block"></div>
      <div style={{ height: "120px" }} className="d-md-none d-block"></div>
      <div className="profile-wrapper" style={{
        minHeight: "100vh",
        background: "#fff8f0",
        padding: "40px 15px 40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Background Decorative Blobs - More Chocolate/Bronze */}
        <div style={{
          position: "absolute",
          top: "5%",
          left: "-10%",
          width: "500px",
          height: "500px",
          background: "rgba(93, 55, 43, 0.05)",
          borderRadius: "50%",
          filter: "blur(100px)",
          zIndex: 0
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "5%",
          right: "-10%",
          width: "400px",
          height: "400px",
          background: "rgba(123, 75, 58, 0.04)",
          borderRadius: "50%",
          filter: "blur(80px)",
          zIndex: 0
        }}></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          style={{
            width: "100%",
            maxWidth: "900px",
            background: "rgba(255, 248, 240, 0.75)", // Cream Glass
            backdropFilter: "blur(25px)",
            borderRadius: "45px",
            boxShadow: "0 30px 60px -12px rgba(93, 55, 43, 0.15)",
            border: "1px solid rgba(93, 55, 43, 0.1)",
            zIndex: 1,
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div className="row g-0 flex-column flex-md-row">
            {/* Left Column: Profile Picture */}
            <div className="col-md-5 d-flex flex-column align-items-center justify-content-center p-4 p-md-5" style={{
              background: "rgba(93, 55, 43, 0.03)",
              borderRight: "1px solid rgba(93, 55, 43, 0.05)"
            }}>
              <div style={{ position: "relative", width: "200px", height: "200px", marginBottom: "25px" }}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    padding: "6px",
                    background: "linear-gradient(135deg, #7B4B3A, #4E342E)",
                    boxShadow: "0 20px 40px rgba(93, 55, 43, 0.25)"
                  }}
                >
                  <img
                    src={imageUrl || profile}
                    alt="Profile"
                    onError={(e) => { e.target.onerror = null; e.target.src = profile; }}
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      objectFit: "cover",
                      background: "#fff8f0",
                      border: "4px solid #fff8f0"
                    }}
                  />
                </motion.div>

                <label htmlFor="imageUpload" className="image-upload-label">
                  <Camera size={22} />
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: "800",
                color: "#3d2b1f",
                marginBottom: "5px"
              }}>{name || "Your Profile"}</h3>
              <p style={{ color: "#8d6e63", fontSize: "0.9rem", fontWeight: "500" }}>{email || "Personalize your account"}</p>
            </div>

            {/* Right Column: Form Fields */}
            <div className="col-md-7 p-4 p-md-5">
              <div className="mb-4 mb-md-5">
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontWeight: "800",
                  fontSize: "2.2rem",
                  color: "#3d2b1f",
                  marginBottom: "10px"
                }}>Account Settings</h2>
                <div style={{ width: "50px", height: "4px", background: "#7B4B3A", borderRadius: "2px" }}></div>
              </div>

              <div className="profile-form d-flex flex-column gap-4">
                <div className="input-group-modern">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your stunning name"
                    />
                  </div>
                </div>

                <div className="input-group-modern">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div className="input-group-modern">
                  <label>Change Password (Optional)</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                  </div>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="error-box d-flex align-items-center gap-2"
                    >
                      <AlertCircle size={16} />
                      <span>{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isUpdating}
                  onClick={updateProfile}
                  className="update-btn"
                >
                  {isUpdating ? (
                    <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                  ) : (
                    <Save size={18} className="me-2" />
                  )}
                  {isUpdating ? "Saving Changes..." : "Save My Details"}
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />

      <style>{`
        .image-upload-label {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: #3d2b1f; 
          color: white;
          border: 4px solid #fff8f0;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          z-index: 2;
        }
        
        .image-upload-label:hover {
          transform: scale(1.15) rotate(15deg);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }

        .input-group-modern {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .input-group-modern label {
          font-weight: 700;
          font-size: 0.8rem;
          color: #5D372B;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-left: 2px;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 18px;
          color: #8d6e63;
          pointer-events: none;
        }

        .input-wrapper input {
          width: 100%;
          padding: 16px 16px 16px 52px;
          border-radius: 20px;
          border: 2px solid rgba(93, 55, 43, 0.05);
          background: rgba(255, 248, 240, 0.4); /* Cream Glass */
          font-size: 1rem;
          font-weight: 600;
          color: #2d3436;
          transition: all 0.3s ease;
          outline: none;
        }

        .input-wrapper input:focus {
          border-color: #7B4B3A;
          background: #fffcf5; /* Off-white cream */
          box-shadow: 0 0 0 5px rgba(123, 75, 58, 0.08);
        }

        .update-btn {
          margin-top: 15px;
          padding: 18px;
          border-radius: 22px;
          border: none;
          background: linear-gradient(135deg, #7B4B3A, #4E342E);
          color: white;
          font-size: 1.1rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 15px 35px rgba(93, 55, 43, 0.3);
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        .update-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .error-box {
          background: rgba(230, 57, 70, 0.1);
          border: 1px solid rgba(230, 57, 70, 0.2);
          color: #e63946;
          padding: 14px 18px;
          border-radius: 16px;
          font-size: 0.9rem;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .profile-wrapper { padding: 20px 15px 40px; }
          .col-md-5 { border-right: none; border-bottom: 1px solid rgba(93, 55, 43, 0.05); padding: 30px 20px !important; }
          .col-md-7 { padding: 30px 20px !important; }
          h2 { font-size: 1.5rem !important; }
          h3 { font-size: 1.3rem !important; }
          .profile-wrapper div[style*="width: 200px"] { 
            width: 140px !important; 
            height: 140px !important; 
            margin-bottom: 15px !important; 
          }
          .image-upload-label {
            width: 38px !important;
            height: 38px !important;
            bottom: 5px !important;
            right: 5px !important;
          }
          .image-upload-label svg { width: 16px; height: 16px; }
          .input-wrapper input { padding: 12px 12px 12px 42px; font-size: 0.9rem; }
          .input-icon { left: 14px; }
          .update-btn { padding: 14px; font-size: 0.95rem; border-radius: 16px; }
          .input-group-modern { gap: 6px; }
        }
      `}</style>
    </>
  );
}



