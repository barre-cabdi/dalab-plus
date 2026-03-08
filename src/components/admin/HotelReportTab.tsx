import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line,
} from "recharts";
import {
  HotelRoom, HotelBooking, getHotelRooms, getHotelBookings,
} from "@/lib/store";
import {
  DollarSign, BedDouble, CalendarCheck, Users, TrendingUp,
  ArrowUpRight, Moon, Hotel, BarChart3, Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = [
  "hsl(152 60% 54%)", "hsl(45 100% 55%)", "hsl(222 60% 50%)",
  "hsl(0 84% 60%)", "hsl(280 60% 55%)", "hsl(200 80% 50%)",
];

type HotelReportView = "overview" | "sales" | "occupancy" | "guests";

interface HotelReportTabProps {
  businessId: string;
  initialView?: string;
}

const HotelReportTab = ({ businessId, initialView }: HotelReportTabProps) => {
  const [view, setView] = useState<HotelReportView>((initialView as HotelReportView) || "overview");
  const [rooms, setRooms] = useState<HotelRoom[]>([]);
  const [bookings, setBookings] = useState<HotelBooking[]>([]);

  useEffect(() => { if (initialView) setView(initialView as HotelReportView); }, [initialView]);

  useEffect(() => {
    setRooms(getHotelRooms(businessId));
    setBookings(getHotelBookings(businessId));
  }, [businessId]);

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChart3 },
    { id: "sales" as const, label: "Hotel Sales", icon: DollarSign },
    { id: "occupancy" as const, label: "Occupancy", icon: BedDouble },
    { id: "guests" as const, label: "Guest Analytics", icon: Users },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-foreground">Hotel Reports</h1>
        <p className="text-sm text-muted-foreground">Comprehensive hotel performance analytics</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <Button key={tab.id} variant={view === tab.id ? "default" : "outline"} size="sm"
            onClick={() => setView(tab.id)}
            className={`transition-all duration-300 ${view === tab.id ? "shadow-gold" : "hover:shadow-card-custom hover:scale-105"}`}>
            <tab.icon className="w-4 h-4 mr-1.5" />
            {tab.label}
          </Button>
        ))}
      </div>

      {view === "overview" && <OverviewReport rooms={rooms} bookings={bookings} />}
      {view === "sales" && <SalesReport rooms={rooms} bookings={bookings} />}
      {view === "occupancy" && <OccupancyReport rooms={rooms} bookings={bookings} />}
      {view === "guests" && <GuestReport bookings={bookings} />}
    </div>
  );
};

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, delay = 0, accent = false }: {
  label: string; value: string | number; icon: any; delay?: number; accent?: boolean;
}) => (
  <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="bg-card border border-border rounded-xl p-4 shadow-card-custom hover:shadow-gold transition-all duration-300 hover:-translate-y-1 group">
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
        <Icon className="w-4 h-4 text-accent" />
      </div>
    </div>
    <p className={`text-2xl font-display font-bold ${accent ? "text-accent" : ""}`}>{value}</p>
  </motion.div>
);

/* ─── Chart Card ─── */
const ChartCard = ({ title, children, delay = 0, className = "" }: {
  title: string; children: React.ReactNode; delay?: number; className?: string;
}) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className={`bg-card border border-border rounded-xl p-6 shadow-card-custom hover:shadow-gold transition-all duration-300 ${className}`}>
    <h3 className="font-display font-bold text-base mb-4">{title}</h3>
    {children}
  </motion.div>
);

