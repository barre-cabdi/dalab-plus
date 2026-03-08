import { Link } from "react-router-dom";
import { useI18n } from "@/lib/i18n";

const Footer = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-hero py-12 border-t border-border/20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center">
              <span className="font-display font-bold text-accent-foreground text-xs">D+</span>
            </div>
            <span className="font-display font-bold text-primary-foreground">DALABplus+</span>
          </div>
          <div className="flex gap-6 text-sm text-primary-foreground/50">
            <a href="#home" className="hover:text-accent transition-colors">{t.home}</a>
            <a href="#services" className="hover:text-accent transition-colors">{t.services}</a>
            <a href="#about" className="hover:text-accent transition-colors">{t.about}</a>
            <a href="#contact" className="hover:text-accent transition-colors">{t.contact}</a>
            <Link to="/login" className="hover:text-accent transition-colors">{t.login}</Link>
          </div>
          <p className="text-xs text-primary-foreground/40">{t.allRights}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
