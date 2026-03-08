import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { getBusinessByAdmin } from "@/lib/store";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      if (username === "superadmin" && password === "super123") {
        toast.success("Ku soo dhawoow, Super Admin!");
        navigate("/super-admin");
        setLoading(false);
        return;
      }

      const biz = getBusinessByAdmin(username);
      if (biz) {
        if (biz.adminPassword !== password) {
          toast.error("Password-ka waa khalad!");
          setLoading(false);
          return;
        }
        if (biz.status === "inactive") {
          toast.error("Meheraddan waa la xidhay. La xiriir Super Admin.");
          setLoading(false);
          return;
        }
        localStorage.setItem("dp_active_business", JSON.stringify(biz));
        toast.success(`Ku soo dhawoow, ${biz.name}!`);
        navigate("/admin");
        setLoading(false);
        return;
      }

      toast.success("Ku soo dhawoow!");
      navigate("/customer");
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-hero flex items-center justify-center px-4">
      <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-accent/10 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-accent/5 blur-3xl" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-accent transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Ku noqo Home
        </Link>

        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gold-gradient flex items-center justify-center">
              <span className="font-display font-bold text-accent-foreground text-lg">D+</span>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-primary-foreground">DALABplus+</h1>
              <p className="text-xs text-primary-foreground/50">Sign in to your account</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-primary-foreground/70 text-sm">Username</Label>
              <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Gali username-kaaga" required className="h-12 bg-primary/30 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent" />
            </div>

            <div className="space-y-2">
              <Label className="text-primary-foreground/70 text-sm">Password</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Gali password-kaaga" required className="h-12 bg-primary/30 border-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/30 focus:border-accent pr-12" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary-foreground/40 hover:text-accent">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button variant="hero" size="lg" type="submit" className="w-full" disabled={loading}>
              {loading ? "Galitaanka..." : "Gal"}
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-primary/20 border border-primary-foreground/10">
            <p className="text-[10px] text-primary-foreground/50 font-semibold mb-1.5">Demo Credentials:</p>
            <p className="text-[10px] text-primary-foreground/40"><strong>Super Admin:</strong> superadmin / super123</p>
            <p className="text-[10px] text-primary-foreground/40"><strong>Business Admin:</strong> Super Admin-ka ka samee meherad cusub</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
