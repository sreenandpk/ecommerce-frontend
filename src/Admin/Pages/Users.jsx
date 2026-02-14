import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getAdminUsers, updateAdminUser } from "../../api/admin/users";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCheck, UserX, Lock, Unlock, Search, Filter,
  Users as UsersIcon, Shield, Calendar
} from "lucide-react";
import AppToast from "../../components/Common/AppToast";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggeredChildren: 0.05 }
  }
};

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

    setUpdatingId(targetUser.id);

    try {
      const updated = await updateAdminUser(targetUser.id, {
        is_active: !targetUser.is_active,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id ? { ...u, ...updated } : u
        )
      );

      const action = updated.is_active ? "User Unblocked" : "User Blocked";
      toastRef.current?.showToast(`${action} successfully`);

    } catch (err) {
      console.error("Failed to update user", err);
      const serverMsg = err.response?.data?.detail || "Failed to update user status";
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="admin-users-container custom-scrollbar"
    >
      <AppToast ref={toastRef} />

      <div className="admin-content-wrapper">
        {/* Header Section */}
        <div className="admin-header-glass d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 mb-md-5 gap-4">
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
              placeholder="Search users..."
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
            <p className="mt-3 text-muted small">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-5">
            <div className="display-4 text-muted opacity-25 mb-3"><UsersIcon /></div>
            <h5>No users found</h5>
            <p className="text-muted small">Try adjusting your search criteria</p>
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
    </motion.div>
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
      whileHover={{ scale: 1.005 }}
      layout
      className={`admin-user-row-glass ${!user.is_active ? "is-inactive" : ""}`}
    >
      <div className="admin-user-row-inner d-flex flex-column flex-md-row align-items-center justify-content-between p-3 p-md-4 gap-3">

        {/* User Identity */}
        <div className="d-flex align-items-center gap-3 gap-md-4 w-100 flex-grow-1">
          <div className={`admin-avatar-glass ${user.is_staff ? "staff" : "regular"}`}>
            {user.email?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-grow-1 min-width-0">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
              <h6 className="admin-user-email mb-0 text-truncate">{user.email}</h6>
              {user.is_staff && (
                <span className="admin-role-badge">
                  <Shield size={10} /> Admin Staff
                </span>
              )}
            </div>
            <div className="admin-user-metadata d-flex flex-wrap align-items-center gap-2 gap-md-3">
              <span className="d-flex align-items-center gap-1">
                <span className="opacity-50">UID:</span> #{user.id}
              </span>
              <span className="d-flex align-items-center gap-1">
                <Calendar size={12} className="opacity-50" />
                Joined {new Date(user.date_joined || user.created_at || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Status and Actions Wrapper for Mobile Only */}
        <div className="d-flex flex-row flex-md-column align-items-center justify-content-between justify-content-md-center w-100 w-md-auto gap-2 gap-md-2">
          <div className={`admin-status-tag ${user.is_active ? "active" : "blocked"}`}>
            {user.is_active ? <UserCheck size={12} /> : <UserX size={12} />}
            {user.is_active ? "Active" : "Blocked"}
          </div>

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
              <><Lock size={14} className="me-1 me-md-2" /> Block</>
            ) : (
              <><Unlock size={14} className="me-1 me-md-2" /> Unblock</>
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
    <div className="admin-stat-badge-glass flex-fill" style={{ borderColor: theme.border }}>
      <div className="stat-icon" style={{ color: theme.color }}><Icon size={16} /></div>
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
      padding: 20px 15px;
      font-family: 'Poppins', sans-serif;
    }
    @media (min-width: 768px) {
      .admin-users-container { padding: 40px; }
    }
    .admin-content-wrapper {
      max-width: 1200px;
      margin: 0 auto;
    }
    .admin-header-glass {
      background: linear-gradient(135deg, rgba(93, 55, 43, 0.05) 0%, rgba(93, 55, 43, 0.02) 100%);
      backdrop-filter: blur(10px);
      padding: 20px;
      border-radius: 20px;
      border: 1px solid rgba(93, 55, 43, 0.08);
    }
    @media (min-width: 768px) {
      .admin-header-glass { padding: 35px; border-radius: 30px; }
    }
    .admin-main-title {
      font-family: 'Playfair Display', serif;
      font-weight: 800;
      color: #5D372B;
      margin: 0;
      font-size: 1.5rem;
    }
    @media (min-width: 768px) {
      .admin-main-title { font-size: 2.2rem; }
    }
    .admin-subtitle {
      color: #8d6e63;
      font-size: 0.8rem;
      margin: 5px 0 0 0;
      font-weight: 500;
    }

    /* Stats Grid */
    .admin-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      width: 100%;
    }
    @media (min-width: 992px) {
      .admin-stats-grid { display: flex; width: auto; }
    }
    .admin-stat-badge-glass {
      background: rgba(255,255,255,0.6);
      backdrop-filter: blur(5px);
      padding: 10px 15px;
      border-radius: 15px;
      border: 1px solid;
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.02);
    }
    .stat-vals {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }
    .stat-num {
      font-weight: 800;
      font-size: 1rem;
      color: #2d3436;
    }
    .stat-label {
      font-size: 0.6rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.5px;
      color: #8d6e63;
    }

    /* Search Bar */
    .admin-search-glass {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(10px);
      border-radius: 15px;
      padding: 5px;
      border: 1px solid rgba(93, 55, 43, 0.1);
    }
    .admin-search-inner {
      display: flex;
      align-items: center;
      padding: 5px 10px;
    }
    .admin-search-icon { color: #8d6e63; opacity: 0.6; width: 18px; }
    .admin-search-input {
      border: none;
      background: transparent;
      width: 100%;
      padding-left: 10px;
      font-size: 0.9rem;
      font-weight: 500;
      color: #5D372B;
      outline: none;
    }

    /* User Row */
    .admin-user-row-glass {
      background: white;
      border-radius: 20px;
      border: 1px solid rgba(93, 55, 43, 0.06);
      transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    }
    .admin-user-row-glass.is-inactive {
      opacity: 0.8;
      background: #fafafa;
    }

    .admin-avatar-glass {
      width: 45px;
      height: 45px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: white;
      font-size: 1.1rem;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
      flex-shrink: 0;
    }
    @media (min-width: 768px) {
      .admin-avatar-glass { width: 55px; height: 55px; font-size: 1.3rem; }
    }
    .admin-avatar-glass.regular { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .admin-avatar-glass.staff { background: linear-gradient(135deg, #5D372B 0%, #a18a81 100%); }

    .admin-user-email {
      font-weight: 700;
      color: #2d3436;
      font-size: 0.9rem;
    }
    @media (min-width: 768px) {
        .admin-user-email { font-size: 1.05rem; }
    }
    .admin-role-badge {
      background: #8d6e63;
      color: white;
      padding: 2px 8px;
      border-radius: 8px;
      font-size: 0.6rem;
      font-weight: 700;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .admin-user-metadata {
      font-size: 0.7rem;
      font-weight: 600;
      color: #8d6e63;
    }

    .admin-status-tag {
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .admin-status-tag.active { background: rgba(46, 204, 113, 0.1); color: #2ecc71; }
    .admin-status-tag.blocked { background: rgba(231, 76, 60, 0.1); color: #e74c3c; }

    .admin-status-btn {
      padding: 6px 15px;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 700;
      border: none;
      display: flex;
      align-items: center;
      transition: all 0.2s;
      white-space: nowrap;
    }
    @media (min-width: 768px) {
        .admin-status-btn { padding: 8px 20px; font-size: 0.8rem; }
    }
    .block-btn { background: #fee2e2; color: #dc2626; }
    .unblock-btn { background: #dcfce7; color: #16a34a; }
    .staff-btn { background: #f3f4f6; color: #9ca3af; cursor: not-allowed; }
    
    .block-btn:hover:not(:disabled) { background: #dc2626; color: white; }
    .unblock-btn:hover:not(:disabled) { background: #16a34a; color: white; }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  `}</style>
);
