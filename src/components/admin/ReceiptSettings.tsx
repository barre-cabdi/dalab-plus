import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Lock, Receipt, Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Business } from "@/lib/store";

interface ReceiptSettingsProps {
  business: Business;
}

export interface ReceiptConfig {
  edahabNumber: string;
  mycashNumber: string;
  yeelNumber: string;
  tplusNumber: string;
  sahalNumber: string;
  contactPhone: string;
  contactAddress: string;
  vatRate: number;
  thankYouMessage: string;
  poweredBy: string;
  qrUssdPrefix: string;
}

const defaultConfig: ReceiptConfig = {
  edahabNumber: "",
  mycashNumber: "",
  yeelNumber: "",
  tplusNumber: "",
  sahalNumber: "",
  contactPhone: "",
  contactAddress: "",
  vatRate: 2,
  thankYouMessage: "Thank you for visiting us",
  poweredBy: "www.DALABplus.com",
  qrUssdPrefix: "*712",
};

export const getReceiptConfig = (businessId: string): ReceiptConfig => {
  try {
    const stored = localStorage.getItem(`dp_receipt_config_${businessId}`);
    if (stored) return { ...defaultConfig, ...JSON.parse(stored) };
  } catch {}
  return defaultConfig;
};

export const saveReceiptConfig = (businessId: string, config: ReceiptConfig) => {
  localStorage.setItem(`dp_receipt_config_${businessId}`, JSON.stringify(config));
};

