import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Heart, Gift, Users, TrendingUp, Star, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";
import { generateId } from "@/lib/store";

interface LoyaltyMember {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  points: number;
  visits: number;
  joinedAt: string;
}

const getLoyaltyMembers = (businessId: string): LoyaltyMember[] => {
  const all: LoyaltyMember[] = JSON.parse(localStorage.getItem("dp_loyalty_members") || "[]");
  return all.filter(m => m.businessId === businessId);
};

const saveLoyaltyMember = (member: LoyaltyMember) => {
  const all: LoyaltyMember[] = JSON.parse(localStorage.getItem("dp_loyalty_members") || "[]");
  all.push(member);
  localStorage.setItem("dp_loyalty_members", JSON.stringify(all));
};

const deleteLoyaltyMember = (id: string) => {
  const all: LoyaltyMember[] = JSON.parse(localStorage.getItem("dp_loyalty_members") || "[]");
  localStorage.setItem("dp_loyalty_members", JSON.stringify(all.filter(m => m.id !== id)));
};

const updateLoyaltyMember = (id: string, updates: Partial<LoyaltyMember>) => {
  const all: LoyaltyMember[] = JSON.parse(localStorage.getItem("dp_loyalty_members") || "[]");
  localStorage.setItem("dp_loyalty_members", JSON.stringify(all.map(m => m.id === id ? { ...m, ...updates } : m)));
};

interface LoyaltyTabProps {
  businessId: string;
}

const LoyaltyTab = ({ businessId }: LoyaltyTabProps) => {
  const [members, setMembers] = useState<LoyaltyMember[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<LoyaltyMember | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", points: "0" });

  useEffect(() => { refresh(); }, [businessId]);
  const refresh = () => setMembers(getLoyaltyMembers(businessId));

  const openDialog = (member?: LoyaltyMember) => {
    if (member) {
      setEditing(member);
      setForm({ name: member.name, phone: member.phone, points: String(member.points) });
    } else {
      setEditing(null);
      setForm({ name: "", phone: "", points: "0" });
    }
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editing) {
      updateLoyaltyMember(editing.id, { name: form.name, phone: form.phone, points: Number(form.points) });
      toast.success("Member updated");
    } else {
      saveLoyaltyMember({
        id: generateId("loy"),
        businessId,
        name: form.name,
        phone: form.phone,
        points: Number(form.points),
        visits: 1,
        joinedAt: new Date().toISOString(),
      });
      toast.success("Member added");
    }
    setShowDialog(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this member?")) return;
    deleteLoyaltyMember(id);
    toast.success("Member removed");
    refresh();
  };

  const totalPoints = members.reduce((s, m) => s + m.points, 0);

  const stats = [
    { label: "Total Members", value: members.length, icon: Users, color: "text-accent", bg: "bg-accent/10" },
    { label: "Total Points", value: totalPoints, icon: Star, color: "text-accent", bg: "bg-accent/10" },
    { label: "Avg Points", value: members.length ? Math.round(totalPoints / members.length) : 0, icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
    { label: "This Month", value: members.filter(m => new Date(m.joinedAt).getMonth() === new Date().getMonth()).length, icon: Gift, color: "text-accent", bg: "bg-accent/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Loyalty Program</h1>
          <p className="text-sm text-muted-foreground">Manage customer rewards</p>
        </div>
        <Button onClick={() => openDialog()} variant="hero">
          <Plus className="w-4 h-4 mr-1" /> Add Member
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-4 shadow-card-custom">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{s.label}</p>
              <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Visits</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                  <Heart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No loyalty members yet</p>
                </TableCell>
              </TableRow>
            ) : members.map(m => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.phone}</TableCell>
                <TableCell><Badge variant="secondary">{m.points} pts</Badge></TableCell>
                <TableCell>{m.visits}</TableCell>
                <TableCell className="text-xs text-muted-foreground">{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(m)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(m.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Member" : "New Loyalty Member"}</DialogTitle>
            <DialogDescription>Enter member details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Name</label><Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Phone</label><Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className="text-sm font-medium mb-1 block">Points</label><Input type="number" value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} variant="hero">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoyaltyTab;
