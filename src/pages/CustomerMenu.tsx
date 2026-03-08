import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Plus, Minus, Search, Star, ArrowLeft, Trash2, Send, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getCategories, getMenuItems, Category, MenuItem, seedDemoData } from "@/lib/store";

type CartItem = { id: string; name: string; price: number; quantity: number; image: string };

const CustomerMenu = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get("table") || "1";
  const businessId = searchParams.get("business") || "";
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => { const stored = localStorage.getItem("dp_customer"); if (stored) setCustomer(JSON.parse(stored)); }, []);
  useEffect(() => { if (!businessId) return; seedDemoData(businessId); setCategories(getCategories(businessId)); setMenuItems(getMenuItems(businessId).filter(m => m.available)); }, [businessId]);

  const isImageUrl = (img: string) => img.startsWith("data:") || img.startsWith("http");

  const filteredItems = menuItems.filter(item => {
    const matchCat = activeCategory === "all" || item.categoryId === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const confirmOrder = () => {
    const orderId = `ORD-${String(Math.floor(Math.random() * 999999)).padStart(6, "0")}`;
    const order = { id: orderId, items: cart, total: cartTotal, status: "pending", tableId, businessId, customerId: customer?.id, createdAt: new Date().toISOString() };
    const orders = JSON.parse(localStorage.getItem("dp_orders") || "[]");
    orders.push(order);
    localStorage.setItem("dp_orders", JSON.stringify(orders));
    if (customer) {
      const points = Math.floor(cartTotal);
      customer.points = (customer.points || 0) + points;
      customer.totalOrders = (customer.totalOrders || 0) + 1;
      customer.totalSpent = (customer.totalSpent || 0) + cartTotal;
      if (customer.points >= 600) customer.level = "Platinum";
      else if (customer.points >= 300) customer.level = "Gold";
      else if (customer.points >= 100) customer.level = "Silver";
      else customer.level = "Bronze";
      localStorage.setItem("dp_customer", JSON.stringify(customer));
    }
    navigate(`/order-tracking/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-hero pb-24">
      <header className="glass border-b border-border/20 px-4 py-3 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="text-primary-foreground/60 hover:text-accent transition-colors"><ArrowLeft className="w-5 h-5" /></button>
            <div><p className="font-display font-bold text-primary-foreground text-sm">Menu</p><p className="text-xs text-primary-foreground/40">Table #{tableId}</p></div>
          </div>
          {customer && (
            <div className="flex items-center gap-2">
              <div className="text-right"><p className="text-xs font-medium text-primary-foreground">{customer.name}</p><p className="text-[10px] text-accent">{customer.points || 0} points</p></div>
              <div className="w-8 h-8 rounded-full bg-gold-gradient flex items-center justify-center"><span className="font-display font-bold text-accent-foreground text-xs">{customer.name?.charAt(0) || "?"}</span></div>
            </div>
          )}
        </div>
        <div className="mt-3 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary-foreground/30" />
          <Input placeholder="Raadi cunto..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 bg-primary/20 border-border/20 text-primary-foreground placeholder:text-primary-foreground/30 h-9 text-sm" />
        </div>
      </header>

      <div className="px-4 py-3 overflow-x-auto flex gap-2 no-scrollbar">
        <button onClick={() => setActiveCategory("all")} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === "all" ? "bg-gold-gradient text-accent-foreground shadow-gold" : "glass text-primary-foreground/60"}`}>
          <UtensilsCrossed className="w-3.5 h-3.5" /> Dhammaan
        </button>
        {categories.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${activeCategory === cat.id ? "bg-gold-gradient text-accent-foreground shadow-gold" : "glass text-primary-foreground/60"}`}>
            {isImageUrl(cat.icon) ? <img src={cat.icon} alt="" className="w-4 h-4 rounded-full object-cover" /> : <span>{cat.icon}</span>} {cat.name}
          </button>
        ))}
      </div>

      <div className="px-4 grid grid-cols-2 gap-3">
        {filteredItems.length === 0 ? (
          <div className="col-span-2 text-center py-12"><p className="text-primary-foreground/40 text-sm">Menu items ma jiraan.</p></div>
        ) : filteredItems.map((item, i) => {
          const inCart = cart.find(c => c.id === item.id);
          return (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass rounded-xl overflow-hidden hover:shadow-gold transition-shadow duration-300">
              <div className="h-24 flex items-center justify-center text-4xl bg-primary/20 overflow-hidden">
                {isImageUrl(item.image) ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  item.image
                )}
              </div>
              <div className="p-3">
                <h3 className="font-display font-semibold text-primary-foreground text-sm truncate">{item.name}</h3>
                <p className="text-[10px] text-primary-foreground/40 mt-0.5 line-clamp-1">{item.description}</p>
                {item.rating > 0 && (<div className="flex items-center gap-1 mt-1"><Star className="w-3 h-3 text-accent fill-accent" /><span className="text-[10px] text-accent font-medium">{item.rating}</span></div>)}
                <div className="flex items-center justify-between mt-2">
                  <span className="font-display font-bold text-accent text-sm">${item.price}</span>
                  {inCart ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center text-destructive"><Minus className="w-3 h-3" /></button>
                      <span className="text-xs font-bold text-primary-foreground w-4 text-center">{inCart.quantity}</span>
                      <button onClick={() => addToCart(item)} className="w-6 h-6 rounded-full bg-gold-gradient flex items-center justify-center text-accent-foreground"><Plus className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <button onClick={() => addToCart(item)} className="w-7 h-7 rounded-full bg-gold-gradient flex items-center justify-center text-accent-foreground shadow-gold hover:scale-110 transition-transform"><Plus className="w-4 h-4" /></button>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {cartCount > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-0 left-0 right-0 z-50">
            <AnimatePresence>
              {showCart && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="glass border-t border-border/20 px-4 pt-4 pb-2 max-h-[50vh] overflow-y-auto">
                  <h3 className="font-display font-bold text-primary-foreground text-sm mb-3">Liiskaaga 🛒</h3>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={item.id} className="flex items-center justify-between py-2 border-b border-border/10">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-primary/10">
                            {isImageUrl(item.image) ? <img src={item.image} alt="" className="w-full h-full object-cover" /> : <span className="text-lg">{item.image}</span>}
                          </div>
                          <div><p className="text-xs font-medium text-primary-foreground">{item.name}</p><p className="text-[10px] text-primary-foreground/40">${item.price} × {item.quantity}</p></div>
                        </div>
                        <div className="flex items-center gap-2"><span className="text-sm font-bold text-accent">${(item.price * item.quantity).toFixed(2)}</span><button onClick={() => updateQuantity(item.id, -item.quantity)} className="text-destructive/60"><Trash2 className="w-3.5 h-3.5" /></button></div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="glass border-t border-border/20 px-4 py-3 flex items-center gap-3">
              <button onClick={() => setShowCart(!showCart)} className="relative w-10 h-10 rounded-full bg-gold-gradient flex items-center justify-center text-accent-foreground shadow-gold">
                <ShoppingCart className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-[10px] px-1.5 h-4 min-w-4">{cartCount}</Badge>
              </button>
              <div className="flex-1"><p className="text-xs text-primary-foreground/40">{cartCount} items</p><p className="font-display font-bold text-accent">${cartTotal.toFixed(2)}</p></div>
              <Button variant="hero" size="default" onClick={confirmOrder} className="gap-1.5"><Send className="w-4 h-4" /> Dalbo</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomerMenu;
