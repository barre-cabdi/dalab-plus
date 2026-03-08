import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Search, Star, Trash2, Send, UtensilsCrossed, Trophy, ChevronRight, User, Clock, ChefHat, Package, CheckCircle, MessageSquare, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCategories, getMenuItems, Category, MenuItem, seedDemoData, getBusinesses } from "@/lib/store";

type CartItem = { id: string; name: string; price: number; quantity: number; image: string };

const CustomerMenu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table") || "1";
  const businessId = searchParams.get("business") || "";
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

  useEffect(() => { const stored = localStorage.getItem("dp_customer"); if (stored) setCustomer(JSON.parse(stored)); }, []);
  useEffect(() => { if (!businessId) return; seedDemoData(businessId); setCategories(getCategories(businessId)); setMenuItems(getMenuItems(businessId).filter(m => m.available)); }, [businessId]);

  // Poll for active order status updates
  useEffect(() => {
    const pollOrders = () => {
      const stored = localStorage.getItem("dp_customer");
      if (!stored) return;
      const c = JSON.parse(stored);
      const allOrders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
      const myOrders = allOrders.filter((o: any) => o.customerId === c.id && o.businessId === businessId && o.status !== "delivered" && o.status !== "cancelled");
      setActiveOrders(myOrders);
      if (myOrders.length > 0) setShowOrderTracker(true);
      // Load messages for active orders
      const allMsgs = JSON.parse(localStorage.getItem("dp_order_messages") || "[]");
      const myMsgs = allMsgs.filter((m: any) => myOrders.some((o: any) => o.id === m.orderId));
      setOrderMessages(myMsgs);
    };
    pollOrders();
    const interval = setInterval(pollOrders, 3000);
    return () => clearInterval(interval);
  }, [businessId]);

  const business = getBusinesses().find(b => b.id === businessId);
  const businessName = business?.name || "DALABplus+";

  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  const filteredItems = menuItems.filter(item => {
    const matchCat = activeCategory === "all" || item.categoryId === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
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
    // Update customer stats in dp_customers store
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

  // Loyalty info
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
    <div className="min-h-screen bg-background pb-24">
      {/* Top Navbar - Clean & Light */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">{businessName}</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { key: "menu", label: "Menu" },
              { key: "orders", label: "My Orders" },
            ].map(nav => (
              <button
                key={nav.key}
                onClick={() => {
                  setActiveNav(nav.key);
                  if (nav.key === "orders") navigate(`/customer`);
                }}
                className={`text-sm font-medium transition-colors duration-200 relative pb-1 ${
                  activeNav === nav.key
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {nav.label}
                {activeNav === nav.key && (
                  <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                )}
              </button>
            ))}
          </div>
          {customer && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-9 h-9 rounded-full bg-muted border-2 border-border flex items-center justify-center cursor-pointer"
              onClick={() => navigate("/customer")}
            >
              <User className="w-4 h-4 text-muted-foreground" />
            </motion.div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Loyalty Card */}
        {customer && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-card border border-border rounded-2xl p-5 mb-8 shadow-card-custom"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-secondary" />
                <span className="font-display font-bold text-foreground">{customerLevel} Level</span>
              </div>
              <Badge className="bg-secondary/10 text-secondary border-secondary/20 font-bold">
                {customerPoints} pts
              </Badge>
            </div>
            <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                className="h-full rounded-full bg-secondary"
              />
            </div>
            {levelTarget.next && pointsToNext > 0 && (
              <p className="text-xs text-muted-foreground mt-2">{pointsToNext} points to {levelTarget.next}</p>
            )}
          </motion.div>
        )}

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-card border-border h-10"
          />
        </div>

        {/* Menu Categories - Tab Style */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="font-display font-bold text-xl text-foreground mb-4">Menu Categories</h2>
          <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
                activeCategory === "all"
                  ? "text-secondary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All
              {activeCategory === "all" && (
                <motion.div layoutId="cat-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
              )}
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all duration-200 relative ${
                  activeCategory === cat.id
                    ? "text-secondary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.name}
                {activeCategory === cat.id && (
                  <motion.div layoutId="cat-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Menu Items - Horizontal Cards */}
        <div className="grid md:grid-cols-2 gap-4">
          {filteredItems.length === 0 ? (
            <div className="col-span-2 text-center py-16">
              <p className="text-muted-foreground">No items found.</p>
            </div>
          ) : filteredItems.map((item, i) => {
            const inCart = cart.find(c => c.id === item.id);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}
                whileHover={{ y: -4, boxShadow: "0 12px 40px -12px hsl(var(--border))" }}
                className="bg-card border border-border rounded-xl overflow-hidden flex group cursor-default transition-shadow duration-300"
              >
                {/* Text side */}
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display font-semibold text-foreground text-sm">{item.name}</h3>
                      <span className="font-display font-bold text-secondary text-sm whitespace-nowrap">${item.price.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
                    {item.rating > 0 && (
                      <div className="flex items-center gap-1 mt-2">
                        <Star className="w-3 h-3 text-secondary fill-secondary" />
                        <span className="text-xs text-muted-foreground font-medium">{item.rating}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 h-7 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <motion.span
                          key={inCart.quantity}
                          initial={{ scale: 1.3 }}
                          animate={{ scale: 1 }}
                          className="text-sm font-bold text-foreground w-5 text-center"
                        >
                          {inCart.quantity}
                        </motion.span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:opacity-90 transition-all duration-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => addToCart(item)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:opacity-90 transition-all duration-200"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add to Cart
                      </motion.button>
                    )}
                  </div>
                </div>
                {/* Image side */}
                <div className="w-32 h-32 flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                  {isImageUrl(item.image) ? (
                    <motion.img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{item.image}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Floating Cart Bar */}
      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 right-6 left-6 md:left-auto md:right-8 md:max-w-sm z-50"
          >
            {/* Expanded cart */}
            <AnimatePresence>
              {showCart && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-card border border-border rounded-t-2xl shadow-hero overflow-hidden mb-0"
                >
                  <div className="p-4 max-h-[40vh] overflow-y-auto">
                    <h3 className="font-display font-bold text-foreground text-sm mb-3">Your Cart 🛒</h3>
                    <div className="space-y-2">
                      {cart.map(item => (
                        <motion.div
                          key={item.id}
                          layout
                          className="flex items-center justify-between py-2 border-b border-border/50 last:border-0"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-muted">
                              {isImageUrl(item.image) ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{item.image}</span>}
                            </div>
                            <div>
                              <p className="text-xs font-medium text-foreground">{item.name}</p>
                              <p className="text-[10px] text-muted-foreground">${item.price.toFixed(2)} × {item.quantity}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-secondary">${(item.price * item.quantity).toFixed(2)}</span>
                            <button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-destructive/60 hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart summary bar */}
            <motion.div
              className={`bg-foreground text-background flex items-center gap-3 px-4 py-3 cursor-pointer ${showCart ? "rounded-b-2xl" : "rounded-2xl"} shadow-hero`}
              onClick={() => setShowCart(!showCart)}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {cartCount}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs opacity-70">{cartCount} item{cartCount > 1 ? "s" : ""}</p>
                <p className="font-display font-bold text-sm">${cartTotal.toFixed(2)}</p>
              </div>
              <Button
                onClick={(e) => { e.stopPropagation(); confirmOrder(); }}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 gap-1.5 rounded-xl text-xs h-9"
              >
                View Cart <ChevronRight className="w-3.5 h-3.5" />
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
            className="fixed bottom-6 left-4 right-4 md:left-auto md:right-8 md:max-w-sm z-50"
          >
            <div className="bg-card border border-border rounded-2xl shadow-hero overflow-hidden">
              <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-display font-bold text-sm text-foreground">Dalabyadaada ({activeOrders.length})</span>
                </div>
                <button onClick={() => setShowOrderTracker(false)} className="text-muted-foreground hover:text-foreground">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
              <div className="max-h-[50vh] overflow-y-auto">
                {activeOrders.map(o => {
                  const statusConfig: Record<string, { icon: any; label: string; color: string }> = {
                    pending: { icon: Clock, label: "La sugayo...", color: "text-secondary" },
                    preparing: { icon: ChefHat, label: "La kariyaa 👨‍🍳", color: "text-accent" },
                    ready: { icon: Package, label: "Diyaar! ✅", color: "text-green-600" },
                  };
                  const status = statusConfig[o.status] || statusConfig.pending;
                  const StatusIcon = status.icon;
                  const msgs = orderMessages.filter((m: any) => m.orderId === o.id);

                  return (
                    <div key={o.id} className="p-4 border-b border-border/50 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            <StatusIcon className={`w-5 h-5 ${status.color}`} />
                          </motion.div>
                          <span className={`text-sm font-semibold ${status.color}`}>{status.label}</span>
                        </div>
                        <span className="font-display font-bold text-sm text-accent">${o.total.toFixed(2)}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mb-1">
                        {o.items.map((i: any) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                      <div className="flex gap-1 mt-2">
                        {["pending", "preparing", "ready"].map((step, idx) => (
                          <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                              ["pending", "preparing", "ready"].indexOf(o.status) >= idx
                                ? "bg-secondary"
                                : "bg-muted"
                            }`}
                          />
                        ))}
                      </div>
                      {/* Admin messages */}
                      {msgs.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {msgs.slice(-2).map((msg: any) => (
                            <div key={msg.id} className="flex items-start gap-1.5 bg-secondary/10 rounded-lg px-2.5 py-1.5">
                              <MessageSquare className="w-3 h-3 text-secondary mt-0.5 shrink-0" />
                              <p className="text-[11px] text-foreground">{msg.message}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => navigate(`/order-tracking/${o.id}`)}
                        className="text-[11px] text-secondary font-medium mt-2 flex items-center gap-1 hover:underline"
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
