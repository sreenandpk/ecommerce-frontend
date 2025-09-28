import * as Toast from "@radix-ui/react-toast";
import { forwardRef, useImperativeHandle, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

const AppToast = forwardRef((props, ref) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000); // auto hide after 4s
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useImperativeHandle(ref, () => ({ showToast }));

  return (
    <Toast.Provider swipeDirection="right">
      <div
        style={{
          position: "fixed",
          top: 20,
          right: 20,
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          zIndex: 9999,
        }}
      >
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            open={true}
            className="advanced-toast"
            style={{
              backgroundColor: toast.type === "success" ? "#0a2141" : "#d64b65",
              color: "#fff",
              borderRadius: "16px",
              padding: "14px 20px",
              minWidth: "280px",
              maxWidth: "350px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              transform: "translateX(100%)",
              animation: "slideIn 0.3s forwards",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {toast.type === "success" ? (
                <CheckCircle2 size={24} />
              ) : (
                <XCircle size={24} />
              )}
              <Toast.Title style={{ fontWeight: 600 }}>{toast.message}</Toast.Title>
            </div>
            <Toast.Close
              onClick={() => removeToast(toast.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#fff",
                fontSize: "18px",
                cursor: "pointer",
              }}
            >
              ×
            </Toast.Close>
          </Toast.Root>
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(120%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </Toast.Provider>
  );
});

export default AppToast;
