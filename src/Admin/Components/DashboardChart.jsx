import { useContext, useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { OrdersLengthContext } from "../Context/OrdersContext";

export default function DashboardChart() {
  const { totalOrders } = useContext(OrdersLengthContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const data = days.map((day, index) => {
      const ordersForDay = totalOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        const istDate = new Date(
          orderDate.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
        );
        return istDate.getDay() === index;
      });

      const revenueForDay = ordersForDay.reduce((sum, order) => sum + Number(order.amount || 0), 0);

      return {
        name: day,
        orders: ordersForDay.length,
        revenue: revenueForDay
      };
    });

    setChartData(data);
  }, [totalOrders]);

  return (
    <div className="p-4 shadow-sm rounded-4 bg-white mt-4">
      <h5 className="mb-3 fw-semibold">Revenue & Orders Overview</h5>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#4a90e2" radius={[6, 6, 0, 0]} />
          <Bar dataKey="orders" fill="#50c878" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
