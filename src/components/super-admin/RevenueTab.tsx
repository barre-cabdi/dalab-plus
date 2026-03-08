import { motion } from "framer-motion";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Business } from "@/lib/store";

interface Props {
  businesses: Business[];
}

const RevenueTab = ({ businesses }: Props) => {
  const totalRevenue = businesses.reduce((s, b) => s + b.totalRevenue, 0);
  const totalOrders = businesses.reduce((s, b) => s + b.totalOrders, 0);
  const avgRevenue = businesses.length ? totalRevenue / businesses.length : 0;
  const prices: Record<string, number> = { free: 0, basic: 29, premium: 79, enterprise: 199 };
  const mrr = businesses.filter(b => b.status === "active").reduce((s, b) => s + (prices[b.subscription || "free"] || 0), 0);

  const topBusinesses = [...businesses].sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+15%" },
          { label: "MRR (Subscriptions)", value: `$${mrr.toLocaleString()}`, icon: TrendingUp, change: "+8%" },
          { label: "Total Orders", value: totalOrders.toLocaleString(), icon: ArrowUpRight, change: "+22%" },
          { label: "Avg Revenue/Biz", value: `$${avgRevenue.toFixed(0)}`, icon: DollarSign, change: "+5%" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-5 shadow-card-custom">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-accent font-medium mt-1">↗ {s.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
        <h3 className="font-display font-bold text-foreground mb-4">Monthly Revenue Trend</h3>
        <div className="h-48 flex items-end gap-2">
          {[35, 45, 55, 40, 65, 80, 70, 90, 85, 95, 88, 100].map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className="flex-1 bg-accent/20 rounded-t-md hover:bg-accent/40 transition-colors relative group"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ${(h * mrr / 100).toFixed(0)}
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-[10px] text-muted-foreground">
          {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>

      {/* Top businesses */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card-custom">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-display font-bold text-foreground">Top Revenue Generators</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-6 py-3">#</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-6 py-3">Business</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-6 py-3">Orders</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-6 py-3">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topBusinesses.map((b, i) => (
              <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-6 py-3 text-sm text-muted-foreground">{i + 1}</td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center overflow-hidden">
                      {b.logo ? <img src={b.logo} className="w-full h-full object-cover" /> : <span className="text-xs font-bold text-accent">{b.name[0]}</span>}
                    </div>
                    <span className="text-sm font-medium text-foreground">{b.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3 text-sm text-muted-foreground">{b.totalOrders}</td>
                <td className="px-6 py-3 text-sm font-bold text-foreground text-right">${b.totalRevenue.toLocaleString()}</td>
              </tr>
            ))}
            {topBusinesses.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">No revenue data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RevenueTab;
