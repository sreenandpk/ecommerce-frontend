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

  // Expose showToast to parent
  useImperativeHandle(ref, () => ({
    showToast,
  }));

  return (
    <Toast.Provider swipeDirection="right">
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        style={{
          background: "#0a2141",
          color: "#fff",
          borderRadius: "16px",
          padding: "16px 20px",
          minWidth: "280px",
          maxWidth: "350px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 9999,
          transform: "translateX(120%)",
          animation: "slideIn 0.3s forwards",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={20} />
          <Toast.Title style={{ fontWeight: 600 }}>{message}</Toast.Title>
        </div>
        <Toast.Close
          style={{
            background: "transparent",
            border: "none",
            color: "#fff",
            cursor: "pointer",
            fontSize: "18px",
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
            background: "#ff4d6d",
            width: "100%",
            animation: "progress 4s linear forwards",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
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

      {/* Animations */}
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
