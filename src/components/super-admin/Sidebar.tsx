import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import dalabLogo from "@/assets/dalabplus-logo.png";
import {
  LayoutDashboard, Building2, CreditCard, DollarSign,
  Settings, LogOut, ChevronLeft, ChevronRight, Globe,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  activeTab: string;
  setActiveTab: (v: string) => void;
}

const SuperAdminSidebar = ({ collapsed, setCollapsed, activeTab, setActiveTab }: SidebarProps) => {
  const { t, lang, setLang } = useI18n();

  const navItems = [
    { id: "dashboard", label: t.adDashboard, icon: LayoutDashboard },
    { id: "businesses", label: t.businesses, icon: Building2 },
    { id: "subscriptions", label: t.saSubscriptions, icon: CreditCard },
    { id: "revenue", label: t.saRevenue, icon: DollarSign },
    { id: "settings", label: t.saSettings, icon: Settings },
  ];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 bg-card border-r border-border flex flex-col z-40"
    >
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
          <span className="font-display font-bold text-foreground text-xs">SA</span>
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-w-0">
            <p className="font-display font-bold text-sm text-foreground truncate">Super Admin</p>
            <p className="text-[10px] text-muted-foreground truncate">{t.saGlobalCtrl}</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent/15 text-accent"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              <item.icon className={`w-5 h-5 shrink-0 ${isActive ? "text-accent" : ""}`} />
              {!collapsed && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate">
                  {item.label}
                </motion.span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Language toggle + Collapse */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Language + Log Out */}
      <div className="p-3 border-t border-border space-y-1">
        <button
          onClick={() => setLang(lang === "en" ? "so" : "en")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Globe className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{lang === "en" ? "Somali" : "English"}</span>}
        </button>
        <Link
          to="/login"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{t.saLogOut}</span>}
        </Link>
      </div>
    </motion.aside>
  );
};

export default SuperAdminSidebar;
