import { motion } from "framer-motion";
import { Pencil, Power, Trash2, Eye, Building2, Hotel, Coffee, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Business } from "@/lib/store";

const typeIcons: Record<string, any> = { hotel: Hotel, cafe: Coffee, restaurant: UtensilsCrossed };
const typeLabels: Record<string, string> = { hotel: "Hotel", cafe: "Cafe", restaurant: "Restaurant" };
const subColors: Record<string, string> = {
  free: "bg-muted text-muted-foreground",
  basic: "bg-accent/15 text-accent",
  premium: "bg-primary/10 text-primary",
  enterprise: "bg-secondary/15 text-secondary-foreground",
};
const subLabels: Record<string, string> = {
  free: "Free", basic: "Basic", premium: "Premium", enterprise: "Enterprise",
};

interface BusinessTableProps {
  businesses: Business[];
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string, name: string) => void;
  onEdit: (biz: Business) => void;
  onView: (biz: Business) => void;
}

const BusinessTable = ({ businesses, onToggleStatus, onDelete, onEdit, onView }: BusinessTableProps) => {
  if (businesses.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border">
        <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No businesses registered yet</p>
        <p className="text-xs mt-1">Click "New Business" to create one</p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-card-custom">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Business</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Contact</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Type</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Plan</th>
            <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Status</th>
            <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {businesses.map((biz, i) => {
            const initials = biz.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            const fullPhone = `${biz.countryCode || ""}${biz.phonePrefix || ""}${biz.phone || ""}`;
            return (
              <motion.tr
                key={biz.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold overflow-hidden ${
                      biz.status === "active" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                    }`}>
                      {biz.logo ? (
                        <img src={biz.logo} alt={biz.name} className="w-full h-full object-cover" />
                      ) : initials}
                    </div>
                    <div>
                      <p className="font-display font-semibold text-sm text-foreground">{biz.name}</p>
                      <p className="text-xs text-muted-foreground">{biz.city || biz.address}, {biz.country || ""}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm text-foreground">{fullPhone || "N/A"}</p>
                  <p className="text-xs text-muted-foreground">{biz.email || biz.adminUsername}</p>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs text-muted-foreground">{typeLabels[biz.type] || biz.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${subColors[biz.subscription || "free"]}`}>
                    {subLabels[biz.subscription || "free"]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                    biz.status === "active" ? "text-accent" : "text-destructive"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${biz.status === "active" ? "bg-accent" : "bg-destructive"}`} />
                    {biz.status === "active" ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onView(biz)} title="View">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEdit(biz)} title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onToggleStatus(biz.id, biz.status)} title={biz.status === "active" ? "Deactivate" : "Activate"}>
                      <Power className={`w-4 h-4 ${biz.status === "active" ? "text-destructive" : "text-accent"}`} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(biz.id, biz.name)} title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessTable;
