import { Navbar, Container } from "react-bootstrap";

const AdminNavbar = ({ toggleSidebar }) => {
    return (
        <Navbar expand="lg" className="shadow-sm border-bottom py-3" style={{ backgroundColor: "#ffffff" }}>
            <Container fluid>
                <div className="d-flex align-items-center">
                    <button
                        className="btn btn-link d-lg-none me-2 p-0 border-0 text-dark"
                        onClick={toggleSidebar}
                        aria-label="Toggle Sidebar"
                    >
                        <i className="bi bi-list fs-3"></i>
                    </button>
                    <h5 className="mb-0 fw-bold" style={{ color: "#e63946", fontFamily: "'Poppins', sans-serif" }}>Management Dashboard</h5>
                </div>
            </Container>
        </Navbar>
    );
};

export default AdminNavbar;
