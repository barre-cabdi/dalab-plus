import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ContactSection = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); toast.success("Message sent! We'll get back to you soon."); setForm({ name: "", email: "", message: "" }); };

  return (
    <section id="contact" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <span className="text-sm font-semibold text-accent uppercase tracking-widest">Contact</span>
          <h2 className="text-3xl md:text-4xl font-display font-bold mt-3 mb-4">Get in <span className="text-gradient-gold">Touch</span></h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Ready to transform your restaurant? Reach out and let's get started.</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-8">
            {[{ icon: Phone, label: "Phone", value: "+252 61 XXX XXXX" }, { icon: Mail, label: "Email", value: "info@dalabplus.com" }, { icon: MapPin, label: "Location", value: "Mogadishu, Somalia" }].map(c => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0"><c.icon className="w-5 h-5 text-accent" /></div>
                <div><p className="font-semibold text-sm">{c.label}</p><p className="text-muted-foreground text-sm">{c.value}</p></div>
              </div>
            ))}
          </motion.div>
          <motion.form onSubmit={handleSubmit} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-4">
            <Input placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="h-12" />
            <Input type="email" placeholder="Your Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="h-12" />
            <Textarea placeholder="Your Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required rows={5} />
            <Button variant="hero" size="lg" type="submit" className="w-full"><Send className="mr-2 w-4 h-4" /> Send Message</Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
