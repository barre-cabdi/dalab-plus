import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { LogOut, User, ShoppingBag, Plus, Minus, Search, ClipboardList, UtensilsCrossed } from "lucide-react";
import {
  StaffMember, Business, MenuItem, Category, Order, TableItem,
  getCategories, getMenuItems, getTables, getOrders, generateId,
} from "@/lib/store";
import { toast } from "sonner";

const WaiterDashboard = () => {
  const navigate = useNavigate();
  const [waiter, setWaiter] = useState<StaffMember | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState<"menu" | "orders" | "profile">("menu");
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<{ id: string; name: string; price: number; quantity: number; image: string }[]>([]);
  const [selectedTable, setSelectedTable] = useState("");

  useEffect(() => {
    const w = localStorage.getItem("dp_active_waiter");
    const b = localStorage.getItem("dp_active_business");
    if (w && b) {
      const waiterData = JSON.parse(w);
      const bizData = JSON.parse(b);
      setWaiter(waiterData);
      setBusiness(bizData);
      setCategories(getCategories(bizData.id));
      setMenuItems(getMenuItems(bizData.id));
      setTables(getTables(bizData.id));
      setOrders(getOrders(bizData.id));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const refresh = () => {
    if (!business) return;
    setOrders(getOrders(business.id));
  };

  if (!waiter || !business) return null;

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
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    if (!selectedTable) { toast.error("Select a table"); return; }
    const allOrders: Order[] = JSON.parse(localStorage.getItem("dp_orders") || "[]");
    const order: Order = {
      id: generateId("ord"),
      businessId: business.id,
      tableId: selectedTable,
      customerId: waiter.id,
      items: cart,
      total: cartTotal,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    allOrders.push(order);
    localStorage.setItem("dp_orders", JSON.stringify(allOrders));
    setCart([]);
    setSelectedTable("");
    toast.success("Order placed successfully!");
    refresh();
  };

  const waiterOrders = orders.filter(o => o.customerId === waiter.id);
  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  const handleLogout = () => {
    localStorage.removeItem("dp_active_waiter");
    localStorage.removeItem("dp_active_business");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center text-accent font-bold">
            {waiter.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-display font-bold text-sm">{waiter.name}</p>
            <p className="text-[10px] text-muted-foreground">Waiter • {business.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {(["menu", "orders", "profile"] as const).map(tab => (
            <Button key={tab} variant={activeTab === tab ? "default" : "ghost"} size="sm" onClick={() => setActiveTab(tab)}
              className="transition-all duration-200 hover:scale-105">
              {tab === "menu" && <UtensilsCrossed className="w-4 h-4 mr-1" />}
              {tab === "orders" && <ClipboardList className="w-4 h-4 mr-1" />}
              {tab === "profile" && <User className="w-4 h-4 mr-1" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {activeTab === "menu" && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Menu */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search menu..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button variant={selectedCat === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedCat("all")}>All</Button>
                {categories.map(c => (
                  <Button key={c.id} variant={selectedCat === c.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCat(c.id)}>
                    {isImageUrl(c.icon) ? <img src={c.icon} alt="" className="w-4 h-4 rounded mr-1 object-cover" /> : <span className="mr-1">{c.icon}</span>}
                    {c.name}
                  </Button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {filteredItems.map((item, i) => (
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
              <div className="bg-card border border-border rounded-xl p-5 shadow-card-custom sticky top-24">
                <h3 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-accent" /> Order Cart
                </h3>
                <div className="mb-3">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="h-10"><SelectValue placeholder="Select Table..." /></SelectTrigger>
                    <SelectContent>
                      {tables.map(t => <SelectItem key={t.id} value={t.id}>Table #{t.number} ({t.seats} seats)</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {cart.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">No items yet</p>
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
                    <span className="font-medium">Total</span>
                    <span className="font-display font-bold text-lg text-accent">${cartTotal.toFixed(2)}</span>
                  </div>
                  <Button onClick={placeOrder} variant="hero" className="w-full" disabled={cart.length === 0}>
                    Place Order
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-4">
            <h2 className="text-xl font-display font-bold">My Orders</h2>
            <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {waiterOrders.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
                  ) : waiterOrders.map((o, i) => (
                    <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-border hover:bg-muted/50 transition-colors">
                      <TableCell className="font-mono text-xs">{o.id.slice(0, 12)}</TableCell>
                      <TableCell className="text-sm">{o.items.map(i => `${i.name} x${i.quantity}`).join(", ")}</TableCell>
                      <TableCell className="font-bold text-accent">${o.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          o.status === "delivered" ? "bg-accent/20 text-accent" :
                          o.status === "cancelled" ? "bg-destructive/15 text-destructive" :
                          "bg-secondary/20"
                        }>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-md mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border rounded-xl p-8 shadow-card-custom text-center">
              <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-4 text-accent font-bold text-3xl">
                {waiter.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-display font-bold text-xl mb-1">{waiter.name}</h2>
              <p className="text-sm text-muted-foreground mb-6">{waiter.jobTitle} • {business.name}</p>
              <div className="space-y-3 text-left">
                {[
                  { label: "Phone", value: waiter.phone },
                  { label: "Nationality", value: waiter.nationality },
                  { label: "Shift", value: waiter.shifts },
                  { label: "Working Hours", value: `${waiter.startTime} - ${waiter.endTime}` },
                  { label: "Username", value: waiter.username || "—" },
                  { label: "Total Orders", value: waiterOrders.length },
                  { label: "Total Revenue", value: `$${waiterOrders.reduce((s, o) => s + o.total, 0).toFixed(2)}` },
                ].map(item => (
                  <div key={item.label} className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">{item.label}</span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WaiterDashboard;
