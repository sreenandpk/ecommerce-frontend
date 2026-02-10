import { createContext, useState, useEffect, useRef } from "react";
import {
  getAdminOrders,
  getAdminOrderStats,
} from "../../api/admin/orders";
import { useAuth } from "../../context/AuthContext";

export const OrdersLengthContext = createContext(null);

export function OrdersLengthProvider({ children }) {
  const { isAdmin, loading: authLoading } = useAuth();

  const [ordersLength, setOrdersLength] = useState(0);
  const [orderAmount, setOrderAmount] = useState(0);
  const [totalOrders, setTotalOrders] = useState([]);
  const [graphData, setGraphData] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔒 track fetch lifecycle
  const fetchedRef = useRef(false);

  useEffect(() => {
    // ⛔ wait for auth
    if (authLoading) return;

    // ⛔ reset on logout / role change
    if (!isAdmin) {
      fetchedRef.current = false;
      setOrdersLength(0);
      setOrderAmount(0);
      setTotalOrders([]);
      return;
    }

    // ⛔ fetch only once per admin session
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchAdminOrders() {
      try {
        setLoading(true);

        const ordersRes = await getAdminOrders();
        const orders = ordersRes?.results ?? ordersRes ?? [];

        setTotalOrders(orders);
        setOrdersLength(Array.isArray(orders) ? orders.length : 0);

        const stats = await getAdminOrderStats();
        setOrderAmount(stats?.total_revenue ?? 0);
        setGraphData(stats?.graph_data || []);
      } catch (err) {
        console.error("Failed to fetch admin orders:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminOrders();
  }, [authLoading, isAdmin]);

  return (
    <OrdersLengthContext.Provider
      value={{
        ordersLength,
        orderAmount,
        totalOrders,
        graphData,
        loading,
      }}
    >
      {children}
    </OrdersLengthContext.Provider>
  );
}
