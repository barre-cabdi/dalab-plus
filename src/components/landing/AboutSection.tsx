import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const features = ["Multi-Tenant SaaS Architecture", "Role-Based Access Control", "Real-Time Order Tracking", "Gamified Loyalty System", "Customer Self-Registration via QR", "Comprehensive Analytics & Reports"];

const AboutSection = () => (
  <section id="about" className="py-24 bg-hero">
    <div className="container mx-auto px-4">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">About Us</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-6 text-primary-foreground">Built for the Future of<span className="text-gradient-gold"> Hospitality</span></h2>
          <p className="text-primary-foreground/70 leading-relaxed mb-6">DALABplus+ is a complete SaaS platform designed for hotels and restaurants in the modern era. We combine QR-based ordering, intelligent loyalty systems, and real-time analytics into one seamless experience.</p>
          <p className="text-primary-foreground/70 leading-relaxed mb-8">Our mission is to empower every hospitality business — from small cafés to large hotel chains — with technology that drives revenue, delights customers, and simplifies operations.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {features.map(f => (<div key={f} className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" /><span className="text-sm text-primary-foreground/80">{f}</span></div>))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
          <div className="grid grid-cols-2 gap-4">
            {[{ value: "99.9%", label: "Uptime", emoji: "🟢" }, { value: "12+", label: "Countries", emoji: "🌍" }, { value: "500+", label: "Businesses", emoji: "🏢" }, { value: "2M+", label: "Orders Processed", emoji: "📦" }].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="glass rounded-xl p-6 text-center hover:shadow-gold transition-shadow duration-300">
                <p className="text-2xl mb-1">{s.emoji}</p><p className="text-3xl font-display font-bold text-accent">{s.value}</p><p className="text-sm text-primary-foreground/60 mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;
