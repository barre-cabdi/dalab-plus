import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X, Eye, EyeOff, PlusCircle, Shield, Upload, Trash2, Plus, Wallet, CreditCard, Smartphone, Lock,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Business, BusinessService, MobilePaymentProvider, PaymentMethodsConfig, BusinessPermissions, getBusinesses, saveBusiness, updateBusiness, generateId, getDefaultServices, getDefaultPaymentMethods, getDefaultPermissions } from "@/lib/store";

const businessTypes = [
  { value: "restaurant", label: "Restaurant", emoji: "🍽️" },
  { value: "hotel", label: "Hotel", emoji: "🏨" },
  { value: "cafe", label: "Cafe", emoji: "☕" },
];

const eastAfricaCountries = [
  { code: "+252", country: "Somalia", flag: "🇸🇴", prefixes: ["61", "63", "65", "68", "69", "70", "71", "90"] },
  { code: "+254", country: "Kenya", flag: "🇰🇪", prefixes: [] },
  { code: "+255", country: "Tanzania", flag: "🇹🇿", prefixes: [] },
  { code: "+256", country: "Uganda", flag: "🇺🇬", prefixes: [] },
  { code: "+251", country: "Ethiopia", flag: "🇪🇹", prefixes: [] },
  { code: "+253", country: "Djibouti", flag: "🇩🇯", prefixes: [] },
  { code: "+257", country: "Burundi", flag: "🇧🇮", prefixes: [] },
  { code: "+250", country: "Rwanda", flag: "🇷🇼", prefixes: [] },
  { code: "+291", country: "Eritrea", flag: "🇪🇷", prefixes: [] },
];

const serviceEmojis = ["🍽️", "📦", "⭐", "👥", "🚗", "🎉", "☕", "🛏️", "🛎️", "📶", "🅿️", "👨‍💼", "🥐", "🏊", "💪", "🧖", "🎵", "📸"];

interface NewBusinessModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  editBusiness?: Business | null;
}

