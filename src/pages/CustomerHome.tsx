import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed, Hotel, Coffee, Phone, Mail, MapPin,
  Clock, Star, ShoppingBag, Users, ChevronRight, Wifi,
  Utensils, ConciergeBell, Car, Sparkles, Bed, Globe
} from "lucide-react";
import { getBusinesses, Business } from "@/lib/store";

const typeConfig: Record<string, { icon: any; heroTitle: string; heroHighlight: string; heroDesc: string; gradient: string; emoji: string }> = {
  restaurant: {
    icon: UtensilsCrossed,
    heroTitle: "Delicious Food,",
    heroHighlight: "Exceptional Service",
    heroDesc: "Discover our menu, earn loyalty points, and enjoy a seamless dining experience.",
    gradient: "from-[hsl(222,60%,12%)] via-[hsl(222,50%,18%)] to-[hsl(222,40%,14%)]",
    emoji: "🍽️",
  },
  hotel: {
    icon: Hotel,
    heroTitle: "Luxury Stay,",
    heroHighlight: "Unforgettable Experience",
    heroDesc: "Book your room, order room service, and enjoy world-class hospitality.",
    gradient: "from-[hsl(222,60%,12%)] via-[hsl(200,50%,18%)] to-[hsl(222,40%,14%)]",
    emoji: "🏨",
  },
  cafe: {
    icon: Coffee,
    heroTitle: "Fresh Brews,",
    heroHighlight: "Cozy Vibes",
    heroDesc: "Savor artisan coffee, delicious pastries, and a warm atmosphere.",
    gradient: "from-[hsl(30,40%,15%)] via-[hsl(35,45%,20%)] to-[hsl(25,35%,12%)]",
    emoji: "☕",
  },
};

const getServices = (type: string) => {
  const base = [
    { icon: Utensils, title: "Dine-In", description: "Enjoy our carefully crafted dishes in a comfortable atmosphere" },
    { icon: ShoppingBag, title: "Takeaway", description: "Order your favorites and take them to go" },
    { icon: Star, title: "Loyalty Program", description: "Earn points with every order and unlock exclusive rewards" },
    { icon: Users, title: "Group Dining", description: "Special arrangements for groups and events" },
  ];
  if (type === "hotel") {
    return [
      { icon: Bed, title: "Room Booking", description: "Book luxurious rooms for a comfortable stay" },
      { icon: Utensils, title: "Restaurant", description: "Fine dining with a curated menu of local & international dishes" },
      { icon: Hotel, title: "Room Service", description: "Order food directly to your room 24/7" },
      { icon: ConciergeBell, title: "Concierge", description: "Our staff is ready to assist you with anything" },
      { icon: Wifi, title: "Free Wi-Fi", description: "High-speed internet throughout the premises" },
      { icon: Car, title: "Valet Parking", description: "Complimentary parking service for all guests" },
      { icon: Star, title: "Loyalty Program", description: "Earn points with every stay and unlock rewards" },
      { icon: Globe, title: "Tour Services", description: "Explore the city with our guided tour arrangements" },
    ];
  }
  if (type === "cafe") {
    return [
      { icon: Coffee, title: "Specialty Coffee", description: "Freshly brewed artisan coffee selections" },
      { icon: Utensils, title: "Pastries & Snacks", description: "Freshly baked goods and light bites" },
      { icon: ShoppingBag, title: "Takeaway", description: "Grab your favorites on the go" },
      { icon: Wifi, title: "Free Wi-Fi", description: "Stay connected while you enjoy your coffee" },
      { icon: Star, title: "Loyalty Program", description: "Earn stamps with every cup" },
      { icon: Users, title: "Meeting Space", description: "Cozy spots for small meetings and co-working" },
    ];
  }
  return base;
};

const CustomerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business") || "";
  const tableId = searchParams.get("table") || "1";
  const [business, setBusiness] = useState<Business | null>(null);

  useEffect(() => {
    const b = getBusinesses().find(b => b.id === businessId);
    if (b) setBusiness(b);
  }, [businessId]);

  const businessName = business?.name || "DALABplus+";
  const businessType = business?.type || "restaurant";
  const config = typeConfig[businessType] || typeConfig.restaurant;
  const TypeIcon = config.icon;
  const services = getServices(businessType);

  const contactInfo = [
    { icon: MapPin, label: "Address", value: business ? `${business.address}, ${business.city}, ${business.country}` : "123 Main Street" },
    { icon: Phone, label: "Phone", value: business ? `${business.countryCode} ${business.phonePrefix} ${business.phone}` : "+1 234 567 890" },
    { icon: Mail, label: "Email", value: business?.email || "info@dalabplus.com" },
    { icon: Clock, label: "Hours", value: "Open daily · 7:00 AM – 11:00 PM" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {business?.logo ? (
              <img src={business.logo} alt={businessName} className="w-9 h-9 rounded-xl object-cover border border-border" />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                <TypeIcon className="w-4 h-4 text-secondary-foreground" />
              </div>
            )}
            <div>
              <span className="font-display font-bold text-foreground text-sm leading-none block">{businessName}</span>
              <span className="text-[10px] text-muted-foreground capitalize">{config.emoji} {businessType}</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
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
        transition={{ duration: 0.7 }}
        className={`relative bg-gradient-to-br ${config.gradient} text-background overflow-hidden`}
      >
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-secondary/15 blur-3xl animate-float-slow" />
          <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full bg-secondary/10 blur-3xl animate-float-slow" style={{ animationDelay: "3s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-secondary/5 blur-[80px]" />
        </div>
        <div className="container mx-auto px-4 py-16 md:py-28 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Logo in hero */}
            {business?.logo && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
                className="mx-auto mb-6 w-20 h-20 rounded-2xl overflow-hidden border-2 border-secondary/30 shadow-gold"
              >
                <img src={business.logo} alt={businessName} className="w-full h-full object-cover" />
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-secondary/20 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6 border border-secondary/20"
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              <span className="text-sm text-secondary font-medium">Welcome to {businessName}</span>
            </motion.div>
            <h1 className="font-display font-bold text-3xl md:text-5xl mb-4 leading-tight text-white">
              {config.heroTitle}<br />
              <span className="text-gradient-gold">{config.heroHighlight}</span>
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-white/60 max-w-md mx-auto mb-8 text-sm md:text-base"
            >
              {business?.description || config.heroDesc}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Button
                onClick={() => navigate(`/menu?business=${businessId}&table=${tableId}`)}
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl px-8 py-3 text-sm font-bold gap-2 shadow-gold"
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
            {contactInfo.map((info, i) => (
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
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl px-8 py-3 gap-2 shadow-gold"
            >
              Go to Menu <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {business?.logo && <img src={business.logo} alt="" className="w-5 h-5 rounded object-cover" />}
            <span className="text-xs font-semibold text-foreground">{businessName}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">© 2026 {businessName}. Powered by DALABplus+</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerHome;
