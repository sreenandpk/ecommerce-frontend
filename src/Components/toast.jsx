import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Apple-like style toast
export function infoToast(message) {
  toast.info(message, {
    position: "top-center",
    autoClose: 1000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    style: {
      background: "#fff8f0", // soft white
      color: "#1c1c1e", // dark text
      borderRadius: "16px",
      padding: "16px 22px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.08)", // subtle Apple-like shadow
      fontFamily: "'San Francisco', 'Helvetica Neue', Arial, sans-serif",
      fontWeight: "500",
      fontSize: "15px",
      border: "1px solid rgba(0,0,0,0.08)",
      backdropFilter: "blur(6px)", // frosted glass effect
      marginTop:'2%'
    },
    icon: true, // clean, no icon
    theme: "light",
  });
}