const NewBusinessModal = ({ open, onClose, onCreated, editBusiness }: NewBusinessModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    name: "",
    type: "restaurant" as Business["type"],
    address: "",
    city: "",
    country: "Somalia",
    countryCode: "+252",
    phonePrefix: "",
    phone: "",
    email: "",
    logo: "",
    description: "",
    adminUsername: "",
    adminPassword: "",
    subscription: "free" as Business["subscription"],
  });
  const [services, setServices] = useState<BusinessService[]>(getDefaultServices("restaurant"));

  // Reset form when editBusiness changes or modal opens
  useEffect(() => {
    if (open) {
      if (editBusiness) {
        setForm({
          name: editBusiness.name,
          type: editBusiness.type,
          address: editBusiness.address,
          city: editBusiness.city,
          country: editBusiness.country,
          countryCode: editBusiness.countryCode,
          phonePrefix: editBusiness.phonePrefix,
          phone: editBusiness.phone,
          email: editBusiness.email,
          logo: editBusiness.logo,
          description: editBusiness.description,
          adminUsername: editBusiness.adminUsername,
          adminPassword: editBusiness.adminPassword,
          subscription: editBusiness.subscription,
        });
        setServices(editBusiness.services || getDefaultServices(editBusiness.type));
      } else {
        setForm({
          name: "", type: "restaurant", address: "", city: "", country: "Somalia",
          countryCode: "+252", phonePrefix: "", phone: "", email: "", logo: "",
          description: "", adminUsername: "", adminPassword: "", subscription: "free",
        });
        setServices(getDefaultServices("restaurant"));
      }
    }
  }, [open, editBusiness]);

  const selectedCountry = eastAfricaCountries.find(c => c.code === form.countryCode);
  const hasPrefixes = selectedCountry && selectedCountry.prefixes.length > 0;

  const handleTypeChange = (type: Business["type"]) => {
    setForm({ ...form, type });
    // Only reset services if creating new (not editing)
    if (!editBusiness) {
      setServices(getDefaultServices(type));
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be under 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setForm({ ...form, logo: reader.result as string });
    reader.readAsDataURL(file);
  };

  const addService = () => {
    setServices([...services, { id: generateId("svc"), title: "", description: "", icon: "⭐" }]);
  };

  const removeService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof BusinessService, value: string) => {
    setServices(services.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBusiness && getBusinesses().some(b => b.adminUsername === form.adminUsername)) {
      toast.error("Username already taken!");
      return;
    }
    const validServices = services.filter(s => s.title.trim());
    const newBiz: Business = {
      id: editBusiness?.id || generateId("biz"),
      ...form,
      services: validServices,
      status: editBusiness?.status || "active",
      createdAt: editBusiness?.createdAt || new Date().toISOString(),
      totalOrders: editBusiness?.totalOrders || 0,
      totalRevenue: editBusiness?.totalRevenue || 0,
    };

    if (editBusiness) {
      updateBusiness(editBusiness.id, newBiz);
    } else {
      saveBusiness(newBiz);
    }
    onCreated();
    onClose();
    toast.success(editBusiness ? `"${newBiz.name}" updated!` : `"${newBiz.name}" created with home page! 🎉`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-hero max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">{editBusiness ? "Edit Business" : "Create New Business"}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* Logo Upload */}
              <div className="flex items-center gap-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-accent/50 flex items-center justify-center cursor-pointer transition-colors overflow-hidden bg-muted/30"
                >
                  {form.logo ? (
                    <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground">Logo</span>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                <div className="flex-1 space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Business Name *</Label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Al-Baraka Hotel" required />
                </div>
              </div>

              {/* Type & Subscription */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Business Type *</Label>
                  <Select value={form.type} onValueChange={(v) => handleTypeChange(v as Business["type"])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {businessTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>
                          <span className="flex items-center gap-2">{t.emoji} {t.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Subscription Plan</Label>
                  <Select value={form.subscription} onValueChange={(v) => setForm({ ...form, subscription: v as Business["subscription"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">🆓 Free</SelectItem>
                      <SelectItem value="basic">⭐ Basic</SelectItem>
                      <SelectItem value="premium">💎 Premium</SelectItem>
                      <SelectItem value="enterprise">🏢 Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description of the business..." rows={2} />
              </div>

              {/* Services Editor */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    🏠 Home Page Services
                  </p>
                  <Button type="button" variant="outline" size="sm" onClick={addService} className="h-7 text-xs gap-1">
                    <Plus className="w-3 h-3" /> Add Service
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3">
                  These services will appear on the customer home page when they scan the QR code
                </p>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {services.map((service, i) => (
                    <motion.div
                      key={service.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-2 bg-muted/30 rounded-lg p-2.5 border border-border"
                    >
                      {/* Emoji picker */}
                      <Select value={service.icon} onValueChange={(v) => updateService(service.id, "icon", v)}>
                        <SelectTrigger className="w-14 h-9 shrink-0 text-base">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="grid grid-cols-6 gap-1 p-1">
                            {serviceEmojis.map(e => (
                              <SelectItem key={e} value={e} className="flex items-center justify-center p-1 cursor-pointer">
                                {e}
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                      <div className="flex-1 space-y-1">
                        <Input
                          value={service.title}
                          onChange={(e) => updateService(service.id, "title", e.target.value)}
                          placeholder="Service name"
                          className="h-8 text-xs"
                        />
                        <Input
                          value={service.description}
                          onChange={(e) => updateService(service.id, "description", e.target.value)}
                          placeholder="Short description"
                          className="h-8 text-xs"
                        />
                      </div>
                      <button type="button" onClick={() => removeService(service.id)} className="text-muted-foreground hover:text-destructive mt-1 shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Country *</Label>
                  <Select value={form.country} onValueChange={(v) => {
                    const c = eastAfricaCountries.find(x => x.country === v);
                    setForm({ ...form, country: v, countryCode: c?.code || "+252", phonePrefix: "" });
                  }}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {eastAfricaCountries.map(c => (
                        <SelectItem key={c.code} value={c.country}>{c.flag} {c.country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">City *</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Mogadishu" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Address *</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street / Area" required />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone Number *</Label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1 px-3 bg-muted rounded-md border border-border text-sm min-w-[80px] justify-center shrink-0">
                    <span>{selectedCountry?.flag}</span>
                    <span className="font-medium">{form.countryCode}</span>
                  </div>
                  {hasPrefixes && (
                    <Select value={form.phonePrefix} onValueChange={(v) => setForm({ ...form, phonePrefix: v })}>
                      <SelectTrigger className="w-[90px] shrink-0"><SelectValue placeholder="Prefix" /></SelectTrigger>
                      <SelectContent>
                        {selectedCountry.prefixes.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} placeholder={hasPrefixes ? "XXXXXXX" : "XXXXXXXXX"} required className="flex-1" />
                </div>
                <p className="text-[10px] text-muted-foreground">Full: {form.countryCode} {form.phonePrefix} {form.phone}</p>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@business.com" />
              </div>

              {/* Admin credentials */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-accent" /> Admin Login Credentials
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Username *</Label>
                    <Input value={form.adminUsername} onChange={(e) => setForm({ ...form, adminUsername: e.target.value })} placeholder="admin_albaraka" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Password *</Label>
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
                <PlusCircle className="w-4 h-4 mr-2" /> {editBusiness ? "Update Business" : "Create Business"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewBusinessModal;
