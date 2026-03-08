import { motion } from "framer-motion";
import { DollarSign, ShoppingBag, Armchair, Users, TrendingUp } from "lucide-react";

interface StatsCardsProps {
  todayRevenue: number;
  totalOrders: number;
  activeTables: number;
  totalTables: number;
  loyaltySignups: number;
}

const AdminStatsCards = ({ todayRevenue, totalOrders, activeTables, totalTables, loyaltySignups }: StatsCardsProps) => {
  const cards = [
    {
      label: "TODAY'S REVENUE",
      value: `$${todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      change: "+15%",
      changeLabel: "vs yesterday",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "TOTAL ORDERS",
      value: String(totalOrders),
      icon: ShoppingBag,
      change: "+5%",
      changeLabel: "vs yesterday",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "ACTIVE TABLES",
      value: `${activeTables}`,
      valueSuffix: `/${totalTables}`,
      icon: Armchair,
      change: "→0%",
      changeLabel: "vs yesterday",
      color: "text-muted-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "LOYALTY SIGNUPS",
      value: String(loyaltySignups),
      icon: Users,
      change: "+20%",
      changeLabel: "vs yesterday",
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold text-muted-foreground tracking-wider uppercase">{card.label}</p>
            <div className={`w-9 h-9 rounded-lg ${card.bgColor} flex items-center justify-center`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
          </div>
          <p className="text-2xl font-display font-bold text-foreground">
            {card.value}
            {card.valueSuffix && <span className="text-base text-muted-foreground font-normal">{card.valueSuffix}</span>}
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="text-xs text-accent font-medium">{card.change}</span>
            <span className="text-xs text-muted-foreground">{card.changeLabel}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default AdminStatsCards;
