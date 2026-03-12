import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Phone, Mail, MapPin, Calendar, CreditCard, Shield, Wallet, Smartphone, Lock, Save, Plus, Trash2, KeyRound, Eye, EyeOff } from "lucide-react";
import { Business, getDefaultPaymentMethods, getDefaultPermissions, PaymentMethodsConfig, BusinessPermissions, MobilePaymentProvider, updateBusiness, generateId } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const typeLabels: Record<string, string> = { hotel: "Hotel", cafe: "Cafe", restaurant: "Restaurant" };
const subLabels: Record<string, string> = { free: "Free", basic: "Basic", premium: "Premium", enterprise: "Enterprise" };

interface Props {
  open: boolean;
  onClose: () => void;
  business: Business | null;
  onUpdated?: () => void;
}

const BusinessDetailModal = ({ open, onClose, business, onUpdated }: Props) => {
  const [editMode, setEditMode] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsConfig>(getDefaultPaymentMethods());
  const [permissions, setPermissions] = useState<BusinessPermissions>(getDefaultPermissions());

  useEffect(() => {
    if (business) {
      setPaymentMethods(business.paymentMethods || getDefaultPaymentMethods());
      setPermissions(business.permissions || getDefaultPermissions());
      setEditMode(false);
    }
  }, [business]);

  if (!business) return null;
  const fullPhone = `${business.countryCode || ""}${business.phonePrefix || ""}${business.phone || ""}`;

  const addMobileProvider = () => {
    setPaymentMethods(pm => ({
      ...pm,
      mobileProviders: [...pm.mobileProviders, { id: generateId("mp"), name: "", accountNumber: "" }],
    }));
  };
  const removeMobileProvider = (id: string) => {
    setPaymentMethods(pm => ({ ...pm, mobileProviders: pm.mobileProviders.filter(p => p.id !== id) }));
  };
  const updateMobileProvider = (id: string, field: keyof MobilePaymentProvider, value: string) => {
    setPaymentMethods(pm => ({
      ...pm,
      mobileProviders: pm.mobileProviders.map(p => p.id === id ? { ...p, [field]: value } : p),
    }));
  };

  const handleSave = () => {
    updateBusiness(business.id, { paymentMethods, permissions });
    // Also sync dp_active_business if it matches
    try {
      const active = localStorage.getItem("dp_active_business");
      if (active) {
        const activeBiz = JSON.parse(active);
        if (activeBiz.id === business.id) {
          localStorage.setItem("dp_active_business", JSON.stringify({ ...activeBiz, paymentMethods, permissions }));
        }
      }
    } catch {}
    toast.success("Business settings updated ✅");
    setEditMode(false);
    onUpdated?.();
  };

  const permissionItems = [
    { key: "canEditMenu" as const, label: "Menu Editing", icon: "🍽️" },
    { key: "canManageStaff" as const, label: "Staff Management", icon: "👥" },
    { key: "canViewReports" as const, label: "View Reports", icon: "📊" },
    { key: "canManageTables" as const, label: "Table Management", icon: "🪑" },
    { key: "canManageHotel" as const, label: "Hotel Management", icon: "🏨" },
    { key: "canManageLoyalty" as const, label: "Loyalty Program", icon: "⭐" },
    { key: "canManageReceipts" as const, label: "Receipt Settings", icon: "🧾" },
    { key: "canViewPayments" as const, label: "View Payments", icon: "💰" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-hero max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">Business Details</h2>
              <div className="flex items-center gap-2">
                {!editMode ? (
                  <Button variant="outline" size="sm" onClick={() => setEditMode(true)} className="gap-1.5 text-xs">
                    <Shield className="w-3.5 h-3.5" /> Edit Controls
                  </Button>
                ) : (
                  <Button variant="hero" size="sm" onClick={handleSave} className="gap-1.5 text-xs">
                    <Save className="w-3.5 h-3.5" /> Save
                  </Button>
                )}
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center overflow-hidden shrink-0">
                  {business.logo ? (
                    <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-accent" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground">{business.name}</h3>
                  <p className="text-sm text-muted-foreground">{typeLabels[business.type]}</p>
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium mt-1 ${business.status === "active" ? "text-accent" : "text-destructive"}`}>
                    <span className={`w-2 h-2 rounded-full ${business.status === "active" ? "bg-accent" : "bg-destructive"}`} />
                    {business.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {business.description && (
                <p className="text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">{business.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3">
                <InfoItem icon={MapPin} label="Location" value={`${business.city || ""}, ${business.country || ""}`} />
                <InfoItem icon={MapPin} label="Address" value={business.address} />
                <InfoItem icon={Phone} label="Phone" value={fullPhone || "N/A"} />
                <InfoItem icon={Mail} label="Email" value={business.email || "N/A"} />
                <InfoItem icon={CreditCard} label="Plan" value={subLabels[business.subscription || "free"]} />
                <InfoItem icon={Calendar} label="Created" value={new Date(business.createdAt).toLocaleDateString()} />
                <InfoItem icon={Shield} label="Admin" value={business.adminUsername} />
                <InfoItem icon={Building2} label="Revenue" value={`$${business.totalRevenue.toLocaleString()}`} />
              </div>

              {/* Payment Methods */}
              <div className="mt-4 border-t border-border pt-4">
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-accent" /> Payment Methods
                  {!editMode && <Lock className="w-3 h-3 text-muted-foreground ml-auto" />}
                </p>
                {editMode ? (
                  <div className="space-y-3">
                    {[
                      { key: "cashEnabled" as const, label: "💵 Cash", },
                      { key: "cardEnabled" as const, label: "💳 Card", },
                      { key: "mobileEnabled" as const, label: "📱 Mobile Payments", },
                    ].map(pm => (
                      <div key={pm.key} className="flex items-center justify-between bg-muted/30 rounded-lg px-3 py-2">
                        <span className="text-sm font-medium">{pm.label}</span>
                        <Switch checked={paymentMethods[pm.key]} onCheckedChange={v => setPaymentMethods(prev => ({ ...prev, [pm.key]: v }))} />
                      </div>
                    ))}
                    {paymentMethods.mobileEnabled && (
                      <div className="ml-2 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground">Mobile Providers</p>
                        {paymentMethods.mobileProviders.map(p => (
                          <div key={p.id} className="flex gap-2 items-center">
                            <Input placeholder="Name (e.g. Zaad)" value={p.name} onChange={e => updateMobileProvider(p.id, "name", e.target.value)} className="h-8 text-xs flex-1" />
                            <Input placeholder="Account #" value={p.accountNumber} onChange={e => updateMobileProvider(p.id, "accountNumber", e.target.value)} className="h-8 text-xs flex-1" />
                            <button onClick={() => removeMobileProvider(p.id)} className="text-destructive hover:text-destructive/80"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" className="text-xs gap-1" onClick={addMobileProvider}>
                          <Plus className="w-3 h-3" /> Add Provider
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${paymentMethods.cashEnabled ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground line-through"}`}>💵 Cash</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${paymentMethods.cardEnabled ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground line-through"}`}>💳 Card</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${paymentMethods.mobileEnabled ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground line-through"}`}>📱 Mobile</span>
                    </div>
                    {paymentMethods.mobileEnabled && paymentMethods.mobileProviders.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {paymentMethods.mobileProviders.map(p => (
                          <span key={p.id} className="text-[10px] bg-muted/50 border border-border px-2 py-0.5 rounded-full">
                            {p.name}: {p.accountNumber}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Access Controls */}
              <div className="border-t border-border pt-4">
                <p className="text-xs font-semibold text-foreground mb-3 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-accent" /> Access Controls
                  {!editMode && <Lock className="w-3 h-3 text-muted-foreground ml-auto" />}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {permissionItems.map(pi => (
                    <div key={pi.key} className={`flex items-center justify-between rounded-lg px-3 py-2 ${editMode ? "bg-muted/30" : "bg-muted/20"}`}>
                      <span className="text-xs font-medium flex items-center gap-1.5">
                        <span>{pi.icon}</span> {pi.label}
                      </span>
                      {editMode ? (
                        <Switch checked={permissions[pi.key]} onCheckedChange={v => setPermissions(prev => ({ ...prev, [pi.key]: v }))} />
                      ) : (
                        <span className={`text-[10px] font-bold ${permissions[pi.key] ? "text-accent" : "text-destructive"}`}>
                          {permissions[pi.key] ? "ON" : "OFF"}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="bg-muted/20 rounded-lg p-3">
    <div className="flex items-center gap-1.5 mb-1">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-sm font-medium text-foreground truncate">{value}</p>
  </div>
);

export default BusinessDetailModal;
