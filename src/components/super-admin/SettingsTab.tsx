import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Bell, Shield, Globe, Save, Database, RefreshCw, CreditCard, Edit2, Check, X, Plus, Trash2, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  maxMenuItems: number;
  maxTables: number;
  popular?: boolean;
}

const DEFAULT_PLANS: SubscriptionPlan[] = [
  { id: "free", name: "Free", price: 0, features: ["5 Menu items", "2 Tables", "Basic analytics"], maxMenuItems: 5, maxTables: 2 },
  { id: "basic", name: "Basic", price: 29, features: ["50 Menu items", "10 Tables", "Email support", "Analytics"], maxMenuItems: 50, maxTables: 10 },
  { id: "premium", name: "Premium", price: 79, features: ["Unlimited Menu items", "50 Tables", "Priority support", "Advanced analytics", "Custom branding"], maxMenuItems: 999, maxTables: 50, popular: true },
  { id: "enterprise", name: "Enterprise", price: 199, features: ["Unlimited everything", "Unlimited Tables", "24/7 support", "API access", "White-label", "Dedicated manager"], maxMenuItems: 9999, maxTables: 9999 },
];

const PLANS_KEY = "dp_subscription_plans";

export const getPlans = (): SubscriptionPlan[] => {
  const stored = localStorage.getItem(PLANS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_PLANS;
};

const savePlans = (plans: SubscriptionPlan[]) => {
  localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
};

const SettingsTab = () => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [platformLogo, setPlatformLogo] = useState<string>(
    localStorage.getItem("dp_platform_logo") || ""
  );
  const [settings, setSettings] = useState({
    platformName: "DALABplus+",
    supportEmail: "support@dalabplus.com",
    maxBusinesses: "100",
    autoApproval: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    analyticsEnabled: true,
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be under 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setPlatformLogo(base64);
      localStorage.setItem("dp_platform_logo", base64);
      toast.success("Logo uploaded! ✅");
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setPlatformLogo("");
    localStorage.removeItem("dp_platform_logo");
    toast.success("Logo removed");
  };

  const [plans, setPlans] = useState<SubscriptionPlan[]>(getPlans());
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<SubscriptionPlan | null>(null);
  const [newFeature, setNewFeature] = useState("");

  const handleSave = () => {
    localStorage.setItem("dp_settings", JSON.stringify(settings));
    savePlans(plans);
    toast.success("Settings saved successfully! ✅");
  };

  const handleReset = () => {
    if (!confirm("Reset all data? This cannot be undone.")) return;
    localStorage.clear();
    toast.success("All data cleared! Refreshing...");
    setTimeout(() => window.location.reload(), 1000);
  };

  const startEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan.id);
    setEditForm({ ...plan, features: [...plan.features] });
  };

  const cancelEdit = () => {
    setEditingPlan(null);
    setEditForm(null);
    setNewFeature("");
  };

  const saveEdit = () => {
    if (!editForm) return;
    const updated = plans.map(p => p.id === editForm.id ? editForm : p);
    setPlans(updated);
    savePlans(updated);
    setEditingPlan(null);
    setEditForm(null);
    setNewFeature("");
    toast.success(`"${editForm.name}" plan updated! ✅`);
  };

  const addFeature = () => {
    if (!newFeature.trim() || !editForm) return;
    setEditForm({ ...editForm, features: [...editForm.features, newFeature.trim()] });
    setNewFeature("");
  };

  const removeFeature = (idx: number) => {
    if (!editForm) return;
    setEditForm({ ...editForm, features: editForm.features.filter((_, i) => i !== idx) });
  };

  const addNewPlan = () => {
    const newPlan: SubscriptionPlan = {
      id: `plan-${Date.now().toString(36)}`,
      name: "New Plan",
      price: 0,
      features: ["Feature 1"],
      maxMenuItems: 10,
      maxTables: 5,
    };
    const updated = [...plans, newPlan];
    setPlans(updated);
    savePlans(updated);
    startEdit(newPlan);
    toast.success("New plan added — edit it now!");
  };

  const deletePlan = (id: string) => {
    if (id === "free") { toast.error("Cannot delete the Free plan"); return; }
    if (!confirm("Delete this plan?")) return;
    const updated = plans.filter(p => p.id !== id);
    setPlans(updated);
    savePlans(updated);
    if (editingPlan === id) cancelEdit();
    toast.success("Plan deleted!");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Subscription Plans */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-accent" />
            <h3 className="font-display font-bold text-foreground">Subscription Plans</h3>
          </div>
          <Button variant="outline" size="sm" onClick={addNewPlan}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Plan
          </Button>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`relative border rounded-xl p-5 transition-all ${
                plan.popular ? "border-primary bg-primary/5" : "border-border bg-background"
              } ${editingPlan === plan.id ? "ring-2 ring-primary" : ""}`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 left-4 text-[10px] font-bold uppercase bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full">
                  Popular
                </span>
              )}

              <AnimatePresence mode="wait">
                {editingPlan === plan.id && editForm ? (
                  <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Name</Label>
                        <Input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Price ($/mo)</Label>
                        <Input type="number" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Max Menu Items</Label>
                        <Input type="number" value={editForm.maxMenuItems} onChange={e => setEditForm({ ...editForm, maxMenuItems: Number(e.target.value) })} className="h-8 text-sm" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground uppercase">Max Tables</Label>
                        <Input type="number" value={editForm.maxTables} onChange={e => setEditForm({ ...editForm, maxTables: Number(e.target.value) })} className="h-8 text-sm" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={editForm.popular || false} onCheckedChange={v => setEditForm({ ...editForm, popular: v })} />
                      <span className="text-xs text-muted-foreground">Mark as Popular</span>
                    </div>

                    {/* Features */}
                    <div className="space-y-1.5">
                      <Label className="text-[10px] text-muted-foreground uppercase">Features</Label>
                      <div className="space-y-1">
                        {editForm.features.map((f, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 group">
                            <span className="text-xs text-foreground flex-1 bg-muted/50 rounded px-2 py-1">{f}</span>
                            <button onClick={() => removeFeature(idx)} className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-1.5">
                        <Input
                          value={newFeature}
                          onChange={e => setNewFeature(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && addFeature()}
                          placeholder="Add feature..."
                          className="h-7 text-xs"
                        />
                        <Button size="sm" variant="outline" onClick={addFeature} className="h-7 px-2">
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <Button size="sm" onClick={saveEdit} className="flex-1 h-8">
                        <Check className="w-3.5 h-3.5 mr-1" /> Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-display font-bold text-foreground">{plan.name}</h4>
                        <p className="text-2xl font-bold text-foreground mt-1">
                          ${plan.price}<span className="text-xs font-normal text-muted-foreground">/mo</span>
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => startEdit(plan)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {plan.id !== "free" && (
                          <button onClick={() => deletePlan(plan.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      {plan.features.map((f, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Check className="w-3 h-3 text-accent flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-3 pt-3 border-t border-border">
                      <span className="text-[10px] text-muted-foreground">Menu: <strong className="text-foreground">{plan.maxMenuItems}</strong></span>
                      <span className="text-[10px] text-muted-foreground">Tables: <strong className="text-foreground">{plan.maxTables}</strong></span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* General */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-foreground">General Settings</h3>
        </div>
        <div className="space-y-4">
          {/* Logo Upload */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Platform Logo</Label>
            <div className="flex items-center gap-4">
              <div
                onClick={() => logoInputRef.current?.click()}
                className="w-20 h-20 rounded-xl border-2 border-dashed border-border hover:border-primary/50 bg-muted/30 flex items-center justify-center cursor-pointer transition-colors overflow-hidden group"
              >
                {platformLogo ? (
                  <img src={platformLogo} alt="Platform logo" className="w-full h-full object-contain p-1" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground group-hover:text-primary transition-colors">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-[9px]">Upload</span>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                  <Upload className="w-3.5 h-3.5 mr-1.5" /> Choose Logo
                </Button>
                {platformLogo && (
                  <Button variant="ghost" size="sm" onClick={removeLogo} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Remove
                  </Button>
                )}
                <p className="text-[10px] text-muted-foreground">PNG, JPG, SVG. Max 2MB</p>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Platform Name</Label>
              <Input value={settings.platformName} onChange={e => setSettings({ ...settings, platformName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Support Email</Label>
              <Input value={settings.supportEmail} onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Businesses Allowed</Label>
            <Input type="number" value={settings.maxBusinesses} onChange={e => setSettings({ ...settings, maxBusinesses: e.target.value })} className="w-32" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-approve new businesses</p>
              <p className="text-xs text-muted-foreground">Automatically activate new businesses upon creation</p>
            </div>
            <Switch checked={settings.autoApproval} onCheckedChange={v => setSettings({ ...settings, autoApproval: v })} />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive email alerts for new signups and issues" },
            { key: "smsNotifications" as const, label: "SMS Notifications", desc: "Receive SMS for critical alerts" },
            { key: "analyticsEnabled" as const, label: "Analytics Tracking", desc: "Track platform usage and performance" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={settings[item.key]} onCheckedChange={v => setSettings({ ...settings, [item.key]: v })} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-destructive/30 rounded-xl p-6 shadow-card-custom">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-destructive" />
          <h3 className="font-display font-bold text-destructive">Danger Zone</h3>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
            <p className="text-xs text-muted-foreground">Disable all business dashboards temporarily</p>
          </div>
          <Switch checked={settings.maintenanceMode} onCheckedChange={v => setSettings({ ...settings, maintenanceMode: v })} />
        </div>
        <div className="flex items-center justify-between py-2 mt-2">
          <div>
            <p className="text-sm font-medium text-foreground">Reset All Data</p>
            <p className="text-xs text-muted-foreground">Clear all businesses, orders, and settings</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleReset}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
        </div>
      </motion.div>

      <Button variant="hero" onClick={handleSave} className="w-full">
        <Save className="w-4 h-4 mr-2" /> Save All Settings
      </Button>
    </div>
  );
};

export default SettingsTab;
