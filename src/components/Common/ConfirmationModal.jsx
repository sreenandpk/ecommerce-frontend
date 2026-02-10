import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function ConfirmationModal({
    open,
    onClose,
    onConfirm,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmLabel = "Yes, Remove",
    cancelLabel = "Cancel",
    confirmColor = "#ff4d6d" // Default to pink/red for danger actions
}) {
    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <AnimatePresence>
                {open && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                                    backdropFilter: "blur(8px)",
                                    position: "fixed",
                                    inset: 0,
                                    zIndex: 2000,
                                }}
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                                animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                                exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                style={{
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "90%",
                                    maxWidth: "400px",
                                    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 248, 240, 0.95) 100%)", // Premium Gradient
                                    backdropFilter: "blur(10px)",
                                    borderRadius: "24px",
                                    padding: "30px",
                                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                    zIndex: 2001,
                                    border: "1px solid rgba(255, 255, 255, 0.8)",
                                    outline: "none"
                                }}
                            >
                                <div className="d-flex flex-column align-items-center text-center">
                                    <div
                                        style={{
                                            width: "60px",
                                            height: "60px",
                                            borderRadius: "50%",
                                            background: "rgba(255, 77, 109, 0.1)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            marginBottom: "20px"
                                        }}
                                    >
                                        <AlertCircle size={32} color={confirmColor} />
                                    </div>

                                    <Dialog.Title
                                        style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontSize: "1.5rem",
                                            fontWeight: "700",
                                            color: "#2d3436",
                                            marginBottom: "10px"
                                        }}
                                    >
                                        {title}
                                    </Dialog.Title>

                                    <Dialog.Description
                                        style={{
                                            color: "#636e72",
                                            fontSize: "0.95rem",
                                            lineHeight: "1.5",
                                            marginBottom: "25px",
                                            maxWidth: "280px"
                                        }}
                                    >
                                        {message}
                                    </Dialog.Description>

                                    <div className="d-flex gap-3 w-100">
                                        <motion.button
                                            whileHover={{ scale: 1.02, backgroundColor: "#e2e6ea" }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onClose}
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                borderRadius: "14px",
                                                border: "none",
                                                background: "#f1f3f5",
                                                color: "#495057",
                                                fontWeight: "600",
                                                fontSize: "0.95rem",
                                                cursor: "pointer"
                                            }}
                                        >
                                            {cancelLabel}
                                        </motion.button>

                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={onConfirm}
                                            style={{
                                                flex: 1,
                                                padding: "12px",
                                                borderRadius: "14px",
                                                border: "none",
                                                background: `linear-gradient(135deg, ${confirmColor}, ${adjustColor(confirmColor, -20)})`,
                                                color: "#fff",
                                                fontWeight: "600",
                                                fontSize: "0.95rem",
                                                boxShadow: `0 8px 16px -4px ${confirmColor}66`,
                                                cursor: "pointer"
                                            }}
                                        >
                                            {confirmLabel}
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    );
}

// Helper to darken color for gradient
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}
