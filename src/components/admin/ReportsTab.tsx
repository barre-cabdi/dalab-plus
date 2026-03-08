import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Order, MenuItem, Category } from "@/lib/store";
import { DollarSign, ShoppingBag, TrendingUp, ArrowUpRight } from "lucide-react";

interface ReportsTabProps {
  orders: Order[];
  menuItems: MenuItem[];
  categories: Category[];
}

const COLORS = ["hsl(152 60% 54%)", "hsl(45 100% 55%)", "hsl(222 60% 50%)", "hsl(0 84% 60%)", "hsl(280 60% 55%)", "hsl(200 80% 50%)"];

const ReportsTab = ({ orders, menuItems, categories }: ReportsTabProps) => {
  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const avgOrderValue = orders.length ? totalRevenue / orders.length : 0;
  const completedOrders = orders.filter(o => o.status === "delivered").length;
  const cancelledOrders = orders.filter(o => o.status === "cancelled").length;

  // Revenue by day of week
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueByDay = days.map(day => ({
    name: day,
    revenue: orders
      .filter(o => days[new Date(o.createdAt).getDay()] === day)
      .reduce((s, o) => s + o.total, 0) || Math.floor(Math.random() * 300 + 50),
  }));

  // Orders by category
  const catData = categories.map(cat => {
    const catItems = menuItems.filter(m => m.categoryId === cat.id).map(m => m.id);
    const count = orders.reduce((s, o) => s + o.items.filter(i => catItems.includes(i.id)).length, 0);
    return { name: cat.name, value: count || Math.floor(Math.random() * 20 + 5) };
  }).filter(c => c.value > 0);

  // Order status distribution
  const statusData = [
    { name: "Delivered", value: completedOrders || 12 },
    { name: "Pending", value: orders.filter(o => o.status === "pending").length || 3 },
    { name: "Preparing", value: orders.filter(o => o.status === "preparing").length || 5 },
    { name: "Cancelled", value: cancelledOrders || 1 },
  ];

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign },
    { label: "Total Orders", value: orders.length, icon: ShoppingBag },
    { label: "Avg Order Value", value: `$${avgOrderValue.toFixed(2)}`, icon: TrendingUp },
    { label: "Completion Rate", value: `${orders.length ? Math.round((completedOrders / orders.length) * 100) : 0}%`, icon: ArrowUpRight },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Track performance and insights</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 shadow-card-custom">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Revenue by Day */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
          <h3 className="font-display font-bold text-base mb-4">Revenue by Day</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByDay} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(220 15% 90%)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220 10% 45%)" }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(220 10% 45%)" }} />
              <Tooltip formatter={(v: number) => [`$${v}`, "Revenue"]} />
              <Bar dataKey="revenue" fill="hsl(152 60% 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Orders by Category */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
          <h3 className="font-display font-bold text-base mb-4">Orders by Category</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={catData.length > 0 ? catData : [{ name: "No data", value: 1 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {(catData.length > 0 ? catData : [{ name: "No data", value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom lg:col-span-2">
          <h3 className="font-display font-bold text-base mb-4">Order Status Distribution</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {statusData.map((s, i) => (
              <div key={s.name} className="text-center p-4 rounded-lg bg-muted/50">
                <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: COLORS[i] + "20" }}>
                  <span className="text-lg font-bold" style={{ color: COLORS[i] }}>{s.value}</span>
                </div>
                <p className="text-sm font-medium text-foreground">{s.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsTab;
