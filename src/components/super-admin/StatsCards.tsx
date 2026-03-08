import { motion } from "framer-motion";
import { Building2, CreditCard, DollarSign, Activity } from "lucide-react";

interface StatsProps {
  totalBusinesses: number;
  activeCount: number;
  totalRevenue: number;
}

const SuperAdminStats = ({ totalBusinesses, activeCount, totalRevenue }: StatsProps) => {
  const stats = [
    {
      label: "Total Businesses",
      value: totalBusinesses.toString(),
      icon: Building2,
      change: "+12% this month",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "Active Subscriptions",
      value: activeCount.toString(),
      icon: CreditCard,
      change: "+8% this month",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: "+15% this month",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
    {
      label: "System Health",
      value: "99.9%",
      icon: Activity,
      change: "-0.1% uptime",
      iconBg: "bg-accent/10",
      iconColor: "text-accent",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <div className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center`}>
              <s.icon className={`w-4 h-4 ${s.iconColor}`} />
            </div>
          </div>
          <p className="text-3xl font-display font-bold text-foreground mb-1">{s.value}</p>
          <p className="text-xs text-accent font-medium">↗ {s.change}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default SuperAdminStats;
