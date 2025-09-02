import { createContext, useState, useEffect } from "react";
import { fetchUsers } from "../fetch";

export const OrdersLengthContext = createContext();

export function OrdersLengthProvider({ children }) {
  const [ordersLength, setOrdersLength] = useState(0);
  const [orderAmount, setOrderAmount] = useState(0); // total revenue
  const [totalOrders, setTotalOrders] = useState([]);

  useEffect(() => {
    async function fetchAllOrders() {
      try {
        const users = await fetchUsers();
        const allOrders = users.flatMap(user => user.payment || []);

        setTotalOrders(allOrders); // store full orders
        setOrdersLength(allOrders.length); // number of orders

        const totalRevenue = allOrders.reduce(
          (acc, order) => acc + (Number(order.amount) || 0),
          0
        );
        setOrderAmount(totalRevenue);

      } catch (err) {
        console.error("Failed to fetch orders:", err);
      }
    }

    fetchAllOrders();
  }, []);

  return (
    <OrdersLengthContext.Provider
      value={{
        ordersLength,
        setOrdersLength,
        orderAmount,
        setOrderAmount,
        totalOrders,
        setTotalOrders
      }}
    >
      {children}
    </OrdersLengthContext.Provider>
  );
}
