import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Search, Upload, ImageIcon, FolderOpen } from "lucide-react";
import {
  Category, MenuItem,
  getCategories, saveCategory, updateCategory, deleteCategory,
  getMenuItems, saveMenuItem, updateMenuItem, deleteMenuItem,
  generateId,
} from "@/lib/store";
import { toast } from "sonner";

const emojiOptions = ["🍛","🍔","🐟","🥗","🍵","🥤","🫓","🍝","🍰","🍦","🦞","🥭","☕","🍕","🥩","🍗","🌮","🍣","🧁","🥚","🍳","🥐","🧀","🍱","🥘","🫘","🍮","🍨","🦑","🦐"];

// Somali restaurant food suggestions
const foodSuggestions = [
  { name: "Bariis Hilib Ari", description: "Bariis cad oo lagu daray hilib ari iyo xawaash macaan", price: 8.50, icon: "🍛", category: "Cuntada Aasaasiga" },
  { name: "Bariis Iskukaris", description: "Bariis la iskukaris oo leh khudrad iyo hilib", price: 7.00, icon: "🍚", category: "Cuntada Aasaasiga" },
  { name: "Suqaar iyo Canjeero", description: "Suqaar hilib lo'aad oo leh canjeero cusub", price: 6.50, icon: "🥘", category: "Cuntada Aasaasiga" },
  { name: "Hilib Geel", description: "Hilib geel la dubay oo leh baradho iyo salad", price: 9.00, icon: "🥩", category: "Shiilka" },
  { name: "Canjeero iyo Subag", description: "Canjeero cusub oo leh subag iyo malab", price: 3.50, icon: "🫓", category: "Quraac" },
  { name: "Bur Shax", description: "Bur kulul oo leh ukun iyo shaah", price: 4.00, icon: "🍳", category: "Quraac" },
  { name: "Fool iyo Canjeero", description: "Fool Masri oo leh saliid saytuun iyo canjeero", price: 4.50, icon: "🫘", category: "Quraac" },
  { name: "Sambusa", description: "Sambusa hilib oo la shiilshiilay", price: 2.00, icon: "🥟", category: "Quraac" },
  { name: "Chicken Tikka", description: "Digaag la dubay oo leh xawaash gaar ah", price: 10.00, icon: "🍗", category: "Shiilka" },
  { name: "Mishkaki", description: "Hilib lo'aad oo la dubay oo usha ku jira", price: 8.00, icon: "🥩", category: "Shiilka" },
  { name: "Burger Gaar ah", description: "Burger weyn oo leh salad iyo cheese", price: 7.50, icon: "🍔", category: "Shiilka" },
  { name: "Baasto Suugo", description: "Baasto leh suugo hilib iyo khudrad", price: 6.00, icon: "🍝", category: "Baasto" },
  { name: "Lasagna", description: "Lasagna hilib oo leh cheese badan", price: 8.50, icon: "🍝", category: "Baasto" },
  { name: "Kalluun la Dubay", description: "Kalluun cusub oo la dubay oo leh liin", price: 12.00, icon: "🐟", category: "Kalluunka" },
  { name: "Calamari", description: "Calamari la shiilshiilay oo leh sauce", price: 9.50, icon: "🦑", category: "Kalluunka" },
  { name: "Shaah Cadays", description: "Shaah xawaash leh caano", price: 1.50, icon: "☕", category: "Cabbitaanka" },
  { name: "Juice Mango", description: "Cambe cusub oo la miixay", price: 3.00, icon: "🥭", category: "Cabbitaanka" },
  { name: "Juice Avocado", description: "Avocado iyo caano la isku daray", price: 3.50, icon: "🥑", category: "Cabbitaanka" },
  { name: "Halwo", description: "Halwo Soomaali oo macaan", price: 3.00, icon: "🍮", category: "Macmacaan" },
  { name: "Buskud", description: "Buskud Soomaaliyeed oo macaan", price: 2.50, icon: "🍪", category: "Macmacaan" },
];

interface MenuManagementTabProps {
  businessId: string;
  onDataChange: () => void;
}

