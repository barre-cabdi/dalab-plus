import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import dalabLogo from "@/assets/dalabplus-logo.png";
import { ArrowRight, Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin, Send, Heart, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const Footer = () => {
  const { t } = useI18n();
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    toast.success("Thank you for subscribing! 🎉");
    setEmail("");
  };

  const footerLinks = {
    explore: [
      { label: t.services, href: "#services" },
      { label: t.about, href: "#about" },
      { label: "Dashboard", href: "/login" },
      { label: "Menu System", href: "#services" },
    ],
    support: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Cookie Policy", href: "#" },
      { label: "Support", href: "#contact" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="relative overflow-hidden">
      {/* Newsletter CTA Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="bg-gradient-to-br from-accent/10 via-accent/5 to-transparent py-16 border-t border-border/30"
      >
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-5">
                <Mail className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-bold text-accent uppercase tracking-widest">Newsletter</span>
              </span>
            </motion.div>
            <motion.h3 variants={fadeUp} custom={1} className="font-display font-extrabold text-3xl md:text-4xl text-foreground mb-3">
              Stay Updated
            </motion.h3>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground mb-8 max-w-md mx-auto">
              Get the latest updates, features, and tips for growing your business with DALABplus+.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex gap-2 max-w-md mx-auto">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                type="email"
                className="rounded-full bg-background h-12 text-sm px-5 border-border/50 focus:border-accent"
                onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
              />
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSubscribe}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground rounded-full h-12 px-6 font-semibold gap-2 shadow-lg shadow-accent/20 hover:shadow-xl hover:shadow-accent/30 transition-all duration-300"
                >
                  Subscribe
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Main Footer */}
      <div className="bg-[hsl(220,25%,8%)] text-white/80">
        <div className="container mx-auto px-4 pt-16 pb-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14"
          >
            {/* Brand */}
            <motion.div variants={fadeUp} custom={0} className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-5">
                <motion.img
                  src={dalabLogo}
                  alt="DALABplus+"
                  className="w-10 h-10 rounded-xl shadow-lg shadow-accent/10"
                  whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                />
                <span className="font-display font-extrabold text-white text-xl tracking-tight">
                  DALAB<span className="text-accent">plus+</span>
                </span>
              </div>
              <p className="text-sm text-white/50 leading-relaxed mb-5">
                Redefining the standard of luxury hospitality through digital innovation and culinary excellence.
              </p>
              <div className="flex items-center gap-2">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    whileHover={{ scale: 1.15, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-accent/15 hover:border-accent/30 hover:text-accent transition-all duration-300"
                  >
                    <social.icon className="w-4 h-4" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Explore */}
            <motion.div variants={fadeUp} custom={1}>
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-widest mb-5">Explore</h4>
              <div className="space-y-3">
                {footerLinks.explore.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-white/50 hover:text-accent transition-colors duration-300 group"
                    whileHover={{ x: 4 }}
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Support */}
            <motion.div variants={fadeUp} custom={2}>
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-widest mb-5">Legal</h4>
              <div className="space-y-3">
                {footerLinks.support.map((link) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-1.5 text-sm text-white/50 hover:text-accent transition-colors duration-300 group"
                    whileHover={{ x: 4 }}
                  >
                    <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Contact */}
            <motion.div variants={fadeUp} custom={3}>
              <h4 className="font-display font-bold text-white text-sm uppercase tracking-widest mb-5">Get in Touch</h4>
              <div className="space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-sm text-white/50">Mogadishu, Somalia</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-sm text-white/50">+252 61 XXX XXXX</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <p className="text-sm text-white/50">hello@dalabplus.com</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bottom Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <p className="text-xs text-white/30 flex items-center gap-1">
              © 2026 DALABplus+ · Made with <Heart className="w-3 h-3 text-accent fill-accent" /> {t.allRights}
            </p>
            <div className="flex items-center gap-4">
              <motion.div
                className="flex items-center gap-2"
                whileHover={{ scale: 1.03 }}
              >
                <Globe className="w-3.5 h-3.5 text-white/30" />
                <span className="text-xs text-white/30">SO · EN</span>
              </motion.div>
              <Link to="/login" className="text-xs text-white/30 hover:text-accent transition-colors duration-300">
                {t.login}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
