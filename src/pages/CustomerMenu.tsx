import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Search, Star, Trash2, Send, UtensilsCrossed, Trophy, ChevronRight, User, Clock, ChefHat, Package, CheckCircle, MessageSquare, XCircle, Sparkles, ArrowRight, Zap, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCategories, getMenuItems, Category, MenuItem, seedDemoData, getBusinessById } from "@/lib/store";

type CartItem = { id: string; name: string; price: number; quantity: number; image: string };

const CustomerMenu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table") || "1";
  const businessId = searchParams.get("business") || "";
  const qrBusinessName = searchParams.get("name") || "";
  const qrBusinessLogo = searchParams.get("logo") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customer, setCustomer] = useState<any>(null);
  const [activeNav, setActiveNav] = useState("menu");
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const [orderMessages, setOrderMessages] = useState<any[]>([]);
  const [addedItemId, setAddedItemId] = useState<string | null>(null);

  useEffect(() => { const stored = localStorage.getItem("dp_customer"); if (stored) setCustomer(JSON.parse(stored)); }, []);
  useEffect(() => { if (!businessId) return; seedDemoData(businessId); setCategories(getCategories(businessId)); setMenuItems(getMenuItems(businessId).filter(m => m.available)); }, [businessId]);

  useEffect(() => {
    const pollOrders = () => {
      const stored = localStorage.getItem("dp_customer");
      if (!stored) return;
      const c = JSON.parse(stored);
      const allOrders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
      const myOrders = allOrders.filter((o: any) => o.customerId === c.id && o.businessId === businessId && o.status !== "delivered" && o.status !== "cancelled");
      setActiveOrders(myOrders);
      if (myOrders.length > 0) setShowOrderTracker(true);
      const allMsgs = JSON.parse(localStorage.getItem("dp_order_messages") || "[]");
      const myMsgs = allMsgs.filter((m: any) => myOrders.some((o: any) => o.id === m.orderId));
      setOrderMessages(myMsgs);
    };
    pollOrders();
    const interval = setInterval(pollOrders, 3000);
    return () => clearInterval(interval);
  }, [businessId]);

  const business = getBusinessById(businessId);
  const businessName = business?.name || qrBusinessName || customer?.businessName || "DALABplus+";
  const businessLogo = business?.logo || qrBusinessLogo || customer?.businessLogo || "";
  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  const filteredItems = menuItems.filter(item => {
    const matchCat = activeCategory === "all" || item.categoryId === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 600);
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const confirmOrder = () => {
    const orderId = `ORD-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
    const order = {
      id: orderId, items: cart, total: cartTotal, status: "pending",
      tableId, businessId, customerId: customer?.id,
      customerName: customer?.name || "Guest",
      customerPhone: customer?.phone || "",
      createdAt: new Date().toISOString()
    };
    const orders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
    orders.push(order);
    localStorage.setItem("dp_orders", JSON.stringify(orders));
    if (customer) {
      const allCustomers = JSON.parse(localStorage.getItem("dp_customers") || "[]");
      const updated = allCustomers.map((c: any) =>
        c.id === customer.id
          ? { ...c, totalOrders: (c.totalOrders || 0) + 1, totalSpent: (c.totalSpent || 0) + cartTotal, loyaltyPoints: (c.loyaltyPoints || 0) + Math.floor(cartTotal) }
          : c
      );
      localStorage.setItem("dp_customers", JSON.stringify(updated));
    }
    if (customer) {
      const points = Math.floor(cartTotal);
      customer.points = (customer.points || 0) + points;
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + cartTotal;
      if (customer.points >= 600) customer.level = "Platinum";
      else if (customer.points >= 300) customer.level = "Gold";
      else if (customer.points >= 100) customer.level = "Silver";
      else customer.level = "Bronze";
      localStorage.setItem("dp_customer", JSON.stringify(customer));
    }
    navigate(`/order-tracking/${orderId}`);
  };

  const customerLevel = customer?.level || "Bronze";
  const customerPoints = customer?.points || 0;
  const getLevelTarget = (level: string) => {
    switch (level) {
      case "Bronze": return { next: "Silver", needed: 100 };
      case "Silver": return { next: "Gold", needed: 300 };
      case "Gold": return { next: "Platinum", needed: 600 };
      default: return { next: null, needed: 600 };
    }
  };
  const levelTarget = getLevelTarget(customerLevel);
  const progressPercent = levelTarget.needed ? Math.min((customerPoints / levelTarget.needed) * 100, 100) : 100;
  const pointsToNext = levelTarget.needed - customerPoints;

  return (
    <div className="min-h-screen bg-hero pb-28">
      {/* Premium Header with Business Logo */}
      <header className="glass border-b border-border/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
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
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="font-display font-bold text-primary-foreground text-sm block leading-tight"
              >
                {businessName}
              </motion.span>
              <span className="text-[10px] text-primary-foreground/40 font-mono">Table #{tableId}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {[
              { key: "menu", label: "Menu", icon: UtensilsCrossed },
              { key: "orders", label: "My Orders", icon: ShoppingCart },
            ].map(nav => (
              <motion.button
                key={nav.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveNav(nav.key);
                  if (nav.key === "orders") navigate(`/customer?business=${businessId}`);
                }}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                  activeNav === nav.key
                    ? "bg-accent/20 text-accent border border-accent/30"
                    : "text-primary-foreground/40 hover:text-primary-foreground/70 hover:bg-primary-foreground/5"
                }`}
              >
                <nav.icon className="w-3.5 h-3.5" />
                {nav.label}
              </motion.button>
            ))}
          </div>
          {customer && (
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/customer")}
            >
              <span className="text-sm font-bold text-accent">{customer.name?.charAt(0) || "?"}</span>
            </motion.div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-5 max-w-4xl">
        {/* Loyalty Card */}
        {customer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass rounded-2xl p-4 mb-6 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-accent/8 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-3 relative">
              <div className="flex items-center gap-2.5">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                  className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center"
                >
                  <Trophy className="w-4 h-4 text-accent" />
                </motion.div>
                <div>
                  <span className="font-display font-bold text-primary-foreground text-sm">{customerLevel}</span>
                  <span className="text-[10px] text-primary-foreground/40 ml-1.5">Level</span>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/15 border border-accent/25"
              >
                <Zap className="w-3 h-3 text-accent" />
                <span className="text-xs font-bold text-accent">{customerPoints} pts</span>
              </motion.div>
            </div>
            <div className="w-full h-2.5 rounded-full bg-primary/20 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full rounded-full bg-gold-gradient relative"
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent border-2 border-accent-foreground" />
              </motion.div>
            </div>
            {levelTarget.next && pointsToNext > 0 && (
              <p className="text-[11px] text-primary-foreground/40 mt-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-accent" />
                {pointsToNext} points to <span className="font-semibold text-accent">{levelTarget.next}</span>
              </p>
            )}
          </motion.div>
        )}

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative mb-6"
        >
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
          <Input
            placeholder="Raadi cuntada..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 bg-primary-foreground/5 border-primary-foreground/10 h-11 rounded-xl text-sm text-primary-foreground placeholder:text-primary-foreground/25"
          />
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                activeCategory === "all"
                  ? "bg-gold-gradient text-accent-foreground shadow-gold"
                  : "glass text-primary-foreground/50 hover:text-primary-foreground/80"
              }`}
            >
              🍽️ All
            </motion.button>
            {categories.map((cat, i) => (
              <motion.button
                key={cat.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.04 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-gold-gradient text-accent-foreground shadow-gold"
                    : "glass text-primary-foreground/50 hover:text-primary-foreground/80"
                }`}
              >
                {cat.icon} {cat.name}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <div className="grid md:grid-cols-2 gap-3">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 text-center py-16">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="text-4xl block mb-3">🍽️</span>
                <p className="text-primary-foreground/40 text-sm">Wax cunto ah lama helin.</p>
              </motion.div>
            </div>
          ) : filteredItems.map((item, i) => {
            const inCart = cart.find(c => c.id === item.id);
            const justAdded = addedItemId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3 }}
                className={`glass rounded-2xl overflow-hidden flex group cursor-default transition-all duration-400 ${
                  justAdded ? "border-accent/50 shadow-gold" : "hover:border-accent/20"
                }`}
              >
                {/* Info */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-primary-foreground text-sm leading-snug">{item.name}</h3>
                      <span className="font-display font-bold text-accent text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-[11px] text-primary-foreground/35 mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                    {item.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-[11px] text-primary-foreground/50 font-medium">{item.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 rounded-xl border border-primary-foreground/15 flex items-center justify-center text-primary-foreground/50 hover:bg-destructive/20 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <motion.span
                          key={inCart.quantity}
                          initial={{ scale: 1.4 }}
                          animate={{ scale: 1 }}
                          className="text-sm font-bold text-primary-foreground w-6 text-center"
                        >
                          {inCart.quantity}
                        </motion.span>
                        <motion.button
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-xl bg-gold-gradient flex items-center justify-center text-accent-foreground transition-all duration-200 shadow-gold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-gradient text-accent-foreground text-xs font-semibold transition-all duration-200 shadow-gold hover:shadow-lg"
                      >
                        <Plus className="w-3.5 h-3.5" /> Ku dar
                      </motion.button>
                    )}
                  </div>
                </div>
                {/* Image */}
                <div className="w-28 h-full min-h-[120px] flex-shrink-0 bg-primary/30 flex items-center justify-center overflow-hidden relative">
                  {isImageUrl(item.image) ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <motion.span
                      className="text-4xl"
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring" }}
                    >
                      {item.image}
                    </motion.span>
                  )}
                  {justAdded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-accent/25 flex items-center justify-center"
                    >
                      <CheckCircle className="w-8 h-8 text-accent" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Powered by */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-primary-foreground/20 pt-8 pb-4"
        >
          Powered by <span className="text-accent/40 font-bold text-sm">DALABplus+</span>
        </motion.p>
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-5 right-4 left-4 md:left-auto md:right-6 md:max-w-sm z-50"
          >
            <AnimatePresence>
              {showCart && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-t-2xl overflow-hidden mb-0"
                >
                  <div className="p-4 max-h-[40vh] overflow-y-auto">
                    <h3 className="font-display font-bold text-primary-foreground text-sm mb-3 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-accent" /> Cart-kaaga
                    </h3>
                    <div className="space-y-2">
                      {cart.map(item => (
                        <motion.div key={item.id} layout className="flex items-center justify-between py-2.5 border-b border-primary-foreground/10 last:border-0">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center bg-primary/30">
                              {isImageUrl(item.image) ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{item.image}</span>}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-primary-foreground">{item.name}</p>
                              <p className="text-[10px] text-primary-foreground/35">${item.price.toFixed(2)} × {item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</span>
                            <motion.button whileHover={{ scale: 1.2 }} onClick={() => updateQuantity(item.id, -item.quantity)} className="text-destructive/50 hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div
              className={`bg-gold-gradient flex items-center gap-3 px-4 py-3 cursor-pointer ${showCart ? "rounded-b-2xl" : "rounded-2xl"} shadow-gold`}
              onClick={() => setShowCart(!showCart)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-accent-foreground" />
                <motion.span
                  key={cartCount}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center"
                >
                  {cartCount}
                </motion.span>
              </div>
              <div className="flex-1">
                <p className="text-[10px] text-accent-foreground/70">{cartCount} item{cartCount > 1 ? "s" : ""}</p>
                <p className="font-display font-bold text-sm text-accent-foreground">${cartTotal.toFixed(2)}</p>
              </div>
              <Button
                onClick={(e) => { e.stopPropagation(); confirmOrder(); }}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 rounded-xl text-xs h-9 font-semibold"
              >
                Order <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Order Tracker */}
      <AnimatePresence>
        {showOrderTracker && activeOrders.length > 0 && cartCount === 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50"
          >
            <div className="glass rounded-2xl overflow-hidden border border-accent/20">
              <div className="px-4 py-3 border-b border-primary-foreground/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2.5 h-2.5 rounded-full bg-green-500"
                    animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span className="font-display font-bold text-sm text-primary-foreground">Dalabyadaada ({activeOrders.length})</span>
                </div>
                <button onClick={() => setShowOrderTracker(false)} className="text-primary-foreground/30 hover:text-primary-foreground/70 transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {activeOrders.map(o => {
                  const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
                    pending: { icon: Clock, label: "La sugayo...", color: "text-accent" },
                    accepted: { icon: CheckCircle, label: "La aqbalay ✅", color: "text-accent" },
                    preparing: { icon: ChefHat, label: "La kariyaa 👨‍🍳", color: "text-accent" },
                    ready: { icon: Package, label: "Diyaar! ✅", color: "text-green-500" },
                  };
                  const status = statusConfig[o.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const msgs = orderMessages.filter((m: any) => m.orderId === o.id);

                  return (
                    <div key={o.id} className="p-4 border-b border-primary-foreground/5 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          </motion.div>
                          <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
                        </div>
                        <span className="font-display font-bold text-sm text-accent">${o.total.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-primary-foreground/30 mb-2">
                        {o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                      <div className="flex gap-1">
                        {["pending", "accepted", "preparing", "ready"].map((step, idx) => (
                          <motion.div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              ["pending", "accepted", "preparing", "ready"].indexOf(o.status) >= idx ? "bg-gold-gradient" : "bg-primary/20"
                            }`}
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: idx * 0.15 }}
                          />
                        ))}
                      </div>
                      {msgs.length > 0 && (
                        <div className="mt-2.5 space-y-1">
                          {msgs.slice(-2).map((msg: any) => (
                            <div key={msg.id} className="flex items-start gap-1.5 bg-accent/10 rounded-xl px-3 py-2">
                              <MessageSquare className="w-3 h-3 text-accent mt-0.5 shrink-0" />
                              <p className="text-[11px] text-primary-foreground/70">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/order-tracking/${o.id}`)}
                        className="text-[11px] text-accent font-semibold mt-2 flex items-center gap-1 hover:gap-2 transition-all duration-200"
                      >
                        Faahfaahin <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerMenu;