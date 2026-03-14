import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  LogOut, User, ShoppingBag, Plus, Minus, Search, ClipboardList, UtensilsCrossed,
  Bell, MessageSquare, Clock, CheckCircle2, ChefHat, Package, XCircle,
  TrendingUp, DollarSign, Send, Volume2, Globe,
} from "lucide-react";
import {
  StaffMember, Business, MenuItem, Category, Order, TableItem,
  getCategories, getMenuItems, getTables, getOrders, generateId, saveOrder, getStaff,
} from "@/lib/store";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const [waiter, setWaiter] = useState<StaffMember | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "notifications" | "profile">("menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; image: string }[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [messageDialog, setMessageDialog] = useState<{ orderId: string; } | null>(null);
  const [messageText, setMessageText] = useState("");
  const prevOrderStatesRef = useRef<Record<string, string>>({});
  const audioContextRef = useRef<AudioContext | null>(null);
  const prevFeedbackCountRef = useRef(0);

  const statusConfig: Record<string, { label: string; icon: any; color: string; bgColor: string }> = {
    pending: { label: t.wtPending.replace("⏳ ", ""), icon: Clock, color: "text-amber-600", bgColor: "bg-amber-500/15 border-amber-500/30" },
    preparing: { label: t.wtPreparing.replace("👨‍🍳 ", ""), icon: ChefHat, color: "text-blue-600", bgColor: "bg-blue-500/15 border-blue-500/30" },
    ready: { label: t.wtReady.replace("✅ ", ""), icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-500/15 border-green-500/30" },
    delivered: { label: t.wtDelivered.replace("📦 ", ""), icon: Package, color: "text-muted-foreground", bgColor: "bg-muted/50 border-border" },
    cancelled: { label: t.wtCancelledCount, icon: XCircle, color: "text-destructive", bgColor: "bg-destructive/10 border-destructive/30" },
    paid: { label: t.csPaid, icon: DollarSign, color: "text-accent", bgColor: "bg-accent/15 border-accent/30" },
  };

  useEffect(() => {
    const w = localStorage.getItem("dp_active_waiter");
    const b = localStorage.getItem("dp_active_business");
    if (w && b) {
      const waiterData = JSON.parse(w);
      const bizData = JSON.parse(b);
      setWaiter(waiterData);
      setBusiness(bizData);
      const load = async () => {
        setCategories(await getCategories(bizData.id));
        setMenuItems(await getMenuItems(bizData.id));
        setTables(await getTables(bizData.id));
        const initialOrders = await getOrders(bizData.id);
        setOrders(initialOrders);
        const stateMap: Record<string, string> = {};
        initialOrders.forEach(o => { stateMap[o.id] = o.status; });
        prevOrderStatesRef.current = stateMap;
      };
      load();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (!business || !waiter) return;
    const interval = setInterval(async () => {
      const currentOrders = await getOrders(business.id);
      const waiterCurrentOrders = currentOrders.filter(o => o.customerId === waiter.id || (o as any).waiterId === waiter.id);
      
      waiterCurrentOrders.forEach(o => {
        const prevStatus = prevOrderStatesRef.current[o.id];
        if (prevStatus && prevStatus !== o.status) {
          const cfg = statusConfig[o.status];
          playNotificationSound(o.status === "ready" ? "ready" : "update");
          toast.success(`🔔 Order #${o.id.slice(4, 12)} - ${cfg?.label || o.status}!`, { duration: 5000 });
          setUnreadCount(prev => prev + 1);
        }
      });

      const allMessages = JSON.parse(localStorage.getItem("dp_order_messages") || "[]");
      const adminMessages = allMessages.filter((msg: any) => 
        msg.businessId === business.id && msg.from === "admin" &&
        waiterCurrentOrders.some((o: Order) => o.id === msg.orderId)
      );
      if (prevFeedbackCountRef.current > 0 && adminMessages.length > prevFeedbackCountRef.current) {
        playNotificationSound("message");
        toast.info("💬 Admin-ka fariin cusub ayuu ku soo diray!", { duration: 5000 });
        setUnreadCount(prev => prev + 1);
      }
      prevFeedbackCountRef.current = adminMessages.length;

      const stateMap: Record<string, string> = {};
      currentOrders.forEach(o => { stateMap[o.id] = o.status; });
      prevOrderStatesRef.current = stateMap;

      setOrders(currentOrders);
      setMenuItems(await getMenuItems(business.id));
      setTables(await getTables(business.id));
    }, 4000);
    return () => clearInterval(interval);
  }, [business?.id, waiter?.id]);

  const playNotificationSound = (type: "ready" | "update" | "message") => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      const notes = type === "ready"
        ? [523.25, 659.25, 783.99, 1046.5]
        : type === "message"
        ? [880, 1108.73, 880]
        : [659.25, 783.99];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = type === "message" ? "triangle" : "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + i * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.4);
      });
    } catch {}
  };

  if (!waiter || !business) return null;

  const waiterOrders = orders.filter(o => o.customerId === waiter.id || (o as any).waiterId === waiter.id);
  const filteredOrders = orderFilter === "all" ? waiterOrders : waiterOrders.filter(o => o.status === orderFilter);

  const filteredItems = menuItems.filter(m => {
    const matchCat = selectedCat === "all" || m.categoryId === selectedCat;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && m.available;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);

  const placeOrder = () => {
    if (cart.length === 0) { toast.error(t.wtCartEmpty); return; }
    if (!selectedTable) { toast.error(t.wtSelectTableErr); return; }
    const table = tables.find(t => t.id === selectedTable);
    const order: Order = {
      id: generateId("ord"),
      businessId: business.id,
      tableId: table ? String(table.number) : selectedTable,
      customerId: waiter.id,
      items: cart,
      total: cartTotal,
      status: "pending",
      createdAt: new Date().toISOString(),
      orderedBy: `waiter:${waiter.name}`,
    };
    (order as any).waiterId = waiter.id;
    (order as any).waiterName = waiter.name;
    (order as any).customerName = `🧑‍🍳 ${waiter.name} (${t.wtWaiter})`;
    (order as any).customerPhone = waiter.phone || "";
    await saveOrder(order);
    setCart([]);
    setSelectedTable("");
    toast.success(t.wtOrderPlaced);
    setOrders(await getOrders(business.id));
  };

  const getOrderMessages = (orderId: string) => {
    const allMessages = JSON.parse(localStorage.getItem("dp_order_messages") || "[]");
    return allMessages.filter((msg: any) => msg.orderId === orderId && msg.businessId === business.id);
  };

  const sendMessage = () => {
    if (!messageDialog || !messageText.trim()) return;
    const allMessages = JSON.parse(localStorage.getItem("dp_order_messages") || "[]");
    allMessages.push({
      id: `msg-${Date.now()}`,
      orderId: messageDialog.orderId,
      businessId: business.id,
      from: "customer",
      message: messageText.trim(),
      senderName: waiter.name,
      senderRole: "waiter",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("dp_order_messages", JSON.stringify(allMessages));
    toast.success(t.wtMsgSent);
    setMessageText("");
    setMessageDialog(null);
  };

  const todayOrders = waiterOrders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const activeOrders = waiterOrders.filter(o => ["pending", "preparing", "ready"].includes(o.status));
  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  const allMessages = JSON.parse(localStorage.getItem("dp_order_messages") || "[]");
  const waiterNotifications = allMessages
    .filter((msg: any) => msg.businessId === business.id && msg.from === "admin" && waiterOrders.some(o => o.id === msg.orderId))
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleLogout = () => {
    localStorage.removeItem("dp_active_waiter");
    localStorage.removeItem("dp_active_business");
    navigate("/login");
  };

  const tabs = [
    { id: "menu" as const, label: t.wtMenu, icon: UtensilsCrossed },
    { id: "orders" as const, label: t.wtOrders, icon: ClipboardList, badge: activeOrders.length },
    { id: "notifications" as const, label: t.wtNotifications, icon: Bell, badge: unreadCount },
    { id: "profile" as const, label: t.wtProfile, icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          {business.logo ? (
            <img src={business.logo} alt="" className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold text-sm">
              {business.name.charAt(0)}
            </div>
          )}
          <div className="hidden sm:block">
            <p className="font-display font-bold text-sm">{waiter.name}</p>
            <p className="text-[10px] text-muted-foreground">{t.wtWaiter} • {business.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLang(lang === "en" ? "so" : "en")}
            className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-accent transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "en" ? "SO" : "EN"}
          </button>
          {tabs.map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              size="sm"
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id === "notifications") setUnreadCount(0);
              }}
              className="relative transition-all duration-200 hover:scale-105 text-xs sm:text-sm gap-1"
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-[9px] text-destructive-foreground flex items-center justify-center font-bold">
                  {tab.badge}
                </span>
              )}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive transition-all ml-1">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="bg-card/50 border-b border-border px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center gap-4 sm:gap-6 text-xs overflow-x-auto">
          <div className="flex items-center gap-1.5 shrink-0">
            <ClipboardList className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted-foreground">{t.wtToday}:</span>
            <span className="font-bold">{todayOrders.length} {t.wtOrders.toLowerCase()}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-accent" />
            <span className="text-muted-foreground">{t.wtRevenue}:</span>
            <span className="font-bold text-accent">${todayRevenue.toFixed(2)}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-muted-foreground">{t.wtActive}:</span>
            <span className="font-bold">{activeOrders.length}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{t.wtLiveUpdates}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* MENU TAB */}
        {activeTab === "menu" && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={t.wtSearchMenu} value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant={selectedCat === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedCat("all")}>{t.wtAll}</Button>
                {categories.map(c => (
                  <Button key={c.id} variant={selectedCat === c.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCat(c.id)}>
                    {isImageUrl(c.icon) ? <img src={c.icon} alt="" className="w-4 h-4 rounded mr-1 object-cover" /> : <span className="mr-1">{c.icon}</span>}
                    {c.name}
                  </Button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredItems.length === 0 ? (
                  <div className="col-span-2 bg-card border border-border rounded-xl p-12 text-center">
                    <p className="text-muted-foreground">{t.wtNoFood}</p>
                  </div>
                ) : filteredItems.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="bg-card border border-border rounded-xl p-4 shadow-card-custom hover:shadow-gold transition-all duration-300 hover:-translate-y-0.5 cursor-pointer group"
                    onClick={() => addToCart(item)}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform duration-300">
                        {isImageUrl(item.image) ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-2xl">{item.image}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-accent">${item.price.toFixed(2)}</p>
                        <Plus className="w-4 h-4 text-accent ml-auto mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Cart */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-card-custom sticky top-28">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-accent" /> {t.wtOrderCart}
                  {cart.length > 0 && <Badge variant="secondary" className="text-xs">{cart.reduce((s, c) => s + c.quantity, 0)}</Badge>}
                </h3>
                <div className="mb-3">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="h-10"><SelectValue placeholder={t.wtSelectTable} /></SelectTrigger>
                    <SelectContent>
                      {tables.map(t => <SelectItem key={t.id} value={t.id}>Table #{t.number} ({t.seats} seats)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">{t.wtNoItems}</p>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {cart.map(c => (
                      <motion.div key={c.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between py-2 border-b border-border/50">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{c.name}</p>
                          <p className="text-xs text-accent">${(c.price * c.quantity).toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(c.id, -1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-destructive/20 transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-sm font-bold w-5 text-center">{c.quantity}</span>
                          <button onClick={() => updateQty(c.id, 1)} className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-accent/20 transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex justify-between mb-3">
                    <span className="font-medium">{t.wtTotal}</span>
                    <span className="font-display font-bold text-lg text-accent">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button onClick={placeOrder} variant="hero" className="w-full" disabled={cart.length === 0}>
                    {t.wtPlaceOrder}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">{t.wtMyOrders}</h2>
              <span className="text-xs text-muted-foreground">{waiterOrders.length} {t.wtTotal.toLowerCase()}</span>
            </div>

            <div className="flex gap-2 flex-wrap">
              {[
                { key: "all", label: t.wtAllFilter, count: waiterOrders.length },
                { key: "pending", label: t.wtPending, count: waiterOrders.filter(o => o.status === "pending").length },
                { key: "preparing", label: t.wtPreparing, count: waiterOrders.filter(o => o.status === "preparing").length },
                { key: "ready", label: t.wtReady, count: waiterOrders.filter(o => o.status === "ready").length },
                { key: "delivered", label: t.wtDelivered, count: waiterOrders.filter(o => o.status === "delivered").length },
              ].map(f => (
                <Button
                  key={f.key}
                  variant={orderFilter === f.key ? "default" : "outline"}
                  size="sm"
                  className="text-xs gap-1.5"
                  onClick={() => setOrderFilter(f.key)}
                >
                  {f.label}
                  {f.count > 0 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{f.count}</Badge>}
                </Button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">{t.wtNoOrders}</p>
                </div>
              ) : filteredOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((o, i) => {
                const cfg = statusConfig[o.status] || statusConfig.pending;
                const StatusIcon = cfg.icon;
                const messages = getOrderMessages(o.id);
                const adminMessages = messages.filter((m: any) => m.from === "admin");

                return (
                  <motion.div
                    key={o.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`bg-card border rounded-xl p-4 sm:p-5 shadow-card-custom transition-all duration-300 hover:shadow-gold ${cfg.bgColor}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.color} bg-card border border-border`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-display font-bold text-sm">Table #{o.tableId}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{o.id.slice(0, 12)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={`text-xs ${cfg.bgColor} ${cfg.color} border`}>
                          {cfg.label}
                        </Badge>
                        <p className="text-[10px] text-muted-foreground mt-1">{new Date(o.createdAt).toLocaleTimeString()}</p>
                      </div>
                    </div>

                    <div className="bg-muted/30 rounded-lg p-3 mb-3">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm py-0.5">
                          <span>{item.quantity}× {item.name}</span>
                          <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t border-border mt-2 pt-2 flex justify-between">
                        <span className="font-semibold text-sm">{t.wtGrandTotal}</span>
                        <span className="font-display font-bold text-accent">${o.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {adminMessages.length > 0 && (
                      <div className="mb-3 space-y-1.5">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" /> {t.wtAdminMessages}
                        </p>
                        {adminMessages.slice(-2).map((msg: any) => (
                          <div key={msg.id} className="bg-accent/10 border border-accent/20 rounded-lg px-3 py-2 text-xs">
                            <p className="text-foreground">{msg.message}</p>
                            <p className="text-[9px] text-muted-foreground mt-0.5">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {o.status !== "cancelled" && o.status !== "delivered" && o.status !== "paid" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1.5 text-xs"
                          onClick={() => setMessageDialog({ orderId: o.id })}
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> {t.wtSendMsg}
                        </Button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold flex items-center gap-2">
              <Bell className="w-5 h-5 text-accent" /> {t.wtNotificationsTitle}
            </h2>

            {waiterNotifications.length === 0 && activeOrders.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-12 text-center">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t.wtNoNotifications}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeOrders.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.wtActiveOrders}</p>
                    {activeOrders.map(o => {
                      const cfg = statusConfig[o.status] || statusConfig.pending;
                      const StatusIcon = cfg.icon;
                      return (
                        <motion.div key={o.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          className={`bg-card border rounded-xl p-4 shadow-card-custom ${cfg.bgColor}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${cfg.color} bg-card border border-border`}>
                              <StatusIcon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">Order #{o.id.slice(4, 12)} • Table #{o.tableId}</p>
                              <p className="text-xs text-muted-foreground">{o.items.map(i => i.name).join(", ")}</p>
                            </div>
                            <Badge className={`${cfg.bgColor} ${cfg.color} border`}>{cfg.label}</Badge>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {waiterNotifications.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t.wtAdminMsgs}</p>
                    {waiterNotifications.map((msg: any) => (
                      <motion.div key={msg.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="bg-card border border-accent/20 rounded-xl p-4 shadow-card-custom">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-4 h-4 text-accent" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{msg.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Order #{msg.orderId.slice(4, 12)} • {new Date(msg.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="max-w-md mx-auto space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-8 shadow-card-custom text-center">
              <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4 text-accent font-bold text-3xl">
                {waiter.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-display font-bold text-xl mb-1">{waiter.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{waiter.jobTitle} • {business.name}</p>
              <div className="space-y-3 text-left">
                {[
                  { label: t.wtPhone, value: waiter.phone },
                  { label: t.wtNationality, value: waiter.nationality },
                  { label: t.wtShift, value: waiter.shifts },
                  { label: t.wtWorkingHours, value: `${waiter.startTime} - ${waiter.endTime}` },
                  { label: t.wtUsername, value: waiter.username || "—" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
              <h3 className="font-display font-bold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-accent" /> {t.wtPerformance}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: t.wtTotalOrders, value: waiterOrders.length, icon: "📋" },
                  { label: t.wtTodayOrders, value: todayOrders.length, icon: "📦" },
                  { label: t.wtTotalRevenue, value: `$${waiterOrders.reduce((s, o) => s + o.total, 0).toFixed(2)}`, icon: "💰" },
                  { label: t.wtTodayRevenue, value: `$${todayRevenue.toFixed(2)}`, icon: "📈" },
                  { label: t.wtDeliveredCount, value: waiterOrders.filter(o => o.status === "delivered" || o.status === "paid").length, icon: "✅" },
                  { label: t.wtCancelledCount, value: waiterOrders.filter(o => o.status === "cancelled").length, icon: "❌" },
                ].map(stat => (
                  <div key={stat.label} className="bg-muted/30 rounded-lg p-3 text-center">
                    <p className="text-lg mb-1">{stat.icon}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="font-bold text-sm mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Message Dialog */}
      <Dialog open={!!messageDialog} onOpenChange={() => { setMessageDialog(null); setMessageText(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.wtMsgToAdmin}</DialogTitle>
            <DialogDescription>Order #{messageDialog?.orderId.slice(4, 12)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {[t.wtQuickWaiting, t.wtQuickTableFull, t.wtQuickNewReq, t.wtQuickFoodReady].map(q => (
                <Button key={q} variant="outline" size="sm" className="text-xs" onClick={() => setMessageText(q)}>{q}</Button>
              ))}
            </div>
            <Textarea
              placeholder={t.wtWriteMsg}
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setMessageDialog(null); setMessageText(""); }}>{t.wtCancel}</Button>
            <Button variant="hero" onClick={sendMessage} disabled={!messageText.trim()}>
              <Send className="w-4 h-4 mr-1.5" /> {t.wtSend}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WaiterDashboard;
