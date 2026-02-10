import "bootstrap/dist/css/bootstrap.min.css";
import { useContext, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import DashboardChart from "../Components/DashboardChart";
import { getAdminUsers } from "../../api/admin/users";
import { getAdminProducts } from "../../api/admin/products";
import { OrdersLengthContext } from "../Context/OrdersContext";
import { useAuth } from "../../context/AuthContext";

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
        <div className="spinner-border" />
      </div>
    );
  }

  const stats = [
    { title: "Users", value: usersCount, icon: "bi-people-fill", path: "users" },
    { title: "Products", value: productsCount, icon: "bi-box-seam", path: "products" },
    { title: "Orders", value: ordersLength, icon: "bi-cart-check-fill", path: "orders" },
    { title: "Revenue", value: `₹${orderAmount}`, icon: "bi-currency-rupee" },
  ];

  return (
    <div className="container-fluid py-4" style={{ background: "#f9f9f9", minHeight: "100vh" }}>
      <div className="d-flex justify-content-between align-items-center mb-5">
        <h1 className="h3 fw-bold">Admin Dashboard</h1>
        <button className="btn btn-outline-dark fw-semibold shadow-sm">
          Generate Report
        </button>
      </div>

      <div className="row g-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="col-xl-3 col-lg-6 col-md-6">
            <Card
              className="shadow-lg border-0 rounded-4 p-3 stat-card"
              onClick={() => stat.path && navigate(stat.path)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-muted small text-uppercase">{stat.title}</div>
                  <div className="h4 fw-bold">{stat.value}</div>
                </div>
                <i className={`bi ${stat.icon} fs-2 text-secondary`} />
              </div>
            </Card>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <DashboardChart />
      </div>
    </div>
  );
}

export default Dashboard;
