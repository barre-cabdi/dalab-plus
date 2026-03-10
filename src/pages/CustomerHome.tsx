import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Hotel, Coffee, Phone, Mail, MapPin,
  Clock, Info, ArrowRight, Sparkles, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getBusinessById, Business, getDefaultServices, BusinessService } from "@/lib/store";

const typeConfig: Record<string, { icon: any; emoji: string; aboutText: string }> = {
  restaurant: {
    icon: UtensilsCrossed, emoji: "🍽️",
    aboutText: "We serve delicious meals prepared with the freshest ingredients. Our goal is to provide an exceptional dining experience with quality food and outstanding service.",
  },
  hotel: {
    icon: Hotel, emoji: "🏨",
    aboutText: "We offer luxury accommodation and world-class hospitality. From comfortable rooms to premium amenities, your comfort is our priority.",
  },
  cafe: {
    icon: Coffee, emoji: "☕",
    aboutText: "We craft artisan coffee and delicious pastries in a warm, welcoming atmosphere. Every cup is made with passion and the finest beans.",
  },
};

const CustomerHome = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const businessId = searchParams.get("business") || "";
  const tableId = searchParams.get("table") || "1";
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const b = getBusinesses().find(b => b.id === businessId);
    if (b) setBusiness(b);
  }, [businessId]);

  const businessName = business?.name || "";
  const businessType = business?.type || "restaurant";
  const config = typeConfig[businessType] || typeConfig.restaurant;
  const TypeIcon = config.icon;

  const services: BusinessService[] = business?.services?.length ? business.services : getDefaultServices(businessType);

  const contactInfo = [
    { icon: MapPin, label: "Cinwaanka", value: business ? `${business.address}, ${business.city}, ${business.country}` : "" },
    { icon: Phone, label: "Telefoon", value: business ? `${business.countryCode} ${business.phonePrefix} ${business.phone}` : "" },
    { icon: Mail, label: "Email", value: business?.email || "" },
    { icon: Clock, label: "Saacadaha", value: "Maalin walba · 7:00 AM – 11:00 PM" },
  ].filter(c => c.value);

  const sections = [
    { key: "about", label: "About", icon: Info },
    { key: "services", label: "Services", icon: Star },
    { key: "contact", label: "Contact", icon: Phone },
  ];

  return (
    <div className="min-h-screen bg-hero relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/3 blur-[80px] pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-4 pt-12 pb-6 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative inline-block"
        >
          {business?.logo ? (
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-accent/30 shadow-gold mx-auto">
              <img src={business.logo} alt={businessName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <motion.div
              className="w-20 h-20 rounded-2xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center mx-auto"
              animate={{ boxShadow: ["0 0 20px hsl(45 100% 50% / 0.15)", "0 0 40px hsl(45 100% 50% / 0.25)", "0 0 20px hsl(45 100% 50% / 0.15)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <TypeIcon className="w-10 h-10 text-accent" />
            </motion.div>
          )}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center shadow-gold"
          >
            <Sparkles className="w-3.5 h-3.5 text-accent-foreground" />
          </motion.div>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display font-bold text-2xl text-primary-foreground mt-4"
        >
          {businessName}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-primary-foreground/40 text-sm mt-1"
        >
          {config.emoji} {businessType.charAt(0).toUpperCase() + businessType.slice(1)}
        </motion.p>
      </div>

      {/* Section Tabs */}
      <div className="sticky top-0 z-40 glass border-y border-border/10">
        <div className="flex items-center justify-center gap-2 px-4 py-2.5">
          {sections.map((s, i) => (
            <motion.button
              key={s.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveSection(s.key);
                document.getElementById(`section-${s.key}`)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300 flex items-center gap-1.5 ${
                activeSection === s.key
                  ? "bg-gold-gradient text-accent-foreground shadow-gold"
                  : "text-primary-foreground/50 hover:text-primary-foreground/70 hover:bg-accent/5"
              }`}
            >
              <s.icon className="w-3 h-3" />
              {s.label}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 py-6 max-w-lg mx-auto w-full space-y-6">
        {/* About */}
        <motion.section
          id="section-about"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-accent" />
            <h2 className="font-display font-bold text-base text-primary-foreground">What We Do</h2>
          </div>
          <div className="glass rounded-2xl p-5">
            <p className="text-sm text-primary-foreground/60 leading-relaxed">
              {business?.description || config.aboutText}
            </p>
          </div>
        </motion.section>

        {/* Services */}
        <motion.section
          id="section-services"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <h2 className="font-display font-bold text-base text-primary-foreground mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-accent" /> Our Services
          </h2>
          <div className="space-y-2.5">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.06 }}
                whileHover={{ x: 4 }}
                className="glass rounded-2xl p-4 flex gap-3 items-center group hover:border-accent/20 transition-all duration-300 cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 10 }}
                  className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-lg">{service.icon}</span>
                </motion.div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-primary-foreground text-sm">{service.title}</h3>
                  <p className="text-xs text-primary-foreground/40 truncate">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Contact */}
        {contactInfo.length > 0 && (
          <motion.section
            id="section-contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
          >
            <h2 className="font-display font-bold text-base text-primary-foreground mb-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent" /> Contact & Info
            </h2>
            <div className="glass rounded-2xl p-5 space-y-4">
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="flex items-center gap-3 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                    <info.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-primary-foreground/30 uppercase tracking-wider">{info.label}</p>
                    <p className="text-xs font-medium text-primary-foreground/80">{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="hero"
            size="xl"
            className="w-full rounded-2xl gap-2"
            onClick={() => navigate(`/menu?table=${tableId}&business=${businessId}`)}
          >
            <UtensilsCrossed className="w-4 h-4" /> Browse Menu <ArrowRight className="w-4 h-4" />
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 glass border-t border-border/10 py-4 mt-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {business?.logo && <img src={business.logo} alt="" className="w-4 h-4 rounded object-cover" />}
            <span className="text-[11px] font-semibold text-primary-foreground/60">{businessName}</span>
          </div>
          <p className="text-[9px] text-primary-foreground/25">© 2026 {businessName} · Powered by <span className="text-accent/40 font-semibold">DALABplus+</span></p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerHome;
