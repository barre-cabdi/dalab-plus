import { useState, useRef } from "react";
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
  X, Eye, EyeOff, PlusCircle, Shield, Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Business, getBusinesses, saveBusiness, generateId } from "@/lib/store";

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
    name: editBusiness?.name || "",
    type: (editBusiness?.type || "restaurant") as Business["type"],
    address: editBusiness?.address || "",
    city: editBusiness?.city || "",
    country: editBusiness?.country || "Somalia",
    countryCode: editBusiness?.countryCode || "+252",
    phonePrefix: editBusiness?.phonePrefix || "",
    phone: editBusiness?.phone || "",
    email: editBusiness?.email || "",
    logo: editBusiness?.logo || "",
    description: editBusiness?.description || "",
    adminUsername: editBusiness?.adminUsername || "",
    adminPassword: editBusiness?.adminPassword || "",
    subscription: (editBusiness?.subscription || "free") as Business["subscription"],
  });

  const selectedCountry = eastAfricaCountries.find(c => c.code === form.countryCode);
  const hasPrefixes = selectedCountry && selectedCountry.prefixes.length > 0;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, logo: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBusiness && getBusinesses().some(b => b.adminUsername === form.adminUsername)) {
      toast.error("Username already taken!");
      return;
    }
    const fullPhone = `${form.countryCode}${form.phonePrefix}${form.phone}`;
    const newBiz: Business = {
      id: editBusiness?.id || generateId("biz"),
      name: form.name,
      type: form.type,
      address: form.address,
      city: form.city,
      country: form.country,
      countryCode: form.countryCode,
      phonePrefix: form.phonePrefix,
      phone: form.phone,
      email: form.email,
      logo: form.logo,
      description: form.description,
      adminUsername: form.adminUsername,
      adminPassword: form.adminPassword,
      status: editBusiness?.status || "active",
      createdAt: editBusiness?.createdAt || new Date().toISOString(),
      totalOrders: editBusiness?.totalOrders || 0,
      totalRevenue: editBusiness?.totalRevenue || 0,
      subscription: form.subscription,
    };

    if (editBusiness) {
      const { updateBusiness } = require("@/lib/store");
      updateBusiness(editBusiness.id, newBiz);
    } else {
      saveBusiness(newBiz);
    }
    onCreated();
    onClose();
    toast.success(editBusiness ? `"${newBiz.name}" updated!` : `"${newBiz.name}" created!`);
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
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Business["type"] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
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

              {/* Location */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Country *</Label>
                  <Select value={form.country} onValueChange={(v) => {
                    const c = eastAfricaCountries.find(x => x.country === v);
                    setForm({ ...form, country: v, countryCode: c?.code || "+252", phonePrefix: "" });
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {eastAfricaCountries.map(c => (
                        <SelectItem key={c.code} value={c.country}>
                          {c.flag} {c.country}
                        </SelectItem>
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

              {/* Phone with country code and prefix */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Phone Number *</Label>
                <div className="flex gap-2">
                  {/* Country code (read-only) */}
                  <div className="flex items-center gap-1 px-3 bg-muted rounded-md border border-border text-sm min-w-[80px] justify-center shrink-0">
                    <span>{selectedCountry?.flag}</span>
                    <span className="font-medium">{form.countryCode}</span>
                  </div>
                  {/* Prefix selector for Somalia */}
                  {hasPrefixes && (
                    <Select value={form.phonePrefix} onValueChange={(v) => setForm({ ...form, phonePrefix: v })}>
                      <SelectTrigger className="w-[90px] shrink-0">
                        <SelectValue placeholder="Prefix" />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedCountry.prefixes.map(p => (
                          <SelectItem key={p} value={p}>{p}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                    placeholder={hasPrefixes ? "XXXXXXX" : "XXXXXXXXX"}
                    required
                    className="flex-1"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Full: {form.countryCode} {form.phonePrefix} {form.phone}
                </p>
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
