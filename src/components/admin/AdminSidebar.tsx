import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, UtensilsCrossed, Grid3X3, QrCode,
  ClipboardList, Heart, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Business } from "@/lib/store";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "tables", label: "Tables", icon: Grid3X3 },
  { id: "qr", label: "QR Codes", icon: QrCode },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "loyalty", label: "Loyalty", icon: Heart },
  { id: "reports", label: "Reports", icon: BarChart3 },
];

interface AdminSidebarProps {
  business: Business;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const AdminSidebar = ({ business, activeTab, setActiveTab, collapsed, setCollapsed }: AdminSidebarProps) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="fixed left-0 top-0 bottom-0 bg-card border-r border-border flex flex-col z-40"
    >
      {/* Business info */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-border shrink-0">
        <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0 overflow-hidden">
          {business.logo ? (
            <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <span className="font-display font-bold text-accent text-xs">
              {business.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
            </span>
          )}
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <p className="font-display font-bold text-sm text-foreground truncate">{business.name}</p>
            <p className="text-[10px] text-muted-foreground capitalize">Business Admin</p>
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

      {/* Settings at bottom */}
      <div className="px-3 pb-2">
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === "settings"
              ? "bg-accent/15 text-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Settings className={`w-5 h-5 shrink-0 ${activeTab === "settings" ? "text-accent" : ""}`} />
          {!collapsed && <span>Settings</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Log Out */}
      <div className="p-3 border-t border-border">
        <Link
          to="/login"
          onClick={() => localStorage.removeItem("dp_active_business")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Log Out</span>}
        </Link>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
