import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  UtensilsCrossed, Hotel, Coffee, Phone, Mail, MapPin,
  Clock, ArrowRight, Sparkles, Star, LayoutDashboard,
  Home, Menu as MenuIcon, PhoneCall, Globe, ChevronRight,
  Shield, Zap, Heart, Award, Users, CheckCircle2,
  Send, MessageCircle, Gift, TrendingUp, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Business, getDefaultServices, BusinessService } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import dalabLogo from "@/assets/dalabplus-logo.png";

/* ─── Type-specific theming ─── */
const typeThemes = {
  restaurant: {
    icon: UtensilsCrossed,
    emoji: "🍽️",
    label: "Restaurant",
    heroGradient: "from-[hsl(15,80%,12%)] via-[hsl(20,60%,18%)] to-[hsl(25,50%,14%)]",
    accentGlow: "hsl(30,90%,55%)",
    heroTagline: { en: "Exceptional Dining Experience", so: "Waayo-aragnimo Cunto Gaari Ah" },
    heroSubtitle: { en: "Savor every bite in an atmosphere of warmth, flavor, and unforgettable moments.", so: "Ku raaxayso cunto macaan oo lagu darbay jawi diiran iyo xasuus aan la illaawin." },
    aboutText: { en: "We are passionate about creating memorable dining experiences. Every dish is prepared with the freshest ingredients and served with love in a vibrant, welcoming atmosphere.", so: "Waxaan ku dadaalnaa inaan abuurno waayo-aragnimo cunto oo aan la illaawin. Cunto kasta waxaa lagu diyaariyaa walxaha ugu cusub." },
    ctaPrimary: { en: "View Our Menu", so: "Eeg Menu-kayaga" },
    ctaSecondary: { en: "Reserve a Table", so: "Miis Qabo" },
    testimonials: [
      { name: "Ahmed Hassan", text: "Best restaurant in town! The food is always fresh and delicious.", rating: 5 },
      { name: "Fatima Ali", text: "Amazing service and beautiful atmosphere. Our family's favorite place.", rating: 5 },
      { name: "Mohamed Yusuf", text: "The loyalty program is great. I've earned so many rewards!", rating: 4 },
    ],
    whyChooseUs: [
      { icon: UtensilsCrossed, title: { en: "Fresh Ingredients", so: "Walxo Cusub" }, desc: { en: "Sourced daily from local markets", so: "Maalin kasta laga keeno suuqyada" } },
      { icon: Zap, title: { en: "Fast Service", so: "Adeeg Degdeg ah" }, desc: { en: "Quick ordering with QR technology", so: "Dalbo degdeg ah oo QR ah" } },
      { icon: Heart, title: { en: "Cozy Atmosphere", so: "Jawi Raaxo leh" }, desc: { en: "Designed for comfort and warmth", so: "Loo nashqadeeyay raaxo iyo diirannimo" } },
      { icon: Award, title: { en: "Loyalty Rewards", so: "Abaalmarin" }, desc: { en: "Earn points with every order", so: "Dhibco ku kasbado dalbo kasta" } },
    ],
  },
  cafe: {
    icon: Coffee,
    emoji: "☕",
    label: "Cafeteria",
    heroGradient: "from-[hsl(28,40%,14%)] via-[hsl(30,35%,20%)] to-[hsl(25,30%,12%)]",
    accentGlow: "hsl(35,80%,55%)",
    heroTagline: { en: "Crafted Coffee, Cozy Vibes", so: "Qahawo La Sameeyay, Jawi Raaxo leh" },
    heroSubtitle: { en: "Start your day with artisan coffee, freshly baked pastries, and a warm, inviting atmosphere.", so: "Maalintaada ku bilow qahawo macaan, doolshe cusub, iyo jawi diiran." },
    aboutText: { en: "Our café is more than just a coffee shop — it's a community hub where people come together over perfectly crafted beverages and freshly baked delights.", so: "Cafékeenu waa ka badan meel qahawo — waa goob bulsheed oo dadku ku kulanto qahawo macaan iyo wax la dubay oo cusub." },
    ctaPrimary: { en: "See Our Menu", so: "Eeg Menu-ka" },
    ctaSecondary: { en: "Order Takeaway", so: "U Dalbo Qaadashada" },
    testimonials: [
      { name: "Amina Omar", text: "The best cappuccino in the city! Love the cozy atmosphere.", rating: 5 },
      { name: "Ibrahim Jama", text: "Perfect spot for meetings. Great WiFi and amazing pastries.", rating: 5 },
      { name: "Hawa Abdi", text: "My daily coffee fix. The staff knows my order by heart!", rating: 4 },
    ],
    whyChooseUs: [
      { icon: Coffee, title: { en: "Artisan Coffee", so: "Qahawo Gaar ah" }, desc: { en: "Premium beans, expertly brewed", so: "Bun heerka sare ah, si xirfad leh loo kariyay" } },
      { icon: Zap, title: { en: "Quick Service", so: "Adeeg Degdeg ah" }, desc: { en: "Ready in minutes, every time", so: "Daqiiqado gudahood diyaar" } },
      { icon: Heart, title: { en: "Warm & Cozy", so: "Diiran & Raaxo" }, desc: { en: "Your home away from home", so: "Gurigaaga labaad" } },
      { icon: Award, title: { en: "Stamp Rewards", so: "Abaalmarin Shahaado" }, desc: { en: "Free coffee with every 10 stamps", so: "Qahawo bilaash ah 10 shahaadood ka dib" } },
    ],
  },
  hotel: {
    icon: Hotel,
    emoji: "🏨",
    label: "Hotel",
    heroGradient: "from-[hsl(220,50%,10%)] via-[hsl(215,45%,16%)] to-[hsl(210,40%,12%)]",
    accentGlow: "hsl(45,100%,55%)",
    heroTagline: { en: "Luxury Stay, Timeless Comfort", so: "Hoy Raaxo leh, Raaxo Waligeed ah" },
    heroSubtitle: { en: "Experience world-class hospitality with premium amenities, elegant rooms, and exceptional service.", so: "Ku soo dhawoow marti-gelinta heerka caalamiga ah oo leh adeegyo heer sare ah." },
    aboutText: { en: "Our hotel combines elegant luxury with modern comfort. From spacious suites to world-class dining, every detail is crafted to exceed your expectations.", so: "Hudheelikeenu wuxuu isku daraa qurux iyo raaxo casri ah. Qolal ballaaran ilaa cunto heerka caalamiga ah." },
    ctaPrimary: { en: "Book a Room", so: "Qol Qabo" },
    ctaSecondary: { en: "View Rooms", so: "Eeg Qolalka" },
    testimonials: [
      { name: "Sarah Johnson", text: "Absolutely stunning hotel. The VIP suite was beyond expectations.", rating: 5 },
      { name: "Ali Farah", text: "World-class service. The staff made our anniversary truly special.", rating: 5 },
      { name: "Maryam Ahmed", text: "The conference facilities are excellent. Perfect for business events.", rating: 4 },
    ],
    whyChooseUs: [
      { icon: Crown, title: { en: "Premium Rooms", so: "Qolal Heerka Sare" }, desc: { en: "Luxurious suites and amenities", so: "Qolal raaxo leh oo leh adeegyo" } },
      { icon: Shield, title: { en: "24/7 Security", so: "Amniga 24/7" }, desc: { en: "Your safety is our priority", so: "Amnigaagu waa muhiim" } },
      { icon: Heart, title: { en: "Exceptional Service", so: "Adeeg Gaar ah" }, desc: { en: "Dedicated staff at your service", so: "Shaqaale ku adag adeegaaga" } },
      { icon: Award, title: { en: "VIP Experience", so: "Waayo-aragnimo VIP" }, desc: { en: "Exclusive perks for our guests", so: "Faa'iidooyin gaar ah martideena" } },
    ],
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const BusinessHome = () => {
  const navigate = useNavigate();
  const { lang, setLang } = useI18n();
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

  // Track scroll for header bg
  const { scrollY } = useScroll();
  const headerBg = useTransform(scrollY, [0, 100], [0, 1]);
  const [headerSolid, setHeaderSolid] = useState(false);
  useEffect(() => {
    return headerBg.on("change", (v) => setHeaderSolid(v > 0.5));
  }, [headerBg]);

  if (!business) return null;

  const theme = typeThemes[business.type] || typeThemes.restaurant;
  const TypeIcon = theme.icon;
  const services: BusinessService[] = business.services?.length ? business.services : getDefaultServices(business.type);
  const l = (obj: { en: string; so: string }) => obj[lang] || obj.en;

  const contactInfo = [
    { icon: MapPin, label: l({ en: "Address", so: "Cinwaanka" }), value: [business.address, business.city, business.country].filter(Boolean).join(", ") },
    { icon: Phone, label: l({ en: "Phone", so: "Telefoon" }), value: [business.countryCode, business.phonePrefix, business.phone].filter(Boolean).join(" ") },
    { icon: Mail, label: "Email", value: business.email },
    { icon: Clock, label: l({ en: "Hours", so: "Saacadaha" }), value: l({ en: "Daily · 7:00 AM – 11:00 PM", so: "Maalin walba · 7:00 AM – 11:00 PM" }) },
  ].filter(c => c.value);

  const navItems = [
    { key: "home", label: l({ en: "Home", so: "Guriga" }), icon: Home },
    { key: "services", label: l({ en: "Services", so: "Adeegyada" }), icon: Star },
    { key: "menu", label: l({ en: "Menu", so: "Menu" }), icon: MenuIcon },
    { key: "contact", label: l({ en: "Contact", so: "La xiriir" }), icon: PhoneCall },
  ];

  const scrollTo = (id: string) => {
    if (id === "dashboard") { navigate("/admin"); return; }
    setActiveSection(id);
    document.getElementById(`bh-${id}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const stats = [
    { label: l({ en: "Total Orders", so: "Dalabyo Guud" }), value: business.totalOrders.toLocaleString(), icon: "📦", color: "from-blue-500/20 to-blue-600/10" },
    { label: l({ en: "Revenue", so: "Dakhli" }), value: `$${business.totalRevenue.toLocaleString()}`, icon: "💰", color: "from-green-500/20 to-green-600/10" },
    { label: l({ en: "Services", so: "Adeegyo" }), value: services.length.toString(), icon: "⭐", color: "from-amber-500/20 to-amber-600/10" },
    { label: l({ en: "Status", so: "Xaalad" }), value: business.status === "active" ? l({ en: "Active", so: "Firfircoon" }) : l({ en: "Inactive", so: "Aan shaqaynayn" }), icon: business.status === "active" ? "🟢" : "🔴", color: "from-emerald-500/20 to-emerald-600/10" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── STICKY HEADER ─── */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          headerSolid ? "bg-card/95 backdrop-blur-xl shadow-lg border-b border-border" : "bg-transparent"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            {business.logo ? (
              <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-xl object-cover border-2 border-accent/20 shadow-md" />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center border border-accent/20">
                <TypeIcon className="w-5 h-5 text-accent" />
              </div>
            )}
            <div className="hidden sm:block">
              <p className={`font-display font-bold text-sm leading-tight ${headerSolid ? "text-foreground" : "text-white"}`}>{business.name}</p>
              <p className={`text-[10px] ${headerSolid ? "text-muted-foreground" : "text-white/60"}`}>{theme.emoji} {theme.label}</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => scrollTo(item.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeSection === item.key
                    ? "bg-accent/20 text-accent"
                    : headerSolid
                    ? "text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "text-white/70 hover:text-white hover:bg-white/10"
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
              className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full border transition-all ${
                headerSolid
                  ? "text-muted-foreground border-border hover:border-accent hover:text-accent"
                  : "text-white/70 border-white/20 hover:border-white/50 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              {lang === "en" ? "SO" : "EN"}
            </button>
            <Button
              size="sm"
              onClick={() => navigate("/admin")}
              className="hidden md:flex bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5 rounded-full font-semibold shadow-gold"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Button>
          </div>
        </div>

        {/* Mobile Bottom Nav */}
        <div className="md:hidden flex items-center justify-around border-t border-white/10 py-1.5 px-2 bg-card/90 backdrop-blur-xl">
          {[...navItems, { key: "dashboard", label: "Dashboard", icon: LayoutDashboard }].map((item) => (
            <button
              key={item.key}
              onClick={() => scrollTo(item.key)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-all ${
                activeSection === item.key ? "text-accent" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </motion.header>

      {/* ─── HERO SECTION ─── */}
      <section id="bh-home" className={`relative overflow-hidden pt-16 pb-20 md:pt-0 md:pb-28 min-h-[85vh] flex items-center bg-gradient-to-br ${theme.heroGradient}`}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${theme.accentGlow}, transparent 70%)` }} />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${theme.accentGlow}, transparent 70%)` }} />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djJoLTJ2LTJoMnptMC00djJoLTJ2LTJoMnptLTQgMHYyaC0ydi0yaDJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="relative inline-block mb-8"
            >
              {business.logo ? (
                <div className="w-28 h-28 rounded-3xl overflow-hidden border-2 border-white/20 shadow-2xl mx-auto ring-4 ring-white/5">
                  <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center mx-auto">
                  <TypeIcon className="w-14 h-14 text-accent" />
                </div>
              )}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-gold"
              >
                <Sparkles className="w-5 h-5 text-accent-foreground" />
              </motion.div>
            </motion.div>

            {/* Type badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6"
            >
              <span className="text-sm">{theme.emoji}</span>
              <span className="text-xs font-semibold text-white/80 uppercase tracking-widest">{theme.label}</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-display font-extrabold text-4xl sm:text-5xl md:text-6xl text-white mb-4 leading-tight"
            >
              {business.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-accent font-display font-semibold mb-3"
            >
              {l(theme.heroTagline)}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-10"
            >
              {business.description || l(theme.heroSubtitle)}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              <Button
                size="xl"
                onClick={() => scrollTo("menu")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 rounded-full font-bold shadow-gold hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <MenuIcon className="w-5 h-5" />
                {l(theme.ctaPrimary)}
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                size="xl"
                onClick={() => scrollTo("contact")}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border border-white/20 gap-2 rounded-full font-semibold transition-all"
              >
                <PhoneCall className="w-5 h-5" />
                {l(theme.ctaSecondary)}
              </Button>
              <Button
                size="xl"
                onClick={() => navigate("/admin")}
                className="bg-white/5 backdrop-blur-sm hover:bg-white/15 text-white/80 border border-white/10 gap-2 rounded-full font-semibold transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Button>
            </motion.div>
          </div>

          {/* Stats Cards */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  className="relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-5 text-center group hover:bg-white/15 transition-all duration-300"
                >
                  <span className="text-3xl mb-2 block">{stat.icon}</span>
                  <p className="font-display font-extrabold text-2xl text-white">{stat.value}</p>
                  <p className="text-xs text-white/50 mt-1 font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" className="w-full">
            <path d="M0 40C240 80 480 0 720 40C960 80 1200 0 1440 40V80H0V40Z" fill="hsl(var(--background))" />
          </svg>
        </div>
      </section>

      {/* ─── ABOUT SECTION ─── */}
      <section id="bh-about" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
                <Sparkles className="w-3 h-3" />
                {l({ en: "About Us", so: "Naga Ogow" })}
              </span>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-6 leading-tight">
                {l({ en: `Welcome to ${business.name}`, so: `Ku soo dhawoow ${business.name}` })}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {business.description || l(theme.aboutText)}
              </p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {["👨‍🍳", "👩‍💼", "👨‍💻"].map((e, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-accent/10 border-2 border-background flex items-center justify-center text-lg">{e}</div>
                  ))}
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{l({ en: "Trusted by hundreds", so: "Boqolaal oo ku kalsoon" })}</p>
                  <p className="text-xs text-muted-foreground">{l({ en: "of happy customers", so: "macaamiil faraxsan" })}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
              className="grid grid-cols-2 gap-4"
            >
              {theme.whyChooseUs.map((item, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-accent/20 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-3 group-hover:bg-accent/20 transition-colors">
                    <item.icon className="w-5 h-5 text-accent" />
                  </div>
                  <h4 className="font-bold text-sm text-foreground mb-1">{l(item.title)}</h4>
                  <p className="text-xs text-muted-foreground">{l(item.desc)}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SERVICES SECTION ─── */}
      <section id="bh-services" className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              <Star className="w-3 h-3" />
              {l({ en: "Our Services", so: "Adeegyadeena" })}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-3">
              {l({ en: "What We Offer", so: "Waxaan Bixinaa" })}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {l({ en: "Explore our premium services designed for your comfort and satisfaction.", so: "Baadhitaan adeegyadeena heerka sare ah ee loo nashqadeeyay raaxadaada." })}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {services.map((service, i) => (
              <motion.div
                key={service.id}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="relative overflow-hidden p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group cursor-default"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-accent/10 transition-colors" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 group-hover:scale-110 transition-all duration-300">
                    <span className="text-2xl">{service.icon}</span>
                  </div>
                  <h3 className="font-display font-bold text-foreground mb-2">{service.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MENU / BOOKING PREVIEW ─── */}
      <section id="bh-menu" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              <MenuIcon className="w-3 h-3" />
              {business.type === "hotel"
                ? l({ en: "Our Rooms", so: "Qolalkeena" })
                : l({ en: "Our Menu", so: "Menu-kayaga" })}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-3">
              {business.type === "hotel"
                ? l({ en: "Elegant Rooms & Suites", so: "Qolal Qurux badan" })
                : l({ en: "Taste Our Favorites", so: "Dhadhan Kuweena" })}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {business.type === "hotel"
                ? l({ en: "Choose from our selection of premium rooms for a perfect stay.", so: "Ka dooro qolalkeena heerka sare ah hoyga wanaagsan." })
                : l({ en: "Discover our most popular dishes crafted with fresh ingredients.", so: "Baro cuntooyinkeena caanka ah ee lagu sameeyay walxo cusub." })}
            </p>
          </motion.div>

          {business.type === "hotel" ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { name: l({ en: "Single Room", so: "Qol Keli ah" }), price: "$80", icon: "🛏️", desc: l({ en: "Cozy room for solo travelers", so: "Qol raaxo ah safar keli ah" }) },
                { name: l({ en: "Double Room", so: "Qol Labo" }), price: "$120", icon: "🛏️🛏️", desc: l({ en: "Spacious room for couples or friends", so: "Qol ballaaran labo qof" }) },
                { name: l({ en: "VIP Suite", so: "Qol VIP" }), price: "$250", icon: "👑", desc: l({ en: "Luxury suite with premium amenities", so: "Qol raaxo leh adeegyo heer sare" }) },
              ].map((room, i) => (
                <motion.div
                  key={room.name}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group text-center"
                >
                  <span className="text-4xl block mb-4">{room.icon}</span>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">{room.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{room.desc}</p>
                  <p className="font-display font-extrabold text-2xl text-accent mb-4">{room.price}<span className="text-xs text-muted-foreground font-normal">/{l({ en: "night", so: "habeennimo" })}</span></p>
                  <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-1.5 w-full font-semibold">
                    {l({ en: "Book Now", so: "Hadda Qabo" })}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                { name: business.type === "cafe" ? l({ en: "Cappuccino", so: "Kabuchiino" }) : l({ en: "Grilled Steak", so: "Hilib la dubay" }), price: business.type === "cafe" ? "$4.50" : "$18.00", icon: business.type === "cafe" ? "☕" : "🥩", category: business.type === "cafe" ? l({ en: "Coffee", so: "Qahawo" }) : l({ en: "Main Course", so: "Cunto Weyn" }) },
                { name: business.type === "cafe" ? l({ en: "Croissant", so: "Doolshe" }) : l({ en: "Pasta Alfredo", so: "Baasto" }), price: business.type === "cafe" ? "$3.00" : "$14.00", icon: business.type === "cafe" ? "🥐" : "🍝", category: business.type === "cafe" ? l({ en: "Pastry", so: "Doolshe" }) : l({ en: "Pasta", so: "Baasto" }) },
                { name: business.type === "cafe" ? l({ en: "Smoothie Bowl", so: "Casiir" }) : l({ en: "Tiramisu", so: "Tiramisu" }), price: business.type === "cafe" ? "$6.00" : "$8.00", icon: business.type === "cafe" ? "🥤" : "🍰", category: business.type === "cafe" ? l({ en: "Drinks", so: "Cabbitaano" }) : l({ en: "Dessert", so: "Macmacaan" }) },
              ].map((item, i) => (
                <motion.div
                  key={item.name}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  variants={fadeUp}
                  custom={i}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-accent/30 hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-2.5 py-1 rounded-full">{item.category}</span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-1">{item.name}</h3>
                  <p className="font-display font-extrabold text-xl text-accent">{item.price}</p>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            custom={4}
            className="text-center mt-10"
          >
            <Button
              size="lg"
              onClick={() => navigate(`/customer-menu?business=${business.id}`)}
              className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2 font-bold shadow-gold"
            >
              {business.type === "hotel"
                ? l({ en: "View All Rooms", so: "Eeg Qolalka Oo Dhan" })
                : l({ en: "View Full Menu", so: "Eeg Menu-ka Oo Dhan" })}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              <Shield className="w-3 h-3" />
              {l({ en: "Why Choose Us", so: "Maxaa Naloo Doortaa" })}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground">
              {l({ en: "What Makes Us Special", so: "Waxa Na Gaar ka dhiga" })}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {[
              { icon: CheckCircle2, title: l({ en: "Premium Quality", so: "Tayada Sare" }), desc: l({ en: "Only the best for our customers", so: "Waxaan bixinaa oo kaliya kuwa ugu fiican" }) },
              { icon: Zap, title: l({ en: "Fast & Efficient", so: "Degdeg & Waxtar" }), desc: l({ en: "Quick service with modern technology", so: "Adeeg degdeg ah oo tignoolojiyo casri ah" }) },
              { icon: Users, title: l({ en: "Expert Team", so: "Koox Xirfad leh" }), desc: l({ en: "Trained professionals at your service", so: "Xirfadleyaal tababaran oo adeegaaga ah" }) },
              { icon: Gift, title: l({ en: "Loyalty Rewards", so: "Abaalmarin" }), desc: l({ en: "Earn points and unlock rewards", so: "Dhibcaha ku kasbado oo abaalmariyo fur" }) },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="text-center p-6 rounded-2xl bg-card border border-border hover:border-accent/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 group-hover:scale-110 transition-all duration-300">
                  <item.icon className="w-6 h-6 text-accent" />
                </div>
                <h4 className="font-display font-bold text-foreground mb-2">{item.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              <MessageCircle className="w-3 h-3" />
              {l({ en: "Testimonials", so: "Marag-furka" })}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground">
              {l({ en: "What Our Customers Say", so: "Waxaa Macaamiishayadu Yidhaahdaan" })}
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {theme.testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={fadeUp}
                custom={i}
                className="p-6 rounded-2xl bg-card border border-border hover:border-accent/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-4 h-4 ${si < t.rating ? "text-accent fill-accent" : "text-muted"}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent">
                    {t.name.charAt(0)}
                  </div>
                  <p className="text-sm font-bold text-foreground">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LOYALTY HIGHLIGHT ─── */}
      <section className={`py-16 bg-gradient-to-br ${theme.heroGradient} relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] rounded-full opacity-15" style={{ background: `radial-gradient(circle, ${theme.accentGlow}, transparent 70%)` }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 mb-6">
                <Crown className="w-4 h-4 text-accent" />
                <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{l({ en: "Loyalty Program", so: "Barnaamijka Daacadnimada" })}</span>
              </div>
              <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white mb-4">
                {l({ en: "Earn Rewards Every Visit", so: "Ku Kasbado Abaalmarino Soo-booqasho Kasta" })}
              </h2>
              <p className="text-white/60 max-w-lg mx-auto mb-8 leading-relaxed">
                {l({ en: "Join our loyalty program and unlock exclusive rewards, discounts, and VIP perks. Every order brings you closer to amazing benefits.", so: "Ku biir barnaamijkeena oo fur abaalmariyo gaar ah, qiimo-dhimis, iyo faa'iidooyin VIP." })}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-6 mb-8">
                {[
                  { icon: "🥉", label: l({ en: "Bronze", so: "Bronze" }), points: "0-100" },
                  { icon: "🥈", label: l({ en: "Silver", so: "Silver" }), points: "100-500" },
                  { icon: "🥇", label: l({ en: "Gold", so: "Gold" }), points: "500-1000" },
                  { icon: "💎", label: l({ en: "Platinum", so: "Platinum" }), points: "1000+" },
                ].map((tier) => (
                  <div key={tier.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                    <span className="text-xl">{tier.icon}</span>
                    <div className="text-left">
                      <p className="text-xs font-bold text-white">{tier.label}</p>
                      <p className="text-[10px] text-white/50">{tier.points} pts</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full font-bold gap-2 shadow-gold"
              >
                <Gift className="w-4 h-4" />
                {l({ en: "Join Now", so: "Hadda Ku Biir" })}
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CONTACT SECTION ─── */}
      <section id="bh-contact" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="text-center mb-14"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-4">
              <PhoneCall className="w-3 h-3" />
              {l({ en: "Contact Us", so: "Nala Soo Xiriir" })}
            </span>
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-3">
              {l({ en: "Get In Touch", so: "Nala Soo Xiriir" })}
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              {l({ en: "We'd love to hear from you. Reach out to us anytime.", so: "Waan jeclaan lahayn inaan kaa maqalno. Wakhti kasta nala soo xiriir." })}
            </p>
          </motion.div>

          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
            {/* Contact Info Cards */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              className="space-y-4"
            >
              {contactInfo.map((info, i) => (
                <motion.div
                  key={info.label}
                  variants={fadeUp}
                  custom={i}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-card border border-border hover:border-accent/20 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/20 transition-colors">
                    <info.icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{info.label}</p>
                    <p className="text-sm font-medium text-foreground">{info.value}</p>
                  </div>
                </motion.div>
              ))}

              {/* Payment Methods */}
              {business.paymentMethods && (
                <div className="p-5 rounded-2xl bg-card border border-border">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-3">{l({ en: "Accepted Payments", so: "Lacag-bixinta" })}</p>
                  <div className="flex flex-wrap gap-2">
                    {business.paymentMethods.cashEnabled && <span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold">💵 Cash</span>}
                    {business.paymentMethods.cardEnabled && <span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold">💳 Card</span>}
                    {business.paymentMethods.mobileEnabled && <span className="text-xs px-3 py-1.5 rounded-full bg-accent/10 text-accent font-semibold">📱 Mobile</span>}
                    {business.paymentMethods.mobileEnabled && business.paymentMethods.mobileProviders.map(p => (
                      <span key={p.id} className="text-xs px-3 py-1.5 rounded-full bg-muted border border-border font-medium">{p.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp}
              custom={2}
              className="p-6 rounded-2xl bg-card border border-border"
            >
              <h3 className="font-display font-bold text-lg text-foreground mb-5">{l({ en: "Send Us a Message", so: "Fariin Noo Dir" })}</h3>
              <div className="space-y-4">
                <Input placeholder={l({ en: "Your Name", so: "Magacaaga" })} className="rounded-xl" />
                <Input placeholder={l({ en: "Your Email", so: "Email-kaaga" })} type="email" className="rounded-xl" />
                <Input placeholder={l({ en: "Subject", so: "Mawduuca" })} className="rounded-xl" />
                <Textarea placeholder={l({ en: "Your Message...", so: "Fariintaada..." })} className="rounded-xl min-h-[100px]" />
                <Button className="w-full bg-accent hover:bg-accent/90 text-accent-foreground rounded-xl font-bold gap-2 shadow-gold">
                  <Send className="w-4 h-4" />
                  {l({ en: "Send Message", so: "Dir Fariinta" })}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section className="py-16 bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display font-extrabold text-2xl md:text-3xl text-foreground mb-4">
              {l({ en: "Ready to Experience the Best?", so: "Diyaar u tahay inaad soo dhawaaqdo?" })}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
              {l({ en: `Visit ${business.name} today and discover why we're the top choice.`, so: `Booqo ${business.name} maanta oo ogaada sababta doorashadayada.` })}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={() => navigate("/admin")}
                className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full gap-2 font-bold shadow-gold"
              >
                <LayoutDashboard className="w-4 h-4" />
                {l({ en: "Go to Dashboard", so: "Aad Dashboard-ka" })}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => scrollTo("contact")}
                className="rounded-full gap-2 font-semibold"
              >
                <PhoneCall className="w-4 h-4" />
                {l({ en: "Contact Us", so: "Nala Soo Xiriir" })}
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className={`bg-gradient-to-br ${theme.heroGradient} pt-12 pb-6 relative overflow-hidden`}>
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute bottom-0 left-1/2 w-[500px] h-[300px] rounded-full opacity-10" style={{ background: `radial-gradient(circle, ${theme.accentGlow}, transparent 70%)` }} />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {business.logo ? (
                  <img src={business.logo} alt={business.name} className="w-10 h-10 rounded-xl object-cover border border-white/20" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                    <TypeIcon className="w-5 h-5 text-accent" />
                  </div>
                )}
                <div>
                  <p className="font-display font-bold text-white text-sm">{business.name}</p>
                  <p className="text-[10px] text-white/50">{theme.emoji} {theme.label}</p>
                </div>
              </div>
              <p className="text-xs text-white/40 leading-relaxed">{(business.description || l(theme.aboutText)).slice(0, 120)}...</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4">{l({ en: "Quick Links", so: "Links-ka Degdegga" })}</h4>
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button key={item.key} onClick={() => scrollTo(item.key)} className="flex items-center gap-2 text-xs text-white/50 hover:text-accent transition-colors">
                    <ChevronRight className="w-3 h-3" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4">{l({ en: "Services", so: "Adeegyada" })}</h4>
              <div className="space-y-2">
                {services.slice(0, 4).map((s) => (
                  <p key={s.id} className="flex items-center gap-2 text-xs text-white/50">
                    <span>{s.icon}</span> {s.title}
                  </p>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-display font-bold text-white text-sm mb-4">{l({ en: "Contact", so: "Xiriirka" })}</h4>
              <div className="space-y-2">
                {contactInfo.slice(0, 3).map((info) => (
                  <div key={info.label} className="flex items-start gap-2 text-xs text-white/50">
                    <info.icon className="w-3.5 h-3.5 mt-0.5 text-accent flex-shrink-0" />
                    <span className="line-clamp-2">{info.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-white/30">
              © 2026 {business.name} · {l({ en: "All rights reserved", so: "Dhammaan xuquuqda way dhowran tahay" })}
            </p>
            <div className="flex items-center gap-2">
              <img src={dalabLogo} alt="DALABplus+" className="w-5 h-5 rounded" />
              <span className="text-[11px] text-white/40">
                Powered by <span className="text-accent font-bold">DALABplus+</span>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BusinessHome;
