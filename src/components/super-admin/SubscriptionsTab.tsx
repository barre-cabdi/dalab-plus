import { motion } from "framer-motion";
import { CreditCard, Users, TrendingUp, AlertCircle } from "lucide-react";
import { Business } from "@/lib/store";

interface Props {
  businesses: Business[];
}

const SubscriptionsTab = ({ businesses }: Props) => {
  const plans = ["free", "basic", "premium", "enterprise"] as const;
  const planData = plans.map(p => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    count: businesses.filter(b => (b.subscription || "free") === p).length,
    color: p === "free" ? "bg-muted" : p === "basic" ? "bg-accent/20" : p === "premium" ? "bg-primary/20" : "bg-secondary/20",
    textColor: p === "free" ? "text-muted-foreground" : p === "basic" ? "text-accent" : p === "premium" ? "text-primary" : "text-secondary-foreground",
    price: p === "free" ? "$0" : p === "basic" ? "$29" : p === "premium" ? "$79" : "$199",
  }));

  const activeSubscriptions = businesses.filter(b => (b.subscription || "free") !== "free" && b.status === "active").length;
  const mrr = businesses.reduce((sum, b) => {
    const prices: Record<string, number> = { free: 0, basic: 29, premium: 79, enterprise: 199 };
    return sum + (b.status === "active" ? (prices[b.subscription || "free"] || 0) : 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Paid Subscribers", value: activeSubscriptions.toString(), icon: Users, sub: "Active paid plans" },
          { label: "Monthly Revenue", value: `$${mrr.toLocaleString()}`, icon: TrendingUp, sub: "Recurring MRR" },
          { label: "Free Tier", value: businesses.filter(b => (b.subscription || "free") === "free").length.toString(), icon: AlertCircle, sub: "Potential upgrades" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-5 shadow-card-custom">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{s.label}</span>
              <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                <s.icon className="w-4 h-4 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Plan breakdown */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
        <h3 className="font-display font-bold text-foreground mb-4">Plan Distribution</h3>
        <div className="space-y-3">
          {planData.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-4">
              <span className={`text-sm font-medium w-24 ${p.textColor}`}>{p.name}</span>
              <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: businesses.length ? `${(p.count / businesses.length) * 100}%` : "0%" }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                  className={`h-full rounded-full ${p.name === "Free" ? "bg-muted-foreground/30" : p.name === "Basic" ? "bg-accent" : p.name === "Premium" ? "bg-primary" : "bg-secondary"}`}
                />
              </div>
              <span className="text-sm font-bold text-foreground w-8 text-right">{p.count}</span>
              <span className="text-xs text-muted-foreground w-14 text-right">{p.price}/mo</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Subscribers list */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card-custom">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="font-display font-bold text-foreground">All Subscribers</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-6 py-3">Business</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-6 py-3">Plan</th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase px-6 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-muted-foreground uppercase px-6 py-3">Monthly</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map(b => {
              const prices: Record<string, number> = { free: 0, basic: 29, premium: 79, enterprise: 199 };
              return (
                <tr key={b.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-3 text-sm font-medium text-foreground">{b.name}</td>
                  <td className="px-6 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${planData.find(p => p.name.toLowerCase() === (b.subscription || "free"))?.color} ${planData.find(p => p.name.toLowerCase() === (b.subscription || "free"))?.textColor}`}>{(b.subscription || "free").charAt(0).toUpperCase() + (b.subscription || "free").slice(1)}</span></td>
                  <td className="px-6 py-3"><span className={`text-xs ${b.status === "active" ? "text-accent" : "text-destructive"}`}>{b.status}</span></td>
                  <td className="px-6 py-3 text-sm font-medium text-foreground text-right">${prices[b.subscription || "free"]}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SubscriptionsTab;
