import { Nav } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "bootstrap-icons/font/bootstrap-icons.css";
import { motion, AnimatePresence } from "framer-motion";

const SidebarContent = ({ navItems, handleLogout, toggleSidebar }) => (
    <>
        <div className="d-flex align-items-center mb-4 px-2">
            <div className="rounded-circle d-flex align-items-center justify-content-center me-2 shadow-sm" style={{ width: '32px', height: '32px', backgroundColor: '#e63946' }}>
                <i className="bi bi-shield-lock-fill text-white fs-6"></i>
            </div>
            <span className="fs-5 fw-bold" style={{ color: "#1a1a1a", fontFamily: "'Poppins', sans-serif", letterSpacing: '0.5px' }}>Admin Portal</span>
        </div>

        <Nav className="nav-pills flex-column mb-auto">
            {navItems.map((item) => (
                <Nav.Item key={item.path} className="mb-2">
                    <NavLink
                        to={item.path}
                        end={item.path === "/admin" || item.path === "/"}
                        onClick={toggleSidebar}
                        className={({ isActive }) =>
                            `nav-link d-flex align-items-center py-2 px-3 modern-nav-link ${isActive && item.path !== "/" ? 'active' : ''}`
                        }
                        style={({ isActive }) => ({
                            backgroundColor: isActive && item.path !== "/" ? "#fff0f3" : "transparent",
                            color: "#1a1a1a",
                            fontWeight: isActive ? "700" : "500",
                            border: "none",
                            borderLeft: isActive && item.path !== "/" ? "4px solid #e63946" : "4px solid transparent",
                            borderRadius: isActive && item.path !== "/" ? "0 10px 10px 0" : "10px",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        })}
                    >
                        {({ isActive }) => (
                            <>
                                <i className={`bi ${item.icon} me-3 fs-5`} style={{
                                    color: isActive && item.path !== "/" ? "#e63946" : "#1a1a1a",
                                    transition: "color 0.3s ease"
                                }}></i>
                                <span>{item.label}</span>
                            </>
                        )}
                    </NavLink>
                </Nav.Item>
            ))}

            <Nav.Item className="mb-2">
                <button
                    onClick={handleLogout}
                    className="nav-link d-flex align-items-center py-2 px-3 modern-nav-link w-100 border-0"
                    style={{
                        backgroundColor: "transparent",
                        color: "#1a1a1a",
                        fontWeight: "600",
                        borderRadius: "10px",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        textAlign: "left"
                    }}
                >
                    <i className="bi bi-box-arrow-right me-3 fs-5" style={{ color: "#1a1a1a" }}></i>
                    <span>Sign out</span>
                </button>
            </Nav.Item>
        </Nav>

        <style>{`
            .modern-nav-link:hover {
                background-color: #fff0f3 !important;
                color: #1a1a1a !important;
                transform: translateX(5px);
            }
            .modern-nav-link:hover i {
                color: #e63946 !important;
            }
            .nav-link.active {
                box-shadow: 0 2px 10px rgba(230, 57, 70, 0.08);
            }
        `}</style>
    </>
);

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const navItems = [
        { path: "/admin", icon: "bi-speedometer2", label: "Dashboard" },
        { path: "/admin/products", icon: "bi-box-seam", label: "Products" },
        { path: "/admin/orders", icon: "bi-cart-check", label: "Orders" },
        { path: "/admin/users", icon: "bi-people", label: "Users" },
        { path: "/", icon: "bi-house-heart", label: "Back to Website" },
    ];

    const sidebarVariants = {
        open: {
            x: 0,
            transition: { type: "spring", stiffness: 300, damping: 30 }
        },
        closed: {
            x: "-100%",
            transition: { type: "spring", stiffness: 300, damping: 30 }
        }
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="d-none d-lg-flex flex-column flex-shrink-0 p-3 border-end shadow-sm" style={{ width: "260px", minHeight: "100vh", backgroundColor: "#ffffff" }}>
                <SidebarContent navItems={navItems} handleLogout={handleLogout} />
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sidebarVariants}
                        className="d-lg-none position-fixed top-0 left-0 h-100 shadow-lg"
                        style={{ width: "280px", backgroundColor: "#ffffff", zIndex: 1000, left: 0 }}
                    >
                        <div className="p-3 h-100 flex-column d-flex">
                            <div className="d-flex justify-content-end mb-2">
                                <button className="btn border-0 p-1" onClick={toggleSidebar}>
                                    <i className="bi bi-x-lg fs-4"></i>
                                </button>
                            </div>
                            <SidebarContent navItems={navItems} handleLogout={handleLogout} toggleSidebar={toggleSidebar} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
