import { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users as UsersIcon,
  Search,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  Lock,
  Unlock,
  Mail,
  Calendar,
  AlertCircle
} from "lucide-react";

import AppToast from "../../components/Common/AppToast";

import {
  getAdminUsers,
  updateAdminUser,
} from "../../api/admin/users";

import { useAuth } from "../../context/AuthContext";

export default function Users() {
  const { user: loggedInUser, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const toastRef = useRef();

  /* 🔒 HARD ADMIN GUARD */
  if (authLoading) return null;
  if (!isAdmin) {
    navigate("/login", { replace: true });
    return null;
  }

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getAdminUsers();
      setUsers(data.results ?? data ?? []);
    } catch (err) {
      console.error("Failed to fetch users", err);
      toastRef.current?.showToast("Failed to load users list");
    } finally {
      setLoading(false);
    }
  }

  /* ================= BLOCK / UNBLOCK ================= */
  const toggleUserStatus = async (targetUser) => {
    if (targetUser.id === loggedInUser?.id) {
      toastRef.current?.showToast("You cannot block your own admin account.");
      return;
    }

    // Optimistic UI update requires careful error handling, 
    // so we'll wait for server response to allow strictly validated actions only.
    setUpdatingId(targetUser.id);

    try {
      const updated = await updateAdminUser(targetUser.id, {
        is_active: !targetUser.is_active,
      });

      // Update local state on success
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, ...updated } : u
        )
      );

      const action = updated.is_active ? "User Unblocked" : "User Blocked";
      toastRef.current?.showToast(`${action} successfully`);

    } catch (err) {
      console.error("Failed to update user", err);
      // Backend error message usually in err.response.data.detail
      const serverMsg = err.response?.data?.detail || "Failed to update user status";
      // If server returns specific validation error (e.g. pending orders), show it
      toastRef.current?.showToast(serverMsg);
    } finally {
      setUpdatingId(null);
    }
  };

  /* ================= FILTERING ================= */
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.id?.toString().includes(searchTerm)
  );

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    blocked: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.is_staff).length
  };
  return (
    <div className="admin-users-container custom-scrollbar">
      <AppToast ref={toastRef} />

      <div className="admin-content-wrapper">
        {/* Header Section */}
        <div className="admin-header-glass d-flex flex-column flex-md-row justify-content-between align-items-center mb-5 gap-4">
          <div>
            <h2 className="admin-main-title">User Network</h2>
            <p className="admin-subtitle">Governing system access and member privileges</p>
          </div>

          <div className="admin-stats-grid">
            <StatsBadge Icon={UsersIcon} label="Total" value={stats.total} type="total" />
            <StatsBadge Icon={UserCheck} label="Active" value={stats.active} type="success" />
            <StatsBadge Icon={UserX} label="Blocked" value={stats.blocked} type="danger" />
            <StatsBadge Icon={Shield} label="Admins" value={stats.admins} type="admin" />
          </div>
        </div>

        {/* Search & Controls */}
        <div className="admin-search-glass mb-4">
          <div className="admin-search-inner">
            <Search size={22} className="admin-search-icon" />
            <input
              type="text"
              placeholder="Search user identification or credentials..."
              className="admin-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-3 text-muted">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-1 text-muted opacity-25 mb-3"><UsersIcon /></div>
            <h4>No users found</h4>
            <p className="text-muted">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            <AnimatePresence>
              {filteredUsers.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  toggleStatus={toggleUserStatus}
                  updatingId={updatingId}
                  loggedInUser={loggedInUser}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      <Styles />
    </div>
  );
}

