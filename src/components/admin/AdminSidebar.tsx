import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, UtensilsCrossed, Grid3X3, QrCode,
  ClipboardList, Heart, BarChart3, Settings, LogOut,
  ChevronLeft, ChevronRight, Users, UserCheck,
  DollarSign, Package, Layers, UserCog, Hotel,
  BedDouble, CalendarCheck, BookOpen, Contact, History, Receipt,
  Wallet,
} from "lucide-react";
import { Business } from "@/lib/store";
import { useState } from "react";

const baseNavItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "home", label: "Business Home", icon: Hotel },
  { id: "menu", label: "Menu", icon: UtensilsCrossed },
  { id: "admin-order", label: "Place Order", icon: Package },
  { id: "tables", label: "Tables", icon: Grid3X3 },
  { id: "qr", label: "QR Codes", icon: QrCode },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "order-history", label: "Order History", icon: History },
  { id: "staff", label: "Staff", icon: UserCog },
  { id: "customers", label: "Customers", icon: Users },
  { id: "loyalty", label: "Loyalty", icon: Heart },
  { id: "payment-methods", label: "Payment Methods", icon: Wallet },
  {
    id: "reports", label: "Reports", icon: BarChart3,
    children: [
      { id: "reports-sales", label: "Sales Report", icon: DollarSign },
      { id: "reports-items", label: "Item Report", icon: Package },
      { id: "reports-categories", label: "Category Report", icon: Layers },
      { id: "reports-waiters", label: "Waiter Report", icon: UserCheck },
      { id: "reports-cashiers", label: "Cashier Report", icon: Receipt },
    ],
  },
];

const hotelNavItems = [
  {
    id: "hotel", label: "Hotel Management", icon: Hotel,
    children: [
      { id: "hotel-overview", label: "Overview", icon: LayoutDashboard },
      { id: "hotel-rooms", label: "Rooms", icon: BedDouble },
      { id: "hotel-bookings", label: "Bookings", icon: CalendarCheck },
      { id: "hotel-guests", label: "Guests", icon: Contact },
    ],
  },
  {
    id: "hotel-report", label: "Hotel Reports", icon: BarChart3,
    children: [
      { id: "hotel-report-overview", label: "Overview", icon: BarChart3 },
      { id: "hotel-report-sales", label: "Hotel Sales", icon: DollarSign },
      { id: "hotel-report-occupancy", label: "Occupancy", icon: BedDouble },
      { id: "hotel-report-guests", label: "Guest Analytics", icon: Users },
    ],
  },
];

interface AdminSidebarProps {
  business: Business;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const AdminSidebar = ({ business, activeTab, setActiveTab, collapsed, setCollapsed }: AdminSidebarProps) => {
  const isHotel = business.type === "hotel";
  const navItems = isHotel ? [...baseNavItems.slice(0, 1), ...hotelNavItems, ...baseNavItems.slice(1)] : baseNavItems;
  const [reportsOpen, setReportsOpen] = useState(activeTab.startsWith("reports"));
  const [hotelOpen, setHotelOpen] = useState(activeTab.startsWith("hotel-") && !activeTab.startsWith("hotel-report"));
  const [hotelReportOpen, setHotelReportOpen] = useState(activeTab.startsWith("hotel-report"));

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
      <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id || (item.children && activeTab.startsWith(item.id));
          const hasChildren = item.children && !collapsed;
          const isOpen = item.id === "reports" ? reportsOpen : item.id === "hotel" ? hotelOpen : item.id === "hotel-report" ? hotelReportOpen : false;
          const setOpen = item.id === "reports" ? setReportsOpen : item.id === "hotel" ? setHotelOpen : item.id === "hotel-report" ? setHotelReportOpen : () => {};

          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.children) {
                    if (collapsed) { setActiveTab(item.children[0].id); }
                    else { setOpen(!isOpen); }
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-accent" : ""}`} />
                {!collapsed && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="truncate flex-1 text-left">
                    {item.label}
                  </motion.span>
                )}
                {hasChildren && (
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-90" : ""}`} />
                )}
                {/* Hover tooltip when collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </button>

              {/* Report sub-items */}
              {hasChildren && isOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="ml-5 mt-0.5 space-y-0.5 border-l-2 border-border pl-3">
                  {item.children!.map(child => {
                    const childActive = activeTab === child.id;
                    return (
                      <button key={child.id} onClick={() => setActiveTab(child.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 group ${
                          childActive ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}>
                        <child.icon className={`w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110 ${childActive ? "text-accent" : ""}`} />
                        <span className="truncate">{child.label}</span>
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 pb-2 space-y-0.5">
        <button
          onClick={() => setActiveTab("receipt-settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
            activeTab === "receipt-settings"
              ? "bg-accent/15 text-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Receipt className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${activeTab === "receipt-settings" ? "text-accent" : ""}`} />
          {!collapsed && <span>Receipt Settings</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Receipt Settings
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
            activeTab === "settings"
              ? "bg-accent/15 text-accent"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Settings className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:rotate-90 ${activeTab === "settings" ? "text-accent" : ""}`} />
          {!collapsed && <span>Settings</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Settings
            </span>
          )}
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 shadow-sm hover:scale-110"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Log Out */}
      <div className="p-3 border-t border-border">
        <Link
          to="/login"
          onClick={() => localStorage.removeItem("dp_active_business")}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group relative"
        >
          <LogOut className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          {!collapsed && <span>Log Out</span>}
          {collapsed && (
            <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
              Log Out
            </span>
          )}
        </Link>
      </div>
    </motion.aside>
  );
};

export default AdminSidebar;
