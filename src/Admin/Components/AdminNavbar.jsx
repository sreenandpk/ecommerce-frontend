import { Navbar, Container, Nav, Dropdown } from "react-bootstrap";
import { useAuth } from "../../context/AuthContext";

const AdminNavbar = () => {
    const { user, logout } = useAuth();

    return (
        <Navbar expand="lg" className="shadow-sm border-bottom py-3" style={{ backgroundColor: "#ffffff" }}>
            <Container fluid>
                <div className="d-flex align-items-center">
                    <h5 className="mb-0 fw-bold" style={{ color: "#e63946", fontFamily: "'Poppins', sans-serif" }}>Management Dashboard</h5>
                </div>

                <Navbar.Toggle aria-controls="admin-navbar-nav" />
                <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
                    <Nav>
                        <Dropdown align="end">
                            <Dropdown.Toggle variant="light" className="d-flex align-items-center border-0 bg-transparent">
                                <div className="text-end me-3 d-none d-sm-block">
                                    <div className="fw-bold small" style={{ color: "#333" }}>{user?.full_name || user?.username || "Admin User"}</div>
                                    <div style={{ fontSize: '11px', color: "#e63946", fontWeight: "600" }}>System Administrator</div>
                                </div>
                                <div
                                    className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm"
                                    style={{ width: '42px', height: '42px', backgroundColor: "#e63946", border: "2px solid #ffe5ec" }}
                                >
                                    {(user?.full_name || user?.username || "A")[0].toUpperCase()}
                                </div>
                            </Dropdown.Toggle>

                            <Dropdown.Menu className="shadow border-0 mt-2 p-2" style={{ borderRadius: "12px", backgroundColor: "#ffffff" }}>
                                <Dropdown.Header style={{ color: "#e63946", fontWeight: "700", fontSize: "12px", letterSpacing: "0.5px" }}>ADMIN SETTINGS</Dropdown.Header>
                                <Dropdown.Item className="rounded-3 py-2" style={{ color: "#444" }}>
                                    <i className="bi bi-person-gear me-2"></i> Profile Settings
                                </Dropdown.Item>
                                <Dropdown.Item className="rounded-3 py-2" style={{ color: "#444" }}>
                                    <i className="bi bi-journal-text me-2"></i> System Logs
                                </Dropdown.Item>
                                <Dropdown.Divider style={{ borderColor: "#eee" }} />
                                <Dropdown.Item className="text-danger rounded-3 py-2" onClick={logout} style={{ fontWeight: "600" }}>
                                    <i className="bi bi-box-arrow-right me-2"></i> Logout
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default AdminNavbar;
