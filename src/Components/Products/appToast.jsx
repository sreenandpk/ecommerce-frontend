import * as Toast from "@radix-ui/react-toast";
import { useState } from "react";

export default function AppToast() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const showToast = (msg) => {
    setMessage(msg);
    setOpen(true);
  };

  return (
    <>
      <Toast.Provider swipeDirection="right">
        {/* Call showToast("Your message") from anywhere */}
        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className="toast-root"
          style={{
            background: "#0a2141",
            color: "#fff",
            borderRadius: "12px",
            padding: "16px 20px",
            minWidth: "250px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Toast.Title style={{ fontWeight: 600 }}>{message}</Toast.Title>
          <Toast.Close
            className="toast-close"
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              marginLeft: "12px",
            }}
          >
            ×
          </Toast.Close>
        </Toast.Root>

        <Toast.Viewport
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            zIndex: 9999,
          }}
        />
      </Toast.Provider>
    </>
  );
}
