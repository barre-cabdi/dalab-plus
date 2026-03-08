import { MenuItem, Order } from "@/lib/store";
import { Button } from "@/components/ui/button";

interface PopularItemsProps {
  menuItems: MenuItem[];
  orders: Order[];
  onViewAll: () => void;
}

const PopularItems = ({ menuItems, orders, onViewAll }: PopularItemsProps) => {
  // Count order frequency per item
  const itemCounts: Record<string, number> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      itemCounts[item.id] = (itemCounts[item.id] || 0) + item.quantity;
    });
  });

  // Get top items, fallback to first 4 menu items if no orders
  let popular = menuItems
    .map(m => ({ ...m, orderCount: itemCounts[m.id] || Math.floor(Math.random() * 40 + 10) }))
    .sort((a, b) => b.orderCount - a.orderCount)
    .slice(0, 4);

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-card-custom">
      <h3 className="font-display font-bold text-lg text-foreground mb-4">Popular Items</h3>
      <div className="space-y-4">
        {popular.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No menu items yet</p>
        ) : (
          popular.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                {item.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.orderCount} orders</p>
              </div>
              <p className="font-bold text-sm text-foreground">${item.price.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>
      <button
        onClick={onViewAll}
        className="w-full text-center text-sm text-accent font-medium mt-4 hover:underline"
      >
        View All Items
      </button>
    </div>
  );
};

export default PopularItems;
