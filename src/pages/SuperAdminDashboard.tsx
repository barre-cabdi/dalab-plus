import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Users, BarChart3, Shield, PlusCircle,
  LogOut, X, Eye, EyeOff, Hotel, Coffee, UtensilsCrossed,
  Trash2, Power, Search,
} from "lucide-react";
import { toast } from "sonner";
import {
  Business, getBusinesses, saveBusiness, updateBusiness,
  deleteBusiness, generateId,
} from "@/lib/store";

const typeIcons: Record<string, any> = { hotel: Hotel, cafe: Coffee, restaurant: UtensilsCrossed };
const typeLabels: Record<string, string> = { hotel: "Hotel", cafe: "Cafe", restaurant: "Restaurant" };

const SuperAdminDashboard = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "restaurant" as Business["type"], address: "", phone: "", adminUsername: "", adminPassword: "",
  });

  useEffect(() => { setBusinesses(getBusinesses()); }, []);
  const refresh = () => setBusinesses(getBusinesses());

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (getBusinesses().some(b => b.adminUsername === form.adminUsername)) {
      toast.error("Username-kaas waa la isticmaalaa!");
      return;
    }
    const newBiz: Business = {
      id: generateId("biz"), ...form, status: "active", createdAt: new Date().toISOString(), totalOrders: 0, totalRevenue: 0,
    };
    saveBusiness(newBiz);
    refresh();
    setShowForm(false);
    setForm({ name: "", type: "restaurant", address: "", phone: "", adminUsername: "", adminPassword: "" });
    toast.success(`${typeLabels[newBiz.type]} "${newBiz.name}" si guul leh ayaa loo sameeyay!`);
  };

  const toggleStatus = (id: string, current: string) => {
    const newStatus = current === "active" ? "inactive" : "active";
    updateBusiness(id, { status: newStatus as Business["status"] });
    refresh();
    toast.success(newStatus === "active" ? "Meherad la furiyay ✅" : "Meherad la xidhay ❌");
  };

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Ma hubtaa inaad tirtiraysaa "${name}"?`)) return;
    deleteBusiness(id);
    refresh();
    toast.success("Meherad la tirtiray!");
  };

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.type.includes(search.toLowerCase()) || b.adminUsername.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = businesses.filter(b => b.status === "active").length;
  const totalRevenue = businesses.reduce((sum, b) => sum + b.totalRevenue, 0);
  const stats = [
    { label: "Meherado Guud", value: businesses.length.toString(), icon: Building2 },
    { label: "Kuwa Firfircoon", value: activeCount.toString(), icon: Shield },
    { label: "Admins", value: businesses.length.toString(), icon: Users },
    { label: "Dakhli Guud", value: `$${totalRevenue.toLocaleString()}`, icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center">
            <span className="font-display font-bold text-accent-foreground text-sm">D+</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg">Super Admin</h1>
            <p className="text-xs text-muted-foreground">DALABplus+ Control Panel</p>
          </div>
        </div>
        <Link to="/login"><Button variant="ghost" size="sm"><LogOut className="w-4 h-4 mr-2" /> Logout</Button></Link>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-shadow duration-300">
              <div className="flex items-center justify-between mb-3">
                <s.icon className="w-5 h-5 text-accent" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-2xl font-display font-bold">{s.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Raadi meherad..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={() => setShowForm(true)} variant="hero">
            <PlusCircle className="w-4 h-4 mr-2" /> Meherad Cusub
          </Button>
        </div>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Wali meherad lama diiwaan-gelin</p>
              <p className="text-xs mt-1">Riix "Meherad Cusub" si aad mid cusub u sameyso</p>
            </div>
          )}
          {filtered.map((biz, i) => {
            const TypeIcon = typeIcons[biz.type] || Building2;
            return (
              <motion.div key={biz.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-xl p-4 shadow-card-custom hover:shadow-gold transition-all duration-300 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${biz.status === "active" ? "bg-accent/15" : "bg-muted"}`}>
                  <TypeIcon className={`w-5 h-5 ${biz.status === "active" ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-semibold text-sm truncate">{biz.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${biz.status === "active" ? "bg-accent/15 text-accent" : "bg-destructive/15 text-destructive"}`}>
                      {biz.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {typeLabels[biz.type]} · {biz.address} · Admin: <strong>{biz.adminUsername}</strong>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleStatus(biz.id, biz.status)}>
                    <Power className={`w-4 h-4 ${biz.status === "active" ? "text-accent" : "text-muted-foreground"}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(biz.id, biz.name)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-hero" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-bold text-lg">Meherad Cusub Samee</h2>
                <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Magaca Meheradda</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Al-Baraka Hotel" required />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Nooca</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["restaurant", "hotel", "cafe"] as const).map((t) => {
                      const Icon = typeIcons[t];
                      return (
                        <button type="button" key={t} onClick={() => setForm({ ...form, type: t })} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${form.type === t ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:border-accent/30"}`}>
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{typeLabels[t]}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Cinwaanka</Label>
                    <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Mogadishu" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Telefoonka</Label>
                    <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="061..." required />
                  </div>
                </div>

                <div className="border-t border-border pt-4 mt-2">
                  <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-accent" /> Admin Login Credentials
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Username</Label>
                      <Input value={form.adminUsername} onChange={(e) => setForm({ ...form, adminUsername: e.target.value })} placeholder="admin_albaraka" required />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Password</Label>
                      <div className="relative">
                        <Input type={showPassword ? "text" : "password"} value={form.adminPassword} onChange={(e) => setForm({ ...form, adminPassword: e.target.value })} placeholder="••••••" required className="pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full mt-2">
                  <PlusCircle className="w-4 h-4 mr-2" /> Meherad Samee
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
