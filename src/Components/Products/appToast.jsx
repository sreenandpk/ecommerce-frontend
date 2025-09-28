import * as Toast from "@radix-ui/react-toast";
import { useState, forwardRef, useImperativeHandle } from "react";
import { CheckCircle2 } from "lucide-react"; // optional icon

const AppToast = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showToast = (msg) => {
    setMessage(msg);
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({
    showToast,
  }));

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        style={{
          background: "linear-gradient(135deg, #ff4d6d, #ff6f91)", // attractive gradient
          color: "#fff",
          borderRadius: "18px",
          padding: "16px 24px",
          width: "350px",
          height: "70px",
          boxShadow: "0 15px 40px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 9999,
          position: "fixed",
          top: "20px",
          right: "20px",
          transform: "translateX(120%)",
          animation: "slideIn 0.4s forwards",
          fontFamily: "'SF Pro', sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <CheckCircle2 size={24} />
          <Toast.Title style={{ fontWeight: 600, fontSize: "1rem" }}>
            {message}
          </Toast.Title>
        </div>
        <Toast.Close
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "20px",
          }}
        >
          ×
        </Toast.Close>

        {/* Progress Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            height: "4px",
            background: "rgba(255,255,255,0.8)",
            width: "100%",
            animation: "progress 4s linear forwards",
            borderBottomLeftRadius: "18px",
            borderBottomRightRadius: "18px",
          }}
        ></div>
      </Toast.Root>

      <Toast.Viewport
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 9999,
        }}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </Toast.Provider>
  );
});

export default AppToast;
