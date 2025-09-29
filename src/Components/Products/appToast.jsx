import * as Toast from "@radix-ui/react-toast";
import { useState, forwardRef, useImperativeHandle } from "react";
import { CheckCircle2 } from "lucide-react"; // optional icon

const AppToast = forwardRef((props, ref) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [buttonConfig, setButtonConfig] = useState(null);

  // Function to show toast with optional button
  const showToast = (msg, btnConfig = null) => {
    setMessage(msg);
    setButtonConfig(btnConfig);
    setOpen(true);
  };

  useImperativeHandle(ref, () => ({
    showToast,
  }));

  return (
    <Toast.Provider swipeDirection="down" duration={5000}>
      <Toast.Root
        open={open}
        onOpenChange={setOpen}
        duration={5000}
        className="toast-root"
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <CheckCircle2 size={22} />
          <Toast.Title style={{ fontWeight: 600, fontSize: "0.7rem" }}>
            {message}
          </Toast.Title>
        </div>

        {/* Dynamic button */}
      {buttonConfig && (
  <button 
    onClick={() => {
      if (buttonConfig.onClick) buttonConfig.onClick(); // navigate or custom action
      setOpen(false); // close the toast
    }}
    style={{
      background: "transparent",
      border: "none",
      color: "  #FFF8E7",
      cursor: "pointer",
      fontWeight: 600,
      fontSize:'0.8rem'
    }}
  >
    {buttonConfig.label}
  </button>
)}

       

        {/* Progress Bar */}
        <div className="toast-progress"></div>
      </Toast.Root>

      <Toast.Viewport className="toast-viewport" />

      <style>{`
       .toast-root {
  background: linear-gradient(135deg, #ff4d6d, #ff6f91);
  color: #F5F5F5;
  border-radius: 18px;
  padding: 16px 24px;
  width: clamp(350px, 90%, 350px);
  height: 55px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  font-family: 'SF Pro', sans-serif;
  
  /* Fixed slide up */
  transform: translateY(120px);
  opacity: 0;
  animation: slideUp 0.4s ease-out forwards;
}

@keyframes slideUp {
  from { transform: translateY(120px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
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
          bottom: 40px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          z-index: 9999;
          width: auto;
          max-width: 90vw;
          padding: 0 12px;
        }

        

       
      `}</style>
    </Toast.Provider>
  );
});

export default AppToast;