const MenuManagementTab = ({ businessId, onDataChange }: MenuManagementTabProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeSubTab, setActiveSubTab] = useState("items");
  const [searchQuery, setSearchQuery] = useState("");
  const [catDialog, setCatDialog] = useState(false);
  const [menuDialog, setMenuDialog] = useState(false);
  const [editingCat, setEditingCat] = useState<Category | null>(null);
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string; id: string; name: string } | null>(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "🍛" });
  const [menuForm, setMenuForm] = useState({ name: "", description: "", price: "", categoryId: "", image: "🍛", available: true });
  const [imageMode, setImageMode] = useState<"emoji" | "upload">("emoji");
  const [catImageMode, setCatImageMode] = useState<"emoji" | "upload">("emoji");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const menuImageRef = useRef<HTMLInputElement>(null);
  const catImageRef = useRef<HTMLInputElement>(null);

  useEffect(() => { refreshData(); }, [businessId]);

  const refreshData = async () => {
    setCategories(await getCategories(businessId));
    setMenuItems(await getMenuItems(businessId));
    onDataChange();
  };

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
    if (editingCat) {
      updateCategory(editingCat.id, { name: catForm.name, icon: catForm.icon });
      toast.success("Category la cusbooneysiiyay ✓");
    } else {
      saveCategory({ id: generateId("cat"), businessId, name: catForm.name, icon: catForm.icon, order: categories.length });
      toast.success("Category la abuuray ✓");
    }
    setCatDialog(false);
    refreshData();
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
    setShowSuggestions(false);
  };

  const saveMenuForm = () => {
    if (!menuForm.name.trim() || !menuForm.price) return;
    if (editingMenu) {
      updateMenuItem(editingMenu.id, { name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), categoryId: menuForm.categoryId, image: menuForm.image, available: menuForm.available });
      toast.success("Item la cusbooneysiiyay ✓");
    } else {
      saveMenuItem({ id: generateId("item"), businessId, categoryId: menuForm.categoryId, name: menuForm.name, description: menuForm.description, price: Number(menuForm.price), image: menuForm.image, rating: 0, available: menuForm.available });
      toast.success("Item la abuuray ✓");
    }
    setMenuDialog(false);
    refreshData();
  };

  const handleMenuImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setMenuForm({ ...menuForm, image: reader.result as string });
    reader.readAsDataURL(file);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === "category") deleteCategory(deleteConfirm.id);
    else if (deleteConfirm.type === "menu") deleteMenuItem(deleteConfirm.id);
    toast.success(`${deleteConfirm.name} la tirtiray ✓`);
    setDeleteConfirm(null);
    refreshData();
  };

  const applySuggestion = (suggestion: typeof foodSuggestions[0]) => {
    const matchingCat = categories.find(c => c.name.toLowerCase().includes(suggestion.category.toLowerCase()));
    setMenuForm({
      name: suggestion.name,
      description: suggestion.description,
      price: String(suggestion.price),
      categoryId: matchingCat?.id || categories[0]?.id || "",
      image: suggestion.icon,
      available: true,
    });
    setShowSuggestions(false);
  };

  const getCategoryName = (id: string) => categories.find(c => c.id === id)?.name || "—";
  const filteredMenuItems = menuItems.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">Menu Management</h2>
          <p className="text-sm text-muted-foreground">{menuItems.length} items · {categories.length} categories</p>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="items" className="gap-1.5">
            <FolderOpen className="w-4 h-4" /> Menu Items
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-1.5">
            <FolderOpen className="w-4 h-4" /> Categories
          </TabsTrigger>
        </TabsList>

        <TabsContent value="items">
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Raadi item..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-56" />
              </div>
              <Select value={searchQuery || "all"} onValueChange={v => setSearchQuery(v === "all" ? "" : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Dhammaan</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={() => openMenuDialog()} variant="hero">
              <Plus className="w-4 h-4 mr-1.5" /> Ku Dar Item
            </Button>
          </div>

          <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Qiimaha</TableHead>
                  <TableHead>Xaalad</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">Wax item ah lama helin</TableCell>
                  </TableRow>
                ) : filteredMenuItems.map((item, i) => (
                  <motion.tr
                    key={item.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border hover:bg-muted/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-muted flex items-center justify-center shrink-0">
                          {isImageUrl(item.image) ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{item.image}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{item.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">{item.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><Badge variant="secondary">{getCategoryName(item.categoryId)}</Badge></TableCell>
                    <TableCell className="font-semibold text-accent">${item.price.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={item.available ? "secondary" : "destructive"}>
                        {item.available ? "Diyaar" : "Ma Jiro"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => openMenuDialog(item)}>
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm({ type: "menu", id: item.id, name: item.name })}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">{categories.length} categories</p>
            <Button onClick={() => openCatDialog()} variant="hero">
              <Plus className="w-4 h-4 mr-1.5" /> Ku Dar Category
            </Button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {isImageUrl(cat.icon) ? (
                      <img src={cat.icon} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl">{cat.icon}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold">{cat.name}</p>
                    <p className="text-xs text-muted-foreground">{menuItems.filter(m => m.categoryId === cat.id).length} items</p>
                  </div>
                </div>
                <div className="flex gap-1 justify-end">
                  <Button variant="outline" size="sm" className="h-8 gap-1" onClick={() => openCatDialog(cat)}>
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDeleteConfirm({ type: "category", id: cat.id, name: cat.name })}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Menu Item Dialog */}
      <Dialog open={menuDialog} onOpenChange={setMenuDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="shrink-0">
            <DialogTitle>{editingMenu ? "Edit Item" : "Ku Dar Item Cusub"}</DialogTitle>
            <DialogDescription>Buuxi xogta item-ka menu-ga</DialogDescription>
          </DialogHeader>

          {!editingMenu && (
            <div className="mb-4">
              <Button variant="outline" size="sm" onClick={() => setShowSuggestions(!showSuggestions)} className="text-xs gap-1.5">
                💡 Tusaalooyin Cunto Soomaali
              </Button>
              {showSuggestions && (
                <div className="mt-2 max-h-40 overflow-y-auto border border-border rounded-lg p-2 space-y-1">
                  {foodSuggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => applySuggestion(s)}
                      className="w-full text-left p-2 rounded-lg hover:bg-muted text-sm flex items-center gap-2"
                    >
                      <span>{s.icon}</span>
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground ml-auto">${s.price}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="space-y-4 overflow-y-auto flex-1 pr-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Magaca</label>
                <Input value={menuForm.name} onChange={e => setMenuForm({ ...menuForm, name: e.target.value })} placeholder="Magaca item-ka" />
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Sharaxaad</label>
                <Textarea value={menuForm.description} onChange={e => setMenuForm({ ...menuForm, description: e.target.value })} placeholder="Sharaxaad gaaban" rows={2} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Qiimaha ($)</label>
                <Input type="number" step="0.01" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} placeholder="0.00" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Category</label>
                <Select value={menuForm.categoryId} onValueChange={v => setMenuForm({ ...menuForm, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Dooro" /></SelectTrigger>
                  <SelectContent>
                    {categories.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block">Sawirka</label>
                <div className="flex gap-2 mb-2">
                  <Button variant={imageMode === "emoji" ? "default" : "outline"} size="sm" onClick={() => setImageMode("emoji")}>Emoji</Button>
                  <Button variant={imageMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setImageMode("upload")}>Upload</Button>
                </div>
                {imageMode === "emoji" ? (
                  <div className="flex flex-wrap gap-2 p-2 border rounded-lg max-h-28 overflow-y-auto">
                    {emojiOptions.map(e => (
                      <button
                        key={e}
                        onClick={() => setMenuForm({ ...menuForm, image: e })}
                        className={`text-2xl p-1.5 rounded-lg hover:bg-muted transition-colors ${menuForm.image === e ? "bg-accent/20 ring-2 ring-accent" : ""}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent" onClick={() => menuImageRef.current?.click()}>
                      {isImageUrl(menuForm.image) ? (
                        <img src={menuForm.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      )}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => menuImageRef.current?.click()}>
                      <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload
                    </Button>
                    <input ref={menuImageRef} type="file" accept="image/*" className="hidden" onChange={handleMenuImageUpload} />
                  </div>
                )}
              </div>
              <div className="col-span-2 flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm font-medium">Diyaar (Available)</span>
                <Switch checked={menuForm.available} onCheckedChange={v => setMenuForm({ ...menuForm, available: v })} />
              </div>
            </div>
          </div>
          <DialogFooter className="shrink-0 border-t border-border pt-4 mt-2">
            <Button variant="outline" onClick={() => setMenuDialog(false)}>Jooji</Button>
            <Button variant="hero" onClick={saveMenuForm} disabled={!menuForm.name.trim() || !menuForm.price}>
              {editingMenu ? "Keydi" : "Ku Dar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={catDialog} onOpenChange={setCatDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCat ? "Edit Category" : "Ku Dar Category Cusub"}</DialogTitle>
            <DialogDescription>Buuxi xogta category-ga</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1.5 block">Magaca</label>
              <Input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Quraac, Cuntada Aasaasiga" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Icon</label>
              <div className="flex gap-2 mb-2">
                <Button variant={catImageMode === "emoji" ? "default" : "outline"} size="sm" onClick={() => setCatImageMode("emoji")}>Emoji</Button>
                <Button variant={catImageMode === "upload" ? "default" : "outline"} size="sm" onClick={() => setCatImageMode("upload")}>Upload</Button>
              </div>
              {catImageMode === "emoji" ? (
                <div className="flex flex-wrap gap-2 p-2 border rounded-lg max-h-28 overflow-y-auto">
                  {emojiOptions.map(e => (
                    <button
                      key={e}
                      onClick={() => setCatForm({ ...catForm, icon: e })}
                      className={`text-2xl p-1.5 rounded-lg hover:bg-muted transition-colors ${catForm.icon === e ? "bg-accent/20 ring-2 ring-accent" : ""}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent" onClick={() => catImageRef.current?.click()}>
                    {isImageUrl(catForm.icon) ? (
                      <img src={catForm.icon} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => catImageRef.current?.click()}>
                    <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload
                  </Button>
                  <input ref={catImageRef} type="file" accept="image/*" className="hidden" onChange={handleCatImageUpload} />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(false)}>Jooji</Button>
            <Button variant="hero" onClick={saveCatForm} disabled={!catForm.name.trim()}>
              {editingCat ? "Keydi" : "Ku Dar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Ma hubtaa?</DialogTitle>
            <DialogDescription>Ma rabtaa inaad tirtirto "{deleteConfirm?.name}"? Tani dib looma celin karo.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Maya</Button>
            <Button variant="destructive" onClick={confirmDelete}>Haa, Tirtir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MenuManagementTab;
