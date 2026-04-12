import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  UtensilsCrossed, Hotel, Coffee, Phone, Mail, MapPin,
  Clock, ArrowRight, Sparkles, Star, Info, LayoutDashboard,
  Home, Menu as MenuIcon, PhoneCall, Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Business, getDefaultServices, BusinessService } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import dalabLogo from "@/assets/dalabplus-logo.png";

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

const BusinessHome = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const [business, setBusiness] = useState<Business | null>(null);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const stored = localStorage.getItem("dp_active_business");
    if (stored) {
      setBusiness(JSON.parse(stored));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!business) return null;

  const config = typeConfig[business.type] || typeConfig.restaurant;
  const TypeIcon = config.icon;
  const services: BusinessService[] = business.services?.length ? business.services : getDefaultServices(business.type);

  const contactInfo = [
    { icon: MapPin, label: lang === "so" ? "Cinwaanka" : "Address", value: `${business.address}, ${business.city}, ${business.country}` },
    { icon: Phone, label: lang === "so" ? "Telefoon" : "Phone", value: `${business.countryCode} ${business.phonePrefix} ${business.phone}` },
    { icon: Mail, label: "Email", value: business.email },
    { icon: Clock, label: lang === "so" ? "Saacadaha" : "Hours", value: lang === "so" ? "Maalin walba · 7:00 AM – 11:00 PM" : "Daily · 7:00 AM – 11:00 PM" },
  ].filter(c => c.value);

  const navItems = [
    { key: "home", label: lang === "so" ? "Guriga" : "Home", icon: Home },
    { key: "services", label: lang === "so" ? "Adeegyada" : "Services", icon: Star },
    { key: "contact", label: lang === "so" ? "La xiriir" : "Contact", icon: PhoneCall },
    { key: "dashboard", label: lang === "so" ? "Dashboard" : "Dashboard", icon: LayoutDashboard },
  ];

  const scrollTo = (id: string) => {
    if (id === "dashboard") {
      navigate("/admin");
      return;
    }
    setActiveSection(id);
    document.getElementById(`bh-${id}`)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <motion.header
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 glass border-b border-border"
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-9 h-9 rounded-lg object-cover border border-accent/20" />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <TypeIcon className="w-5 h-5 text-accent" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className="font-display font-bold text-sm text-foreground leading-tight">{business.name}</p>
              <p className="text-[10px] text-muted-foreground">{config.emoji} {business.type.charAt(0).toUpperCase() + business.type.slice(1)}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollTo(item.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.key
                    ? "bg-accent/15 text-accent"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang(lang === "en" ? "so" : "en")}
              className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-full border border-border hover:border-accent"
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "SO" : "EN"}
            </button>
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate("/admin")}
              className="hidden md:flex bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden flex items-center justify-around border-t border-border py-1.5 px-2">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => scrollTo(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${
                activeSection === item.key
                  ? "text-accent"
                  : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </motion.header>

      {/* Hero Section */}
      <section id="bh-home" className="pt-32 md:pt-24 pb-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-accent/5 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] rounded-full bg-accent/3 blur-[80px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="relative inline-block mb-6"
            >
              {business.logo ? (
                <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-accent/30 shadow-lg mx-auto">
                  <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <motion.div
                  className="w-24 h-24 rounded-2xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center mx-auto"
                  animate={{ boxShadow: ["0 0 20px hsl(var(--accent) / 0.15)", "0 0 40px hsl(var(--accent) / 0.25)", "0 0 20px hsl(var(--accent) / 0.15)"] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <TypeIcon className="w-12 h-12 text-accent" />
                </motion.div>
              )}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-accent-foreground" />
              </motion.div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-display font-extrabold text-4xl md:text-5xl text-foreground mb-3"
            >
              {business.name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground text-lg mb-2"
            >
              {config.emoji} {business.type.charAt(0).toUpperCase() + business.type.slice(1)} · {business.city}, {business.country}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground/70 text-sm max-w-xl mx-auto leading-relaxed mb-8"
            >
              {business.description || config.aboutText}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-3"
            >
              <Button
                variant="default"
                size="lg"
                onClick={() => navigate("/admin")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 rounded-xl px-6"
              >
                <LayoutDashboard className="w-4 h-4" />
                {lang === "so" ? "Dashboard-ka Fur" : "Open Dashboard"}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollTo("contact")}
                className="gap-2 rounded-xl px-6"
              >
                <PhoneCall className="w-4 h-4" />
                {lang === "so" ? "La xiriir" : "Contact Info"}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-8 border-y border-border bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: lang === "so" ? "Dalabyo Guud" : "Total Orders", value: business.totalOrders.toLocaleString(), icon: "📦" },
              { label: lang === "so" ? "Dakhli Guud" : "Total Revenue", value: `$${business.totalRevenue.toLocaleString()}`, icon: "💰" },
              { label: lang === "so" ? "Adeegyo" : "Services", value: services.length.toString(), icon: "⭐" },
              { label: lang === "so" ? "Xaalad" : "Status", value: business.status === "active" ? (lang === "so" ? "Firfircoon" : "Active") : (lang === "so" ? "Aan shaqaynayn" : "Inactive"), icon: business.status === "active" ? "🟢" : "🔴" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="text-center p-4 rounded-xl bg-card border border-border"
              >
                <span className="text-2xl">{stat.icon}</span>
                <p className="font-display font-bold text-lg text-foreground mt-1">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="bh-services" className="py-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2 flex items-center justify-center gap-2">
              <Star className="w-6 h-6 text-accent" />
              {lang === "so" ? "Adeegyadeena" : "Our Services"}
            </h2>
            <p className="text-muted-foreground text-sm">
              {lang === "so" ? "Waxaan bixinaa adeegyadan heerka sare ah" : "We offer these premium services"}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="flex gap-4 items-start p-5 rounded-2xl border border-border bg-card hover:border-accent/20 hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                  <span className="text-xl">{service.icon}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-1">{service.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      {contactInfo.length > 0 && (
        <section id="bh-contact" className="py-16 bg-muted/30 border-t border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-2 flex items-center justify-center gap-2">
                <MapPin className="w-6 h-6 text-accent" />
                {lang === "so" ? "Xiriirka & Macluumaadka" : "Contact & Info"}
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border group hover:border-accent/20 transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                    <info.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">{info.label}</p>
                    <p className="text-sm font-medium text-foreground">{info.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6 bg-card">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <img src={dalabLogo} alt="DALABplus+" className="w-5 h-5 rounded" />
            <span className="text-xs font-semibold text-muted-foreground">{business.name}</span>
          </div>
          <p className="text-[10px] text-muted-foreground/50">
            © 2026 {business.name} · Powered by <span className="text-accent font-semibold">DALABplus+</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default BusinessHome;
