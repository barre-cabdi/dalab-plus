import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Heart, Gift, Users, TrendingUp, Star, Trash2, Pencil, Award, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { generateId, getOrders, Order } from "@/lib/store";

interface LoyaltyMember {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  points: number;
  visits: number;
  joinedAt: string;
}

const LOYALTY_LEVELS = [
  { name: "Bronze", min: 0, max: 99, color: "bg-amber-700/15 text-amber-700 border-amber-700/30", icon: "🥉" },
  { name: "Silver", min: 100, max: 299, color: "bg-slate-400/15 text-slate-500 border-slate-400/30", icon: "🥈" },
  { name: "Gold", min: 300, max: 599, color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30", icon: "🥇" },
  { name: "Platinum", min: 600, max: Infinity, color: "bg-purple-500/15 text-purple-600 border-purple-500/30", icon: "💎" },
];

const getLevel = (points: number) => LOYALTY_LEVELS.find(l => points >= l.min && points <= l.max) || LOYALTY_LEVELS[0];

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<LoyaltyMember | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", points: "0" });
  const [viewMember, setViewMember] = useState<LoyaltyMember | null>(null);

  useEffect(() => { refresh(); }, [businessId]);
  const refresh = () => {
    setMembers(getLoyaltyMembers(businessId));
    setOrders(getOrders(businessId));
  };

  const getMemberOrders = (memberName: string, memberPhone: string) => {
    return orders.filter(o => {
      const cn = (o as any).customerName || "";
      const cp = (o as any).customerPhone || "";
      return cn.toLowerCase() === memberName.toLowerCase() || cp === memberPhone;
    });
  };

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

  const levelCounts = LOYALTY_LEVELS.map(l => ({
    ...l,
    count: members.filter(m => getLevel(m.points).name === l.name).length,
  }));

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
          <p className="text-sm text-muted-foreground">Manage customer rewards & levels</p>
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

      {/* Level Distribution */}
      <div className="grid sm:grid-cols-4 gap-3">
        {levelCounts.map((l, i) => (
          <motion.div key={l.name} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}
            className={`rounded-xl border p-4 text-center ${l.color}`}>
            <p className="text-2xl mb-1">{l.icon}</p>
            <p className="font-display font-bold text-sm">{l.name}</p>
            <p className="text-xs opacity-70">{l.min}–{l.max === Infinity ? "∞" : l.max} pts</p>
            <p className="font-bold text-lg mt-1">{l.count}</p>
            <p className="text-[10px] opacity-60">members</p>
          </motion.div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Points</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-12">
                  <Heart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>No loyalty members yet</p>
                </TableCell>
              </TableRow>
            ) : members.map(m => {
              const level = getLevel(m.points);
              const memberOrders = getMemberOrders(m.name, m.phone);
              const totalSpent = memberOrders.reduce((s, o) => s + o.total, 0);
              const nextLevel = LOYALTY_LEVELS.find(l => l.min > m.points);
              const progress = nextLevel ? ((m.points - level.min) / (nextLevel.min - level.min)) * 100 : 100;

              return (
                <TableRow key={m.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-xs font-bold text-accent">
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{m.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.phone}</TableCell>
                  <TableCell>
                    <Badge className={`${level.color} border text-[10px]`}>
                      {level.icon} {level.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-bold">{m.points}</span>
                      <div className="w-16 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-muted-foreground" />
                      <span className="font-medium">{memberOrders.length}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-accent">${totalSpent.toFixed(2)}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(m.joinedAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setViewMember(m)}>
                      <Award className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openDialog(m)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(m.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
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

      {/* Member Detail Dialog */}
      <Dialog open={!!viewMember} onOpenChange={() => setViewMember(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Member Profile</DialogTitle>
            <DialogDescription>{viewMember?.name}'s loyalty details</DialogDescription>
          </DialogHeader>
          {viewMember && (() => {
            const level = getLevel(viewMember.points);
            const memberOrders = getMemberOrders(viewMember.name, viewMember.phone);
            const totalSpent = memberOrders.reduce((s, o) => s + o.total, 0);
            const nextLevel = LOYALTY_LEVELS.find(l => l.min > viewMember.points);
            const progress = nextLevel ? ((viewMember.points - level.min) / (nextLevel.min - level.min)) * 100 : 100;

            return (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-2xl font-bold text-accent">
                    {viewMember.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-display font-bold text-lg">{viewMember.name}</p>
                    <Badge className={`${level.color} border`}>{level.icon} {level.name}</Badge>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>{level.icon} {level.name}</span>
                    <span>{nextLevel ? `${nextLevel.icon} ${nextLevel.name}` : "MAX"}</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {nextLevel ? `${nextLevel.min - viewMember.points} points to ${nextLevel.name}` : "Maximum level reached! 🎉"}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Points</p>
                    <p className="font-bold text-lg">{viewMember.points}</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Orders</p>
                    <p className="font-bold text-lg">{memberOrders.length}</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-3 text-center">
                    <p className="text-xs text-muted-foreground">Spent</p>
                    <p className="font-bold text-lg text-accent">${totalSpent.toFixed(2)}</p>
                  </div>
                </div>

                {memberOrders.length > 0 && (
                  <div>
                    <p className="font-medium text-sm mb-2">Recent Orders</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {memberOrders.slice(-5).reverse().map(o => (
                        <div key={o.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</p>
                            <p className="text-xs">{o.items.map(i => `${i.quantity}x ${i.name}`).join(", ")}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-accent">${o.total.toFixed(2)}</p>
                            <Badge variant="secondary" className="text-[9px]">{o.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LoyaltyTab;
