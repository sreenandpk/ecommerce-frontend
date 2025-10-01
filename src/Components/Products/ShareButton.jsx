import { useState, useEffect, useRef } from "react";
import { FaWhatsapp, FaTwitter, FaFacebook, FaLink } from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";

export default function ShareButton({ url, title }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false); // new state
  const dropdownRef = useRef(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true); // show "Copied"
    setTimeout(() => setCopied(false), 5000); // hide after 1.5s
  };

  const handleShare = (platform) => {
    let shareUrl = "";
    switch (platform) {
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
        break;
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          url
        )}&text=${encodeURIComponent(title)}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      default:
        break;
    }
    window.open(shareUrl, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="position-relative d-inline-block" ref={dropdownRef}>
      {/* Share Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="btn"
        style={{ background: "transparent", border: "none" }}
      >
        <FiShare2 size={24} color="#32201a" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="position-absolute shadow rounded p-2"
          style={{
            right: 0,
            top: "100%",
            background: "#fff8f0",
            minWidth: "160px",
            zIndex: 1000,
            border: "1px solid #ffe5d6",
            boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
          }}
        >
          <button
            onClick={handleCopyLink}
            className="d-flex align-items-center w-100 btn mb-1"
            style={{
              background: "#fff8f0",
              color: "#32201a",
              border: "1px solid #ffe5d6",
              fontWeight: 600,
            }}
          >
            <FaLink size={16} className="me-2" />{" "}
            {copied ? "Copied " : "Copy Link"}
          </button>
          <button
            onClick={() => handleShare("whatsapp")}
            className="d-flex align-items-center w-100 btn mb-1"
            style={{
              background: "#d4f0dc",
              color: "#1b5e20",
              border: "1px solid #b2d8b2",
              fontWeight: 600,
            }}
          >
            <FaWhatsapp size={16} className="me-2" /> WhatsApp
          </button>
          <button
            onClick={() => handleShare("twitter")}
            className="d-flex align-items-center w-100 btn mb-1"
            style={{
              background: "#e0f7fa",
              color: "#007c91",
              border: "1px solid #b2ebf2",
              fontWeight: 600,
            }}
          >
            <FaTwitter size={16} className="me-2" /> Twitter
          </button>
          <button
            onClick={() => handleShare("facebook")}
            className="d-flex align-items-center w-100 btn"
            style={{
              background: "#e8f0fe",
              color: "#1a3c9f",
              border: "1px solid #c6dafc",
              fontWeight: 600,
            }}
          >
            <FaFacebook size={16} className="me-2" /> Facebook
          </button>
        </div>
      )}
    </div>
  );
}
