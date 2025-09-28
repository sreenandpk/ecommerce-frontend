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
    <Toast.Provider swipeDirection="right" duration={4000}>
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        duration={4000}
        className="toast-root"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <CheckCircle2 size={22} />
          <Toast.Title style={{ fontWeight: 600, fontSize: "0.7rem" }}>
            {message}
          </Toast.Title>
        </div>

        <Toast.Close className="toast-close">×</Toast.Close>

        {/* Progress Bar */}
        <div className="toast-progress"></div>
      </Toast.Root>

      <Toast.Viewport className="toast-viewport" />

      <style>{`
        .toast-root {
          background: linear-gradient(135deg, #ff4d6d, #ff6f91);
          color: #fff;
          border-radius: 18px;
          padding: 16px 24px;
          width: 350px;
          max-width: 90vw; /* responsive for mobile */
          height: 70px;
          box-shadow: 0 15px 40px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          font-family: 'SF Pro', sans-serif;
          animation: slideIn 0.4s ease-out;
        }

        .toast-close {
          background: transparent;
          border: none;
          color: #fff;
          cursor: pointer;
          font-size: 20px;
        }

        .toast-viewport {
          position: fixed;
          top: 20px;
          right: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 9999;
        }

        .toast-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          height: 4px;
          background: rgba(255,255,255,0.8);
          width: 100%;
          animation: progress 4s linear forwards;
          border-bottom-left-radius: 18px;
          border-bottom-right-radius: 18px;
        }

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
