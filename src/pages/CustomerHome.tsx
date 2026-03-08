import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed, Hotel, Coffee, Phone, Mail, MapPin,
  Clock, Star, ShoppingBag, Users, ChevronRight, Wifi,
  Utensils, ConciergeBell, Car, Sparkles
} from "lucide-react";
import { getBusinesses, Business } from "@/lib/store";

const serviceIcons: Record<string, any> = {
  restaurant: Utensils,
  hotel: Hotel,
  cafe: Coffee,
  wifi: Wifi,
  parking: Car,
  concierge: ConciergeBell,
  room: Hotel,
};

const CustomerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business") || "";
  const tableId = searchParams.get("table") || "1";
  const [business, setBusiness] = useState<Business | null>(null);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("dp_customer");
    if (stored) setCustomer(JSON.parse(stored));
    const b = getBusinesses().find(b => b.id === businessId);
    if (b) setBusiness(b);
  }, [businessId]);

  const businessName = business?.name || "DALABplus+";
  const businessType = business?.type || "restaurant";

  // Services based on business type
  const getServices = () => {
    const base = [
      { icon: Utensils, title: "Dine-In", description: "Enjoy our carefully crafted dishes in a comfortable atmosphere" },
      { icon: ShoppingBag, title: "Takeaway", description: "Order your favorites and take them to go" },
      { icon: Star, title: "Loyalty Program", description: "Earn points with every order and unlock exclusive rewards" },
      { icon: Users, title: "Group Dining", description: "Special arrangements for groups and events" },
    ];
    if (businessType === "hotel") {
      return [
        ...base,
        { icon: Hotel, title: "Room Service", description: "Order food directly to your hotel room 24/7" },
        { icon: ConciergeBell, title: "Concierge", description: "Our staff is ready to assist you with anything you need" },
        { icon: Wifi, title: "Free Wi-Fi", description: "High-speed internet throughout the premises" },
        { icon: Car, title: "Valet Parking", description: "Complimentary parking service for all guests" },
      ];
    }
    if (businessType === "cafe") {
      return [
        ...base,
        { icon: Coffee, title: "Specialty Coffee", description: "Freshly brewed artisan coffee selections" },
        { icon: Wifi, title: "Free Wi-Fi", description: "Stay connected while you enjoy your coffee" },
      ];
    }
    return base;
  };

  const services = getServices();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">{businessName}</span>
          </div>
          <div className="flex items-center gap-6">
            {[
              { key: "home", label: "Home", path: `/customer-home?business=${businessId}&table=${tableId}` },
              { key: "menu", label: "Menu", path: `/menu?business=${businessId}&table=${tableId}` },
              { key: "orders", label: "My Orders", path: "/customer" },
            ].map(nav => (
              <button
                key={nav.key}
                onClick={() => navigate(nav.path)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  nav.key === "home" ? "text-secondary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {nav.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-foreground text-background overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-secondary blur-3xl" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-secondary/20 px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm text-secondary font-medium">Welcome to {businessName}</span>
            </div>
            <h1 className="font-display font-bold text-3xl md:text-5xl mb-4 leading-tight">
              Delicious Food,<br />
              <span className="text-secondary">Exceptional Service</span>
            </h1>
            <p className="text-background/60 max-w-md mx-auto mb-8">
              Discover our menu, earn loyalty points, and enjoy a seamless dining experience.
            </p>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Button
                onClick={() => navigate(`/menu?business=${businessId}&table=${tableId}`)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl px-8 py-3 text-sm font-bold gap-2"
              >
                <ShoppingBag className="w-4 h-4" /> Browse Menu
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Services */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">Our Services</h2>
          <p className="text-muted-foreground text-sm mb-6">Everything we offer to make your experience memorable</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                whileHover={{ y: -4, boxShadow: "0 12px 40px -12px hsl(var(--border))" }}
                className="bg-card border border-border rounded-xl p-5 flex gap-4 items-start group cursor-default transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors duration-300">
                  <service.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground text-sm mb-1">{service.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact & Info */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="font-display font-bold text-2xl text-foreground mb-2">Contact & Info</h2>
          <p className="text-muted-foreground text-sm mb-6">Get in touch or visit us</p>
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            {[
              { icon: MapPin, label: "Address", value: business ? `${business.address}, ${business.city}, ${business.country}` : "123 Main Street" },
              { icon: Phone, label: "Phone", value: business ? `${business.phonePrefix}${business.phone}` : "+1 234 567 890" },
              { icon: Mail, label: "Email", value: business?.email || "info@dalabplus.com" },
              { icon: Clock, label: "Hours", value: "Open daily · 7:00 AM – 11:00 PM" },
            ].map((info, i) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="flex items-center gap-4 py-2 group"
              >
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-secondary/20 transition-colors duration-300">
                  <info.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{info.label}</p>
                  <p className="text-sm font-medium text-foreground">{info.value}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center py-8"
        >
          <h3 className="font-display font-bold text-xl text-foreground mb-3">Ready to Order?</h3>
          <p className="text-muted-foreground text-sm mb-5">Browse our full menu and start earning loyalty points</p>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              onClick={() => navigate(`/menu?business=${businessId}&table=${tableId}`)}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl px-8 py-3 gap-2"
            >
              Go to Menu <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">© 2026 {businessName}. Powered by DALABplus+</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerHome;
