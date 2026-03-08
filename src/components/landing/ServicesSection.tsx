import { motion } from "framer-motion";
import { QrCode, LayoutDashboard, MapPin, Gift, BarChart3, FileText, Building2, Users } from "lucide-react";

const services = [
  { icon: QrCode, title: "QR Code Ordering", desc: "Customers scan, browse, and order — no app download needed." },
  { icon: LayoutDashboard, title: "Admin Dashboard", desc: "Full control over menus, tables, orders, and staff." },
  { icon: MapPin, title: "Waiter Tracking", desc: "Real-time order status and waiter assignment tracking." },
  { icon: Gift, title: "Loyalty Points", desc: "Bronze to Platinum tiers with automatic reward unlocks." },
  { icon: BarChart3, title: "Customer Analytics", desc: "Deep insights into customer behavior and spending." },
  { icon: FileText, title: "Sales Reports", desc: "Daily, weekly, monthly reports with export options." },
  { icon: Building2, title: "Multi-Business", desc: "Manage multiple restaurants from one super admin." },
  { icon: Users, title: "Staff Management", desc: "Manage waiters, assign roles, track performance." },
];

const ServicesSection = () => (
  <section id="services" className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
        <span className="text-sm font-semibold text-accent uppercase tracking-widest">Services</span>
        <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-4">Everything You Need to Run<span className="text-gradient-gold"> Smart Hospitality</span></h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">A complete suite of tools designed for hotels and restaurants to modernize operations and delight customers.</p>
      </motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((s, i) => (
          <motion.div key={s.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="group p-6 rounded-xl bg-card border border-border shadow-card-custom hover:shadow-gold hover:border-accent/30 transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-gold-gradient transition-all duration-300">
              <s.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors" />
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
