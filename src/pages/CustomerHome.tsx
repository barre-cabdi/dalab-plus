import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Hotel, Coffee, Phone, Mail, MapPin,
  Clock, Info,
} from "lucide-react";
import { getBusinesses, Business, getDefaultServices, BusinessService } from "@/lib/store";

const typeConfig: Record<string, { icon: any; gradient: string; emoji: string; aboutText: string }> = {
  restaurant: {
    icon: UtensilsCrossed,
    gradient: "from-[hsl(222,60%,12%)] via-[hsl(222,50%,18%)] to-[hsl(222,40%,14%)]",
    emoji: "🍽️",
    aboutText: "We serve delicious meals prepared with the freshest ingredients. Our goal is to provide an exceptional dining experience with quality food and outstanding service.",
  },
  hotel: {
    icon: Hotel,
    gradient: "from-[hsl(222,60%,12%)] via-[hsl(200,50%,18%)] to-[hsl(222,40%,14%)]",
    emoji: "🏨",
    aboutText: "We offer luxury accommodation and world-class hospitality. From comfortable rooms to premium amenities, your comfort is our priority.",
  },
  cafe: {
    icon: Coffee,
    gradient: "from-[hsl(30,40%,15%)] via-[hsl(35,45%,20%)] to-[hsl(25,35%,12%)]",
    emoji: "☕",
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

  const services: BusinessService[] = business?.services?.length
    ? business.services
    : getDefaultServices(businessType);

  const contactInfo = [
    { icon: MapPin, label: "Cinwaanka", value: business ? `${business.address}, ${business.city}, ${business.country}` : "" },
    { icon: Phone, label: "Telefoon", value: business ? `${business.countryCode} ${business.phonePrefix} ${business.phone}` : "" },
    { icon: Mail, label: "Email", value: business?.email || "" },
    { icon: Clock, label: "Saacadaha", value: "Maalin walba · 7:00 AM – 11:00 PM" },
  ].filter(c => c.value);

  const sections = [
    { key: "about", label: "About" },
    { key: "services", label: "Services" },
    { key: "contact", label: "Contact" },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header with Business Branding */}
      <header className={`relative bg-gradient-to-br ${config.gradient} text-white overflow-hidden`}>
        <div className="absolute inset-0">
          <div className="absolute top-5 left-5 w-32 h-32 rounded-full bg-secondary/10 blur-3xl" />
          <div className="absolute bottom-5 right-5 w-40 h-40 rounded-full bg-secondary/8 blur-3xl" />
        </div>
        <div className="relative z-10 px-4 py-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", duration: 0.5 }}>
            {business?.logo ? (
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-secondary/30 shadow-gold mx-auto mb-3">
                <img src={business.logo} alt={businessName} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center mx-auto mb-3">
                <TypeIcon className="w-8 h-8 text-secondary" />
              </div>
            )}
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h1 className="font-display font-bold text-xl mb-1">{businessName}</h1>
            <span className="text-white/50 text-xs capitalize">{config.emoji} {businessType}</span>
          </motion.div>

        </div>
      </header>

      {/* Section Tabs */}
      <div className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="flex items-center justify-center gap-1 px-4 py-2">
          {sections.map(s => (
            <button
              key={s.key}
              onClick={() => {
                setActiveSection(s.key);
                document.getElementById(`section-${s.key}`)?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeSection === s.key
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-8">
        {/* About / What We Do */}
        <motion.section
          id="section-about"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-secondary" />
            <h2 className="font-display font-bold text-base text-foreground">What We Do</h2>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {business?.description || config.aboutText}
            </p>
          </div>
        </motion.section>

        {/* Services */}
        <motion.section
          id="section-services"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="font-display font-bold text-base text-foreground mb-3">🛎️ Our Services</h2>
          <div className="space-y-2.5">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.06 }}
                className="bg-card border border-border rounded-xl p-4 flex gap-3 items-center group hover:border-secondary/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">{service.icon}</span>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground text-sm">{service.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{service.description}</p>
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
            transition={{ delay: 0.3 }}
          >
            <h2 className="font-display font-bold text-base text-foreground mb-3">📍 Contact & Info</h2>
            <div className="bg-card border border-border rounded-xl p-4 space-y-3">
              {contactInfo.map((info, i) => (
                <div key={info.label} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <info.icon className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{info.label}</p>
                    <p className="text-xs font-medium text-foreground">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            {business?.logo && <img src={business.logo} alt="" className="w-4 h-4 rounded object-cover" />}
            <span className="text-[11px] font-semibold text-foreground">{businessName}</span>
          </div>
          <p className="text-[9px] text-muted-foreground">© 2026 {businessName} · Powered by DALABplus+</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerHome;
