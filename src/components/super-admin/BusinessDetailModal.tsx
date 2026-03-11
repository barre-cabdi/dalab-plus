import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Phone, Mail, MapPin, Calendar, CreditCard, Shield, Wallet, Smartphone } from "lucide-react";
import { Business, getDefaultPaymentMethods, getDefaultPermissions } from "@/lib/store";

const typeLabels: Record<string, string> = { hotel: "Hotel", cafe: "Cafe", restaurant: "Restaurant" };
const subLabels: Record<string, string> = { free: "Free", basic: "Basic", premium: "Premium", enterprise: "Enterprise" };

interface Props {
  open: boolean;
  onClose: () => void;
  business: Business | null;
}

const BusinessDetailModal = ({ open, onClose, business }: Props) => {
  if (!business) return null;
  const fullPhone = `${business.countryCode || ""}${business.phonePrefix || ""}${business.phone || ""}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-hero" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">Business Details</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
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
              {(() => {
                const pm = business.paymentMethods || getDefaultPaymentMethods();
                return (
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-accent" /> Payment Methods
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${pm.cashEnabled ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground line-through"}`}>💵 Cash</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${pm.cardEnabled ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground line-through"}`}>💳 Card</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${pm.mobileEnabled ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground line-through"}`}>📱 Mobile</span>
                    </div>
                    {pm.mobileEnabled && pm.mobileProviders.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {pm.mobileProviders.map(p => (
                          <span key={p.id} className="text-[10px] bg-muted/50 border border-border px-2 py-0.5 rounded-full">
                            {p.name}: {p.accountNumber}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
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
