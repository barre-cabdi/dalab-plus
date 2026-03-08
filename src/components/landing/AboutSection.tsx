import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const AboutSection = () => {
  const { t } = useI18n();

  const features = [t.feat1, t.feat2, t.feat3, t.feat4, t.feat5, t.feat6];

  return (
    <section id="about" className="py-28 bg-hero">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="text-sm font-semibold text-accent uppercase tracking-widest">{t.aboutTag}</span>
            <h2 className="text-3xl md:text-5xl font-display font-extrabold mt-3 mb-6 text-primary-foreground tracking-tight">
              {t.aboutTitle1}<span className="text-gradient-gold">{t.aboutTitle2}</span>
            </h2>
            <p className="text-primary-foreground/70 leading-relaxed mb-5 text-lg">{t.aboutDesc1}</p>
            <p className="text-primary-foreground/70 leading-relaxed mb-8">{t.aboutDesc2}</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {features.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                  <span className="text-sm text-primary-foreground/80">{f}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="grid grid-cols-2 gap-5">
              {[
                { value: "99.9%", label: t.uptime, emoji: "🟢" },
                { value: "12+", label: t.countries, emoji: "🌍" },
                { value: "500+", label: t.businesses, emoji: "🏢" },
                { value: "2M+", label: t.ordersProcessed, emoji: "📦" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, type: "spring", stiffness: 200 }}
                  whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                  className="glass rounded-2xl p-7 text-center hover:shadow-gold transition-shadow duration-500"
                >
                  <p className="text-3xl mb-2">{s.emoji}</p>
                  <p className="text-3xl font-display font-extrabold text-accent">{s.value}</p>
                  <p className="text-sm text-primary-foreground/60 mt-1">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
