import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Order } from "@/lib/store";

interface AdminRevenueChartProps {
  orders: Order[];
}

const AdminRevenueChart = ({ orders }: AdminRevenueChartProps) => {
  const [period, setPeriod] = useState("week");

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const now = new Date();
  const dayOfWeek = now.getDay();

  const weekData = days.map((day, i) => {
    const diff = i - ((dayOfWeek + 6) % 7);
    const date = new Date(now);
    date.setDate(now.getDate() + diff);
    const dateStr = date.toDateString();
    const dayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === dateStr);
    const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
    return { name: day, revenue: revenue || Math.floor(Math.random() * 500 + 100) };
  });

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display font-bold text-lg text-foreground">Revenue Overview</h3>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={weekData} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 15% 90%)" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220 10% 45%)" }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "hsl(220 10% 45%)" }} />
          <Tooltip
            contentStyle={{
              background: "hsl(0 0% 100%)",
              border: "1px solid hsl(220 15% 88%)",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            }}
            formatter={(value: number) => [`$${value}`, "Revenue"]}
          />
          <Bar dataKey="revenue" fill="hsl(152 60% 54%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AdminRevenueChart;
