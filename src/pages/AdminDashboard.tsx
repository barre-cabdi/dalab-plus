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
  LayoutDashboard, UtensilsCrossed, Grid3X3, QrCode,
  ClipboardList, Users, BarChart3, Settings, LogOut,
  Hotel, Coffee, Building2, Plus, Pencil, Trash2, Search,
} from "lucide-react";
import {
  Business, Category, MenuItem, TableItem, Order,
  getCategories, saveCategory, updateCategory, deleteCategory,
  getMenuItems, saveMenuItem, updateMenuItem, deleteMenuItem,
  getTables, saveTable, updateTable, deleteTable,
  getOrders, updateOrder, generateId,
} from "@/lib/store";
import { toast } from "@/hooks/use-toast";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: Grid3X3, label: "Categories", key: "categories" },
  { icon: UtensilsCrossed, label: "Menu Items", key: "menu" },
  { icon: Grid3X3, label: "Tables", key: "tables" },
  { icon: ClipboardList, label: "Orders", key: "orders" },
  { icon: QrCode, label: "QR Codes", key: "qr" },
  { icon: Users, label: "Customers", key: "customers" },
  { icon: BarChart3, label: "Reports", key: "reports" },
  { icon: Settings, label: "Settings", key: "settings" },
];

const typeIcons: Record<string, any> = { hotel: Hotel, cafe: Coffee, restaurant: UtensilsCrossed };
const emojiOptions = ["🍛","🍔","🐟","🥗","🍵","🥤","🫓","🍝","🍰","🍦","🦞","🥭","☕","🍕","🥩","🍗","🌮","🍣","🧁","🥚","🍳","🥐","🧀","🍱"];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeTab, setActiveTab] = useState("dashboard");
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
  };

  if (!business) return null;
  const TypeIcon = typeIcons[business.type] || Building2;

  const stats = [
    { label: "Dalabada Maanta", value: String(orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length) },
    { label: "Dakhliga Guud", value: `$${orders.reduce((s, o) => s + o.total, 0).toLocaleString()}` },
    { label: "Miisaska", value: String(tables.length) },
    { label: "Dalabada Sugaysa", value: String(orders.filter(o => o.status === "pending").length) },
  ];

  const openCatDialog = (cat?: Category) => {
    if (cat) { setEditingCat(cat); setCatForm({ name: cat.name, icon: cat.icon }); }
    else { setEditingCat(null); setCatForm({ name: "", icon: "🍛" }); }
    setCatDialog(true);
  };

  const saveCatForm = () => {
    if (!catForm.name.trim()) return;
    if (editingCat) { updateCategory(editingCat.id, { name: catForm.name, icon: catForm.icon }); toast({ title: "Category updated" }); }
    else { saveCategory({ id: generateId("cat"), businessId: business.id, name: catForm.name, icon: catForm.icon, order: categories.length }); toast({ title: "Category created" }); }
    setCatDialog(false); refreshData();
  };

  const openMenuDialog = (item?: MenuItem) => {
    if (item) { setEditingMenu(item); setMenuForm({ name: item.name, description: item.description, price: String(item.price), categoryId: item.categoryId, image: item.image, available: item.available }); }
    else { setEditingMenu(null); setMenuForm({ name: "", description: "", price: "", categoryId: categories[0]?.id || "", image: "🍛", available: true }); }
    setMenuDialog(true);
  };

  const saveMenuForm = () => {
    if (!menuForm.name.trim() || !menuForm.price) return;
    if (editingMenu) { updateMenuItem(editingMenu.id, { name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), categoryId: menuForm.categoryId, image: menuForm.image, available: menuForm.available }); toast({ title: "Menu item updated" }); }
    else { saveMenuItem({ id: generateId("item"), businessId: business.id, categoryId: menuForm.categoryId, name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), image: menuForm.image, rating: 0, available: menuForm.available }); toast({ title: "Menu item created" }); }
    setMenuDialog(false); refreshData();
  };

  const openTableDialog = (t?: TableItem) => {
    if (t) { setEditingTable(t); setTableForm({ number: String(t.number), seats: String(t.seats) }); }
    else { setEditingTable(null); setTableForm({ number: String(tables.length + 1), seats: "4" }); }
    setTableDialog(true);
  };

  const saveTableForm = () => {
    if (!tableForm.number) return;
    if (editingTable) { updateTable(editingTable.id, { number: Number(tableForm.number), seats: Number(tableForm.seats) }); toast({ title: "Table updated" }); }
    else { saveTable({ id: generateId("tbl"), businessId: business.id, number: Number(tableForm.number), seats: Number(tableForm.seats), status: "available" }); toast({ title: "Table created" }); }
    setTableDialog(false); refreshData();
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "category") deleteCategory(deleteConfirm.id);
    else if (deleteConfirm.type === "menu") deleteMenuItem(deleteConfirm.id);
    else if (deleteConfirm.type === "table") deleteTable(deleteConfirm.id);
    toast({ title: `${deleteConfirm.name} deleted` });
    setDeleteConfirm(null); refreshData();
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "—";
  const filteredMenuItems = menuItems.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        <div className="p-4 border-b border-sidebar-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-accent-foreground" />
          </div>
          <div className="min-w-0">
            <p className="font-display font-bold text-sm text-sidebar-foreground truncate">{business.name}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{business.type} Admin</p>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.key} onClick={() => { setActiveTab(item.key); setSearchQuery(""); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${activeTab === item.key ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"}`}>
              <item.icon className="w-4 h-4" /> {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <Link to="/login" onClick={() => localStorage.removeItem("dp_active_business")}>
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground/60">
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "dashboard" && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-display font-bold">{business.name}</h1>
              <p className="text-sm text-muted-foreground">Ku soo dhawoow! Halkan waxaad ka maaraysan kartaa {business.type}-kaaga.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-shadow duration-300">
                  <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                </motion.div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom max-w-md">
              <h3 className="font-display font-semibold text-sm mb-4">Xogta Meheradda</h3>
              <div className="space-y-3 text-sm">
                {[["Nooca", business.type], ["Cinwaanka", business.address], ["Telefoonka", business.phone], ["Categories", String(categories.length)], ["Menu Items", String(menuItems.length)]].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-muted-foreground">{k}</span><span className="font-medium capitalize">{v}</span></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "categories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h1 className="text-2xl font-display font-bold">Categories</h1><p className="text-sm text-muted-foreground">{categories.length} categories</p></div>
              <Button onClick={() => openCatDialog()} variant="hero"><Plus className="w-4 h-4 mr-1" /> Ku Dar</Button>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Icon</TableHead><TableHead>Magaca</TableHead><TableHead>Menu Items</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {categories.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">Wali category ma jirto. Ku dar mid cusub!</TableCell></TableRow>
                  ) : categories.map(cat => (
                    <TableRow key={cat.id}>
                      <TableCell className="text-2xl">{cat.icon}</TableCell>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>{menuItems.filter(m => m.categoryId === cat.id).length}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openCatDialog(cat)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "category", id: cat.id, name: cat.name })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h1 className="text-2xl font-display font-bold">Menu Items</h1><p className="text-sm text-muted-foreground">{menuItems.length} items</p></div>
              <div className="flex gap-3">
                <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Raadi..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-48" /></div>
                <Button onClick={() => openMenuDialog()} variant="hero"><Plus className="w-4 h-4 mr-1" /> Ku Dar</Button>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Icon</TableHead><TableHead>Magaca</TableHead><TableHead>Category</TableHead><TableHead>Qiimaha</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {filteredMenuItems.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Menu items ma jiraan.</TableCell></TableRow>
                  ) : filteredMenuItems.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="text-2xl">{item.image}</TableCell>
                      <TableCell><p className="font-medium">{item.name}</p><p className="text-xs text-muted-foreground">{item.description}</p></TableCell>
                      <TableCell><Badge variant="secondary">{getCategoryName(item.categoryId)}</Badge></TableCell>
                      <TableCell className="font-semibold text-accent">${item.price}</TableCell>
                      <TableCell><Badge variant={item.available ? "secondary" : "destructive"}>{item.available ? "Available" : "Unavailable"}</Badge></TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button variant="ghost" size="icon" onClick={() => openMenuDialog(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm({ type: "menu", id: item.id, name: item.name })}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {activeTab === "tables" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div><h1 className="text-2xl font-display font-bold">Tables</h1><p className="text-sm text-muted-foreground">{tables.length} miis</p></div>
              <Button onClick={() => openTableDialog()} variant="hero"><Plus className="w-4 h-4 mr-1" /> Miis Cusub</Button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {tables.map(t => (
                <motion.div key={t.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-all duration-300 text-center">
                  <p className="text-3xl mb-2">🪑</p>
                  <p className="font-display font-bold">Table #{t.number}</p>
                  <p className="text-xs text-muted-foreground">{t.seats} kursi</p>
                  <Badge variant="secondary" className="mt-2 capitalize">{t.status}</Badge>
                  <div className="flex gap-1 justify-center mt-3">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openTableDialog(t)}><Pencil className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteConfirm({ type: "table", id: t.id, name: `Table #${t.number}` })}><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <div className="mb-6"><h1 className="text-2xl font-display font-bold">Orders</h1><p className="text-sm text-muted-foreground">{orders.length} dalabyo</p></div>
            <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
              <Table>
                <TableHeader><TableRow><TableHead>Order ID</TableHead><TableHead>Items</TableHead><TableHead>Total</TableHead><TableHead>Status</TableHead><TableHead>Waqtiga</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Wali dalabyo ma jiraan.</TableCell></TableRow>
                  ) : orders.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id}</TableCell>
                      <TableCell>{o.items.map(i => i.name).join(", ")}</TableCell>
                      <TableCell className="font-bold text-accent">${o.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={
                          o.status === "pending" ? "bg-secondary/80 text-secondary-foreground" :
                          o.status === "preparing" ? "bg-accent/20 text-accent" :
                          o.status === "ready" ? "bg-accent/30 text-accent-foreground" :
                          o.status === "delivered" ? "bg-muted text-muted-foreground" :
                          "bg-destructive/15 text-destructive"
                        }>{o.status}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleTimeString()}</TableCell>
                      <TableCell className="text-right">
                        {o.status !== "delivered" && o.status !== "cancelled" && (
                          <Select value={o.status} onValueChange={(v) => { updateOrder(o.id, { status: v as Order["status"] }); refreshData(); }}>
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
        )}

        {activeTab === "qr" && (
          <div>
            <div className="mb-6"><h1 className="text-2xl font-display font-bold">QR Codes</h1><p className="text-sm text-muted-foreground">Table kasta wuxuu leeyahay QR code gaar ah</p></div>
            {tables.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-8 text-center shadow-card-custom"><p className="text-muted-foreground mb-3">Marka hore tables samee!</p><Button onClick={() => setActiveTab("tables")} variant="outline">Tables tag</Button></div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tables.map(t => {
                  const url = `${window.location.origin}/register?table=${t.number}&business=${business.id}`;
                  return (
                    <div key={t.id} className="bg-card border border-border rounded-xl p-5 shadow-card-custom text-center hover:shadow-gold transition-shadow duration-300">
                      <div className="w-32 h-32 mx-auto mb-3 bg-muted rounded-lg flex items-center justify-center"><QrCode className="w-16 h-16 text-muted-foreground" /></div>
                      <p className="font-display font-bold">Table #{t.number}</p>
                      <p className="text-xs text-muted-foreground mt-1 break-all">{url}</p>
                      <Button variant="outline" size="sm" className="mt-3" onClick={() => { navigator.clipboard.writeText(url); toast({ title: "Link copied!" }); }}>Copy Link</Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {["customers", "reports", "settings"].includes(activeTab) && (
          <div className="flex items-center justify-center h-64">
            <div className="text-center"><h2 className="text-xl font-display font-bold mb-2 capitalize">{activeTab}</h2><p className="text-muted-foreground text-sm">Qaybtan waa la soo sameyn doonaa dhawaan.</p></div>
          </div>
        )}
      </main>

      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingCat ? "Edit Category" : "Category Cusub"}</DialogTitle><DialogDescription>Magaca iyo icon-ka category-ga geli.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Magaca</label><Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Quraac" /></div>
            <div><label className="text-sm font-medium mb-1 block">Icon</label>
              <div className="flex flex-wrap gap-2">{emojiOptions.map(e => (<button key={e} onClick={() => setCatForm({ ...catForm, icon: e })} className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center border transition-all ${catForm.icon === e ? "border-accent bg-accent/10 shadow-gold" : "border-border hover:border-accent/50"}`}>{e}</button>))}</div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setCatDialog(false)}>Cancel</Button><Button onClick={saveCatForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingMenu ? "Edit Menu Item" : "Menu Item Cusub"}</DialogTitle><DialogDescription>Xogta cuntada geli.</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Magaca</label><Input value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} placeholder="e.g. Chicken Burger" /></div>
            <div><label className="text-sm font-medium mb-1 block">Sharaxaad</label><Input value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} placeholder="Sharaxaad gaaban" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-sm font-medium mb-1 block">Qiimaha ($)</label><Input type="number" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Category</label>
                <Select value={menuForm.categoryId} onValueChange={v => setMenuForm({ ...menuForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Dooro..." /></SelectTrigger>
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
        <DialogContent><DialogHeader><DialogTitle>{editingTable ? "Edit Table" : "Table Cusub"}</DialogTitle><DialogDescription>Lambarka iyo kuraasta table-ka geli.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium mb-1 block">Table Number</label><Input type="number" value={tableForm.number} onChange={e => setTableForm({ ...tableForm, number: e.target.value })} /></div>
            <div><label className="text-sm font-medium mb-1 block">Seats</label><Input type="number" value={tableForm.seats} onChange={e => setTableForm({ ...tableForm, seats: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setTableDialog(false)}>Cancel</Button><Button onClick={saveTableForm} variant="hero">Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent><DialogHeader><DialogTitle>Ma hubtaa?</DialogTitle><DialogDescription>"{deleteConfirm?.name}" waa la tirtiri doonaa. Tallaabadan dib looma celin karo.</DialogDescription></DialogHeader>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteConfirm(null)}>Maya</Button><Button variant="destructive" onClick={confirmDelete}>Haa, Tirtir</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
