import { motion } from "framer-motion";
import { QrCode, LayoutDashboard, MapPin, Gift, BarChart3, FileText, Building2, Users } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ServicesSection = () => {
  const { t } = useI18n();

  const services = [
    { icon: QrCode, title: t.svc1Title, desc: t.svc1Desc },
    { icon: LayoutDashboard, title: t.svc2Title, desc: t.svc2Desc },
    { icon: MapPin, title: t.svc3Title, desc: t.svc3Desc },
    { icon: Gift, title: t.svc4Title, desc: t.svc4Desc },
    { icon: BarChart3, title: t.svc5Title, desc: t.svc5Desc },
    { icon: FileText, title: t.svc6Title, desc: t.svc6Desc },
    { icon: Building2, title: t.svc7Title, desc: t.svc7Desc },
    { icon: Users, title: t.svc8Title, desc: t.svc8Desc },
  ];

  return (
    <section id="services" className="py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">{t.servicesTag}</span>
          <h2 className="text-3xl md:text-5xl font-display font-extrabold mt-3 mb-5 tracking-tight">
            {t.servicesTitle1}<span className="text-gradient-gold">{t.servicesTitle2}</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">{t.servicesDesc}</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="group p-7 rounded-2xl bg-card border border-border shadow-card-custom hover:shadow-gold hover:border-accent/30 transition-all duration-500"
            >
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-gold-gradient group-hover:scale-110 transition-all duration-500">
                <s.icon className="w-6 h-6 text-accent group-hover:text-accent-foreground transition-colors duration-300" />
              </div>
              <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
