import { motion } from "framer-motion";

// mode: "fixed" | "inline" | "absolute"
export default function PremiumLoader({ mode = "fixed" }) {
    const isInline = mode === "inline";
    const isFixed = mode === "fixed";

    // Soft pink color for the bars
    const barColor = "#ffb3c6";

    // Animation variants for staggered effect
    const containerVariants = {
        animate: {
            transition: {
                staggerChildren: 0.15
            }
        }
    };

    const barVariants = {
        initial: {
            scaleY: 0.5,
            opacity: 0.5
        },
        animate: {
            scaleY: 1.5,
            opacity: 1,
            transition: {
                duration: 0.5,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
                position: isFixed ? "fixed" : "absolute",
                inset: 0,
                zIndex: isFixed ? 9999 : 10,
                background: "rgba(255, 255, 255, 0.1)", // Slight tint to make blur visible
                backdropFilter: "blur(8px)", // Blurs the background behind the loader
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none"
            }}
        >
            <motion.div
                variants={containerVariants}
                initial="initial"
                animate="animate"
                style={{
                    display: "flex",
                    gap: "8px", // Increased gap
                    alignItems: "center",
                    justifyContent: "center",
                    height: "60px" // Increased container height
                }}
            >
                {[...Array(4)].map((_, i) => (
                    <motion.div
                        key={i}
                        variants={barVariants}
                        style={{
                            width: "10px", // Increased width
                            height: "36px", // Increased height
                            backgroundColor: barColor,
                            borderRadius: "10px",
                            boxShadow: "0 0 10px rgba(255, 179, 198, 0.7)" // Slightly larger shadow
                        }}
                    />
                ))}
            </motion.div>
        </motion.div>
    );
}
