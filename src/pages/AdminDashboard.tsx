import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Plus, Pencil, Trash2, Search, QrCode, Download, Bell, HelpCircle,
  Upload, ImageIcon, Printer, ExternalLink, Copy, X,
} from "lucide-react";
import {
  Business, Category, MenuItem, TableItem, Order,
  getCategories, saveCategory, updateCategory, deleteCategory,
  getMenuItems, saveMenuItem, updateMenuItem, deleteMenuItem,
  getTables, saveTable, updateTable, deleteTable,
  getOrders, updateOrder, generateId,
} from "@/lib/store";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminStatsCards from "@/components/admin/AdminStatsCards";
import AdminRevenueChart from "@/components/admin/AdminRevenueChart";
import PopularItems from "@/components/admin/PopularItems";
import AdminSettings from "@/components/admin/AdminSettings";
import LoyaltyTab from "@/components/admin/LoyaltyTab";
import ReportsTab from "@/components/admin/ReportsTab";

const emojiOptions = ["🍛","🍔","🐟","🥗","🍵","🥤","🫓","🍝","🍰","🍦","🦞","🥭","☕","🍕","🥩","🍗","🌮","🍣","🧁","🥚","🍳","🥐","🧀","🍱"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItemsState] = useState<MenuItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [catDialog, setCatDialog] = useState(false);
  const [menuDialog, setMenuDialog] = useState(false);
  const [tableDialog, setTableDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [editingTable, setEditingTable] = useState<TableItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "🍛" });
  const [menuForm, setMenuForm] = useState({ name: "", description: "", price: "", categoryId: "", image: "🍛", available: true });
  const [tableForm, setTableForm] = useState({ number: "", seats: "4" });
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: string }[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [imageMode, setImageMode] = useState<"emoji" | "upload">("emoji");
  const [catImageMode, setCatImageMode] = useState<"emoji" | "upload">("emoji");
  const menuImageRef = useRef<HTMLInputElement>(null);
  const catImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dp_active_business");
    if (stored) setBusiness(JSON.parse(stored));
    else navigate("/login");
  }, [navigate]);

  useEffect(() => { if (business) refreshData(); }, [business]);

  const refreshData = () => {
    if (!business) return;
    setCategories(getCategories(business.id));
    setMenuItemsState(getMenuItems(business.id));
    setTables(getTables(business.id));
    setOrders(getOrders(business.id));
    const stored = localStorage.getItem("dp_active_business");
    if (stored) setBusiness(JSON.parse(stored));
    // Build notifications from recent orders
    const allOrders = getOrders(business.id);
    const recent = allOrders.filter(o => {
      const diff = Date.now() - new Date(o.createdAt).getTime();
      return diff < 24 * 60 * 60 * 1000;
    });
    setNotifications(recent.slice(-5).reverse().map(o => ({
      id: o.id,
      text: `Order ${o.id.slice(0, 10)} - ${o.status} ($${o.total.toFixed(2)})`,
      time: new Date(o.createdAt).toLocaleTimeString(),
    })));
  };

  if (!business) return null;

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const activeTables = tables.filter(t => t.status === "occupied").length;
  const loyaltyCount = JSON.parse(localStorage.getItem("dp_loyalty_members") || "[]").filter((m: any) => m.businessId === business.id).length;

  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  // Category CRUD
  const openCatDialog = (cat?: Category) => {
    if (cat) {
      setEditingCat(cat);
      setCatForm({ name: cat.name, icon: cat.icon });
      setCatImageMode(isImageUrl(cat.icon) ? "upload" : "emoji");
    } else {
      setEditingCat(null);
      setCatForm({ name: "", icon: "🍛" });
      setCatImageMode("emoji");
    }
    setCatDialog(true);
  };
  const saveCatForm = () => {
    if (!catForm.name.trim()) return;
    if (editingCat) { updateCategory(editingCat.id, { name: catForm.name, icon: catForm.icon }); toast.success("Category updated"); }
    else { saveCategory({ id: generateId("cat"), businessId: business.id, name: catForm.name, icon: catForm.icon, order: categories.length }); toast.success("Category created"); }
    setCatDialog(false); refreshData();
  };

  const handleCatImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setCatForm({ ...catForm, icon: reader.result as string });
    reader.readAsDataURL(file);
  };

  // Menu CRUD
  const openMenuDialog = (item?: MenuItem) => {
    if (item) {
      setEditingMenu(item);
      setMenuForm({ name: item.name, description: item.description, price: String(item.price), categoryId: item.categoryId, image: item.image, available: item.available });
      setImageMode(isImageUrl(item.image) ? "upload" : "emoji");
    } else {
      setEditingMenu(null);
      setMenuForm({ name: "", description: "", price: "", categoryId: categories[0]?.id || "", image: "🍛", available: true });
      setImageMode("emoji");
    }
    setMenuDialog(true);
  };
  const saveMenuForm = () => {
    if (!menuForm.name.trim() || !menuForm.price) return;
    if (editingMenu) { updateMenuItem(editingMenu.id, { name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), categoryId: menuForm.categoryId, image: menuForm.image, available: menuForm.available }); toast.success("Menu item updated"); }
    else { saveMenuItem({ id: generateId("item"), businessId: business.id, categoryId: menuForm.categoryId, name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), image: menuForm.image, rating: 0, available: menuForm.available }); toast.success("Menu item created"); }
    setMenuDialog(false); refreshData();
  };

  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setMenuForm({ ...menuForm, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  // Table CRUD
  const openTableDialog = (t?: TableItem) => {
    if (t) { setEditingTable(t); setTableForm({ number: String(t.number), seats: String(t.seats) }); }
    else { setEditingTable(null); setTableForm({ number: String(tables.length + 1), seats: "4" }); }
    setTableDialog(true);
  };
  const saveTableForm = () => {
    if (!tableForm.number) return;
    if (editingTable) { updateTable(editingTable.id, { number: Number(tableForm.number), seats: Number(tableForm.seats) }); toast.success("Table updated"); }
    else { saveTable({ id: generateId("tbl"), businessId: business.id, number: Number(tableForm.number), seats: Number(tableForm.seats), status: "available" }); toast.success("Table created"); }
    setTableDialog(false); refreshData();
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "category") deleteCategory(deleteConfirm.id);
    else if (deleteConfirm.type === "menu") deleteMenuItem(deleteConfirm.id);
    else if (deleteConfirm.type === "table") deleteTable(deleteConfirm.id);
    toast.success(`${deleteConfirm.name} deleted`);
    setDeleteConfirm(null); refreshData();
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "—";
  const filteredMenuItems = menuItems.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()));

  // Export data
  const handleExport = () => {
    const data = {
      business: business.name,
      exportedAt: new Date().toISOString(),
      orders: orders.length,
      totalRevenue: orders.reduce((s, o) => s + o.total, 0),
      menuItems: menuItems.length,
      categories: categories.length,
      tables: tables.length,
      orderDetails: orders,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${business.name.replace(/\s+/g, "_")}_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Data exported!");
  };

  // Print QR
  const handlePrintQR = (tableNum: number) => {
    const url = `${window.location.origin}/register?table=${tableNum}&business=${business.id}`;
    const printWindow = window.open("", "_blank", "width=400,height=500");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>QR - Table #${tableNum}</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 40px; }
        h1 { font-size: 24px; margin-bottom: 5px; }
        h2 { font-size: 18px; color: #666; margin-bottom: 20px; }
        .qr-container { display: inline-block; padding: 20px; border: 3px solid #000; border-radius: 12px; }
        p { font-size: 12px; color: #999; margin-top: 15px; word-break: break-all; }
        .scan-text { font-size: 14px; color: #333; margin-top: 10px; font-weight: bold; }
      </style></head>
      <body>
        <h1>${business.name}</h1>
        <h2>Table #${tableNum}</h2>
        <div class="qr-container">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}" width="200" height="200" />
        </div>
        <p class="scan-text">📱 Scan to order</p>
        <p>${url}</p>
        <script>window.onload = () => { window.print(); }</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <AdminStatsCards
              todayRevenue={todayRevenue}
              totalOrders={orders.length}
              activeTables={activeTables}
              totalTables={tables.length}
              loyaltySignups={loyaltyCount}
            />
            <div className="grid lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <AdminRevenueChart orders={orders} />
              </div>
              <div className="lg:col-span-2">
                <PopularItems menuItems={menuItems} orders={orders} onViewAll={() => setActiveTab("menu")} />
              </div>
            </div>
          </div>
        );

      case "menu":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-display font-bold">Menu Items</h2><p className="text-sm text-muted-foreground">{menuItems.length} items</p></div>
              <div className="flex gap-3">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-48" /></div>
                <Button onClick={() => openMenuDialog()} variant="hero"><Plus className="w-4 h-4 mr-1" /> Add Item</Button>
              </div>
            </div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setSearchQuery("")}>All</Button>
              {categories.map(c => (
                <Button key={c.id} variant="outline" size="sm" className="text-xs" onClick={() => setSearchQuery(c.name)}>
                  {isImageUrl(c.icon) ? <img src={c.icon} alt="" className="w-4 h-4 rounded object-cover mr-1" /> : <span className="mr-1">{c.icon}</span>}
                  {c.name}
                </Button>
              ))}
              <Button variant="ghost" size="sm" className="text-xs text-accent" onClick={() => setActiveTab("categories")}>
                Manage Categories
              </Button>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredMenuItems.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">No menu items found</TableCell></TableRow>
                  ) : filteredMenuItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                            {isImageUrl(item.image) ? (
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-2xl">{item.image}</span>
                            )}
                          </div>
                          <div><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-muted-foreground">{item.description}</p></div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="secondary">{getCategoryName(item.categoryId)}</Badge></TableCell>
                      <TableCell className="font-semibold text-accent">${item.price.toFixed(2)}</TableCell>
                      <TableCell><Badge variant={item.available ? "secondary" : "destructive"}>{item.available ? "Available" : "Unavailable"}</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openMenuDialog(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm({ type: "menu", id: item.id, name: item.name })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "categories":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-display font-bold">Categories</h2><p className="text-sm text-muted-foreground">{categories.length} categories</p></div>
              <Button onClick={() => openCatDialog()} variant="hero"><Plus className="w-4 h-4 mr-1" /> Add Category</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, i) => (
                <motion.div key={cat.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                      {isImageUrl(cat.icon) ? (
                        <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">{cat.icon}</span>
                      )}
                    </div>
                    <div className="flex-1"><p className="font-display font-bold">{cat.name}</p><p className="text-xs text-muted-foreground">{menuItems.filter(m => m.categoryId === cat.id).length} items</p></div>
                  </div>
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openCatDialog(cat)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm({ type: "category", id: cat.id, name: cat.name })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "tables":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-display font-bold">Tables</h2><p className="text-sm text-muted-foreground">{tables.length} tables</p></div>
              <Button onClick={() => openTableDialog()} variant="hero"><Plus className="w-4 h-4 mr-1" /> New Table</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tables.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-all text-center">
                  <p className="text-3xl mb-2">🪑</p>
                  <p className="font-display font-bold">Table #{t.number}</p>
                  <p className="text-xs text-muted-foreground">{t.seats} seats</p>
                  <div className="mt-2">
                    <Select value={t.status} onValueChange={v => { updateTable(t.id, { status: v as TableItem["status"] }); refreshData(); }}>
                      <SelectTrigger className="h-7 text-xs mx-auto w-28">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-1 justify-center mt-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openTableDialog(t)}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteConfirm({ type: "table", id: t.id, name: `Table #${t.number}` })}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case "orders":
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h2 className="text-xl font-display font-bold">Orders</h2><p className="text-sm text-muted-foreground">{orders.length} orders</p></div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Time</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No orders yet</TableCell></TableRow>
                  ) : orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id.slice(0, 12)}</TableCell>
                      <TableCell className="text-sm">{o.items.map(i => i.name).join(", ")}</TableCell>
                      <TableCell className="font-bold text-accent">${o.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          o.status === "pending" ? "bg-secondary/20 text-secondary-foreground" :
                          o.status === "preparing" ? "bg-accent/20 text-accent" :
                          o.status === "ready" ? "bg-accent/30 text-accent-foreground" :
                          o.status === "delivered" ? "bg-muted text-muted-foreground" :
                          "bg-destructive/15 text-destructive"
                        }>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-right">
                        {o.status !== "delivered" && o.status !== "cancelled" && (
                          <Select value={o.status} onValueChange={v => { updateOrder(o.id, { status: v as Order["status"] }); refreshData(); }}>
                            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="preparing">Preparing</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancel</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        );

      case "qr":
        return (
          <div>
            <div className="mb-6"><h2 className="text-xl font-display font-bold">QR Codes</h2><p className="text-sm text-muted-foreground">Generate scannable & printable QR codes for each table</p></div>
            {tables.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center shadow-card-custom">
                <p className="text-muted-foreground mb-3">Create tables first!</p>
                <Button onClick={() => setActiveTab("tables")} variant="outline">Go to Tables</Button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map(t => {
                  const url = `${window.location.origin}/register?table=${t.number}&business=${business.id}`;
                  return (
                    <div key={t.id} className="bg-card border border-border rounded-xl p-6 shadow-card-custom text-center hover:shadow-gold transition-shadow">
                      <div className="mb-3 flex justify-center">
                        <div className="bg-white p-3 rounded-xl inline-block">
                          <QRCodeSVG
                            value={url}
                            size={160}
                            level="H"
                            includeMargin={false}
                            bgColor="#FFFFFF"
                            fgColor="#000000"
                          />
                        </div>
                      </div>
                      <p className="font-display font-bold text-lg">Table #{t.number}</p>
                      <p className="text-xs text-muted-foreground mt-1">{t.seats} seats</p>
                      <div className="flex gap-2 mt-4 justify-center">
                        <Button variant="outline" size="sm" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!"); }}>
                          <Copy className="w-3.5 h-3.5 mr-1" /> Copy
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handlePrintQR(t.number)}>
                          <Printer className="w-3.5 h-3.5 mr-1" /> Print
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => window.open(url, "_blank")}>
                          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Test
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case "loyalty":
        return <LoyaltyTab businessId={business.id} />;

      case "reports":
        return <ReportsTab orders={orders} menuItems={menuItems} categories={categories} />;

      case "settings":
        return <AdminSettings business={business} onUpdate={refreshData} />;

      default:
        return null;
    }
  };

  const tabTitles: Record<string, string> = {
    dashboard: "Dashboard",
    menu: "Menu Management",
    categories: "Categories",
    tables: "Table Management",
    orders: "Order Management",
    qr: "QR Codes",
    loyalty: "Loyalty Program",
    reports: "Reports",
    settings: "Settings",
  };

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar
        business={business}
        activeTab={activeTab}
        setActiveTab={(t) => { setActiveTab(t); setSearchQuery(""); }}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[240px]"}`}>
        <header className="border-b border-border bg-card px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">{tabTitles[activeTab] || "Dashboard"}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {activeTab === "dashboard" ? "Welcome back! Here's what's happening today." : `Manage your ${activeTab}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === "dashboard" && (
              <>
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-1.5" /> Export
                </Button>
                <Button variant="hero" size="sm" onClick={() => setActiveTab("orders")}>
                  <Plus className="w-4 h-4 mr-1.5" /> New Order
                </Button>
              </>
            )}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowHelp(false); }}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-11 w-72 bg-card border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <p className="font-semibold text-sm">Notifications</p>
                    <button onClick={() => setShowNotifications(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">No notifications</p>
                    ) : notifications.map(n => (
                      <div key={n.id} className="px-4 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { setActiveTab("orders"); setShowNotifications(false); }}>
                        <p className="text-xs text-foreground">{n.text}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => { setShowHelp(!showHelp); setShowNotifications(false); }}
                className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              {showHelp && (
                <div className="absolute right-0 top-11 w-64 bg-card border border-border rounded-xl shadow-lg z-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-semibold text-sm">Help</p>
                    <button onClick={() => setShowHelp(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
                  </div>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>📋 <strong>Menu</strong> — Add/edit items & categories</p>
                    <p>🪑 <strong>Tables</strong> — Manage seating</p>
                    <p>📦 <strong>Orders</strong> — Track & update orders</p>
                    <p>📱 <strong>QR Codes</strong> — Print for each table</p>
                    <p>⭐ <strong>Loyalty</strong> — Manage rewards</p>
                    <p>📊 <strong>Reports</strong> — View analytics</p>
                    <p>⚙️ <strong>Settings</strong> — Business config</p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-accent/15 flex items-center justify-center overflow-hidden">
              {business.logo ? (
                <img src={business.logo} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs font-bold text-accent">
                  {business.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingCat ? "Edit Category" : "New Category"}</DialogTitle><DialogDescription>Enter category details</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Name</label><Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Breakfast" /></div>
            <div>
              <label className="text-sm font-medium mb-2 block">Image</label>
              <div className="flex gap-2 mb-3">
                <Button type="button" variant={catImageMode === "emoji" ? "default" : "outline"} size="sm" onClick={() => setCatImageMode("emoji")}>Emoji</Button>
                <Button type="button" variant={catImageMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setCatImageMode("upload")}>
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload
                </Button>
              </div>
              {catImageMode === "emoji" ? (
                <div className="flex flex-wrap gap-2">{emojiOptions.map(e => (<button key={e} type="button" onClick={() => setCatForm({ ...catForm, icon: e })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all ${catForm.icon === e ? "border-accent bg-accent/10 shadow-gold" : "border-border hover:border-accent/50"}`}>{e}</button>))}</div>
              ) : (
                <div>
                  <input ref={catImageRef} type="file" accept="image/*" className="hidden" onChange={handleCatImageUpload} />
                  {isImageUrl(catForm.icon) ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-border">
                      <img src={catForm.icon} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setCatForm({ ...catForm, icon: "🍛" }); setCatImageMode("emoji"); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => catImageRef.current?.click()} className="w-24 h-24 rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-1 transition-colors">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Upload</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button><Button onClick={saveCatForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Menu Item Dialog */}
      <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editingMenu ? "Edit Menu Item" : "New Menu Item"}</DialogTitle><DialogDescription>Enter item details</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Name</label><Input value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} placeholder="e.g. Chicken Burger" /></div>
            <div><label className="text-sm font-medium mb-1 block">Description</label><Input value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} placeholder="Short description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">Price ($)</label><Input type="number" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={menuForm.categoryId} onValueChange={v => setMenuForm({ ...menuForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{isImageUrl(c.icon) ? "📁" : c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Available</label>
              <Switch checked={menuForm.available} onCheckedChange={v => setMenuForm({ ...menuForm, available: v })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Image</label>
              <div className="flex gap-2 mb-3">
                <Button type="button" variant={imageMode === "emoji" ? "default" : "outline"} size="sm" onClick={() => setImageMode("emoji")}>Emoji</Button>
                <Button type="button" variant={imageMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setImageMode("upload")}>
                  <Upload className="w-3.5 h-3.5 mr-1" /> Upload Photo
                </Button>
              </div>
              {imageMode === "emoji" ? (
                <div className="flex flex-wrap gap-2">{emojiOptions.map(e => (<button key={e} type="button" onClick={() => setMenuForm({ ...menuForm, image: e })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all ${menuForm.image === e ? "border-accent bg-accent/10 shadow-gold" : "border-border hover:border-accent/50"}`}>{e}</button>))}</div>
              ) : (
                <div>
                  <input ref={menuImageRef} type="file" accept="image/*" className="hidden" onChange={handleMenuImageUpload} />
                  {isImageUrl(menuForm.image) ? (
                    <div className="relative w-32 h-24 rounded-xl overflow-hidden border border-border">
                      <img src={menuForm.image} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setMenuForm({ ...menuForm, image: "🍛" }); setImageMode("emoji"); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"><X className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => menuImageRef.current?.click()} className="w-32 h-24 rounded-xl border-2 border-dashed border-border hover:border-accent flex flex-col items-center justify-center gap-1 transition-colors">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">Upload image</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setMenuDialog(false)}>Cancel</Button><Button onClick={saveMenuForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Table Dialog */}
      <Dialog open={tableDialog} onOpenChange={setTableDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingTable ? "Edit Table" : "New Table"}</DialogTitle><DialogDescription>Enter table details</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Table Number</label><Input type="number" value={tableForm.number} onChange={e => setTableForm({ ...tableForm, number: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Seats</label><Input type="number" value={tableForm.seats} onChange={e => setTableForm({ ...tableForm, seats: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setTableDialog(false)}>Cancel</Button><Button onClick={saveTableForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent><DialogHeader><DialogTitle>Are you sure?</DialogTitle><DialogDescription>"{deleteConfirm?.name}" will be permanently deleted.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button><Button variant="destructive" onClick={confirmDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
