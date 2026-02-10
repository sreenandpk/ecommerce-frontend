import { motion } from "framer-motion";

// mode: "fixed" | "inline" | "absolute"
export default function PremiumLoader({ mode = "fixed", text = "Loading Delight" }) {
    const isInline = mode === "inline";
    const isFixed = mode === "fixed";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
                position: isFixed ? "fixed" : "absolute",
                inset: 0,
                zIndex: isFixed ? 9999 : 10,
                background: isFixed ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.6)", // Lighter for inline
                backdropFilter: isFixed ? "blur(15px)" : "blur(5px)", // Less blur for inline
                borderRadius: isInline ? "20px" : "0", // Match card radius if inline
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none" // Let clicks pass through if needed, though usually we want to block
            }}
        >
            {/* 3D Container - Scaled down for inline */}
            <div style={{
                position: "relative",
                width: isInline ? "80px" : "140px",
                height: isInline ? "80px" : "140px",
                perspective: "1000px"
            }}>

                {/* 1. Ambient Glow */}
                <motion.div
                    style={{
                        position: "absolute",
                        inset: "-20px",
                        borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(212, 163, 115, 0.15) 0%, transparent 70%)",
                        filter: "blur(20px)",
                        zIndex: -1
                    }}
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* 2. The Liquid Gold Flow */}
                <motion.div
                    style={{
                        position: "absolute",
                        inset: "0",
                        borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "#D4A373", // Gold
                        borderRightColor: "rgba(212, 163, 115, 0.1)",
                        boxShadow: "0 0 15px rgba(212, 163, 115, 0.3)"
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* 3. The Chocolate Silk */}
                <motion.div
                    style={{
                        position: "absolute",
                        inset: isInline ? "10px" : "15px",
                        borderRadius: "50%",
                        border: isInline ? "2px solid transparent" : "3px solid transparent",
                        borderLeftColor: "#7B4B3A", // Chocolate
                        borderBottomColor: "rgba(123, 75, 58, 0.1)",
                        opacity: 0.9
                    }}
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 4.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* 4. The Core Orb */}
                <motion.div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: isInline ? "10px" : "14px",
                        height: isInline ? "10px" : "14px",
                        borderRadius: "50%",
                        background: "#7B4B3A",
                        boxShadow: "0 0 25px rgba(123, 75, 58, 0.6)"
                    }}
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.8, 1, 0.8]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Minimalist, Clean Typography */}
            {!isInline &&
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    style={{
                        marginTop: "40px",
                        textAlign: "center"
                    }}
                >
                    <span style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: "0.85rem",
                        color: "#5D372B",
                        textTransform: "uppercase",
                        letterSpacing: "3px",
                        fontWeight: "500"
                    }}>
                        {text}
                    </span>
                </motion.div>
            }
        </motion.div>
    );
}
