import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft, Globe } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getBusinessByAdmin, getStaffByUsername, getBusinesses } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import dalabLogo from "@/assets/dalabplus-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (username === "superadmin" && password === "super123") {
        toast.success(`${t.welcome}, Super Admin!`);
        navigate("/super-admin");
        setLoading(false);
        return;
      }

      const biz = getBusinessByAdmin(username);
      if (biz) {
        if (biz.adminPassword !== password) {
          toast.error(t.wrongPassword);
          setLoading(false);
          return;
        }
        if (biz.status === "inactive") {
          toast.error(t.businessInactive);
          setLoading(false);
          return;
        }
        localStorage.setItem("dp_active_business", JSON.stringify(biz));
        toast.success(`${t.welcome}, ${biz.name}!`);
        navigate("/admin");
        setLoading(false);
        return;
      }

      // Check waiter / hotel manager login
      const waiter = getStaffByUsername(username);
      if (waiter) {
        if (waiter.password !== password) {
          toast.error(t.wrongPassword);
          setLoading(false);
          return;
        }
        const businesses = getBusinesses();
        const waiterBiz = businesses.find(b => b.id === waiter.businessId);
        if (waiterBiz) {
          // Hotel Manager → hotel manager dashboard
          if (waiter.jobTitle.toLowerCase() === "hotel manager") {
            localStorage.setItem("dp_active_hotel_manager", JSON.stringify(waiter));
            localStorage.setItem("dp_active_business", JSON.stringify(waiterBiz));
            toast.success(`${t.welcome}, ${waiter.name}! (Hotel Manager)`);
            navigate("/hotel-manager");
            setLoading(false);
            return;
          }
          // Cashier → cashier dashboard
          if (waiter.jobTitle.toLowerCase() === "cashier") {
            localStorage.setItem("dp_active_cashier", JSON.stringify(waiter));
            localStorage.setItem("dp_active_business", JSON.stringify(waiterBiz));
            toast.success(`${t.welcome}, ${waiter.name}! (Cashier)`);
            navigate("/cashier");
            setLoading(false);
            return;
          }
          // Regular waiter
          localStorage.setItem("dp_active_waiter", JSON.stringify(waiter));
          localStorage.setItem("dp_active_business", JSON.stringify(waiterBiz));
          toast.success(`${t.welcome}, ${waiter.name}!`);
          navigate("/waiter");
          setLoading(false);
          return;
        }
      }

      toast.success(`${t.welcome}!`);
      navigate("/customer");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4 relative">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-20 right-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl"
      />

      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => setLang(lang === "en" ? "so" : "en")}
          className="flex items-center gap-1 text-xs font-semibold text-primary-foreground/60 hover:text-accent transition-colors px-3 py-2 rounded-full glass"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === "en" ? "SO" : "EN"}
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-accent transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> {t.backHome}
        </Link>

        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center">
              <span className="font-display font-bold text-accent-foreground text-lg">D+</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-primary-foreground">DALABplus+</h1>
              <p className="text-xs text-primary-foreground/50">{t.signIn}</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-primary-foreground/70 text-sm">{t.username}</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t.enterUsername} required className="h-12 bg-primary/30 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent" />
            </div>

            <div className="space-y-2">
              <Label className="text-primary-foreground/70 text-sm">{t.password}</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t.enterPassword} required className="h-12 bg-primary/30 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-accent transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button variant="hero" size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? t.signingIn : t.signInBtn}
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-primary/20 border border-primary-foreground/10">
            <p className="text-[10px] text-primary-foreground/50 font-semibold mb-1.5">{t.demoCredentials}</p>
            <p className="text-[10px] text-primary-foreground/40"><strong>{t.superAdmin}:</strong> superadmin / super123</p>
            <p className="text-[10px] text-primary-foreground/40"><strong>{t.businessAdmin}:</strong> {t.businessAdmin}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