const ReceiptSettings = ({ business }: ReceiptSettingsProps) => {
  const isSuperAdmin = localStorage.getItem("dp_user_role") === "superadmin";
  const [config, setConfig] = useState<ReceiptConfig>(() => getReceiptConfig(business.id));
  const [previewOpen, setPreviewOpen] = useState(false);

  const handleSave = () => {
    // SuperAdmin fields protection
    if (!isSuperAdmin) {
      const current = getReceiptConfig(business.id);
      config.poweredBy = current.poweredBy;
    }
    saveReceiptConfig(business.id, config);
    toast.success("Receipt settings la keydiyay ✓");
  };

  const LockBadge = () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex items-center gap-1 text-[10px] text-destructive/70 bg-destructive/10 px-2 py-0.5 rounded-full cursor-default ml-2">
          <Lock className="w-3 h-3" />
          <span className="hidden sm:inline">SuperAdmin</span>
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">
        Kaliya SuperAdmin ayaa beddeli kara
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-6 h-6" /> Receipt Settings
          </h2>
          <p className="text-sm text-muted-foreground">Hagaaji qaabka receipt-ka</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setPreviewOpen(true)}>
            <Eye className="w-4 h-4 mr-1.5" /> Preview
          </Button>
          <Button variant="hero" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1.5" /> Keydi
          </Button>
        </div>
      </div>

      {/* Merchant Payment Accounts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-xl p-6 shadow-card-custom"
      >
        <h3 className="font-display font-bold text-base mb-5 text-foreground">📱 Merchant Numbers (Payment Accounts)</h3>
        <p className="text-xs text-muted-foreground mb-4">Numberada lacag bixinta - waxay ku muuqan doonaan receipt-ka oo macmiilku ku bixin karaa</p>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">E-Dahab Number</label>
            <Input
              value={config.edahabNumber}
              onChange={e => setConfig({ ...config, edahabNumber: e.target.value })}
              placeholder="e.g. 748052"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">MyCash Number</label>
            <Input
              value={config.mycashNumber}
              onChange={e => setConfig({ ...config, mycashNumber: e.target.value })}
              placeholder="e.g. 937861"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Yeel Number</label>
            <Input
              value={config.yeelNumber}
              onChange={e => setConfig({ ...config, yeelNumber: e.target.value })}
              placeholder="e.g. 01-92-57-65-4"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">T-PLUS Number</label>
            <Input
              value={config.tplusNumber}
              onChange={e => setConfig({ ...config, tplusNumber: e.target.value })}
              placeholder="e.g. 124856"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">SAHAL Number</label>
            <Input
              value={config.sahalNumber}
              onChange={e => setConfig({ ...config, sahalNumber: e.target.value })}
              placeholder="e.g. 525782"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">QR USSD Prefix</label>
            <Input
              value={config.qrUssdPrefix}
              onChange={e => setConfig({ ...config, qrUssdPrefix: e.target.value })}
              placeholder="e.g. *884 or *712"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Format: {config.qrUssdPrefix || "*712"}*{config.sahalNumber || "MERCHANT"}*amount*decimal#
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contact Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-xl p-6 shadow-card-custom"
      >
        <h3 className="font-display font-bold text-base mb-5 text-foreground">📍 Contact Information</h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Phone Number</label>
            <Input
              value={config.contactPhone}
              onChange={e => setConfig({ ...config, contactPhone: e.target.value })}
              placeholder="e.g. 90-544412"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Address</label>
            <Input
              value={config.contactAddress}
              onChange={e => setConfig({ ...config, contactAddress: e.target.value })}
              placeholder="e.g. Garoowe - Main Road"
            />
          </div>
        </div>
      </motion.div>

      {/* VAT & Messages */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card border border-border rounded-xl p-6 shadow-card-custom"
      >
        <h3 className="font-display font-bold text-base mb-5 text-foreground">💵 VAT & Footer Messages</h3>
        
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">VAT Rate (%)</label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.5"
              value={config.vatRate}
              onChange={e => setConfig({ ...config, vatRate: Number(e.target.value) })}
              placeholder="2"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Thank You Message</label>
            <Input
              value={config.thankYouMessage}
              onChange={e => setConfig({ ...config, thankYouMessage: e.target.value })}
              placeholder="Thank you for visiting us"
            />
          </div>
        </div>
      </motion.div>

      {/* SuperAdmin Only - Powered By */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`bg-card border border-border rounded-xl p-6 shadow-card-custom ${!isSuperAdmin ? "opacity-60" : ""}`}
      >
        <div className="flex items-center gap-2 mb-5">
          <h3 className="font-display font-bold text-base text-foreground">🔒 Branding (Footer)</h3>
          {!isSuperAdmin && <LockBadge />}
        </div>
        
        <div className={!isSuperAdmin ? "pointer-events-none" : ""}>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Powered By URL</label>
            <Input
              value={config.poweredBy}
              onChange={e => setConfig({ ...config, poweredBy: e.target.value })}
              placeholder="www.DALABplus.com"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Kan wuxuu ku muuqdaa receipt kasta oo la soo saaro - kaliya SuperAdmin ayaa beddeli kara
            </p>
          </div>
        </div>
      </motion.div>

      {/* Preview Modal */}
      {previewOpen && (
        <div className="fixed inset-0 bg-background/80 z-50 flex items-center justify-center p-4" onClick={() => setPreviewOpen(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white text-black p-6 rounded-lg shadow-xl max-w-xs w-full font-mono text-xs"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-center border-b border-dashed border-gray-300 pb-3 mb-3">
              <p className="font-bold text-base">{business.name}</p>
              {(config.edahabNumber || config.mycashNumber || config.sahalNumber) && (
                <p className="text-[10px] mt-1">
                  {config.edahabNumber && `E-Dahab: ${config.edahabNumber}`}
                  {config.mycashNumber && ` MyCash: ${config.mycashNumber}`}
                </p>
              )}
              {(config.yeelNumber || config.tplusNumber) && (
                <p className="text-[10px]">
                  {config.yeelNumber && `Yeel: ${config.yeelNumber}`}
                  {config.tplusNumber && ` T-PLUS: ${config.tplusNumber}`}
                </p>
              )}
            </div>
            <div className="space-y-1 mb-3">
              <p>Phone Number: {config.contactPhone || business.phone || "—"}</p>
              <p>Address: {config.contactAddress || business.address || "—"}</p>
            </div>
            <div className="border-t border-dashed border-gray-300 pt-2 mb-2">
              <p>Receipt Number: <span className="font-bold">37699</span></p>
              <p>Served By: Waiter • SAHAL: {config.sahalNumber || "525782"}</p>
              <p>Customer: Walking Customer</p>
              <p>Table: 3</p>
              <p>Date: {new Date().toLocaleString()}</p>
            </div>
            <table className="w-full border-t border-dashed border-gray-300 pt-2">
              <thead>
                <tr className="text-left">
                  <th>Item</th>
                  <th className="text-center">No.</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Shaah Cadays</td>
                  <td className="text-center">2</td>
                  <td className="text-right">1.50</td>
                  <td className="text-right">3.00</td>
                </tr>
                <tr>
                  <td>Bariis Hilib</td>
                  <td className="text-center">1</td>
                  <td className="text-right">8.50</td>
                  <td className="text-right">8.50</td>
                </tr>
              </tbody>
            </table>
            <div className="border-t border-dashed border-gray-300 mt-2 pt-2 space-y-1">
              <div className="flex justify-between">
                <span>VAT @ {config.vatRate}%</span>
                <span>0.23</span>
              </div>
              <div className="flex justify-between">
                <span>Paid Amount</span>
                <span>0</span>
              </div>
              <div className="flex justify-between font-bold text-sm">
                <span>Total:</span>
                <span>11.73</span>
              </div>
            </div>
            <div className="text-center mt-4 pt-3 border-t border-dashed border-gray-300">
              <div className="w-24 h-24 mx-auto bg-gray-200 flex items-center justify-center mb-2">
                [QR Code]
              </div>
              <p className="font-bold">{config.thankYouMessage}</p>
              <p className="text-[10px] text-gray-500 mt-1">Powered by {config.poweredBy}</p>
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>Close Preview</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ReceiptSettings;
