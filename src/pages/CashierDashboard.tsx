import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  LogOut, ShoppingBag, Plus, Minus, Search, ClipboardList, UtensilsCrossed,
  CreditCard, Banknote, Smartphone, Check, XCircle, Receipt, RefreshCw,
  BarChart3, Clock, DollarSign, TrendingUp, User, ChevronLeft, ChevronRight,
  LayoutDashboard, ShoppingCart, FileText, Bell, Users, AlertCircle, Eye,
  Phone, Mail, Award, Calendar, Filter, ArrowUpRight, Package,
} from "lucide-react";
import {
  StaffMember, Business, MenuItem, Category, Order, TableItem, Customer,
  getCategories, getMenuItems, getTables, getOrders, generateId,
  saveOrder, updateOrder, deleteOrder, getCustomers,
} from "@/lib/store";
import { toast } from "sonner";
import { printReceipt } from "@/lib/printReceipt";

interface Notification {
  id: string;
  type: "new_order" | "order_ready" | "payment" | "cancel";
  message: string;
  time: string;
  read: boolean;
  orderId?: string;
}

const CashierDashboard = () => {
  const navigate = useNavigate();
  const [cashier, setCashier] = useState<StaffMember | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; image: string }[]>([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [customerName, setCustomerName] = useState("Walking Customer");
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [customerSearch, setCustomerSearch] = useState("");

  // Payment dialog
  const [paymentDialog, setPaymentDialog] = useState<Order | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "mobile">("cash");
  const [paidAmount, setPaidAmount] = useState("");

  // Refund dialog
  const [refundDialog, setRefundDialog] = useState<Order | null>(null);

  const audioRef = useRef<AudioContext | null>(null);
  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const prevReadyIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const c = localStorage.getItem("dp_active_cashier");
    const b = localStorage.getItem("dp_active_business");
    if (c && b) {
      setCashier(JSON.parse(c));
      setBusiness(JSON.parse(b));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (business) {
      refresh();
      const interval = setInterval(refresh, 5000);
      return () => clearInterval(interval);
    }
  }, [business?.id]);

  const refresh = () => {
    if (!business) return;
    setCategories(getCategories(business.id));
    setMenuItems(getMenuItems(business.id));
    setTables(getTables(business.id));
    setCustomers(getCustomers(business.id));
    const currentOrders = getOrders(business.id);

    // Detect new orders for notifications
    const currentIds = new Set(currentOrders.map(o => o.id));
    const newOrders = currentOrders.filter(o => !prevOrderIdsRef.current.has(o.id));
    const newReady = currentOrders.filter(o => o.status === "ready" && !prevReadyIdsRef.current.has(o.id));

    if (prevOrderIdsRef.current.size > 0) {
      newOrders.forEach(o => {
        playSound();
        addNotification("new_order", `Dalab cusub: ${(o as any).customerName || "Guest"} - $${o.total.toFixed(2)}`, o.id);
      });
      newReady.forEach(o => {
        addNotification("order_ready", `Dalabka ${(o as any).customerName || "Guest"} diyaar ayuu yahay!`, o.id);
      });
    }

    prevOrderIdsRef.current = currentIds;
    prevReadyIdsRef.current = new Set(currentOrders.filter(o => o.status === "ready").map(o => o.id));
    setOrders(currentOrders);
  };

  const addNotification = (type: Notification["type"], message: string, orderId?: string) => {
    setNotifications(prev => [{
      id: generateId("notif"),
      type,
      message,
      time: new Date().toISOString(),
      read: false,
      orderId,
    }, ...prev].slice(0, 50));
    toast.success(`🔔 ${message}`);
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const playSound = () => {
    try {
      if (!audioRef.current) audioRef.current = new AudioContext();
      const ctx = audioRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

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
    if (!business || !cashier || cart.length === 0) return;
    const order: Order = {
      id: generateId("ord"),
      businessId: business.id,
      tableId: selectedTable || "Takeaway",
      items: cart,
      total: cartTotal,
      status: "pending",
      createdAt: new Date().toISOString(),
      orderedBy: `cashier:${cashier.name}`,
      cashierId: cashier.id,
      customerName: customerName || "Walking Customer",
    } as any;
    saveOrder(order);
    addNotification("new_order", `Dalab cusub oo aad samaysay: $${cartTotal.toFixed(2)}`, order.id);
    setCart([]);
    setCustomerName("Walking Customer");
    setSelectedTable("");
    refresh();
  };

  const handlePayment = () => {
    if (!paymentDialog) return;
    updateOrder(paymentDialog.id, {
      status: "paid",
      paymentMethod,
      paidAt: new Date().toISOString(),
      cashierId: cashier?.id,
    });
    addNotification("payment", `Lacagta la qaatay: $${paymentDialog.total.toFixed(2)} (${paymentMethod})`, paymentDialog.id);
    if (business) {
      printReceipt({
        order: paymentDialog,
        business,
        servedBy: cashier?.name,
        paidAmount: Number(paidAmount) || paymentDialog.total,
      });
    }
    setPaymentDialog(null);
    setPaidAmount("");
    refresh();
  };

  const handleRefund = () => {
    if (!refundDialog) return;
    updateOrder(refundDialog.id, { status: "cancelled" });
    addNotification("cancel", `Order la cancel-gareeye: $${refundDialog.total.toFixed(2)}`, refundDialog.id);
    setRefundDialog(null);
    refresh();
  };

  if (!business || !cashier) return null;

  // ===== CASHIER-SPECIFIC STATS (only their own orders, starting from zero) =====
  const todayStr = new Date().toDateString();
  const allTodayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  
  // Only show this cashier's orders
  const myOrders = allTodayOrders.filter(o => 
    o.cashierId === cashier.id || (o as any).orderedBy === `cashier:${cashier.name}`
  );
  const myRevenue = myOrders.filter(o => o.status === "paid").reduce((s, o) => s + o.total, 0);
  const myPendingOrders = myOrders.filter(o => o.status === "pending");
  const myPreparing = myOrders.filter(o => o.status === "preparing");
  const myReady = myOrders.filter(o => o.status === "ready");

  // Also show customer-originated orders that need cashier attention
  const customerPendingOrders = allTodayOrders.filter(o => 
    o.status === "pending" && (o as any).orderedBy === "customer"
  );
  const allPending = orders.filter(o => o.status === "pending");

  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  const filteredMenu = menuItems
    .filter(m => m.available)
    .filter(m => selectedCat === "all" || m.categoryId === selectedCat)
    .filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  // Filtered orders for Orders tab
  const filteredOrders = (orderStatusFilter === "all" 
    ? orders 
    : orders.filter(o => o.status === orderStatusFilter)
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Filtered customers
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const cashPayments = myOrders.filter(o => o.paymentMethod === "cash" && o.status === "paid");
  const cardPayments = myOrders.filter(o => o.paymentMethod === "card" && o.status === "paid");
  const mobilePayments = myOrders.filter(o => o.paymentMethod === "mobile" && o.status === "paid");

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "orders", label: "Orders", icon: ClipboardList, badge: allPending.length || undefined },
    { id: "pos", label: "POS / Walk-in", icon: ShoppingCart },
    { id: "payment-methods", label: "Payments", icon: CreditCard },
    { id: "customers", label: "Customers", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell, badge: unreadCount || undefined },
    { id: "shift-report", label: "Shift Report", icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 bottom-0 bg-card border-r border-border flex flex-col z-40"
      >
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 overflow-hidden">
            {business.logo ? (
              <img src={business.logo} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="font-display font-bold text-accent text-xs">
                {business.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-display font-bold text-sm truncate">{business.name}</p>
              <p className="text-[10px] text-muted-foreground">Cashier: {cashier.name}</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                activeTab === item.id ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <div className="relative shrink-0">
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-accent" : ""}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </div>
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.badge && (
                <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0">{item.badge}</Badge>
              )}
              {collapsed && (
                <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label} {item.badge ? `(${item.badge})` : ""}
                </span>
              )}
            </button>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className="p-3 border-t border-border">
          <button
            onClick={() => {
              localStorage.removeItem("dp_active_cashier");
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all group relative"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main content */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[240px]"}`}>
        <header className="border-b border-border bg-card px-8 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-2xl">
                {activeTab === "dashboard" ? "Cashier Dashboard" : 
                 activeTab === "orders" ? "Order Management" : 
                 activeTab === "pos" ? "POS / Walk-in Order" : 
                 activeTab === "payment-methods" ? "Payment Methods" :
                 activeTab === "customers" ? "Customers" :
                 activeTab === "notifications" ? "Notifications" :
                 "Shift Report"}
              </h1>
              <p className="text-sm text-muted-foreground">{cashier.name} · {new Date().toLocaleDateString()}</p>
            </div>
            {/* Quick notification bell in header */}
            <button 
              onClick={() => setActiveTab("notifications")}
              className="relative p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Bell className="w-5 h-5 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="p-8">
          {/* ===== DASHBOARD ===== */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Alert for customer orders needing attention */}
              {customerPendingOrders.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 flex items-center gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-secondary shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{customerPendingOrders.length} dalab cusub oo macaamiisha ka yimid!</p>
                    <p className="text-xs text-muted-foreground">Fadlan ka jawaab dalabyadaas</p>
                  </div>
                  <Button size="sm" variant="hero" onClick={() => setActiveTab("orders")} className="text-xs gap-1">
                    <Eye className="w-3 h-3" /> Arag
                  </Button>
                </motion.div>
              )}

              {/* My Stats (cashier-specific, zero-based) */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "My Orders", value: myOrders.length, icon: ShoppingBag, desc: "Maanta" },
                  { label: "My Revenue", value: `$${myRevenue.toFixed(2)}`, icon: DollarSign, desc: "Lacag la qaatay" },
                  { label: "My Pending", value: myPendingOrders.length, icon: Clock, desc: "Sugaya" },
                  { label: "Ready to Serve", value: myReady.length, icon: Package, desc: "Diyaar" },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4 shadow-card-custom">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                        <s.icon className="w-4 h-4 text-accent" />
                      </div>
                    </div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="grid sm:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("pos")}
                  className="bg-card border border-border rounded-xl p-5 shadow-card-custom text-left hover:border-accent/30 transition-all"
                >
                  <ShoppingCart className="w-8 h-8 text-accent mb-3" />
                  <p className="font-display font-bold text-sm">New Order</p>
                  <p className="text-xs text-muted-foreground mt-1">Dalab cusub samee</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("orders")}
                  className="bg-card border border-border rounded-xl p-5 shadow-card-custom text-left hover:border-accent/30 transition-all"
                >
                  <ClipboardList className="w-8 h-8 text-accent mb-3" />
                  <p className="font-display font-bold text-sm">Manage Orders</p>
                  <p className="text-xs text-muted-foreground mt-1">{allPending.length} pending</p>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab("customers")}
                  className="bg-card border border-border rounded-xl p-5 shadow-card-custom text-left hover:border-accent/30 transition-all"
                >
                  <Users className="w-8 h-8 text-accent mb-3" />
                  <p className="font-display font-bold text-sm">Customers</p>
                  <p className="text-xs text-muted-foreground mt-1">{customers.length} registered</p>
                </motion.button>
              </div>

              {/* Recent orders quick view */}
              <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                  <h3 className="font-display font-bold">Recent Orders (Mine)</h3>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab("orders")}>View All</Button>
                </div>
                {myOrders.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">Wali dalab ma samaysan</p>
                    <p className="text-xs mt-1">POS tab-ka tag si aad dalab cusub u samayso</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myOrders.slice(-10).reverse().map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{(o as any).customerName || "Guest"}</TableCell>
                          <TableCell>{o.tableId}</TableCell>
                          <TableCell className="text-xs">{o.items.map(i => `${i.quantity}× ${i.name}`).join(", ").slice(0, 40)}</TableCell>
                          <TableCell className="font-bold text-accent">${o.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-[10px]">{o.status}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {(o.status === "ready" || o.status === "delivered") && (
                              <Button size="sm" variant="hero" className="text-xs gap-1" onClick={() => { setPaymentDialog(o); setPaidAmount(String(o.total)); }}>
                                <CreditCard className="w-3 h-3" /> Pay
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* ===== ORDERS ===== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              {/* Status filter */}
              <div className="flex gap-2 flex-wrap">
                {["all", "pending", "preparing", "ready", "delivered", "paid", "cancelled"].map(s => (
                  <Button key={s} variant={orderStatusFilter === s ? "default" : "outline"} size="sm" className="text-xs capitalize"
                    onClick={() => setOrderStatusFilter(s)}>
                    {s === "all" ? "All" : s}
                    {s === "pending" && allPending.length > 0 && (
                      <Badge variant="destructive" className="ml-1.5 text-[9px] px-1 py-0">{allPending.length}</Badge>
                    )}
                  </Button>
                ))}
              </div>

              <div className="space-y-4">
                {filteredOrders.length === 0 ? (
                  <div className="bg-card border border-border rounded-xl p-12 text-center">
                    <ClipboardList className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-20" />
                    <p className="text-sm text-muted-foreground">Dalab la helin</p>
                  </div>
                ) : (
                  filteredOrders.map((o, i) => (
                    <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                      className={`bg-card border rounded-xl p-5 shadow-card-custom ${
                        o.status === "pending" ? "border-secondary/50" :
                        o.status === "preparing" ? "border-accent/50" :
                        o.status === "ready" ? "border-green-500/50" :
                        o.status === "paid" ? "border-accent/30" :
                        "border-border"
                      }`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                            {((o as any).customerName || "G").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-display font-bold text-sm">{(o as any).customerName || "Guest"}</p>
                            <p className="text-xs text-muted-foreground">Table: {o.tableId} · {new Date(o.createdAt).toLocaleTimeString()}</p>
                            {o.orderedBy && <p className="text-[10px] text-muted-foreground">By: {o.orderedBy}</p>}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{o.status}</Badge>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-3 mb-3">
                        {o.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span>{item.quantity}× {item.name}</span>
                            <span className="text-muted-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        <div className="border-t border-border mt-2 pt-2 flex justify-between font-bold">
                          <span>Total</span>
                          <span className="text-accent">${o.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {o.status === "pending" && (
                          <>
                            <Button size="sm" variant="hero" className="text-xs gap-1"
                              onClick={() => { updateOrder(o.id, { status: "preparing" }); toast.success("Aqbalay ✓"); refresh(); }}>
                              <Check className="w-3 h-3" /> Aqbal
                            </Button>
                            <Button size="sm" variant="destructive" className="text-xs gap-1"
                              onClick={() => { updateOrder(o.id, { status: "cancelled" }); toast.info("La joojiyay"); refresh(); }}>
                              <XCircle className="w-3 h-3" /> Diid
                            </Button>
                          </>
                        )}
                        {o.status === "preparing" && (
                          <Button size="sm" className="text-xs gap-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => { updateOrder(o.id, { status: "ready" }); toast.success("Diyaar ✓"); refresh(); }}>
                            <Check className="w-3 h-3" /> Diyaar
                          </Button>
                        )}
                        {o.status === "ready" && (
                          <Button size="sm" variant="outline" className="text-xs gap-1"
                            onClick={() => { updateOrder(o.id, { status: "delivered" }); toast.success("La geeyay ✓"); refresh(); }}>
                            <Check className="w-3 h-3" /> Served
                          </Button>
                        )}
                        {(o.status === "ready" || o.status === "delivered") && (
                          <Button size="sm" variant="hero" className="text-xs gap-1"
                            onClick={() => { setPaymentDialog(o); setPaidAmount(String(o.total)); }}>
                            <CreditCard className="w-3 h-3" /> Confirm Payment
                          </Button>
                        )}
                        {o.status !== "cancelled" && o.status !== "paid" && (
                          <Button size="sm" variant="outline" className="text-xs gap-1"
                            onClick={() => setRefundDialog(o)}>
                            <RefreshCw className="w-3 h-3" /> Cancel/Refund
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="text-xs gap-1"
                          onClick={() => printReceipt({ order: o, business, servedBy: cashier.name })}>
                          <Receipt className="w-3 h-3" /> Receipt
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ===== POS ===== */}
          {activeTab === "pos" && (
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Menu side */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Button variant={selectedCat === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedCat("all")}>All</Button>
                  {categories.map(c => (
                    <Button key={c.id} variant={selectedCat === c.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCat(c.id)} className="whitespace-nowrap">
                      {isImageUrl(c.icon) ? "📁" : c.icon} {c.name}
                    </Button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredMenu.map(item => (
                    <motion.div key={item.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(item)}
                      className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:shadow-gold transition-all">
                      <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl mb-2 mx-auto overflow-hidden">
                        {isImageUrl(item.image) ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : item.image}
                      </div>
                      <p className="font-medium text-sm text-center">{item.name}</p>
                      <p className="text-accent font-bold text-center">${item.price.toFixed(2)}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Cart side */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-xl shadow-card-custom sticky top-8">
                  <div className="px-5 py-4 border-b border-border">
                    <h3 className="font-display font-bold flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-accent" /> Order Cart
                    </h3>
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium mb-1 block">Customer Name</label>
                        <Input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Walking Customer" className="h-9 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs font-medium mb-1 block">Table</label>
                        <Select value={selectedTable} onValueChange={setSelectedTable}>
                          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Takeaway" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="takeaway">Takeaway</SelectItem>
                            {tables.map(t => (
                              <SelectItem key={t.id} value={String(t.number)}>Table #{t.number}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {cart.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">Cart is empty</p>
                        <p className="text-xs">Click menu items to add</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {cart.map(c => (
                          <div key={c.id} className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{c.name}</p>
                              <p className="text-xs text-muted-foreground">${c.price.toFixed(2)} each</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(c.id, -1)}>
                                <Minus className="w-3 h-3" />
                              </Button>
                              <span className="w-6 text-center font-bold text-sm">{c.quantity}</span>
                              <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => updateQty(c.id, 1)}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="font-bold text-sm ml-3 w-16 text-right">${(c.price * c.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {cart.length > 0 && (
                      <div className="border-t border-border pt-4 space-y-3">
                        <div className="flex justify-between font-display font-bold text-lg">
                          <span>Total</span>
                          <span className="text-accent">${cartTotal.toFixed(2)}</span>
                        </div>
                        <Button variant="hero" className="w-full" onClick={placeOrder}>
                          <Check className="w-4 h-4 mr-2" /> Place Order
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ===== PAYMENT METHODS ===== */}
          {activeTab === "payment-methods" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid sm:grid-cols-4 gap-4">
                {[
                  { label: "Total Paid", value: `$${myRevenue.toFixed(2)}`, icon: DollarSign, desc: `${myOrders.filter(o => o.status === "paid").length} orders` },
                  { label: "Cash", value: `$${cashPayments.reduce((s, o) => s + o.total, 0).toFixed(2)}`, icon: Banknote, desc: `${cashPayments.length} payments` },
                  { label: "Card", value: `$${cardPayments.reduce((s, o) => s + o.total, 0).toFixed(2)}`, icon: CreditCard, desc: `${cardPayments.length} payments` },
                  { label: "Mobile", value: `$${mobilePayments.reduce((s, o) => s + o.total, 0).toFixed(2)}`, icon: Smartphone, desc: `${mobilePayments.length} payments` },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4 shadow-card-custom">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                      <s.icon className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{s.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Breakdown bar */}
              <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
                <h3 className="font-display font-bold mb-4">Revenue Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: "💵 Cash", total: cashPayments.reduce((s, o) => s + o.total, 0), pct: myRevenue ? (cashPayments.reduce((s, o) => s + o.total, 0) / myRevenue * 100) : 0 },
                    { label: "💳 Card", total: cardPayments.reduce((s, o) => s + o.total, 0), pct: myRevenue ? (cardPayments.reduce((s, o) => s + o.total, 0) / myRevenue * 100) : 0 },
                    { label: "📱 Mobile Money", total: mobilePayments.reduce((s, o) => s + o.total, 0), pct: myRevenue ? (mobilePayments.reduce((s, o) => s + o.total, 0) / myRevenue * 100) : 0 },
                  ].map((p, i) => (
                    <div key={p.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{p.label}</span>
                        <span className="text-muted-foreground">${p.total.toFixed(2)} ({p.pct.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${p.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          className="h-full rounded-full bg-accent"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent paid list */}
              <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-display font-bold">Recent Payments (My Shift)</h3>
                </div>
                {myOrders.filter(o => o.status === "paid").length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Wali lacag lama qaatin</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myOrders.filter(o => o.status === "paid").reverse().map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{(o as any).customerName || "Guest"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {o.paymentMethod === "cash" ? "💵 Cash" : o.paymentMethod === "card" ? "💳 Card" : "📱 Mobile"}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-accent">${o.total.toFixed(2)}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(o.paidAt || o.createdAt).toLocaleTimeString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* ===== CUSTOMERS ===== */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Total Customers", value: customers.length, icon: Users },
                  { label: "Registered Today", value: customers.filter(c => new Date(c.registeredAt).toDateString() === todayStr).length, icon: Calendar },
                  { label: "Active Spenders", value: customers.filter(c => c.totalSpent > 0).length, icon: Award },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4 shadow-card-custom">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                      <s.icon className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-2xl font-display font-bold">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Search */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Raadi macmiil... (magac ama telefoon)" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-9" />
              </div>

              {/* Customer list */}
              <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
                {filteredCustomers.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <Users className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Macmiil la helin</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Points</TableHead>
                        <TableHead>Registered</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map(c => (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-xs">
                                {c.name.charAt(0).toUpperCase()}
                              </div>
                              <span className="font-medium text-sm">{c.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{c.phone || "—"}</TableCell>
                          <TableCell className="font-medium">{c.totalOrders}</TableCell>
                          <TableCell className="font-bold text-accent">${c.totalSpent.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">
                              {c.loyaltyPoints} pts
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(c.registeredAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}

          {/* ===== NOTIFICATIONS ===== */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}</p>
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" className="text-xs" onClick={markAllNotificationsRead}>
                    <Check className="w-3 h-3 mr-1" /> Mark all read
                  </Button>
                )}
              </div>

              {notifications.length === 0 ? (
                <div className="bg-card border border-border rounded-xl p-12 text-center">
                  <Bell className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground font-medium">Wali ogeysiis ma jiro</p>
                  <p className="text-xs text-muted-foreground mt-1">Marka dalab cusub yimaado halkan ayuu ka soo muuqan doonaa</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`bg-card border rounded-xl p-4 flex items-start gap-3 transition-all ${
                        n.read ? "border-border opacity-70" : "border-accent/30 bg-accent/5"
                      }`}
                      onClick={() => {
                        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                        if (n.orderId) setActiveTab("orders");
                      }}
                    >
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                        n.type === "new_order" ? "bg-accent/15 text-accent" :
                        n.type === "order_ready" ? "bg-green-500/15 text-green-600" :
                        n.type === "payment" ? "bg-accent/15 text-accent" :
                        "bg-destructive/15 text-destructive"
                      }`}>
                        {n.type === "new_order" ? <ShoppingBag className="w-4 h-4" /> :
                         n.type === "order_ready" ? <Package className="w-4 h-4" /> :
                         n.type === "payment" ? <CreditCard className="w-4 h-4" /> :
                         <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{n.message}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(n.time).toLocaleTimeString()}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===== SHIFT REPORT ===== */}
          {activeTab === "shift-report" && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "My Total Orders", value: myOrders.length, icon: ShoppingBag },
                  { label: "My Revenue", value: `$${myRevenue.toFixed(2)}`, icon: DollarSign },
                  { label: "Cash Payments", value: `$${cashPayments.reduce((s, o) => s + o.total, 0).toFixed(2)} (${cashPayments.length})`, icon: Banknote },
                  { label: "Mobile Payments", value: `$${mobilePayments.reduce((s, o) => s + o.total, 0).toFixed(2)} (${mobilePayments.length})`, icon: Smartphone },
                ].map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className="bg-card border border-border rounded-xl p-4 shadow-card-custom">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
                      <s.icon className="w-4 h-4 text-accent" />
                    </div>
                    <p className="text-xl font-display font-bold">{s.value}</p>
                  </motion.div>
                ))}
              </div>

              <div className="bg-card border border-border rounded-xl p-5 shadow-card-custom">
                <h3 className="font-display font-bold mb-4">Payment Breakdown</h3>
                <div className="space-y-3">
                  {[
                    { label: "Cash", count: cashPayments.length, total: cashPayments.reduce((s, o) => s + o.total, 0), icon: "💵" },
                    { label: "Card", count: cardPayments.length, total: cardPayments.reduce((s, o) => s + o.total, 0), icon: "💳" },
                    { label: "Mobile Money", count: mobilePayments.length, total: mobilePayments.reduce((s, o) => s + o.total, 0), icon: "📱" },
                  ].map(p => (
                    <div key={p.label} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{p.icon}</span>
                        <div>
                          <p className="font-medium text-sm">{p.label}</p>
                          <p className="text-xs text-muted-foreground">{p.count} transactions</p>
                        </div>
                      </div>
                      <p className="font-bold text-accent">${p.total.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
                <div className="px-5 py-4 border-b border-border">
                  <h3 className="font-display font-bold">My Orders Today</h3>
                </div>
                {myOrders.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Maanta wali dalab ma samaysan</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...myOrders].reverse().map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="text-xs">{new Date(o.createdAt).toLocaleTimeString()}</TableCell>
                          <TableCell className="font-medium">{(o as any).customerName || "Guest"}</TableCell>
                          <TableCell className="text-xs">{o.items.length} items</TableCell>
                          <TableCell className="font-bold">${o.total.toFixed(2)}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px]">{o.paymentMethod || "—"}</Badge></TableCell>
                          <TableCell><Badge variant="secondary" className="text-[10px]">{o.status}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Payment Dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={() => setPaymentDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>💰 Confirm Payment</DialogTitle>
            <DialogDescription>
              {(paymentDialog as any)?.customerName || "Guest"} · Total: ${paymentDialog?.total.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "cash", label: "Cash", icon: "💵" },
                  { value: "card", label: "Card", icon: "💳" },
                  { value: "mobile", label: "Mobile", icon: "📱" },
                ].map(m => (
                  <button key={m.value} onClick={() => setPaymentMethod(m.value as any)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      paymentMethod === m.value ? "border-accent bg-accent/10 shadow-gold" : "border-border hover:border-accent/50"
                    }`}>
                    <span className="text-2xl block mb-1">{m.icon}</span>
                    <span className="text-xs font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Amount Paid</label>
              <Input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0.00" />
            </div>
            {Number(paidAmount) > (paymentDialog?.total || 0) && (
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 text-sm">
                <p className="text-green-700 dark:text-green-400">Change: ${(Number(paidAmount) - (paymentDialog?.total || 0)).toFixed(2)}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(null)}>Cancel</Button>
            <Button variant="hero" onClick={handlePayment}>
              <Check className="w-4 h-4 mr-1" /> Confirm & Print Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Refund/Cancel Dialog */}
      <Dialog open={!!refundDialog} onOpenChange={() => setRefundDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel / Refund Order</DialogTitle>
            <DialogDescription>This will cancel order #{refundDialog?.id.slice(0, 10)} (${refundDialog?.total.toFixed(2)})</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefundDialog(null)}>Keep Order</Button>
            <Button variant="destructive" onClick={handleRefund}>
              <XCircle className="w-4 h-4 mr-1" /> Cancel & Refund
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CashierDashboard;