const UserRow = ({ user, toggleStatus, updatingId, loggedInUser }) => {
  const isMe = user.id === loggedInUser?.id;
  const isUpdating = updatingId === user.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ scale: 1.01 }}
      layout
      className={`admin-user-row-glass ${!user.is_active ? "is-inactive" : ""}`}
    >
      <div className="admin-user-row-inner d-flex flex-column flex-md-row align-items-center justify-content-between p-4 gap-4">

        {/* User Identity */}
        <div className="d-flex align-items-center gap-4 flex-grow-1">
          <div className={`admin-avatar-glass ${user.is_staff ? "staff" : "regular"}`}>
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <h6 className="admin-user-email mb-0">{user.email}</h6>
              {user.is_staff && (
                <span className="admin-role-badge">
                  <Shield size={10} /> Admin Staff
                </span>
              )}
            </div>
            <div className="admin-user-metadata d-flex align-items-center gap-3">
              <span className="d-flex align-items-center gap-1">
                <span className="opacity-50">UID:</span> #{user.id}
              </span>
              <span className="d-flex align-items-center gap-1">
                <Calendar size={13} className="opacity-50" />
                Joined {new Date(user.date_joined || user.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Status indicator */}
        <div className="admin-status-cell">
          <div className={`admin-status-tag ${user.is_active ? "active" : "blocked"}`}>
            {user.is_active ? <UserCheck size={14} /> : <UserX size={14} />}
            {user.is_active ? "Authorized" : "Deactivated"}
          </div>
        </div>

        {/* Action Center */}
        <div className="admin-action-cell ms-md-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleStatus(user)}
            disabled={isUpdating || isMe || user.is_staff}
            className={`admin-status-btn ${user.is_staff ? "staff-btn" : user.is_active ? "block-btn" : "unblock-btn"}`}
          >
            {isUpdating ? (
              <span className="spinner-border spinner-border-sm" />
            ) : user.is_staff ? (
              <>Admin Locked</>
            ) : user.is_active ? (
              <><Lock size={15} className="me-2" /> Restrict Access</>
            ) : (
              <><Unlock size={15} className="me-2" /> Restore Access</>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const StatsBadge = ({ Icon, label, value, type }) => {
  const styles = {
    total: { color: "#5D372B", border: "rgba(93, 55, 43, 0.2)" },
    success: { color: "#2ecc71", border: "rgba(46, 204, 113, 0.2)" },
    danger: { color: "#e74c3c", border: "rgba(231, 76, 60, 0.2)" },
    admin: { color: "#f39c12", border: "rgba(243, 156, 18, 0.2)" }
  };
  const theme = styles[type] || styles.total;

  return (
    <div className="admin-stat-badge-glass" style={{ borderColor: theme.border }}>
      <div className="stat-icon" style={{ color: theme.color }}><Icon size={18} /></div>
      <div className="stat-vals">
        <span className="stat-num">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
};

// Add styles
const Styles = () => (
  <style>{`
    .admin-users-container {
      background: #fff8f0;
      min-height: 100vh;
      padding: 60px 40px;
      font-family: 'Poppins', sans-serif;
    }
    .admin-content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
    .admin-header-glass {
      background: linear-gradient(135deg, rgba(93, 55, 43, 0.05) 0%, rgba(93, 55, 43, 0.02) 100%);
      backdrop-filter: blur(10px);
      padding: 35px;
      border-radius: 30px;
      border: 1px solid rgba(93, 55, 43, 0.08);
    }
    .admin-main-title {
      font-family: 'Playfair Display', serif;
      font-weight: 800;
      color: #5D372B;
      margin: 0;
      font-size: 2.2rem;
    }
    .admin-subtitle {
      color: #8d6e63;
      font-size: 0.95rem;
      margin: 5px 0 0 0;
      font-weight: 500;
    }

    /* Stats Grid */
    .admin-stats-grid {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }
    .admin-stat-badge-glass {
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(5px);
      padding: 12px 20px;
      border-radius: 18px;
      border: 1px solid;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    }
    .stat-vals {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .stat-num {
      font-weight: 800;
      font-size: 1.2rem;
      color: #2d3436;
    }
    .stat-label {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #8d6e63;
    }

    /* Search Bar */
    .admin-search-glass {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 8px;
      border: 1px solid rgba(93, 55, 43, 0.1);
    }
    .admin-search-inner {
      display: flex;
      align-items: center;
      padding: 8px 15px;
    }
    .admin-search-icon { color: #8d6e63; opacity: 0.6; }
    .admin-search-input {
      border: none;
      background: transparent;
      width: 100%;
      padding-left: 15px;
      font-size: 0.95rem;
      font-weight: 500;
      color: #5D372B;
      outline: none;
    }
    .admin-search-input::placeholder { color: #a18a81; }

    /* User Row */
    .admin-user-row-glass {
      background: white;
      border-radius: 24px;
      border: 1px solid rgba(93, 55, 43, 0.06);
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
      box-shadow: 0 4px 15px rgba(0,0,0,0.01);
    }
    .admin-user-row-glass:hover {
      box-shadow: 0 20px 40px rgba(93, 55, 43, 0.06);
      border-color: rgba(93, 55, 43, 0.1);
    }
    .admin-user-row-glass.is-inactive {
      opacity: 0.8;
      background: #fafafa;
    }

    .admin-avatar-glass {
      width: 55px;
      height: 55px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 1.3rem;
      box-shadow: 0 8px 20px rgba(0,0,0,0.1);
    }
    .admin-avatar-glass.regular { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .admin-avatar-glass.staff { background: linear-gradient(135deg, #5D372B 0%, #a18a81 100%); }

    .admin-user-email {
      font-weight: 700;
      color: #2d3436;
      font-size: 1.05rem;
    }
    .admin-role-badge {
      background: #8d6e63;
      color: white;
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .admin-user-metadata {
      font-size: 0.75rem;
      font-weight: 600;
      color: #8d6e63;
    }

    .admin-status-tag {
      padding: 6px 14px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .admin-status-tag.active { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
    .admin-status-tag.blocked { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }

    .admin-status-btn {
      padding: 10px 22px;
      border-radius: 14px;
      font-size: 0.8rem;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      transition: all 0.2s;
    }
    .block-btn { background: #fee2e2; color: #dc2626; }
    .unblock-btn { background: #dcfce7; color: #16a34a; }
    .staff-btn { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
    
    .block-btn:hover:not(:disabled) { background: #dc2626; color: white; }
    .unblock-btn:hover:not(:disabled) { background: #16a34a; color: white; }

    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(93, 55, 43, 0.1); border-radius: 10px; }
  `}</style>
);
