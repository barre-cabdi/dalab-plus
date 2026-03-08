import { Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    { label: "Home", href: "#home" },
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gold-gradient flex items-center justify-center">
            <span className="font-display font-bold text-accent-foreground text-sm">D+</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">DALABplus+</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">{l.label}</a>
          ))}
          <Link to="/login"><Button variant="hero" size="default">Login</Button></Link>
        </div>
        <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden glass border-t border-border px-4 pb-4 space-y-3">
          {links.map(l => (<a key={l.href} href={l.href} className="block text-sm font-medium text-muted-foreground hover:text-foreground py-2" onClick={() => setMobileOpen(false)}>{l.label}</a>))}
          <Link to="/login" onClick={() => setMobileOpen(false)}><Button variant="hero" size="default" className="w-full">Login</Button></Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
