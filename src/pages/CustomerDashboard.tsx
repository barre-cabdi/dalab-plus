import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Gift, ShoppingBag, Star, Trophy, LogOut, Clock, ChevronRight, Sparkles, Crown, Zap, TrendingUp, Eye, EyeOff, Store, Flame, Award, Gem } from "lucide-react";
import { getBusinessById } from "@/lib/store";

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlBusinessId = searchParams.get("business") || "";
  const [customer, setCustomer] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [animatePoints, setAnimatePoints] = useState(false);
  const [showSpent, setShowSpent] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dp_customer");
    if (stored) setCustomer(JSON.parse(stored));
    else { navigate("/register?table=1&business=1001"); return; }
    const storedOrders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
    setOrders(storedOrders);
    setTimeout(() => setAnimatePoints(true), 800);
  }, [navigate]);

  if (!customer) return null;

  // Get business info for branding - use persistent branding store
  const lastOrder = orders[orders.length - 1];
  const businessId = urlBusinessId || customer.businessId || lastOrder?.businessId || "1001";
  const [businessData, setBusinessData] = useState<any>(null);
  useEffect(() => { getBusinessById(businessId).then(b => setBusinessData(b || null)); }, [businessId]);
  const branding = (() => { try { return JSON.parse(localStorage.getItem("dp_customer_branding") || "{}"); } catch { return {}; } })();
  const businessName = businessData?.name || branding.businessName || customer?.businessName || "DALABplus+";
  const businessLogo = businessData?.logo || branding.businessLogo || customer?.businessLogo || "";
  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  const getLevelInfo = (level: string) => {
    switch (level) {
      case "Silver": return { next: "Gold", needed: 300, reward: "Cabbitaan bilaash ah! 🥤", emoji: "🥈", color: "from-gray-400 to-gray-300" };
      case "Gold": return { next: "Platinum", needed: 600, reward: "Cunto bilaash ah! 🍽️", emoji: "🥇", color: "from-yellow-500 to-amber-400" };
      case "Platinum": return { next: null, needed: 0, reward: "10% Discount! 💎", emoji: "💎", color: "from-cyan-400 to-blue-500" };
      default: return { next: "Silver", needed: 100, reward: "", emoji: "🥉", color: "from-amber-700 to-amber-600" };
    }
  };

  const levelInfo = getLevelInfo(customer.level);
  const progress = levelInfo.needed ? Math.min((customer.points / levelInfo.needed) * 100, 100) : 100;

  const rewardLevels = [
    { name: "Bronze", range: "0–100", icon: "🥉", active: customer.level === "Bronze", points: 0 },
    { name: "Silver", range: "100+", icon: "🥈", active: customer.level === "Silver", points: 100 },
    { name: "Gold", range: "300+", icon: "🥇", active: customer.level === "Gold", points: 300 },
    { name: "Platinum", range: "600+", icon: "💎", active: customer.level === "Platinum", points: 600 },
  ];

  const currentLevelIndex = rewardLevels.findIndex(l => l.active);

  const spentDisplay = showSpent ? `$${customer.totalSpent?.toFixed(0) || 0}` : "****";

  return (
    <div className="min-h-screen bg-hero relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-accent/3 blur-[100px] pointer-events-none" />

      {/* Header with Business Logo */}
      <header className="glass border-b border-border/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-xl overflow-hidden shadow-gold flex items-center justify-center bg-gold-gradient"
          >
            {businessLogo && isImageUrl(businessLogo) ? (
              <img src={businessLogo} alt={businessName} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-accent-foreground" />
            )}
          </motion.div>
          <div>
            <span className="font-display font-bold text-primary-foreground text-sm block leading-tight">{businessName}</span>
            <span className="text-[10px] text-primary-foreground/40">Member Dashboard</span>
          </div>
        </div>
        <Link to="/login">
          <Button variant="ghost" size="sm" className="text-primary-foreground/40 hover:text-primary-foreground/70">
            <LogOut className="w-4 h-4" />
          </Button>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-5 relative z-10">
        {/* Profile Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative glass rounded-3xl p-6 overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative flex items-start gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold">
                <span className="font-display font-bold text-accent-foreground text-2xl">
                  {customer.name?.charAt(0) || "?"}
                </span>
              </div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center"
              >
                <span className="text-xs">{levelInfo.emoji}</span>
              </motion.div>
            </motion.div>
            
            <div className="flex-1 min-w-0">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display font-bold text-lg text-primary-foreground truncate"
              >
                {customer.name}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs text-primary-foreground/40 font-mono mb-2"
              >
                {customer.id}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/15 border border-accent/25"
              >
                <Crown className="w-3 h-3 text-accent" />
                <span className="text-[11px] font-bold text-accent">{customer.level} Member</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Orders", value: customer.totalOrders || 0, icon: Flame, delay: 0.3 },
            { label: "Points", value: customer.points || 0, icon: Gem, delay: 0.4 },
            { label: "Spent", value: spentDisplay, icon: Award, delay: 0.5, hasToggle: true },
          ].map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: s.delay, type: "spring", stiffness: 200 }}
              whileHover={{ scale: 1.05, y: -2 }}
              className="glass rounded-2xl p-4 text-center group cursor-default relative"
            >
              <motion.div
                className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-accent/20 transition-colors duration-300"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.4 }}
              >
                <s.icon className="w-5 h-5 text-accent" />
              </motion.div>
              <motion.p
                className="text-xl font-display font-bold text-primary-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: s.delay + 0.2 }}
              >
                {s.value}
              </motion.p>
              <p className="text-[10px] text-primary-foreground/40 font-medium uppercase tracking-wider mt-0.5">{s.label}</p>
              {s.hasToggle && (
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowSpent(!showSpent)}
                  className="absolute top-2 right-2 p-1 text-primary-foreground/25 hover:text-accent transition-colors"
                >
                  {showSpent ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </motion.button>
              )}
            </motion.div>
          ))}
        </div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="glass rounded-2xl p-5 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-20 h-20 bg-accent/5 rounded-full blur-2xl" />
          <div className="flex items-center justify-between mb-4 relative">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-sm font-display font-bold text-primary-foreground">
                {levelInfo.next ? `${levelInfo.next} Level` : "Max Level! 💎"}
              </span>
            </div>
            {levelInfo.next && (
              <span className="text-xs text-accent font-bold bg-accent/10 px-2.5 py-1 rounded-full">
                {customer.points} / {levelInfo.needed}
              </span>
            )}
          </div>
          <div className="w-full h-3 rounded-full bg-primary/20 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ delay: 0.8, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full bg-gold-gradient relative"
            >
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-2 border-accent-foreground shadow-gold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8, type: "spring" }}
              />
            </motion.div>
          </div>
          {levelInfo.next && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-xs text-primary-foreground/40 mt-3"
            >
              {levelInfo.needed - customer.points > 0
                ? `${levelInfo.needed - customer.points} points kale oo aad u baahan tahay! 🎉`
                : levelInfo.reward}
            </motion.p>
          )}
        </motion.div>

        {/* Reward Levels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display font-bold text-primary-foreground text-sm mb-4 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-accent" /> Reward Levels
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {rewardLevels.map((level, i) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.08, type: "spring" }}
                whileHover={{ scale: 1.08, y: -3 }}
                className={`rounded-xl p-3 text-center cursor-default transition-all duration-300 relative ${
                  level.active
                    ? "bg-accent/15 border-2 border-accent/30 shadow-gold"
                    : i <= currentLevelIndex
                    ? "bg-accent/5 border border-accent/10"
                    : "bg-primary/10 border border-primary/10"
                }`}
              >
                {level.active && (
                  <motion.div
                    className="absolute inset-0 rounded-xl border-2 border-accent/20"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
                <motion.span
                  className="text-2xl block"
                  animate={level.active ? { scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {level.icon}
                </motion.span>
                <p className={`text-[10px] font-bold mt-1.5 ${level.active ? "text-accent" : "text-primary-foreground/50"}`}>
                  {level.name}
                </p>
                <p className="text-[8px] text-primary-foreground/25 mt-0.5">{level.range}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        {orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="glass rounded-2xl p-5"
          >
            <h3 className="font-display font-bold text-primary-foreground text-sm mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" /> Order-yadaadii ugu dambeeyay
            </h3>
            <div className="space-y-1">
              {orders.slice(-3).reverse().map((order, i) => (
                <motion.button
                  key={order.id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.08 }}
                  whileHover={{ x: 4, backgroundColor: "hsl(45 100% 55% / 0.05)" }}
                  onClick={() => navigate(`/order-tracking/${order.id}`)}
                  className="w-full flex items-center justify-between py-3 px-3 rounded-xl border border-transparent hover:border-accent/10 transition-all duration-300 group"
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ rotate: [0, -5, 5, 0] }}
                      className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4 text-accent" />
                    </motion.div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-primary-foreground">{order.id}</p>
                      <p className="text-[10px] text-primary-foreground/35">
                        {order.items?.length || 0} items · <span className="text-accent font-medium">${order.total?.toFixed(2)}</span>
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary-foreground/20 group-hover:text-accent group-hover:translate-x-1 transition-all duration-300" />
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            variant="hero"
            size="xl"
            className="w-full rounded-2xl gap-2"
            onClick={() => navigate(`/menu?table=${customer.tableId || "1"}&business=${businessId}`)}
          >
            <ShoppingBag className="mr-1" /> Browse Menu & Order
          </Button>
        </motion.div>

        {/* Powered by - Bigger & Bolder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center pb-6 pt-2"
        >
          <p className="text-[11px] text-primary-foreground/25 mb-1">Powered by</p>
          <motion.p
            whileHover={{ scale: 1.05 }}
            className="font-display font-black text-xl text-accent/40 tracking-tight"
          >
            DALABplus+
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerDashboard;