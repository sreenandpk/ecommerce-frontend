import { useContext, useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { OrdersLengthContext } from "../Context/OrdersContext";

export default function DashboardChart() {
  const { graphData } = useContext(OrdersLengthContext);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (graphData && graphData.length > 0) {
      setChartData(graphData);
    }
  }, [graphData]);

  if (!graphData || graphData.length === 0) {
    return (
      <div className="p-4 shadow-sm rounded-4 bg-white mt-4">
        <h5 className="mb-3 fw-semibold">Revenue & Orders Overview</h5>
        <p className="text-center text-muted">No data available</p>
      </div>
    );
  }

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

          <Bar
            dataKey="revenue"
            fill="#4a90e2"
            radius={[6, 6, 0, 0]}
          />
          <Bar
            dataKey="orders"
            fill="#50c878"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
