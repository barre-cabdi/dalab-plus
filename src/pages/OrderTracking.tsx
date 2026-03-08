import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Truck, CheckCircle, Home, Star, Trophy, Gift, ArrowRight, Package } from "lucide-react";

const statusSteps = [
  { key: "pending", label: "La sugayo", icon: Clock, color: "text-muted-foreground" },
  { key: "accepted", label: "La aqbalay", icon: CheckCircle, color: "text-accent" },
  { key: "preparing", label: "La kariyaa", icon: ChefHat, color: "text-accent" },
  { key: "ready", label: "Diyaar", icon: Package, color: "text-accent" },
  { key: "on_the_way", label: "Socda", icon: Truck, color: "text-accent" },
  { key: "delivered", label: "La keenay", icon: CheckCircle, color: "text-accent" },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [customer, setCustomer] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);

  useEffect(() => {
    const orders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
    const found = orders.find((o: any) => o.id === orderId);
    if (found) setOrder(found);
    const stored = localStorage.getItem("dp_customer");
    if (stored) {
      const c = JSON.parse(stored);
      setCustomer(c);
      if (c.points >= 100 && c.level === "Silver") setShowReward(true);
    }
  }, [orderId]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < statusSteps.length - 1) return prev + 1;
        clearInterval(interval);
        return prev;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const getLevelInfo = (level: string) => {
    switch (level) {
      case "Silver": return { color: "text-muted-foreground", next: "Gold", needed: 300, reward: "Cabbitaan bilaash ah! 🥤" };
      case "Gold": return { color: "text-accent", next: "Platinum", needed: 600, reward: "Cunto bilaash ah! 🍽️" };
      case "Platinum": return { color: "text-accent", next: null, needed: 0, reward: "10% Discount! 💎" };
      default: return { color: "text-accent", next: "Silver", needed: 100, reward: "" };
    }
  };

  if (!order) return (<div className="min-h-screen bg-hero flex items-center justify-center"><p className="text-primary-foreground/60">Order not found</p></div>);

  const levelInfo = customer ? getLevelInfo(customer.level) : null;
  const earnedPoints = Math.floor(order.total);

  return (
    <div className="min-h-screen bg-hero">
      <header className="glass border-b border-border/20 px-4 py-3 flex items-center justify-between">
        <div><p className="font-display font-bold text-primary-foreground text-sm">Order Tracking</p><p className="text-[10px] text-primary-foreground/40 font-mono">{orderId}</p></div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/customer")} className="text-primary-foreground/60"><Home className="w-4 h-4" /></Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-5">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-4 text-center">
          <motion.div initial={{ rotate: -10 }} animate={{ rotate: [0, 10, -10, 0] }} transition={{ delay: 0.5, duration: 0.5 }}><Star className="w-8 h-8 text-accent mx-auto mb-2" /></motion.div>
          <p className="font-display font-bold text-accent text-lg">+{earnedPoints} Points!</p>
          <p className="text-xs text-primary-foreground/50">Order-kaaga waad ku heshay {earnedPoints} points</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass rounded-xl p-5">
          <h3 className="font-display font-semibold text-primary-foreground text-sm mb-4">Xaalada Order-ka</h3>
          <div className="space-y-0">
            {statusSteps.map((step, i) => {
              const isActive = i <= currentStep;
              const isCurrent = i === currentStep;
              return (
                <div key={step.key} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <motion.div initial={{ scale: 0.5, opacity: 0.3 }} animate={{ scale: isCurrent ? 1.2 : isActive ? 1 : 0.8, opacity: isActive ? 1 : 0.3 }} transition={{ duration: 0.4 }} className={`w-8 h-8 rounded-full flex items-center justify-center ${isCurrent ? "bg-gold-gradient shadow-gold animate-pulse-gold" : isActive ? "bg-accent/20" : "bg-primary/20"}`}>
                      <step.icon className={`w-4 h-4 ${isCurrent ? "text-accent-foreground" : isActive ? "text-accent" : "text-primary-foreground/30"}`} />
                    </motion.div>
                    {i < statusSteps.length - 1 && <div className={`w-0.5 h-8 ${isActive ? "bg-accent/40" : "bg-primary/20"}`} />}
                  </div>
                  <div className="pb-6">
                    <p className={`text-sm font-medium ${isCurrent ? "text-accent" : isActive ? "text-primary-foreground" : "text-primary-foreground/30"}`}>{step.label}</p>
                    {isCurrent && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-primary-foreground/40 mt-0.5">Hadda socota...</motion.p>}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass rounded-xl p-5">
          <h3 className="font-display font-semibold text-primary-foreground text-sm mb-3">Waxaad dalbatay</h3>
          <div className="space-y-2">
            {order.items.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2"><span>{item.image}</span><span className="text-xs text-primary-foreground">{item.name} × {item.quantity}</span></div>
                <span className="text-xs font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border/20 pt-2 mt-2 flex items-center justify-between">
              <span className="text-sm font-bold text-primary-foreground">Wadarta</span>
              <span className="text-sm font-bold text-accent">${order.total.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {customer && levelInfo && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3"><Trophy className={`w-5 h-5 ${levelInfo.color}`} /><span className="font-display font-semibold text-primary-foreground text-sm">{customer.level} Level</span></div>
            {levelInfo.next && (
              <>
                <div className="flex items-center justify-between mb-2"><span className="text-xs text-primary-foreground/50">{customer.level} <ArrowRight className="w-3 h-3 inline" /> {levelInfo.next}</span><span className="text-xs text-accent font-medium">{customer.points} / {levelInfo.needed}</span></div>
                <div className="w-full h-2 rounded-full bg-primary/30"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min((customer.points / levelInfo.needed) * 100, 100)}%` }} transition={{ delay: 0.8, duration: 1 }} className="h-full rounded-full bg-gold-gradient" /></div>
                <p className="text-[10px] text-primary-foreground/40 mt-2">{levelInfo.needed - customer.points > 0 ? `${levelInfo.needed - customer.points} points kale ayaad u baahan tahay ${levelInfo.next}!` : levelInfo.reward}</p>
              </>
            )}
            {!levelInfo.next && <p className="text-xs text-accent">{levelInfo.reward}</p>}
          </motion.div>
        )}

        {showReward && (
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-xl p-5 border border-accent/30 text-center">
            <Gift className="w-10 h-10 text-accent mx-auto mb-2 animate-pulse-gold" />
            <h3 className="font-display font-bold text-accent text-lg">Hambalyo! 🎉</h3>
            <p className="text-xs text-primary-foreground/60 mt-1">Waxaad gaadhay level cusub! Reward-kaaga soo qaado.</p>
            <Button variant="hero" size="sm" className="mt-3">Claim Reward</Button>
          </motion.div>
        )}

        <div className="flex gap-3">
          <Button variant="hero-outline" className="flex-1" onClick={() => navigate("/customer")}>Dashboard</Button>
          <Button variant="hero" className="flex-1" onClick={() => navigate(`/menu?table=${order.tableId}&business=${order.businessId}`)}>Dib u dalbo</Button>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
