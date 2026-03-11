import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Eye, Phone, Mail, MapPin, Clock, Star, Info, Sparkles, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Business, getDefaultServices, BusinessService } from "@/lib/store";
import { toast } from "sonner";

interface Props {
  business: Business;
}

const typeConfig: Record<string, { emoji: string; aboutText: string }> = {
  restaurant: { emoji: "🍽️", aboutText: "We serve delicious meals prepared with the freshest ingredients." },
  hotel: { emoji: "🏨", aboutText: "We offer luxury accommodation and world-class hospitality." },
  cafe: { emoji: "☕", aboutText: "We craft artisan coffee and delicious pastries in a warm atmosphere." },
};

const BusinessHomeTab = ({ business }: Props) => {
  const config = typeConfig[business.type] || typeConfig.restaurant;
  const services: BusinessService[] = business.services?.length ? business.services : getDefaultServices(business.type);
  const homeUrl = `${window.location.origin}/customer-home?business=${business.id}`;

  const contactInfo = [
    { icon: MapPin, label: "Address", value: `${business.address}, ${business.city}, ${business.country}` },
    { icon: Phone, label: "Phone", value: `${business.countryCode} ${business.phonePrefix} ${business.phone}` },
    { icon: Mail, label: "Email", value: business.email || "" },
    { icon: Clock, label: "Hours", value: "Maalin walba · 7:00 AM – 11:00 PM" },
  ].filter(c => c.value);

  return (
    <div className="space-y-6">
      {/* Actions Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold">Business Home Page</h2>
          <p className="text-sm text-muted-foreground">Preview how customers see your business</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { navigator.clipboard.writeText(homeUrl); toast.success("Link copied!"); }}>
            <Copy className="w-3.5 h-3.5" /> Copy Link
          </Button>
          <Button variant="hero" size="sm" className="gap-1.5" onClick={() => window.open(homeUrl, "_blank")}>
            <ExternalLink className="w-3.5 h-3.5" /> Open Live Page
          </Button>
        </div>
      </div>

      {/* Preview Card */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card-custom">
        <div className="bg-hero relative p-8 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[80px] pointer-events-none" />
          <div className="relative z-10">
            {business.logo ? (
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-accent/30 shadow-gold mx-auto">
                <img src={business.logo} alt={business.name} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-accent/15 border-2 border-accent/30 flex items-center justify-center mx-auto">
                <span className="text-3xl">{config.emoji}</span>
              </div>
            )}
            <h3 className="font-display font-bold text-xl text-primary-foreground mt-4">{business.name}</h3>
            <p className="text-primary-foreground/40 text-sm mt-1">{config.emoji} {business.type.charAt(0).toUpperCase() + business.type.slice(1)}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-accent" />
              <h4 className="font-display font-bold text-sm">About</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed bg-muted/30 rounded-xl p-4">
              {business.description || config.aboutText}
            </p>
          </div>

          {/* Services */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-accent" />
              <h4 className="font-display font-bold text-sm">Services ({services.length})</h4>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {services.map(service => (
                <div key={service.id} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                  <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <span className="text-lg">{service.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold truncate">{service.title}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-accent" />
              <h4 className="font-display font-bold text-sm">Contact Info</h4>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {contactInfo.map(info => (
                <div key={info.label} className="flex items-center gap-3 bg-muted/30 rounded-xl p-3">
                  <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                    <info.icon className="w-3.5 h-3.5 text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{info.label}</p>
                    <p className="text-xs font-medium">{info.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          {business.paymentMethods && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-accent" />
                <h4 className="font-display font-bold text-sm">Accepted Payments</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {business.paymentMethods.cashEnabled && <span className="text-xs px-3 py-1.5 rounded-full bg-accent/15 text-accent font-medium">💵 Cash</span>}
                {business.paymentMethods.cardEnabled && <span className="text-xs px-3 py-1.5 rounded-full bg-accent/15 text-accent font-medium">💳 Card</span>}
                {business.paymentMethods.mobileEnabled && <span className="text-xs px-3 py-1.5 rounded-full bg-accent/15 text-accent font-medium">📱 Mobile</span>}
                {business.paymentMethods.mobileEnabled && business.paymentMethods.mobileProviders.map(p => (
                  <span key={p.id} className="text-xs px-3 py-1.5 rounded-full bg-muted border border-border font-medium">{p.name}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessHomeTab;
