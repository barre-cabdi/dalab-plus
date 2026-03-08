import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Building2, Users, BarChart3, Shield, PlusCircle,
  LogOut, X, Eye, EyeOff, Hotel, Coffee, UtensilsCrossed,
  Trash2, Power, Search, LayoutDashboard, CreditCard,
  DollarSign, Activity, Settings, ChevronLeft, ChevronRight, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import {
  Business, getBusinesses, saveBusiness, updateBusiness,
  deleteBusiness, generateId,
} from "@/lib/store";
import SuperAdminSidebar from "@/components/super-admin/Sidebar";
import SuperAdminStats from "@/components/super-admin/StatsCards";
import BusinessTable from "@/components/super-admin/BusinessTable";
import NewBusinessModal from "@/components/super-admin/NewBusinessModal";

const SuperAdminDashboard = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => { setBusinesses(getBusinesses()); }, []);
  const refresh = () => setBusinesses(getBusinesses());

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.type.includes(search.toLowerCase()) || b.adminUsername.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = businesses.filter(b => b.status === "active").length;
  const totalRevenue = businesses.reduce((sum, b) => sum + b.totalRevenue, 0);

  return (
    <div className="min-h-screen bg-background flex">
      <SuperAdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[240px]"}`}>
        {/* Header */}
        <header className="border-b border-border bg-card px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">Super Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Global Control Overview for all SaaS entities</p>
          </div>
          <Button onClick={() => setShowForm(true)} variant="hero">
            <PlusCircle className="w-4 h-4 mr-2" /> New Business
          </Button>
        </header>

        <div className="p-8 space-y-8">
          <SuperAdminStats
            totalBusinesses={businesses.length}
            activeCount={activeCount}
            totalRevenue={totalRevenue}
          />

          {/* Business Management */}
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display font-bold text-xl text-foreground">Business Management</h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search businesses..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <BusinessTable
              businesses={filtered}
              onToggleStatus={(id, status) => {
                const newStatus = status === "active" ? "inactive" : "active";
                updateBusiness(id, { status: newStatus as Business["status"] });
                refresh();
                toast.success(newStatus === "active" ? "Business activated ✅" : "Business deactivated ❌");
              }}
              onDelete={(id, name) => {
                if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
                deleteBusiness(id);
                refresh();
                toast.success("Business deleted!");
              }}
            />
          </div>
        </div>
      </main>

      <NewBusinessModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onCreated={refresh}
      />
    </div>
  );
};

export default SuperAdminDashboard;
