import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-hero py-12 border-t border-border/20">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gold-gradient flex items-center justify-center"><span className="font-display font-bold text-accent-foreground text-xs">D+</span></div>
          <span className="font-display font-bold text-primary-foreground">DALABplus+</span>
        </div>
        <div className="flex gap-6 text-sm text-primary-foreground/50">
          <a href="#home" className="hover:text-accent transition-colors">Home</a>
          <a href="#services" className="hover:text-accent transition-colors">Services</a>
          <a href="#about" className="hover:text-accent transition-colors">About</a>
          <a href="#contact" className="hover:text-accent transition-colors">Contact</a>
          <Link to="/login" className="hover:text-accent transition-colors">Login</Link>
        </div>
        <p className="text-xs text-primary-foreground/40">© 2026 DALABplus+. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
