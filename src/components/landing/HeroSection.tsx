import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";
import { useI18n } from "@/lib/i18n";

const HeroSection = () => {
  const { t } = useI18n();

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-hero">
      {/* Animated background orbs */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 right-10 w-96 h-96 rounded-full bg-accent/10 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        className="absolute bottom-10 left-10 w-[500px] h-[500px] rounded-full bg-accent/5 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.08, 0.15, 0.08] }}
        transition={{ duration: 7, repeat: Infinity, delay: 4 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent/8 blur-3xl"
      />

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6 glow-pulse"
            >
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span className="text-xs font-medium text-accent">{t.heroBadge}</span>
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-7xl font-display font-extrabold leading-[1.1] mb-6 tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-primary-foreground block"
              >
                {t.heroTitle1}
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, duration: 0.6 }}
                className="text-gradient-gold block"
              >
                {t.heroTitle2}
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-primary-foreground/70 max-w-lg mb-10 leading-relaxed"
            >
              {t.heroDesc}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="flex flex-wrap gap-4"
            >
              <Link to="/login">
                <Button variant="hero" size="xl" className="group">
                  {t.getStarted}
                  <ArrowRight className="ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="hero-outline" size="xl" className="group">
                  <Play className="mr-1 group-hover:scale-110 transition-transform" />
                  {t.requestDemo}
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex gap-10 mt-14"
            >
              {[
                { value: "500+", label: t.businesses },
                { value: "50K+", label: t.ordersDay },
                { value: "99.9%", label: t.uptime },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                >
                  <p className="text-3xl font-display font-extrabold text-accent">{s.value}</p>
                  <p className="text-xs text-primary-foreground/50 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 60, rotate: 3 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-hero group">
              <img
                src={heroImage}
                alt="DALABplus+ dashboard preview"
                className="w-full h-auto rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-primary/20 to-transparent rounded-2xl" />
            </div>

            <motion.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-4 -left-4 glass rounded-xl p-4 shadow-card-custom"
            >
              <p className="text-xs text-accent font-semibold">{t.liveOrders}</p>
              <p className="text-2xl font-display font-bold text-primary-foreground">1,247</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-3 -right-3 glass rounded-xl px-4 py-3 shadow-card-custom"
            >
              <p className="text-xs text-accent font-semibold">⭐ Rating</p>
              <p className="text-xl font-display font-bold text-primary-foreground">4.9/5</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
