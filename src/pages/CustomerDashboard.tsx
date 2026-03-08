import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, ShoppingBag, Star, Trophy, LogOut, Clock, ChevronRight } from "lucide-react";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("dp_customer");
    if (stored) setCustomer(JSON.parse(stored));
    else { navigate("/register?table=1&business=1001"); return; }
    const storedOrders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
    setOrders(storedOrders);
  }, [navigate]);

  if (!customer) return null;

  const getLevelInfo = (level: string) => {
    switch (level) {
      case "Silver": return { next: "Gold", needed: 300, reward: "Cabbitaan bilaash ah! 🥤" };
      case "Gold": return { next: "Platinum", needed: 600, reward: "Cunto bilaash ah! 🍽️" };
      case "Platinum": return { next: null, needed: 0, reward: "10% Discount! 💎" };
      default: return { next: "Silver", needed: 100, reward: "" };
    }
  };

  const levelInfo = getLevelInfo(customer.level);
  const progress = levelInfo.needed ? Math.min((customer.points / levelInfo.needed) * 100, 100) : 100;

  const rewardLevels = [
    { name: "Bronze", range: "0–100", icon: "🥉", active: customer.level === "Bronze" },
    { name: "Silver", range: "100+", icon: "🥈", active: customer.level === "Silver" },
    { name: "Gold", range: "300+", icon: "🥇", active: customer.level === "Gold" },
    { name: "Platinum", range: "600+", icon: "💎", active: customer.level === "Platinum" },
  ];

  return (
    <div className="min-h-screen bg-hero">
      <header className="glass border-b border-border/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center"><span className="font-display font-bold text-accent-foreground text-xs">D+</span></div>
          <span className="font-display font-bold text-primary-foreground text-sm">DALABplus+</span>
        </div>
        <Link to="/login"><Button variant="ghost" size="sm" className="text-primary-foreground/60"><LogOut className="w-4 h-4" /></Button></Link>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-gold-gradient mx-auto mb-3 flex items-center justify-center"><span className="font-display font-bold text-accent-foreground text-2xl">{customer.name?.charAt(0) || "?"}</span></div>
          <h2 className="font-display font-bold text-lg text-primary-foreground">{customer.name}</h2>
          <p className="text-xs text-primary-foreground/50 mb-3">{customer.id}</p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20"><Trophy className="w-3.5 h-3.5 text-accent" /><span className="text-xs font-semibold text-accent">{customer.level} Level</span></div>
        </motion.div>

        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Orders", value: customer.totalOrders || 0, icon: ShoppingBag }, { label: "Points", value: customer.points || 0, icon: Star }, { label: "Spent", value: `$${customer.totalSpent?.toFixed(0) || 0}`, icon: Gift }].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }} className="glass rounded-xl p-4 text-center">
              <s.icon className="w-5 h-5 text-accent mx-auto mb-2" /><p className="text-xl font-display font-bold text-primary-foreground">{s.value}</p><p className="text-xs text-primary-foreground/50">{s.label}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-primary-foreground">{levelInfo.next ? `Points to ${levelInfo.next}` : "Max Level! 💎"}</span>
            {levelInfo.next && <span className="text-xs text-accent font-medium">{customer.points} / {levelInfo.needed}</span>}
          </div>
          <div className="w-full h-2.5 rounded-full bg-primary/30">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ delay: 0.7, duration: 1 }} className="h-full rounded-full bg-gold-gradient" />
          </div>
          {levelInfo.next && <p className="text-xs text-primary-foreground/40 mt-2">{levelInfo.needed - customer.points > 0 ? `${levelInfo.needed - customer.points} points kale oo aad u baahan tahay! 🎉` : levelInfo.reward}</p>}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-xl p-5">
          <h3 className="font-display font-semibold text-primary-foreground text-sm mb-3">Reward Levels</h3>
          <div className="grid grid-cols-4 gap-2">
            {rewardLevels.map(level => (
              <div key={level.name} className={`rounded-lg p-2 text-center transition-all duration-200 ${level.active ? "bg-accent/20 border border-accent/30 shadow-gold" : "bg-primary/10"}`}>
                <span className="text-lg">{level.icon}</span>
                <p className={`text-[10px] font-semibold mt-1 ${level.active ? "text-accent" : "text-primary-foreground/50"}`}>{level.name}</p>
                <p className="text-[8px] text-primary-foreground/30">{level.range}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {orders.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="glass rounded-xl p-5">
            <h3 className="font-display font-semibold text-primary-foreground text-sm mb-3">Order-yadaadii ugu dambeeyay</h3>
            <div className="space-y-2">
              {orders.slice(-3).reverse().map(order => (
                <button key={order.id} onClick={() => navigate(`/order-tracking/${order.id}`)} className="w-full flex items-center justify-between py-2 border-b border-border/10 last:border-0 hover:bg-accent/5 rounded transition-colors">
                  <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-primary-foreground/40" /><div className="text-left"><p className="text-xs font-medium text-primary-foreground">{order.id}</p><p className="text-[10px] text-primary-foreground/40">{order.items?.length || 0} items · ${order.total?.toFixed(2)}</p></div></div>
                  <ChevronRight className="w-4 h-4 text-primary-foreground/30" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <Button variant="hero" size="xl" className="w-full" onClick={() => navigate(`/menu?table=1&business=1001`)}>
          <ShoppingBag className="mr-2" /> Browse Menu & Order
        </Button>
      </div>
    </div>
  );
};

export default CustomerDashboard;
