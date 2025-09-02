import { useEffect, useState } from "react";
import { fetchUsers, updateUser } from "../fetch";
import "bootstrap/dist/css/bootstrap.min.css";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function fetchAllUsers() {
      try {
        const response = await fetchUsers();
        setUsers(response);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    }
    fetchAllUsers();
  }, []);

  const blockUser = async (id, userBlock) => {
    try {
      await updateUser(id, { block: !userBlock });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, block: !userBlock } : u))
      );
    } catch {
      console.log("error in block user");
    }
  };

  return (
    <div className="container py-5" style={{ background: "#f5f5f7", minHeight: "100vh" }}>
      {/* Heading */}
      <h2
        className="text-center fw-bold mb-5"
        style={{ fontSize: "2rem", color: "#1e293b", fontFamily: "Poppins, sans-serif" }}
      >
        👥 User Management
      </h2>

      <div className="d-flex flex-column gap-3">
        {users.length > 0 ? (
          [...users].reverse().map((user) => (
            <div
              key={user.id}
              className="d-flex flex-column flex-md-row align-items-center justify-content-between px-4 py-3 user-card"
              style={{
                borderRadius: "12px",
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              {/* Left - ID */}
              <span
                className="mb-2 mb-md-0"
                style={{ fontWeight: "500", fontSize: "0.9rem", color: "#64748b" }}
              >
                id: #{user.id}
              </span>

              {/* Center - Name + Email */}
              <div className="text-center flex-grow-1 mb-2 mb-md-0">
                <h5 className="mb-0" style={{ fontWeight: "600", color: "#0f172a" }}>
                  {user.name}
                </h5>
                <small style={{ color: "#64748b" }}>{user.email}</small>
              </div>

              {/* Right - Block/Unblock Button */}
              <button
                className="btn btn-sm px-3 d-block d-md-inline-block"
                style={{
                  background: user.block ? "#22c55e" : "#ef4444",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "500",
                  padding: "6px 14px",
                  boxShadow: `0 4px 12px ${
                    user.block ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"
                  }`,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = user.block
                    ? "0 6px 20px rgba(34,197,94,0.4)"
                    : "0 6px 20px rgba(239,68,68,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = user.block
                    ? "0 4px 12px rgba(34,197,94,0.3)"
                    : "0 4px 12px rgba(239,68,68,0.3)";
                }}
                onClick={() => blockUser(user.id, user.block)}
              >
                {user.block ? "Unblock" : "Block"}
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-muted">No users found.</p>
        )}
      </div>

      {/* Card Hover Effect */}
      <style>{`
        .user-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.08);
        }
        @media (max-width: 768px) {
          .user-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
