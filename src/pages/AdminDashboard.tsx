import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";
import {
  Business, Category, MenuItem, TableItem, Order,
  getCategories, saveCategory, updateCategory, deleteCategory,
  getMenuItems, saveMenuItem, updateMenuItem, deleteMenuItem,
  getTables, saveTable, updateTable, deleteTable,
  getOrders, updateOrder, generateId,
} from "@/lib/store";
import { toast } from "sonner";

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
    // Re-read business from localStorage
    const stored = localStorage.getItem("dp_active_business");
    if (stored) setBusiness(JSON.parse(stored));
  };

  if (!business) return null;

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const activeTables = tables.filter(t => t.status === "occupied").length;
  const loyaltyCount = JSON.parse(localStorage.getItem("dp_loyalty_members") || "[]").filter((m: any) => m.businessId === business.id).length;

  // Category CRUD
  const openCatDialog = (cat?: Category) => {
    if (cat) { setEditingCat(cat); setCatForm({ name: cat.name, icon: cat.icon }); }
    else { setEditingCat(null); setCatForm({ name: "", icon: "🍛" }); }
    setCatDialog(true);
  };
  const saveCatForm = () => {
    if (!catForm.name.trim()) return;
    if (editingCat) { updateCategory(editingCat.id, { name: catForm.name, icon: catForm.icon }); toast.success("Category updated"); }
    else { saveCategory({ id: generateId("cat"), businessId: business.id, name: catForm.name, icon: catForm.icon, order: categories.length }); toast.success("Category created"); }
    setCatDialog(false); refreshData();
  };

  // Menu CRUD
  const openMenuDialog = (item?: MenuItem) => {
    if (item) { setEditingMenu(item); setMenuForm({ name: item.name, description: item.description, price: String(item.price), categoryId: item.categoryId, image: item.image, available: item.available }); }
    else { setEditingMenu(null); setMenuForm({ name: "", description: "", price: "", categoryId: categories[0]?.id || "", image: "🍛", available: true }); }
    setMenuDialog(true);
  };
  const saveMenuForm = () => {
    if (!menuForm.name.trim() || !menuForm.price) return;
    if (editingMenu) { updateMenuItem(editingMenu.id, { name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), categoryId: menuForm.categoryId, image: menuForm.image, available: menuForm.available }); toast.success("Menu item updated"); }
    else { saveMenuItem({ id: generateId("item"), businessId: business.id, categoryId: menuForm.categoryId, name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), image: menuForm.image, rating: 0, available: menuForm.available }); toast.success("Menu item created"); }
    setMenuDialog(false); refreshData();
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
            {/* Category filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button variant="outline" size="sm" className="text-xs" onClick={() => setSearchQuery("")}>All</Button>
              {categories.map(c => (
                <Button key={c.id} variant="outline" size="sm" className="text-xs" onClick={() => setSearchQuery(c.name)}>
                  {c.icon} {c.name}
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
                          <span className="text-2xl">{item.image}</span>
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
                    <span className="text-3xl">{cat.icon}</span>
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
                  <Badge variant="secondary" className={`mt-2 capitalize ${t.status === "occupied" ? "bg-accent/15 text-accent" : t.status === "reserved" ? "bg-secondary/15 text-secondary-foreground" : ""}`}>
                    {t.status}
                  </Badge>
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
            <div className="mb-6"><h2 className="text-xl font-display font-bold">QR Codes</h2><p className="text-sm text-muted-foreground">Generate QR codes for each table</p></div>
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
                    <div key={t.id} className="bg-card border border-border rounded-xl p-5 shadow-card-custom text-center hover:shadow-gold transition-shadow">
                      <div className="w-28 h-28 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center"><QrCode className="w-14 h-14 text-muted-foreground" /></div>
                      <p className="font-display font-bold">Table #{t.number}</p>
                      <p className="text-[10px] text-muted-foreground mt-1 break-all px-2">{url}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { navigator.clipboard.writeText(url); toast.success("Link copied!"); }}>Copy Link</Button>
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
        {/* Top Header */}
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
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1.5" /> Export
                </Button>
                <Button variant="hero" size="sm" onClick={() => setActiveTab("orders")}>
                  <Plus className="w-4 h-4 mr-1.5" /> New Order
                </Button>
              </>
            )}
            <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
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

      {/* Dialogs */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingCat ? "Edit Category" : "New Category"}</DialogTitle><DialogDescription>Enter category details</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Name</label><Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Breakfast" /></div>
            <div><label className="text-sm font-medium mb-1 block">Icon</label>
              <div className="flex flex-wrap gap-2">{emojiOptions.map(e => (<button key={e} onClick={() => setCatForm({ ...catForm, icon: e })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all ${catForm.icon === e ? "border-accent bg-accent/10 shadow-gold" : "border-border hover:border-accent/50"}`}>{e}</button>))}</div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button><Button onClick={saveCatForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingMenu ? "Edit Menu Item" : "New Menu Item"}</DialogTitle><DialogDescription>Enter item details</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Name</label><Input value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} placeholder="e.g. Chicken Burger" /></div>
            <div><label className="text-sm font-medium mb-1 block">Description</label><Input value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} placeholder="Short description" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">Price ($)</label><Input type="number" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={menuForm.categoryId} onValueChange={v => setMenuForm({ ...menuForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><label className="text-sm font-medium mb-1 block">Icon</label>
              <div className="flex flex-wrap gap-2">{emojiOptions.map(e => (<button key={e} onClick={() => setMenuForm({ ...menuForm, image: e })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all ${menuForm.image === e ? "border-accent bg-accent/10 shadow-gold" : "border-border hover:border-accent/50"}`}>{e}</button>))}</div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setMenuDialog(false)}>Cancel</Button><Button onClick={saveMenuForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tableDialog} onOpenChange={setTableDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingTable ? "Edit Table" : "New Table"}</DialogTitle><DialogDescription>Enter table details</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Table Number</label><Input type="number" value={tableForm.number} onChange={e => setTableForm({ ...tableForm, number: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Seats</label><Input type="number" value={tableForm.seats} onChange={e => setTableForm({ ...tableForm, seats: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setTableDialog(false)}>Cancel</Button><Button onClick={saveTableForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent><DialogHeader><DialogTitle>Are you sure?</DialogTitle><DialogDescription>"{deleteConfirm?.name}" will be permanently deleted.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button><Button variant="destructive" onClick={confirmDelete}>Delete</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
