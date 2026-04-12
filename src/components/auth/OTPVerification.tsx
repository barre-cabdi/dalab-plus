import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface OTPVerificationProps {
  phone: string;
  businessId: string;
  businessName: string;
  lang: "en" | "so";
  onVerified: () => void;
  onBack: () => void;
}

const OTPVerification = ({ phone, businessId, businessName, lang, onVerified, onBack }: OTPVerificationProps) => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const maskedPhone = phone.length > 4
    ? phone.slice(0, phone.length - 4).replace(/./g, "*") + phone.slice(-4)
    : phone;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIdx = Math.min(pasted.length, 3);
    inputRefs.current[focusIdx]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 4) {
      toast.error(lang === "so" ? "Fadlan gali 4 lambar" : "Please enter 4 digits");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("verify-otp", {
        body: { phone, code, businessId },
      });
      if (error) throw error;
      if (data?.valid) {
        toast.success(lang === "so" ? "Xaqiijinta waa la guuleystay!" : "Verification successful!");
        onVerified();
      } else {
        toast.error(lang === "so" ? "Code-ku waa khalad ama wuu dhacay" : "Invalid or expired code");
        setOtp(["", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      console.error("OTP verify error:", err);
      toast.error(lang === "so" ? "Khalad ayaa dhacay" : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const { error } = await supabase.functions.invoke("send-otp", {
        body: { phone, businessId },
      });
      if (error) throw error;
      toast.success(lang === "so" ? "Code cusub ayaa la diray!" : "New code sent!");
      setCountdown(60);
      setOtp(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Resend error:", err);
      toast.error(lang === "so" ? "Dib u diridu way guul darreysatay" : "Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {lang === "so" ? "Dib u noqo" : "Back to login"}
      </button>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
          <Shield className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {lang === "so" ? "Xaqiijinta OTP" : "OTP Verification"}
          </h2>
          <p className="text-sm text-muted-foreground">{businessName}</p>
        </div>
      </div>

      <p className="text-base text-muted-foreground mb-8">
        {lang === "so"
          ? `4 lambar sireed ah ayaa loo diray ${maskedPhone}`
          : `A 4-digit code has been sent to ${maskedPhone}`}
      </p>

      <div className="flex gap-3 justify-center mb-8" onPaste={handlePaste}>
        {otp.map((digit, i) => (
          <Input
            key={i}
            ref={(el) => { inputRefs.current[i] = el; }}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            maxLength={1}
            inputMode="numeric"
            className="w-14 h-14 text-center text-2xl font-bold border-2 border-border focus:border-accent"
          />
        ))}
      </div>

      <Button
        onClick={handleVerify}
        disabled={loading || otp.join("").length !== 4}
        className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-base mb-4"
      >
        {loading
          ? (lang === "so" ? "Xaqiijinaya..." : "Verifying...")
          : (lang === "so" ? "Xaqiiji" : "Verify")}
      </Button>

      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-muted-foreground">
            {lang === "so" ? `Dib u dir kadib ${countdown}s` : `Resend in ${countdown}s`}
          </p>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="flex items-center gap-1.5 text-sm text-accent hover:underline mx-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? "animate-spin" : ""}`} />
            {lang === "so" ? "Dib u dir code-ka" : "Resend code"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default OTPVerification;
