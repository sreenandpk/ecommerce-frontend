import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import DashboardChart from "../Components/DashboardChart";
import { getAdminUsers } from "../../api/admin/users";
import { getAdminProducts } from "../../api/admin/products";
import { OrdersLengthContext } from "../Context/OrdersContext";
import { useAuth } from "../../context/AuthContext";

import { motion } from "framer-motion";

function Dashboard() {
  const navigate = useNavigate();
  const { isAdmin, loading: authLoading } = useAuth();

  const {
    ordersLength,
    orderAmount,
    loading,
  } = useContext(OrdersLengthContext);

  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);

  /* 🔒 HARD ADMIN GUARD */
  if (authLoading) return null;
  if (!isAdmin) {
    navigate("/login", { replace: true });
    return null;
  }

  /* ================= USERS COUNT ================= */
  useEffect(() => {
    async function fetchUsersCount() {
      try {
        const data = await getAdminUsers();
        setUsersCount(data.count ?? data.length ?? 0);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    }
    fetchUsersCount();
  }, []);

  /* ================= PRODUCTS COUNT ================= */
  useEffect(() => {
    async function fetchProductsCount() {
      try {
        const data = await getAdminProducts();
        setProductsCount(data.count ?? data.length ?? 0);
      } catch (err) {
        console.error("Failed to fetch products", err);
      }
    }
    fetchProductsCount();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-danger" />
      </div>
    );
  }

  const stats = [
    { title: "Users", value: usersCount, icon: "bi-people-fill", path: "users", color: "#4cc9f0" },
    { title: "Products", value: productsCount, icon: "bi-box-seam", path: "products", color: "#4361ee" },
    { title: "Orders", value: ordersLength, icon: "bi-cart-check-fill", path: "orders", color: "#e63946" },
    { title: "Revenue", value: `₹${orderAmount}`, icon: "bi-currency-rupee", color: "#2b9348" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggeredChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container-fluid py-4"
      style={{ minHeight: "100vh" }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5">
        <div>
          <h1 className="h3 fw-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted small mb-0">Welcome back, Administrator</p>
        </div>
        <button className="btn btn-dark fw-semibold shadow-sm mt-3 mt-md-0 d-flex align-items-center justify-content-center">
          <i className="bi bi-file-earmark-bar-graph me-2"></i>
          Generate Report
        </button>
      </div>

      <div className="row g-4">
        {stats.map((stat, idx) => (
          <motion.div key={idx} className="col-xl-3 col-sm-6" variants={itemVariants}>
            <Card
              className="border-0 rounded-4 p-3 h-100 stat-card"
              onClick={() => stat.path && navigate(stat.path)}
              style={{
                cursor: stat.path ? "pointer" : "default",
                background: "#ffffff",
                boxShadow: "0 10px 30px rgba(0,0,0,0.03)"
              }}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small fw-bold text-uppercase mb-1" style={{ letterSpacing: "1px" }}>{stat.title}</div>
                  <div className="h3 fw-bold mb-0">{stat.value}</div>
                </div>
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px", backgroundColor: `${stat.color}15`, color: stat.color }}
                >
                  <i className={`bi ${stat.icon} fs-3`} />
                </div>
              </div>
              {stat.path && (
                <div className="mt-3 text-muted small d-flex align-items-center">
                  See Details <i className="bi bi-arrow-right ms-1"></i>
                </div>
              )}
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div className="mt-5" variants={itemVariants}>
        <Card className="border-0 shadow-sm rounded-4 p-4 overflow-hidden">
          <h5 className="fw-bold mb-4">Orders Overview</h5>
          <DashboardChart />
        </Card>
      </motion.div>

      <style>{`
        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease !important;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </motion.div>
  );
}

export default Dashboard;
