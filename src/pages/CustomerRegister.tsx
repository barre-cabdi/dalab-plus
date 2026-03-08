import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, MapPin, CheckCircle, UtensilsCrossed, Hotel, Coffee, Sparkles, Star } from "lucide-react";
import { getBusinesses, Business } from "@/lib/store";

const typeConfig: Record<string, { icon: any; emoji: string; welcome: string; gradient: string }> = {
  restaurant: { icon: UtensilsCrossed, emoji: "🍽️", welcome: "Cuntada ugu fiican!", gradient: "from-[hsl(222,60%,12%)] via-[hsl(222,50%,18%)] to-[hsl(222,40%,14%)]" },
  hotel: { icon: Hotel, emoji: "🏨", welcome: "Soo dhawoow Hotel-keena!", gradient: "from-[hsl(222,60%,12%)] via-[hsl(200,50%,18%)] to-[hsl(222,40%,14%)]" },
  cafe: { icon: Coffee, emoji: "☕", welcome: "Cabitaanka ugu macaansan!", gradient: "from-[hsl(30,40%,15%)] via-[hsl(35,45%,20%)] to-[hsl(25,35%,12%)]" },
};

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table") || "1";
  const businessId = searchParams.get("business") || "1001";
  const [formData, setFormData] = useState({ name: "", phone: "", residency: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId] = useState(`CUS-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`);
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const b = getBusinesses().find(b => b.id === businessId);
    if (b) setBusiness(b);
  }, [businessId]);

  // Check if customer already exists → redirect to customer-home
  useEffect(() => {
    const stored = localStorage.getItem("dp_customer");
    if (stored) {
      const customer = JSON.parse(stored);
      if (customer && customer.name) {
        navigate(`/customer-home?table=${tableId}&business=${businessId}`);
      }
    }
  }, [navigate, tableId, businessId]);

  const businessName = business?.name || "DALABplus+";
  const businessType = business?.type || "restaurant";
  const config = typeConfig[businessType] || typeConfig.restaurant;
  const TypeIcon = config.icon;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    const customer = { id: customerId, ...formData, tableId, businessId, points: 0, level: "Bronze", totalOrders: 0, totalSpent: 0, registeredAt: new Date().toISOString() };
    localStorage.setItem("dp_customer", JSON.stringify(customer));
    setTimeout(() => { navigate(`/customer-home?table=${tableId}&business=${businessId}`); }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Header with Business Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7 }}
        className={`relative bg-gradient-to-br ${config.gradient} text-white overflow-hidden`}
      >
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-secondary/15 blur-3xl animate-float-slow" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-secondary/10 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />
        </div>
        <div className="relative z-10 px-4 py-10 text-center">
          {/* Business Logo */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5, type: "spring" }}
            className="mx-auto mb-4"
          >
            {business?.logo ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-secondary/30 shadow-gold mx-auto">
                <img src={business.logo} alt={businessName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center mx-auto">
                <TypeIcon className="w-10 h-10 text-secondary" />
              </div>
            )}
          </motion.div>

          {/* Business Name & Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-3 py-1 rounded-full mb-3 border border-secondary/20">
              <Sparkles className="w-3.5 h-3.5 text-secondary" />
              <span className="text-xs text-secondary font-medium capitalize">{config.emoji} {businessType}</span>
            </div>
            <h1 className="font-display font-bold text-2xl mb-1">{businessName}</h1>
            <p className="text-white/60 text-sm">{config.welcome}</p>
          </motion.div>

          {/* Services Preview */}
          {business && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex items-center justify-center gap-3 mt-4 flex-wrap"
            >
              {getQuickServices(businessType).map((s, i) => (
                <motion.div
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10"
                >
                  <span className="text-[11px] text-white/80">{s}</span>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Table Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: "spring" }}
            className="inline-flex items-center gap-1.5 mt-5 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/30"
          >
            <MapPin className="w-3 h-3 text-secondary" />
            <span className="text-xs font-medium text-secondary">Table #{tableId}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Registration Form */}
      <div className="flex-1 bg-background px-4 py-8 flex items-start justify-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-1">Iska Diiwaan Geli 📝</h2>
            <p className="text-sm text-muted-foreground">Fadlan buuxi foomka hoose si aad u dalacdo</p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="bg-card border border-border rounded-2xl p-6 space-y-5 shadow-sm"
          >
            <div className="text-center mb-2">
              <p className="text-xs text-muted-foreground font-mono">{customerId}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Magacaaga</Label>
              <Input placeholder="e.g. Ahmed Mohamed" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-secondary" required />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefoon Number</Label>
              <Input type="tel" placeholder="e.g. +252 61 xxx xxxx" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground/50 focus:border-secondary" required />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground/80 text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Deegaanka</Label>
              <Select onValueChange={v => setFormData({ ...formData, residency: v })}>
                <SelectTrigger className="bg-muted/50 border-border text-foreground"><SelectValue placeholder="Dooro deegaankaaga" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mogadishu">Mogadishu</SelectItem>
                  <SelectItem value="hargeisa">Hargeisa</SelectItem>
                  <SelectItem value="kismayo">Kismayo</SelectItem>
                  <SelectItem value="garowe">Garowe</SelectItem>
                  <SelectItem value="other">Kale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl py-3 font-bold gap-2 shadow-gold" disabled={isSubmitting || !formData.name || !formData.phone}>
              {isSubmitting ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Waad ku mahadsantahay!
                </motion.div>
              ) : (
                <>
                  <Star className="w-4 h-4" /> Iska Diiwaan Geli
                </>
              )}
            </Button>
          </motion.form>

          {/* Contact Info */}
          {business && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 text-center text-xs text-muted-foreground space-y-1"
            >
              <p>{business.address}, {business.city}</p>
              <p>{business.countryCode} {business.phonePrefix} {business.phone}</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

function getQuickServices(type: string): string[] {
  if (type === "hotel") return ["🛎️ Room Service", "🍽️ Restaurant", "📶 Free Wi-Fi", "🅿️ Parking"];
  if (type === "cafe") return ["☕ Coffee", "🥐 Pastries", "📶 Wi-Fi", "⭐ Rewards"];
  return ["🍽️ Dine-In", "📦 Takeaway", "⭐ Loyalty", "👥 Groups"];
}

export default CustomerRegister;
