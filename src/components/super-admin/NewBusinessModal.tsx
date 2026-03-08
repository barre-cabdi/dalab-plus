import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  X, Eye, EyeOff, Hotel, Coffee, UtensilsCrossed,
  PlusCircle, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { Business, getBusinesses, saveBusiness, generateId } from "@/lib/store";

const typeIcons: Record<string, any> = { hotel: Hotel, cafe: Coffee, restaurant: UtensilsCrossed };
const typeLabels: Record<string, string> = { hotel: "Hotel", cafe: "Cafe", restaurant: "Restaurant" };

interface NewBusinessModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const NewBusinessModal = ({ open, onClose, onCreated }: NewBusinessModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: "", type: "restaurant" as Business["type"], address: "", phone: "", adminUsername: "", adminPassword: "",
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (getBusinesses().some(b => b.adminUsername === form.adminUsername)) {
      toast.error("Username already taken!");
      return;
    }
    const newBiz: Business = {
      id: generateId("biz"), ...form, status: "active", createdAt: new Date().toISOString(), totalOrders: 0, totalRevenue: 0,
    };
    saveBusiness(newBiz);
    onCreated();
    onClose();
    setForm({ name: "", type: "restaurant", address: "", phone: "", adminUsername: "", adminPassword: "" });
    toast.success(`${typeLabels[newBiz.type]} "${newBiz.name}" created successfully!`);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-hero" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-bold text-lg">Create New Business</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Business Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Al-Baraka Hotel" required />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Type</Label>
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
                  <Label className="text-xs text-muted-foreground">Address</Label>
                  <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Mogadishu" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Phone</Label>
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
                <PlusCircle className="w-4 h-4 mr-2" /> Create Business
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NewBusinessModal;
