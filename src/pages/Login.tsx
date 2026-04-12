import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Globe, User, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { getBusinessByAdmin, getStaffByUsername, getBusinesses } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/integrations/supabase/client";
import OTPVerification from "@/components/auth/OTPVerification";
import dalabLogo from "@/assets/dalabplus-logo.png";
import slideWelcome from "@/assets/slide-welcome.png";
import slideQR from "@/assets/slide-qr-ordering.png";
import slideLoyalty from "@/assets/slide-loyalty.png";
import slideAnalytics from "@/assets/slide-analytics.png";

const slides = [
  {
    image: slideWelcome,
    en: { title: "Welcome!", desc: "Smart digital menu & ordering system for hotels and restaurants." },
    so: { title: "Ku soo dhawoow!", desc: "Menu digital casri ah & nidaamka dalashada ee hoteellada iyo makhaayadaha." },
  },
  {
    image: slideQR,
    en: { title: "QR Ordering", desc: "Customers scan, browse, and order — no app download needed." },
    so: { title: "QR Dalbasho", desc: "Macaamiishu waa scan-gareyaan, daawadaan, oo dalban karaan — app la'aan." },
  },
  {
    image: slideLoyalty,
    en: { title: "Loyalty Rewards", desc: "Bronze to Platinum tiers with automatic reward unlocks for customers." },
    so: { title: "Abaalmarin Daacadnimo", desc: "Bronze ilaa Platinum oo leh abaalmarin toos ah macaamiisha." },
  },
  {
    image: slideAnalytics,
    en: { title: "Real-time Analytics", desc: "Track orders, revenue, and customer insights with powerful dashboards." },
    so: { title: "Falanqayn Toos ah", desc: "Raadraac dalabka, dakhliga, iyo macluumaadka macaamiisha." },
  },
];

interface PendingAdmin {
  type: "business";
  biz: any;
}

