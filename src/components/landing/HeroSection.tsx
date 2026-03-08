import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden bg-hero">
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass mb-6">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse-gold" />
              <span className="text-xs font-medium text-accent">Smart Restaurant Technology</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
              <span className="text-primary-foreground">Smart Digital Menu</span><br />
              <span className="text-gradient-gold">for Hotels & Restaurants</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 max-w-lg mb-8 leading-relaxed">
              QR ordering, loyalty rewards, real-time tracking, and powerful analytics — all in one beautiful platform built for modern hospitality.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/login"><Button variant="hero" size="xl">Get Started <ArrowRight className="ml-1" /></Button></Link>
              <Button variant="hero-outline" size="xl"><Play className="mr-1" /> Request Demo</Button>
            </div>
            <div className="flex gap-8 mt-12">
              {[{ value: "500+", label: "Businesses" }, { value: "50K+", label: "Orders/Day" }, { value: "99.9%", label: "Uptime" }].map(s => (
                <div key={s.label}><p className="text-2xl font-display font-bold text-accent">{s.value}</p><p className="text-xs text-primary-foreground/50">{s.label}</p></div>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-hero">
              <img src={heroImage} alt="DALABplus+ dashboard preview" className="w-full h-auto rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent rounded-2xl" />
            </div>
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -bottom-4 -left-4 glass rounded-xl p-4 shadow-card-custom">
              <p className="text-xs text-accent font-semibold">🔥 Live Orders</p>
              <p className="text-2xl font-display font-bold text-primary-foreground">1,247</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