/* ─── Overview ─── */
const OverviewReport = ({ rooms, bookings }: { rooms: HotelRoom[]; bookings: HotelBooking[] }) => {
  const totalRevenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.totalPrice, 0);
  const totalNights = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + b.nights, 0);
  const avgNightlyRate = totalNights > 0 ? totalRevenue / totalNights : 0;
  const occupiedRooms = rooms.filter(r => r.status === "occupied").length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
  const totalGuests = new Set(bookings.map(b => b.guestPhone)).size;
  const checkedIn = bookings.filter(b => b.status === "checked-in").length;

  const stats = [
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: DollarSign, accent: true },
    { label: "Total Bookings", value: bookings.length, icon: CalendarCheck },
    { label: "Occupancy Rate", value: `${occupancyRate}%`, icon: BedDouble },
    { label: "Avg Nightly Rate", value: `$${avgNightlyRate.toFixed(2)}`, icon: TrendingUp },
    { label: "Total Nights Sold", value: totalNights, icon: Moon },
    { label: "Unique Guests", value: totalGuests, icon: Users },
    { label: "Currently Checked-In", value: checkedIn, icon: Hotel },
    { label: "Total Rooms", value: rooms.length, icon: BedDouble },
  ];

  // Status distribution
  const statusData = [
    { name: "Confirmed", value: bookings.filter(b => b.status === "confirmed").length },
    { name: "Checked-In", value: bookings.filter(b => b.status === "checked-in").length },
    { name: "Checked-Out", value: bookings.filter(b => b.status === "checked-out").length },
    { name: "Cancelled", value: bookings.filter(b => b.status === "cancelled").length },
  ].filter(s => s.value > 0);

  // Room type revenue
  const roomTypeData = rooms.map(r => {
    const roomBookings = bookings.filter(b => b.roomId === r.id && b.status !== "cancelled");
    return { type: r.type, revenue: roomBookings.reduce((s, b) => s + b.totalPrice, 0) };
  });
  const typeRevenue = Object.entries(
    roomTypeData.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + r.revenue;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })).filter(d => d.value > 0);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.label} {...s} delay={i * 0.04} />
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Booking Status Distribution" delay={0.1}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData.length > 0 ? statusData : [{ name: "No data", value: 1 }]}
                cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {(statusData.length > 0 ? statusData : [{ name: "No data", value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Room Type" delay={0.15}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={typeRevenue.length > 0 ? typeRevenue : [{ name: "No data", value: 0 }]} barSize={36}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Revenue"]} />
              <Bar dataKey="value" fill="hsl(152 60% 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

/* ─── Sales Report ─── */
const SalesReport = ({ rooms, bookings }: { rooms: HotelRoom[]; bookings: HotelBooking[] }) => {
  const activeBookings = bookings.filter(b => b.status !== "cancelled");
  const totalRevenue = activeBookings.reduce((s, b) => s + b.totalPrice, 0);
  const avgBookingValue = activeBookings.length > 0 ? totalRevenue / activeBookings.length : 0;

  // Revenue by day of week
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const revenueByDay = days.map(day => ({
    name: day,
    revenue: activeBookings
      .filter(b => days[new Date(b.createdAt).getDay()] === day)
      .reduce((s, b) => s + b.totalPrice, 0),
    bookings: activeBookings
      .filter(b => days[new Date(b.createdAt).getDay()] === day).length,
  }));

  // Monthly trend (last 12 months)
  const monthlyData: { name: string; revenue: number; bookings: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = d.toLocaleDateString("en", { month: "short", year: "2-digit" });
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthBookings = activeBookings.filter(b => {
      const bd = new Date(b.createdAt);
      return bd.getMonth() === month && bd.getFullYear() === year;
    });
    monthlyData.push({
      name: monthStr,
      revenue: monthBookings.reduce((s, b) => s + b.totalPrice, 0),
      bookings: monthBookings.length,
    });
  }

  // Top rooms by revenue
  const roomRevenue = rooms.map(r => {
    const rb = activeBookings.filter(b => b.roomId === r.id);
    return {
      name: `Room ${r.roomNumber}`,
      type: r.type,
      revenue: rb.reduce((s, b) => s + b.totalPrice, 0),
      bookings: rb.length,
    };
  }).sort((a, b) => b.revenue - a.revenue).slice(0, 10);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Hotel Revenue" value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} icon={DollarSign} delay={0} accent />
        <StatCard label="Total Bookings" value={activeBookings.length} icon={CalendarCheck} delay={0.04} />
        <StatCard label="Avg Booking Value" value={`$${avgBookingValue.toFixed(2)}`} icon={TrendingUp} delay={0.08} />
        <StatCard label="Cancellation Rate" value={`${bookings.length > 0 ? Math.round((bookings.filter(b => b.status === "cancelled").length / bookings.length) * 100) : 0}%`} icon={ArrowUpRight} delay={0.12} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Revenue by Day of Week" delay={0.1}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueByDay} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: number, name: string) => [name === "revenue" ? `$${v.toFixed(2)}` : v, name === "revenue" ? "Revenue" : "Bookings"]} />
              <Bar dataKey="revenue" fill="hsl(152 60% 54%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Monthly Revenue Trend" delay={0.15}>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number, name: string) => [name === "revenue" ? `$${v.toFixed(2)}` : v, name === "revenue" ? "Revenue" : "Bookings"]} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(45 100% 55%)" fill="hsl(45 100% 55% / 0.2)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {roomRevenue.length > 0 && (
        <ChartCard title="Top Rooms by Revenue" delay={0.2}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roomRevenue} layout="vertical" barSize={20}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={(v: number, name: string) => [name === "revenue" ? `$${v.toFixed(2)}` : v, name === "revenue" ? "Revenue" : "Bookings"]} />
              <Bar dataKey="revenue" fill="hsl(222 60% 50%)" radius={[0, 4, 4, 0]} name="revenue" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {/* Booking details table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-bold text-base">Recent Bookings</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">Guest</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Room</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Check-In</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Check-Out</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Nights</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Total</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>
              {bookings.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20).map((b, i) => {
                const room = rooms.find(r => r.id === b.roomId);
                const statusColors: Record<string, string> = {
                  "confirmed": "bg-accent/10 text-accent",
                  "checked-in": "bg-blue-500/10 text-blue-500",
                  "checked-out": "bg-muted text-muted-foreground",
                  "cancelled": "bg-destructive/10 text-destructive",
                };
                return (
                  <motion.tr key={b.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-200">
                    <td className="p-3 font-medium">{b.guestName}</td>
                    <td className="p-3">{room ? `${room.roomNumber} (${room.type})` : "—"}</td>
                    <td className="p-3 text-muted-foreground">{new Date(b.checkIn).toLocaleDateString()}</td>
                    <td className="p-3 text-muted-foreground">{new Date(b.checkOut).toLocaleDateString()}</td>
                    <td className="p-3">{b.nights}</td>
                    <td className="p-3 font-semibold text-accent">${b.totalPrice.toFixed(2)}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[b.status] || ""}`}>
                        {b.status.replace("-", " ")}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
              {bookings.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No bookings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

/* ─── Occupancy Report ─── */
const OccupancyReport = ({ rooms, bookings }: { rooms: HotelRoom[]; bookings: HotelBooking[] }) => {
  const occupiedRooms = rooms.filter(r => r.status === "occupied").length;
  const availableRooms = rooms.filter(r => r.status === "available").length;
  const maintenanceRooms = rooms.filter(r => r.status === "maintenance").length;
  const reservedRooms = rooms.filter(r => r.status === "reserved").length;

  const roomStatusData = [
    { name: "Available", value: availableRooms },
    { name: "Occupied", value: occupiedRooms },
    { name: "Reserved", value: reservedRooms },
    { name: "Maintenance", value: maintenanceRooms },
  ].filter(s => s.value > 0);

  // Room type occupancy
  const types = [...new Set(rooms.map(r => r.type))];
  const typeOccupancy = types.map(type => {
    const typeRooms = rooms.filter(r => r.type === type);
    const occupied = typeRooms.filter(r => r.status === "occupied").length;
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      total: typeRooms.length,
      occupied,
      rate: typeRooms.length > 0 ? Math.round((occupied / typeRooms.length) * 100) : 0,
    };
  });

  // Last 7 days occupancy (simulated from bookings)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dayStr = d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" });
    const activeOnDay = bookings.filter(b => {
      if (b.status === "cancelled") return false;
      const checkIn = new Date(b.checkIn);
      const checkOut = new Date(b.checkOut);
      return d >= checkIn && d <= checkOut;
    }).length;
    return {
      name: dayStr,
      guests: activeOnDay,
      rate: rooms.length > 0 ? Math.round((Math.min(activeOnDay, rooms.length) / rooms.length) * 100) : 0,
    };
  });

  // Floor map
  const floors = [...new Set(rooms.map(r => r.floor))].sort();

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Occupancy Rate" value={`${rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0}%`} icon={BedDouble} delay={0} accent />
        <StatCard label="Available Rooms" value={availableRooms} icon={BedDouble} delay={0.04} />
        <StatCard label="Occupied Rooms" value={occupiedRooms} icon={Hotel} delay={0.08} />
        <StatCard label="Under Maintenance" value={maintenanceRooms} icon={BedDouble} delay={0.12} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ChartCard title="Room Status Distribution" delay={0.1}>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={roomStatusData.length > 0 ? roomStatusData : [{ name: "No rooms", value: 1 }]}
                cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {(roomStatusData.length > 0 ? roomStatusData : [{ name: "No rooms", value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="7-Day Occupancy Trend" delay={0.15}>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={last7Days}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} unit="%" />
              <Tooltip formatter={(v: number, name: string) => [name === "rate" ? `${v}%` : v, name === "rate" ? "Occupancy" : "Guests"]} />
              <Line type="monotone" dataKey="rate" stroke="hsl(152 60% 54%)" strokeWidth={2.5} dot={{ fill: "hsl(152 60% 54%)", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Type occupancy cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {typeOccupancy.map((t, i) => (
          <motion.div key={t.name} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            className="bg-card border border-border rounded-xl p-5 shadow-card-custom hover:shadow-gold transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-center justify-between mb-3">
              <p className="font-display font-bold">{t.name}</p>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                t.rate > 75 ? "bg-destructive/10 text-destructive" : t.rate > 40 ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground"
              }`}>{t.rate}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-3">
              <motion.div initial={{ width: 0 }} animate={{ width: `${t.rate}%` }} transition={{ duration: 0.8, delay: i * 0.1 }}
                className="h-2 rounded-full bg-accent" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-bold text-sm">{t.total}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <p className="text-xs text-muted-foreground">Occupied</p>
                <p className="font-bold text-sm">{t.occupied}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Floor Map */}
      {floors.length > 0 && (
        <ChartCard title="Floor Map - Room Status" delay={0.25}>
          <div className="space-y-3">
            {floors.map(floor => (
              <div key={floor}>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Floor {floor}</p>
                <div className="flex gap-2 flex-wrap">
                  {rooms.filter(r => r.floor === floor).map(r => {
                    const statusColor: Record<string, string> = {
                      available: "bg-accent/20 text-accent border-accent/30",
                      occupied: "bg-destructive/20 text-destructive border-destructive/30",
                      reserved: "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
                      maintenance: "bg-muted text-muted-foreground border-border",
                    };
                    return (
                      <motion.div key={r.id} whileHover={{ scale: 1.1 }}
                        className={`px-3 py-2 rounded-lg border text-xs font-bold cursor-default transition-all duration-200 ${statusColor[r.status]}`}>
                        {r.roomNumber}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="flex gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-accent/20 border border-accent/30" /> Available</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-destructive/20 border border-destructive/30" /> Occupied</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30" /> Reserved</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted border border-border" /> Maintenance</span>
            </div>
          </div>
        </ChartCard>
      )}
    </div>
  );
};

/* ─── Guest Analytics ─── */
const GuestReport = ({ bookings }: { bookings: HotelBooking[] }) => {
  // Guest stats
  const guestMap = new Map<string, { name: string; phone: string; nationality: string; stays: number; totalSpent: number; totalNights: number; lastStay: string }>();
  bookings.filter(b => b.status !== "cancelled").forEach(b => {
    const key = b.guestPhone;
    const existing = guestMap.get(key);
    if (existing) {
      existing.stays++;
      existing.totalSpent += b.totalPrice;
      existing.totalNights += b.nights;
      if (new Date(b.checkOut) > new Date(existing.lastStay)) existing.lastStay = b.checkOut;
    } else {
      guestMap.set(key, {
        name: b.guestName, phone: b.guestPhone, nationality: b.guestNationality,
        stays: 1, totalSpent: b.totalPrice, totalNights: b.nights, lastStay: b.checkOut,
      });
    }
  });

  const guests = Array.from(guestMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  const topGuests = guests.slice(0, 10);
  const uniqueGuests = guests.length;
  const returningGuests = guests.filter(g => g.stays > 1).length;
  const avgStayLength = guests.length > 0 ? guests.reduce((s, g) => s + g.totalNights, 0) / guests.reduce((s, g) => s + g.stays, 0) : 0;

  // Nationality distribution
  const natMap = new Map<string, number>();
  guests.forEach(g => natMap.set(g.nationality || "Unknown", (natMap.get(g.nationality || "Unknown") || 0) + 1));
  const nationalityData = Array.from(natMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Unique Guests" value={uniqueGuests} icon={Users} delay={0} />
        <StatCard label="Returning Guests" value={returningGuests} icon={ArrowUpRight} delay={0.04} accent />
        <StatCard label="Return Rate" value={`${uniqueGuests > 0 ? Math.round((returningGuests / uniqueGuests) * 100) : 0}%`} icon={TrendingUp} delay={0.08} />
        <StatCard label="Avg Stay Length" value={`${avgStayLength.toFixed(1)} nights`} icon={Moon} delay={0.12} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {nationalityData.length > 0 && (
          <ChartCard title="Guests by Nationality" delay={0.1}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={nationalityData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {nationalityData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        <ChartCard title="Top Guests by Revenue" delay={0.15}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topGuests.map(g => ({ name: g.name.length > 10 ? g.name.slice(0, 10) + "…" : g.name, spent: g.totalSpent }))} layout="vertical" barSize={18}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
              <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} width={85} />
              <Tooltip formatter={(v: number) => [`$${v.toFixed(2)}`, "Total Spent"]} />
              <Bar dataKey="spent" fill="hsl(45 100% 55%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Guest Directory */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl shadow-card-custom overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-display font-bold text-base">Guest Directory</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">#</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Guest</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Nationality</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Stays</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Nights</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Total Spent</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Last Stay</th>
            </tr></thead>
            <tbody>
              {guests.map((g, i) => (
                <motion.tr key={g.phone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-border/50 hover:bg-muted/30 transition-colors duration-200">
                  <td className="p-3 text-muted-foreground">{i + 1}</td>
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{g.name}</p>
                      <p className="text-xs text-muted-foreground">{g.phone}</p>
                    </div>
                  </td>
                  <td className="p-3">{g.nationality || "—"}</td>
                  <td className="p-3">{g.stays}</td>
                  <td className="p-3">{g.totalNights}</td>
                  <td className="p-3 font-semibold text-accent">${g.totalSpent.toFixed(2)}</td>
                  <td className="p-3 text-muted-foreground">{new Date(g.lastStay).toLocaleDateString()}</td>
                </motion.tr>
              ))}
              {guests.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No guest data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default HotelReportTab;