const Login = () => {
  const navigate = useNavigate();
  const { t, lang, setLang } = useI18n();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [otpStep, setOtpStep] = useState(false);
  const [pendingAdmin, setPendingAdmin] = useState<PendingAdmin | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const sendOTP = async (phone: string, businessId: string) => {
    const { error } = await supabase.functions.invoke("send-otp", {
      body: { phone, businessId },
    });
    if (error) throw error;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (username === "superadmin" && password === "super123") {
        toast.success(`${t.welcome}, Super Admin!`);
        navigate("/super-admin");
        setLoading(false);
        return;
      }

      const biz = await getBusinessByAdmin(username);
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

        // Check if business has a phone number for OTP
        let fullPhone = ((biz.phonePrefix || "") + (biz.phone || "")).replace(/\s+/g, "");
        if (fullPhone && !fullPhone.startsWith("+")) fullPhone = "+" + fullPhone;
        if (fullPhone) {
          try {
            await sendOTP(fullPhone, biz.id);
            setPendingAdmin({ type: "business", biz });
            setOtpStep(true);
            toast.success(
              lang === "so"
                ? "Code xaqiijin ah ayaa loo diray telefoonkaaga"
                : "Verification code sent to your phone"
            );
          } catch (err) {
            console.error("OTP send error:", err);
            toast.error(
              lang === "so"
                ? "SMS-ka diridu way guul darreysatay"
                : "Failed to send verification SMS"
            );
          }
        } else {
          // No phone number, skip OTP
          localStorage.setItem("dp_active_business", JSON.stringify(biz));
          toast.success(`${t.welcome}, ${biz.name}!`);
          navigate("/business-home");
        }
        setLoading(false);
        return;
      }

      const waiter = await getStaffByUsername(username);
      if (waiter) {
        if (waiter.password !== password) {
          toast.error(t.wrongPassword);
          setLoading(false);
          return;
        }
        const businesses = await getBusinesses();
        const waiterBiz = businesses.find(b => b.id === waiter.businessId);
        if (waiterBiz) {
          if (waiter.jobTitle.toLowerCase() === "hotel manager") {
            localStorage.setItem("dp_active_hotel_manager", JSON.stringify(waiter));
            localStorage.setItem("dp_active_business", JSON.stringify(waiterBiz));
            toast.success(`${t.welcome}, ${waiter.name}! (Hotel Manager)`);
            navigate("/hotel-manager");
            setLoading(false);
            return;
          }
          if (waiter.jobTitle.toLowerCase() === "cashier") {
            localStorage.setItem("dp_active_cashier", JSON.stringify(waiter));
            localStorage.setItem("dp_active_business", JSON.stringify(waiterBiz));
            toast.success(`${t.welcome}, ${waiter.name}! (Cashier)`);
            navigate("/cashier");
            setLoading(false);
            return;
          }
          localStorage.setItem("dp_active_waiter", JSON.stringify(waiter));
          localStorage.setItem("dp_active_business", JSON.stringify(waiterBiz));
          toast.success(`${t.welcome}, ${waiter.name}!`);
          navigate("/waiter");
          setLoading(false);
          return;
        }
      }

      toast.error(t.wrongPassword || "Invalid username or password");
      setLoading(false);
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Login failed");
      setLoading(false);
    }
  };

  const handleOTPVerified = () => {
    if (pendingAdmin?.type === "business") {
      const biz = pendingAdmin.biz;
      localStorage.setItem("dp_active_business", JSON.stringify(biz));
      toast.success(`${t.welcome}, ${biz.name}!`);
      navigate("/business-home");
    }
  };

  const handleOTPBack = () => {
    setOtpStep(false);
    setPendingAdmin(null);
  };

  const slide = slides[currentSlide];
  const slideContent = lang === "so" ? slide.so : slide.en;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Language toggle */}
      <div className="absolute top-4 right-4 z-20">
        <button
          onClick={() => setLang(lang === "en" ? "so" : "en")}
          className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-accent transition-colors px-3 py-2 rounded-full border border-border bg-card shadow-sm"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === "en" ? "SO" : "EN"}
        </button>
      </div>

      {/* Left Panel - Blue branded side */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-gradient-to-br from-[hsl(var(--accent))] via-[hsl(220,80%,50%)] to-[hsl(220,90%,35%)] flex-col justify-between p-10 overflow-hidden">
        <div className="absolute top-10 right-10 w-3 h-3 rounded-full bg-white/20" />
        <div className="absolute top-20 right-32 w-2 h-2 rounded-full bg-white/15" />
        <div className="absolute top-40 left-20 w-4 h-4 rounded-full bg-white/10" />
        <div className="absolute bottom-40 right-20 w-2 h-2 rounded-full bg-white/15" />
        <div className="absolute top-16 left-1/2 w-1.5 h-1.5 rounded-full bg-white/20" />

        <div className="flex items-center gap-3 relative z-10">
          <img src={dalabLogo} alt="DALABplus+" className="w-10 h-10 rounded-lg" />
          <span className="font-display font-bold text-xl text-white">DALABplus+</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <img
                src={slide.image}
                alt={slideContent.title}
                className="w-[28rem] h-[22rem] object-contain mb-6 mx-auto drop-shadow-2xl"
              />
              <h2 className="text-3xl font-display font-extrabold text-white mb-3" style={{ fontSize: '28px' }}>
                {slideContent.title}
              </h2>
              <p className="text-white/70 max-w-sm mx-auto leading-relaxed" style={{ fontSize: '20px' }}>
                {slideContent.desc}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`rounded-full transition-all duration-300 ${
                i === currentSlide
                  ? "w-8 h-3 bg-white"
                  : "w-3 h-3 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        {otpStep && pendingAdmin ? (
          <OTPVerification
            phone={(pendingAdmin.biz.phonePrefix || "") + (pendingAdmin.biz.phone || "")}
            businessId={pendingAdmin.biz.id}
            businessName={pendingAdmin.biz.name}
            lang={lang}
            onVerified={handleOTPVerified}
            onBack={handleOTPBack}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-md"
          >
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <img src={dalabLogo} alt="DALABplus+" className="w-10 h-10 rounded-lg" />
              <span className="font-display font-bold text-xl">DALABplus+</span>
            </div>

            <h1 className="text-4xl font-display font-bold text-foreground mb-2">
              {lang === "so" ? "Gal" : "Log In"}
            </h1>
            <p className="text-base text-muted-foreground mb-1">
              {lang === "so" ? "Ma lihid akoon?" : "Don't have an account?"}{" "}
              <Link to="/#contact" className="text-accent font-semibold hover:underline">
                {lang === "so" ? "La xiriir SuperAdmin (Maamulayaasha)" : "Contact SuperAdmin (Managers)"}
              </Link>
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              {lang === "so" ? "Wax yar ayay qaadataa." : "It will take less than a minute."}
            </p>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t.username}
                  required
                  className="h-12 pl-4 pr-10 border-border bg-background"
                />
                <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground/50" />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.password}
                  required
                  className="h-12 pl-4 pr-10 border-border bg-background"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-accent transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Lock className="w-4.5 h-4.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="default"
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="px-8 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
                >
                  {loading ? t.signingIn : t.signInBtn}
                </Button>
              </div>
            </form>

            <div className="mt-8 p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-xs text-muted-foreground font-semibold mb-1.5">{t.demoCredentials}</p>
              <p className="text-xs text-muted-foreground"><strong>{t.superAdmin}:</strong> superadmin / super123</p>
              <p className="text-xs text-muted-foreground"><strong>{t.businessAdmin}:</strong> {t.businessAdmin}</p>
            </div>

            <Link to="/" className="inline-block mt-4 text-xs text-muted-foreground hover:text-accent transition-colors">
              ← {t.backHome}
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Login;
