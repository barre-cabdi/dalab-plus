import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Phone, MapPin, Utensils, CheckCircle } from "lucide-react";

const CustomerRegister = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table") || "1";
  const businessId = searchParams.get("business") || "1001";
  const [formData, setFormData] = useState({ name: "", phone: "", residency: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customerId] = useState(`CUS-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setIsSubmitting(true);
    const customer = { id: customerId, ...formData, tableId, businessId, points: 0, level: "Bronze", totalOrders: 0, totalSpent: 0, registeredAt: new Date().toISOString() };
    localStorage.setItem("dp_customer", JSON.stringify(customer));
    setTimeout(() => { navigate(`/menu?table=${tableId}&business=${businessId}`); }, 1500);
  };

  return (
    <div className="min-h-screen bg-hero flex flex-col">
      <header className="glass border-b border-border/20 px-4 py-3 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center"><span className="font-display font-bold text-accent-foreground text-xs">D+</span></div>
        <span className="font-display font-bold text-primary-foreground text-sm">DALABplus+</span>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-md">
          <div className="glass rounded-2xl p-6 mb-6 text-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }} className="w-16 h-16 rounded-full bg-gold-gradient mx-auto mb-4 flex items-center justify-center">
              <Utensils className="w-8 h-8 text-accent-foreground" />
            </motion.div>
            <h1 className="font-display font-bold text-xl text-primary-foreground mb-1">Ku soo dhawoow! 👋</h1>
            <p className="text-sm text-primary-foreground/60">Fadlan buuxi foomka hoose si aad u dalacdo</p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-accent/20">
              <MapPin className="w-3 h-3 text-accent" /><span className="text-xs font-medium text-accent">Table #{tableId}</span>
            </div>
          </div>

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
            <div className="text-center mb-2"><p className="text-xs text-primary-foreground/40 font-mono">{customerId}</p></div>
            <div className="space-y-2">
              <Label className="text-primary-foreground/80 text-sm flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Magacaaga</Label>
              <Input placeholder="e.g. Ahmed Mohamed" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="bg-primary/20 border-border/20 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent" required />
            </div>
            <div className="space-y-2">
              <Label className="text-primary-foreground/80 text-sm flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telefoon Number</Label>
              <Input type="tel" placeholder="e.g. +252 61 xxx xxxx" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="bg-primary/20 border-border/20 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent" required />
            </div>
            <div className="space-y-2">
              <Label className="text-primary-foreground/80 text-sm flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Deegaanka</Label>
              <Select onValueChange={v => setFormData({ ...formData, residency: v })}>
                <SelectTrigger className="bg-primary/20 border-border/20 text-primary-foreground"><SelectValue placeholder="Dooro deegaankaaga" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mogadishu">Mogadishu</SelectItem>
                  <SelectItem value="hargeisa">Hargeisa</SelectItem>
                  <SelectItem value="kismayo">Kismayo</SelectItem>
                  <SelectItem value="garowe">Garowe</SelectItem>
                  <SelectItem value="other">Kale</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting || !formData.name || !formData.phone}>
              {isSubmitting ? (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2"><CheckCircle className="w-5 h-5" /> Waad ku mahadsantahay!</motion.div>) : "Iska Diiwaan Geli ✨"}
            </Button>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
};

export default CustomerRegister;
