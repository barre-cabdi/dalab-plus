import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, ChefHat, Truck, CheckCircle, Home, Star, Trophy, Gift, ArrowRight, Package, MessageSquare, ShoppingBag, Sparkles, Store, Hourglass } from "lucide-react";
import { getBusinessById } from "@/lib/store";

const statusSteps = [
  { key: "pending", label: "La sugayo", sublabel: "Order-kaaga la helay", emoji: "⏳" },
  { key: "accepted", label: "La aqbalay", sublabel: "Admin/Cashier wuu aqbalay", emoji: "✅" },
  { key: "preparing", label: "La kariyaa", sublabel: "Kitchen-ka ku jira", emoji: "👨‍🍳" },
  { key: "ready", label: "Diyaar", sublabel: "Cuntadaadu way diyaar tahay", emoji: "📦" },
  { key: "on_the_way", label: "Socda", sublabel: "Waiter-ku wuu keenayaa", emoji: "🚀" },
  { key: "delivered", label: "La keenay", sublabel: "Cunto wanaagsan!", emoji: "🎉" },
];

const OrderTracking = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [showReward, setShowReward] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const loadData = () => {
      const orders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
      const found = orders.find((o: any) => o.id === orderId);
      if (found) setOrder(found);
      const stored = localStorage.getItem("dp_customer");
      if (stored) {
        const c = JSON.parse(stored);
        setCustomer(c);
        if (c.points >= 100 && c.level === "Silver") setShowReward(true);
      }
      const allMessages = JSON.parse(localStorage.getItem("dp_order_messages") || "[]");
      setMessages(allMessages.filter((m: any) => m.orderId === orderId));
    };
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [orderId]);

  // Determine current step from actual order status (no auto-increment)
  const getCurrentStep = (status: string) => {
    const idx = statusSteps.findIndex(s => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const getLevelInfo = (level: string) => {
    switch (level) {
      case "Silver": return { next: "Gold", needed: 300, reward: "Cabbitaan bilaash ah! 🥤" };
      case "Gold": return { next: "Platinum", needed: 600, reward: "Cunto bilaash ah! 🍽️" };
      case "Platinum": return { next: null, needed: 0, reward: "10% Discount! 💎" };
      default: return { next: "Silver", needed: 100, reward: "" };
    }
  };

  if (!order) return (
    <div className="min-h-screen bg-hero flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full mx-auto mb-4"
        />
        <p className="text-primary-foreground/50 text-sm">Loading order...</p>
      </motion.div>
    </div>
  );

  const [businessData, setBusinessData] = useState<any>(null);
  useEffect(() => { if (order) getBusinessById(order.businessId).then(b => setBusinessData(b || null)); }, [order?.businessId]);
  const branding = (() => { try { return JSON.parse(localStorage.getItem("dp_customer_branding") || "{}"); } catch { return {}; } })();
  const businessName = businessData?.name || branding.businessName || customer?.businessName || "DALABplus+";
  const businessLogo = businessData?.logo || branding.businessLogo || customer?.businessLogo || "";
  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");
  const currentStep = getCurrentStep(order.status);
  const isAccepted = currentStep >= 1; // Only show processing after accepted
  const levelInfo = customer ? getLevelInfo(customer.level) : null;
  const earnedPoints = Math.floor(order.total);

  return (
    <div className="min-h-screen bg-hero relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-0 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/3 blur-[100px] pointer-events-none" />

      {/* Header with Business Logo */}
      <header className="glass border-b border-border/10 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.08 }}
            className="w-10 h-10 rounded-xl overflow-hidden shadow-gold flex items-center justify-center bg-gold-gradient"
          >
            {businessLogo && isImageUrl(businessLogo) ? (
              <img src={businessLogo} alt={businessName} className="w-full h-full object-cover" />
            ) : (
              <Store className="w-5 h-5 text-accent-foreground" />
            )}
          </motion.div>
          <div>
            <p className="font-display font-bold text-primary-foreground text-sm">{businessName}</p>
            <p className="text-[10px] text-primary-foreground/35 font-mono">{orderId}</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/customer")} className="text-primary-foreground/40 hover:text-primary-foreground/70">
          <Home className="w-4 h-4" />
        </Button>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-md space-y-5 relative z-10">
        {/* Waiting for Accept Banner */}
        {!isAccepted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="glass rounded-2xl p-6 text-center border border-accent/20"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 rounded-2xl bg-accent/15 mx-auto mb-4 flex items-center justify-center"
            >
              <Hourglass className="w-8 h-8 text-accent" />
            </motion.div>
            <h3 className="font-display font-bold text-primary-foreground text-lg mb-1">Order-kaaga la diray ✨</h3>
            <p className="text-xs text-primary-foreground/40">Admin/Cashier-ku wuu eegayaa order-kaaga. Fadlan sug...</p>
            <motion.div
              className="flex gap-1 mt-4 max-w-[200px] mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="h-1.5 flex-1 rounded-full bg-accent/20"
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* Points Earned Card - only after accepted */}
        {isAccepted && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="glass rounded-2xl p-5 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-accent/5 rounded-2xl" />
            <div className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
              >
                <div className="w-14 h-14 rounded-2xl bg-gold-gradient mx-auto mb-3 flex items-center justify-center shadow-gold">
                  <Star className="w-7 h-7 text-accent-foreground" />
                </div>
              </motion.div>
              <motion.p
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="font-display font-bold text-accent text-2xl"
              >
                +{earnedPoints}
              </motion.p>
              <p className="text-[11px] text-primary-foreground/45 mt-1">Points earned from this order</p>
            </div>
          </motion.div>
        )}

        {/* Order Status Timeline - only after accepted */}
        {isAccepted && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl p-6"
          >
            <h3 className="font-display font-bold text-primary-foreground text-sm mb-5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" /> Xaalada Order-ka
            </h3>
            <div className="space-y-0">
              {statusSteps.slice(1).map((step, i) => {
                const actualIndex = i + 1;
                const isActive = actualIndex <= currentStep;
                const isCurrent = actualIndex === currentStep;
                const isPast = actualIndex < currentStep;
                return (
                  <motion.div
                    key={step.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={isCurrent ? {
                          scale: [1, 1.15, 1],
                          boxShadow: ["0 0 0 0 hsl(45 100% 50% / 0.2)", "0 0 0 8px hsl(45 100% 50% / 0)", "0 0 0 0 hsl(45 100% 50% / 0.2)"],
                        } : {}}
                        transition={isCurrent ? { duration: 2, repeat: Infinity } : {}}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                          isCurrent
                            ? "bg-gold-gradient shadow-gold"
                            : isPast
                            ? "bg-accent/20 border border-accent/30"
                            : "bg-primary/15 border border-primary/20"
                        }`}
                      >
                        {isPast ? (
                          <CheckCircle className="w-5 h-5 text-accent" />
                        ) : (
                          <span className={`text-lg ${!isActive ? "opacity-30" : ""}`}>{step.emoji}</span>
                        )}
                      </motion.div>
                      {i < statusSteps.length - 2 && (
                        <motion.div
                          className={`w-0.5 h-10 transition-all duration-700 ${isActive ? "bg-accent/30" : "bg-primary/15"}`}
                          initial={{ scaleY: 0 }}
                          animate={{ scaleY: 1 }}
                          transition={{ delay: 0.4 + i * 0.1 }}
                        />
                      )}
                    </div>
                    <div className="pb-8 pt-1">
                      <p className={`text-sm font-semibold transition-colors duration-300 ${
                        isCurrent ? "text-accent" : isPast ? "text-primary-foreground/80" : "text-primary-foreground/25"
                      }`}>
                        {step.label}
                      </p>
                      <p className={`text-[11px] mt-0.5 transition-colors duration-300 ${
                        isCurrent ? "text-primary-foreground/50" : "text-primary-foreground/20"
                      }`}>
                        {step.sublabel}
                      </p>
                      {isCurrent && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 40 }}
                          className="h-0.5 bg-accent/40 rounded-full mt-2"
                        />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl p-5"
        >
          <h3 className="font-display font-bold text-primary-foreground text-sm mb-4 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-accent" /> Waxaad dalbatay
          </h3>
          <div className="space-y-3">
            {order.items.map((item: any, i: number) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
                className="flex items-center justify-between py-2 group"
              >
                <div className="flex items-center gap-3">
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-lg"
                  >
                    {item.image}
                  </motion.div>
                  <div>
                    <span className="text-xs font-medium text-primary-foreground">{item.name}</span>
                    <span className="text-[10px] text-primary-foreground/30 ml-1.5">× {item.quantity}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</span>
              </motion.div>
            ))}
            <div className="border-t border-border/15 pt-3 mt-3 flex items-center justify-between">
              <span className="text-sm font-display font-bold text-primary-foreground">Wadarta</span>
              <motion.span
                className="text-base font-display font-bold text-accent"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
              >
                ${order.total.toFixed(2)}
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Admin Messages */}
        <AnimatePresence>
          {messages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-4 h-4 text-accent" />
                <h3 className="font-display font-bold text-primary-foreground text-sm">Fariimo</h3>
              </div>
              <div className="space-y-2">
                {messages.map((msg: any, i: number) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-accent/8 rounded-xl p-3.5 border border-accent/15"
                  >
                    <p className="text-xs text-primary-foreground/80">{msg.message}</p>
                    <p className="text-[9px] text-primary-foreground/30 mt-1.5">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loyalty Progress */}
        {customer && levelInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-4 h-4 text-accent" />
              <span className="font-display font-bold text-primary-foreground text-sm">{customer.level} Level</span>
            </div>
            {levelInfo.next && (
              <>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-xs text-primary-foreground/40">{customer.level} <ArrowRight className="w-3 h-3 inline text-accent/40" /> {levelInfo.next}</span>
                  <span className="text-xs text-accent font-bold">{customer.points} / {levelInfo.needed}</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-primary/15 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((customer.points / levelInfo.needed) * 100, 100)}%` }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className="h-full rounded-full bg-gold-gradient"
                  />
                </div>
                <p className="text-[10px] text-primary-foreground/30 mt-2">
                  {levelInfo.needed - customer.points > 0 ? `${levelInfo.needed - customer.points} points kale ayaad u baahan tahay ${levelInfo.next}!` : levelInfo.reward}
                </p>
              </>
            )}
            {!levelInfo.next && <p className="text-xs text-accent">{levelInfo.reward}</p>}
          </motion.div>
        )}

        {/* Reward Celebration */}
        <AnimatePresence>
          {showReward && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="glass rounded-2xl p-6 border border-accent/25 text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-accent/5" />
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Gift className="w-12 h-12 text-accent mx-auto mb-3" />
                </motion.div>
                <h3 className="font-display font-bold text-accent text-lg">Hambalyo! 🎉</h3>
                <p className="text-xs text-primary-foreground/50 mt-2">Waxaad gaadhay level cusub! Reward-kaaga soo qaado.</p>
                <Button variant="hero" size="sm" className="mt-4 rounded-xl">Claim Reward</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex gap-3"
        >
          <Button variant="hero-outline" className="flex-1 rounded-xl" onClick={() => navigate("/customer")}>
            Dashboard
          </Button>
          <Button variant="hero" className="flex-1 rounded-xl" onClick={() => navigate(`/menu?table=${order.tableId}&business=${order.businessId}`)}>
            Dib u dalbo
          </Button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-primary-foreground/20 pb-4"
        >
          Powered by <span className="text-accent/40 font-bold text-sm">DALABplus+</span>
        </motion.p>
      </div>
    </div>
  );
};

export default OrderTracking;