import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle, Search, Building2,
} from "lucide-react";
import { toast } from "sonner";
import {
  Business, getBusinesses, updateBusiness, deleteBusiness,
} from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import SuperAdminSidebar from "@/components/super-admin/Sidebar";
import SuperAdminStats from "@/components/super-admin/StatsCards";
import BusinessTable from "@/components/super-admin/BusinessTable";
import NewBusinessModal from "@/components/super-admin/NewBusinessModal";
import BusinessDetailModal from "@/components/super-admin/BusinessDetailModal";
import SubscriptionsTab from "@/components/super-admin/SubscriptionsTab";
import RevenueTab from "@/components/super-admin/RevenueTab";
import SettingsTab from "@/components/super-admin/SettingsTab";

const SuperAdminDashboard = () => {
  const { t } = useI18n();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editBiz, setEditBiz] = useState<Business | null>(null);
  const [viewBiz, setViewBiz] = useState<Business | null>(null);
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => { getBusinesses().then(setBusinesses); }, []);
  const refresh = () => getBusinesses().then(setBusinesses);

  const filtered = businesses.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.type.includes(search.toLowerCase()) ||
    b.adminUsername.toLowerCase().includes(search.toLowerCase()) ||
    (b.country || "").toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = businesses.filter(b => b.status === "active").length;
  const totalRevenue = businesses.reduce((sum, b) => sum + b.totalRevenue, 0);

  const handleToggleStatus = async (id: string, status: string) => {
    const newStatus = status === "active" ? "inactive" : "active";
    await updateBusiness(id, { status: newStatus as Business["status"] });
    refresh();
    toast.success(newStatus === "active" ? t.saActivated : t.saDeactivated);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${t.saConfirmDelete} "${name}"?`)) return;
    await deleteBusiness(id);
    refresh();
    toast.success(t.saDeleted);
  };

  const handleEdit = (biz: Business) => {
    setEditBiz(biz);
    setShowForm(true);
  };

  const tabTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: t.saDashboard, subtitle: t.saGlobalControl },
    businesses: { title: t.saBusinessMgmt, subtitle: t.saManageAll },
    subscriptions: { title: t.saSubscriptions, subtitle: t.saManagePlans },
    revenue: { title: t.saRevenue, subtitle: t.saTrackIncome },
    settings: { title: t.saPlatformSettings, subtitle: t.saConfigSystem },
  };
  const currentTab = tabTitles[activeTab] || tabTitles.dashboard;

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <SuperAdminStats totalBusinesses={businesses.length} activeCount={activeCount} totalRevenue={totalRevenue} />
            {/* Quick business list */}
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-xl text-foreground">{t.saRecentBiz}</h2>
                <Button variant="outline" size="sm" onClick={() => setActiveTab("businesses")}>
                  {t.saViewAll} <Building2 className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
              <BusinessTable
                businesses={filtered.slice(0, 5)}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
                onEdit={handleEdit}
                onView={(biz) => setViewBiz(biz)}
              />
            </div>
          </div>
        );

      case "businesses":
        return (
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={t.saSearchBiz} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 w-72" />
              </div>
              <Button onClick={() => { setEditBiz(null); setShowForm(true); }} variant="hero">
                <PlusCircle className="w-4 h-4 mr-2" /> {t.saNewBusiness}
              </Button>
            </div>
            <BusinessTable
              businesses={filtered}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onView={(biz) => setViewBiz(biz)}
            />
          </div>
        );

      case "subscriptions":
        return <SubscriptionsTab businesses={businesses} />;

      case "revenue":
        return <RevenueTab businesses={businesses} />;

      case "settings":
        return <SettingsTab />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <SuperAdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[240px]"}`}>
        <header className="border-b border-border bg-card px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">{currentTab.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{currentTab.subtitle}</p>
          </div>
          {activeTab === "dashboard" && (
            <Button onClick={() => { setEditBiz(null); setShowForm(true); }} variant="hero">
              <PlusCircle className="w-4 h-4 mr-2" /> {t.saNewBusiness}
            </Button>
          )}
        </header>

        <div className="p-8">
          {renderContent()}
        </div>
      </main>

      <NewBusinessModal
        open={showForm}
        onClose={() => { setShowForm(false); setEditBiz(null); }}
        onCreated={refresh}
        editBusiness={editBiz}
      />

      <BusinessDetailModal
        open={!!viewBiz}
        onClose={() => setViewBiz(null)}
        business={viewBiz}
        onUpdated={refresh}
      />
    </div>
  );
};

export default SuperAdminDashboard;
