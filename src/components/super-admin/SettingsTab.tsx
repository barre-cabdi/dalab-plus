import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Bell, Shield, Globe, Save, Database, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const SettingsTab = () => {
  const [settings, setSettings] = useState({
    platformName: "DALABplus+",
    supportEmail: "support@dalabplus.com",
    maxBusinesses: "100",
    autoApproval: true,
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    analyticsEnabled: true,
  });

  const handleSave = () => {
    localStorage.setItem("dp_settings", JSON.stringify(settings));
    toast.success("Settings saved successfully! ✅");
  };

  const handleReset = () => {
    if (!confirm("Reset all data? This cannot be undone.")) return;
    localStorage.clear();
    toast.success("All data cleared! Refreshing...");
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* General */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
        <div className="flex items-center gap-2 mb-5">
          <Globe className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-foreground">General Settings</h3>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Platform Name</Label>
              <Input value={settings.platformName} onChange={e => setSettings({ ...settings, platformName: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Support Email</Label>
              <Input value={settings.supportEmail} onChange={e => setSettings({ ...settings, supportEmail: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Max Businesses Allowed</Label>
            <Input type="number" value={settings.maxBusinesses} onChange={e => setSettings({ ...settings, maxBusinesses: e.target.value })} className="w-32" />
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-foreground">Auto-approve new businesses</p>
              <p className="text-xs text-muted-foreground">Automatically activate new businesses upon creation</p>
            </div>
            <Switch checked={settings.autoApproval} onCheckedChange={v => setSettings({ ...settings, autoApproval: v })} />
          </div>
        </div>
      </motion.div>

      {/* Notifications */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
        <div className="flex items-center gap-2 mb-5">
          <Bell className="w-5 h-5 text-accent" />
          <h3 className="font-display font-bold text-foreground">Notifications</h3>
        </div>
        <div className="space-y-4">
          {[
            { key: "emailNotifications" as const, label: "Email Notifications", desc: "Receive email alerts for new signups and issues" },
            { key: "smsNotifications" as const, label: "SMS Notifications", desc: "Receive SMS for critical alerts" },
            { key: "analyticsEnabled" as const, label: "Analytics Tracking", desc: "Track platform usage and performance" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <Switch checked={settings[item.key]} onCheckedChange={v => setSettings({ ...settings, [item.key]: v })} />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-destructive/30 rounded-xl p-6 shadow-card-custom">
        <div className="flex items-center gap-2 mb-5">
          <Shield className="w-5 h-5 text-destructive" />
          <h3 className="font-display font-bold text-destructive">Danger Zone</h3>
        </div>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-foreground">Maintenance Mode</p>
            <p className="text-xs text-muted-foreground">Disable all business dashboards temporarily</p>
          </div>
          <Switch checked={settings.maintenanceMode} onCheckedChange={v => setSettings({ ...settings, maintenanceMode: v })} />
        </div>
        <div className="flex items-center justify-between py-2 mt-2">
          <div>
            <p className="text-sm font-medium text-foreground">Reset All Data</p>
            <p className="text-xs text-muted-foreground">Clear all businesses, orders, and settings</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleReset}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Reset
          </Button>
        </div>
      </motion.div>

      <Button variant="hero" onClick={handleSave} className="w-full">
        <Save className="w-4 h-4 mr-2" /> Save Settings
      </Button>
    </div>
  );
};

export default SettingsTab;
