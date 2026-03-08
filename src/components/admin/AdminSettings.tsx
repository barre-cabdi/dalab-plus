import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Lock, Save, Upload, ImageIcon, X, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Business, updateBusiness } from "@/lib/store";
import { toast } from "sonner";

interface AdminSettingsProps {
  business: Business;
  onUpdate: () => void;
}

interface SettingField {
  key: string;
  label: string;
  type: "text" | "select" | "switch" | "logo";
  value: any;
  options?: { value: string; label: string }[];
  superAdminOnly: boolean;
  description?: string;
}

const AdminSettings = ({ business, onUpdate }: AdminSettingsProps) => {
  const isSuperAdmin = localStorage.getItem("dp_user_role") === "superadmin";
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: business.name,
    email: business.email || "",
    phone: business.phone || "",
    address: business.address || "",
    city: business.city || "",
    country: business.country || "",
    logo: business.logo || "",
    type: business.type,
    description: business.description || "",
    // Admin-editable settings stored in localStorage
    currency: localStorage.getItem(`dp_admin_currency_${business.id}`) || "USD",
    language: localStorage.getItem(`dp_admin_language_${business.id}`) || "so",
    orderNotifications: localStorage.getItem(`dp_admin_notif_${business.id}`) !== "false",
    autoAcceptOrders: localStorage.getItem(`dp_admin_autoaccept_${business.id}`) === "true",
    // SuperAdmin-only settings
    subscription: business.subscription,
    maxTables: localStorage.getItem(`dp_admin_maxtables_${business.id}`) || "20",
    maxMenuItems: localStorage.getItem(`dp_admin_maxmenu_${business.id}`) || "100",
    enableLoyalty: localStorage.getItem(`dp_admin_loyalty_${business.id}`) !== "false",
    commissionRate: localStorage.getItem(`dp_admin_commission_${business.id}`) || "5",
    enablePayments: localStorage.getItem(`dp_admin_payments_${business.id}`) === "true",
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error("Max 2MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, logo: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    // Save admin-editable fields to business
    updateBusiness(business.id, {
      name: form.name,
      email: form.email,
      phone: form.phone,
      address: form.address,
      city: form.city,
      country: form.country,
      logo: form.logo,
      description: form.description,
    });

    // Save admin-editable preferences
    localStorage.setItem(`dp_admin_currency_${business.id}`, form.currency);
    localStorage.setItem(`dp_admin_language_${business.id}`, form.language);
    localStorage.setItem(`dp_admin_notif_${business.id}`, String(form.orderNotifications));
    localStorage.setItem(`dp_admin_autoaccept_${business.id}`, String(form.autoAcceptOrders));

    // SuperAdmin-only fields
    if (isSuperAdmin) {
      updateBusiness(business.id, { subscription: form.subscription as Business["subscription"], type: form.type });
      localStorage.setItem(`dp_admin_maxtables_${business.id}`, form.maxTables);
      localStorage.setItem(`dp_admin_maxmenu_${business.id}`, form.maxMenuItems);
      localStorage.setItem(`dp_admin_loyalty_${business.id}`, String(form.enableLoyalty));
      localStorage.setItem(`dp_admin_commission_${business.id}`, form.commissionRate);
      localStorage.setItem(`dp_admin_payments_${business.id}`, String(form.enablePayments));
    }

    onUpdate();
    toast.success("Settings saved!");
  };

  const LockBadge = ({ label }: { label?: string }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-[10px] text-destructive/70 bg-destructive/10 px-2 py-0.5 rounded-full cursor-default ml-2">
          <Lock className="w-3 h-3" />
          <span className="hidden sm:inline">Locked</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Only SuperAdmin can edit this setting
      </TooltipContent>
    </Tooltip>
  );

  const renderField = (
    label: string,
    superAdminOnly: boolean,
    children: React.ReactNode
  ) => {
    const locked = superAdminOnly && !isSuperAdmin;
    return (
      <div className={`relative ${locked ? "opacity-60" : ""}`}>
        <div className="flex items-center mb-1.5">
          <label className="text-sm font-medium text-foreground">{label}</label>
          {superAdminOnly && <LockBadge />}
        </div>
        <div className={locked ? "pointer-events-none" : ""}>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your business preferences</p>
        </div>
        <Button onClick={handleSave} variant="hero">
          <Save className="w-4 h-4 mr-2" /> Save Changes
        </Button>
      </div>

      {/* Business Profile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 shadow-card-custom"
      >
        <h3 className="font-display font-bold text-base mb-5 text-foreground">Business Profile</h3>
        
        {/* Logo */}
        <div className="flex items-center gap-5 mb-6">
          <div
            className="w-20 h-20 rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:border-accent transition-colors overflow-hidden"
            onClick={() => fileRef.current?.click()}
          >
            {form.logo ? (
              <img src={form.logo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
          <div>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Logo
            </Button>
            {form.logo && (
              <Button variant="ghost" size="sm" className="ml-2 text-destructive" onClick={() => setForm(f => ({ ...f, logo: "" }))}>
                <X className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            )}
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 2MB</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {renderField("Business Name", false,
            <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          )}
          {renderField("Business Type", true,
            <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="hotel">Hotel</SelectItem>
                <SelectItem value="cafe">Cafe</SelectItem>
              </SelectContent>
            </Select>
          )}
          {renderField("Email", false,
            <Input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          )}
          {renderField("Phone", false,
            <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
          )}
          {renderField("Address", false,
            <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} />
          )}
          {renderField("City", false,
            <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} />
          )}
        </div>
      </motion.div>

      {/* Preferences - Admin Editable */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 shadow-card-custom"
      >
        <h3 className="font-display font-bold text-base mb-5 text-foreground">Preferences</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          {renderField("Currency", false,
            <Select value={form.currency} onValueChange={v => setForm(f => ({ ...f, currency: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="KES">KES (KSh)</SelectItem>
                <SelectItem value="SOS">SOS (Sh)</SelectItem>
                <SelectItem value="ETB">ETB (Br)</SelectItem>
                <SelectItem value="UGX">UGX (USh)</SelectItem>
              </SelectContent>
            </Select>
          )}
          {renderField("Language", false,
            <Select value={form.language} onValueChange={v => setForm(f => ({ ...f, language: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="so">Somali</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
                <SelectItem value="sw">Swahili</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Order Notifications</p>
              <p className="text-xs text-muted-foreground">Receive alerts for new orders</p>
            </div>
            <Switch
              checked={form.orderNotifications}
              onCheckedChange={v => setForm(f => ({ ...f, orderNotifications: v }))}
            />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-Accept Orders</p>
              <p className="text-xs text-muted-foreground">Automatically accept incoming orders</p>
            </div>
            <Switch
              checked={form.autoAcceptOrders}
              onCheckedChange={v => setForm(f => ({ ...f, autoAcceptOrders: v }))}
            />
          </div>
        </div>
      </motion.div>

      {/* Platform Settings - SuperAdmin Only */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6 shadow-card-custom"
      >
        <div className="flex items-center gap-2 mb-5">
          <h3 className="font-display font-bold text-base text-foreground">Platform Controls</h3>
          {!isSuperAdmin && (
            <span className="text-[10px] text-destructive/70 bg-destructive/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Lock className="w-3 h-3" /> SuperAdmin Only
            </span>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {renderField("Subscription Plan", true,
            <Select value={form.subscription} onValueChange={v => setForm(f => ({ ...f, subscription: v as any }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="basic">Basic</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          )}
          {renderField("Commission Rate (%)", true,
            <Input type="number" value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} />
          )}
          {renderField("Max Tables", true,
            <Input type="number" value={form.maxTables} onChange={e => setForm(f => ({ ...f, maxTables: e.target.value }))} />
          )}
          {renderField("Max Menu Items", true,
            <Input type="number" value={form.maxMenuItems} onChange={e => setForm(f => ({ ...f, maxMenuItems: e.target.value }))} />
          )}
        </div>

        <div className="mt-5 space-y-4">
          <div className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 ${!isSuperAdmin ? "opacity-60 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Loyalty Program</p>
                <p className="text-xs text-muted-foreground">Allow customers to earn rewards</p>
              </div>
              {!isSuperAdmin && <LockBadge />}
            </div>
            <Switch
              checked={form.enableLoyalty}
              onCheckedChange={v => setForm(f => ({ ...f, enableLoyalty: v }))}
            />
          </div>
          <div className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 ${!isSuperAdmin ? "opacity-60 pointer-events-none" : ""}`}>
            <div className="flex items-center gap-2">
              <div>
                <p className="text-sm font-medium text-foreground">Enable Payments</p>
                <p className="text-xs text-muted-foreground">Accept online payments from customers</p>
              </div>
              {!isSuperAdmin && <LockBadge />}
            </div>
            <Switch
              checked={form.enablePayments}
              onCheckedChange={v => setForm(f => ({ ...f, enablePayments: v }))}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSettings;
