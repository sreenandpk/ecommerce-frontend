import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState, useContext } from "react";
import { Card } from "react-bootstrap";
import { fetchUsers } from "../fetch";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "../../Components/Fetch/FetchUser";
import { OrdersLengthContext } from "../Context/OrdersContext";
import DashboardChart from "../Components/DashboardChart";

function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();
  const { ordersLength, orderAmount, totalOrders } = useContext(OrdersLengthContext);
  const [lengthOfUsers, setLengthOfUsers] = useState(0);
  const [lengthOfProducts, setLengthOfProducts] = useState([]);

  useEffect(function () {
    async function fetchAllUsers() {
      const response = await fetchUsers();
      setLengthOfUsers(response.length);
    }
    fetchAllUsers();
  }, []);

  useEffect(function () {
    async function fetchAllProducts() {
      const response = await fetchProducts();
      setLengthOfProducts(response.length);
    }
    fetchAllProducts();
  }, []);

  useEffect(function () {
    async function fetchAllOrders() {
      const response = await fetchProducts();
      setLengthOfProducts(response.length);
    }
    fetchAllOrders();
  }, []);

  return (
    <div className="container-fluid py-4" style={{ background: "#f9f9f9", minHeight: "100vh" }}>
      {/* Page Heading */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-5 gap-3">
        <h1 className="h3 mb-0 text-dark fw-bold" style={{ letterSpacing: "-0.5px" }}>
          Admin Dashboard
        </h1>
        <button className="btn btn-outline-dark fw-semibold shadow-sm">
          <i className="bi bi-download me-1"></i> Generate Report
        </button>
      </div>

      {/* Row of Stats */}
      <div className="row g-4">
        {[
          { title: "Users", value: lengthOfUsers, icon: "bi-people-fill" },
          { title: "Products", value: lengthOfProducts, icon: "bi-box-seam" },
          { title: "Orders", value: ordersLength, icon: "bi-cart-check-fill" },
          { title: "Revenue", value: `₹${orderAmount}`, icon: "bi-currency-rupee" },
        ].map((stat, idx) => (
          <div key={idx} className="col-xl-3 col-lg-6 col-md-6 col-sm-12">
            <Card
              className="shadow-lg h-100 border-0 rounded-4 p-3 stat-card d-flex flex-row align-items-center justify-content-between"
              onClick={() => {
                if (stat.title === "Users") navigate("users");
                if (stat.title === "Products") navigate("products");
                if (stat.title === "Orders") navigate("orders");
              }}
            >
              <div>
                <div className="text-uppercase text-muted small mb-1">{stat.title}</div>
                <div className="h4 fw-bold">{stat.value}</div>
              </div>
              <i className={`bi ${stat.icon} fs-2 text-secondary`}></i>
            </Card>
          </div>
        ))}
      </div>

      {/* Dashboard Chart */}
      <div className="mt-5">
        <DashboardChart />
      </div>

      {/* Custom Styles */}
      <style>{`
        .stat-card {
          background: #fff;
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.1);
        }
        @media (max-width: 1200px) {
          .stat-card {
            flex-direction: row !important;
          }
        }
        @media (max-width: 768px) {
          .stat-card {
            text-align: left;
            justify-content: space-between;
          }
        }
        @media (max-width: 576px) {
          .stat-card {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
