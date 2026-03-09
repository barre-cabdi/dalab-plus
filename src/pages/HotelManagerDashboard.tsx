import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Hotel, BedDouble, CalendarCheck, LayoutDashboard, Contact,
  BarChart3, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { Business, StaffMember } from "@/lib/store";
import HotelManagementTab from "@/components/admin/HotelManagementTab";
import HotelReportTab from "@/components/admin/HotelReportTab";

const navItems = [
  { id: "hotel-overview", label: "Overview", icon: LayoutDashboard },
  { id: "hotel-rooms", label: "Rooms", icon: BedDouble },
  { id: "hotel-bookings", label: "Bookings", icon: CalendarCheck },
  { id: "hotel-guests", label: "Guests", icon: Contact },
  { id: "hotel-report", label: "Reports", icon: BarChart3 },
];

const HotelManagerDashboard = () => {
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [manager, setManager] = useState<StaffMember | null>(null);
  const [activeTab, setActiveTab] = useState("hotel-overview");
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const storedBiz = localStorage.getItem("dp_active_business");
    const storedManager = localStorage.getItem("dp_active_hotel_manager");
    if (storedBiz && storedManager) {
      setBusiness(JSON.parse(storedBiz));
      setManager(JSON.parse(storedManager));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!business || !manager) return null;

  const hotelViewMap: Record<string, string> = {
    "hotel-overview": "overview",
    "hotel-rooms": "rooms",
    "hotel-bookings": "bookings",
    "hotel-guests": "guests",
  };

  const renderContent = () => {
    if (activeTab === "hotel-report") {
      return <HotelReportTab businessId={business.id} initialView="overview" />;
    }
    return <HotelManagementTab businessId={business.id} initialView={hotelViewMap[activeTab] || "overview"} />;
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="fixed left-0 top-0 bottom-0 bg-card border-r border-border flex flex-col z-40"
      >
        <div className="h-16 flex items-center gap-3 px-4 border-b border-border shrink-0">
          <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center shrink-0">
            <Hotel className="w-5 h-5 text-accent" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
              <p className="font-display font-bold text-sm text-foreground truncate">{business.name}</p>
              <p className="text-[10px] text-muted-foreground">Hotel Manager</p>
            </motion.div>
          )}
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-accent" : ""}`} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {collapsed && (
                  <span className="absolute left-full ml-2 px-2 py-1 rounded-md bg-foreground text-background text-xs font-medium opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 shadow-sm hover:scale-110"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        <div className="p-3 border-t border-border">
          <Link
            to="/login"
            onClick={() => { localStorage.removeItem("dp_active_hotel_manager"); localStorage.removeItem("dp_active_business"); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Log Out</span>}
          </Link>
        </div>
      </motion.aside>

      {/* Main */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? "ml-[72px]" : "ml-[240px]"}`}>
        <header className="border-b border-border bg-card px-8 py-5 flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              {navItems.find(n => n.id === activeTab)?.label || "Hotel Management"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Welcome, {manager.name} — Hotel Manager
            </p>
          </div>
        </header>
        <div className="p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default HotelManagerDashboard;
