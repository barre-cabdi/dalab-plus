// Centralized localStorage-based store for DALABplus+

export interface Business {
  id: string;
  name: string;
  type: "hotel" | "cafe" | "restaurant";
  address: string;
  city: string;
  country: string;
  countryCode: string;
  phonePrefix: string;
  phone: string;
  email: string;
  logo: string;
  description: string;
  adminUsername: string;
  adminPassword: string;
  status: "active" | "inactive";
  createdAt: string;
  totalOrders: number;
  totalRevenue: number;
  subscription: "free" | "basic" | "premium" | "enterprise";
}

export interface Category {
  id: string;
  businessId: string;
  name: string;
  icon: string;
  order: number;
}

export interface MenuItem {
  id: string;
  businessId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  available: boolean;
}

export interface TableItem {
  id: string;
  businessId: string;
  number: number;
  seats: number;
  status: "available" | "occupied" | "reserved";
}

export interface Order {
  id: string;
  businessId: string;
  tableId: string;
  customerId?: string;
  items: { id: string; name: string; price: number; quantity: number; image: string }[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: string;
}

const BUSINESSES_KEY = "dp_businesses";
const CATEGORIES_KEY = "dp_categories";
const MENU_ITEMS_KEY = "dp_menu_items";
const TABLES_KEY = "dp_tables";
const ORDERS_KEY = "dp_orders";

export const getBusinesses = (): Business[] => JSON.parse(localStorage.getItem(BUSINESSES_KEY) || "[]");
export const saveBusiness = (business: Business) => { const b = getBusinesses(); b.push(business); localStorage.setItem(BUSINESSES_KEY, JSON.stringify(b)); };
export const updateBusiness = (id: string, updates: Partial<Business>) => { localStorage.setItem(BUSINESSES_KEY, JSON.stringify(getBusinesses().map(b => b.id === id ? { ...b, ...updates } : b))); };
export const deleteBusiness = (id: string) => { localStorage.setItem(BUSINESSES_KEY, JSON.stringify(getBusinesses().filter(b => b.id !== id))); };
export const getBusinessByAdmin = (username: string): Business | undefined => getBusinesses().find(b => b.adminUsername === username);

export const getCategories = (businessId: string): Category[] => {
  const all: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]");
  return all.filter(c => c.businessId === businessId).sort((a, b) => a.order - b.order);
};
export const saveCategory = (cat: Category) => { const all: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]"); all.push(cat); localStorage.setItem(CATEGORIES_KEY, JSON.stringify(all)); };
export const updateCategory = (id: string, updates: Partial<Category>) => { const all: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]"); localStorage.setItem(CATEGORIES_KEY, JSON.stringify(all.map(c => c.id === id ? { ...c, ...updates } : c))); };
export const deleteCategory = (id: string) => { const all: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]"); localStorage.setItem(CATEGORIES_KEY, JSON.stringify(all.filter(c => c.id !== id))); };

export const getMenuItems = (businessId: string): MenuItem[] => {
  const all: MenuItem[] = JSON.parse(localStorage.getItem(MENU_ITEMS_KEY) || "[]");
  return all.filter(m => m.businessId === businessId);
};
export const saveMenuItem = (item: MenuItem) => { const all: MenuItem[] = JSON.parse(localStorage.getItem(MENU_ITEMS_KEY) || "[]"); all.push(item); localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(all)); };
export const updateMenuItem = (id: string, updates: Partial<MenuItem>) => { const all: MenuItem[] = JSON.parse(localStorage.getItem(MENU_ITEMS_KEY) || "[]"); localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(all.map(m => m.id === id ? { ...m, ...updates } : m))); };
export const deleteMenuItem = (id: string) => { const all: MenuItem[] = JSON.parse(localStorage.getItem(MENU_ITEMS_KEY) || "[]"); localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify(all.filter(m => m.id !== id))); };

export const getTables = (businessId: string): TableItem[] => {
  const all: TableItem[] = JSON.parse(localStorage.getItem(TABLES_KEY) || "[]");
  return all.filter(t => t.businessId === businessId);
};
export const saveTable = (table: TableItem) => { const all: TableItem[] = JSON.parse(localStorage.getItem(TABLES_KEY) || "[]"); all.push(table); localStorage.setItem(TABLES_KEY, JSON.stringify(all)); };
export const updateTable = (id: string, updates: Partial<TableItem>) => { const all: TableItem[] = JSON.parse(localStorage.getItem(TABLES_KEY) || "[]"); localStorage.setItem(TABLES_KEY, JSON.stringify(all.map(t => t.id === id ? { ...t, ...updates } : t))); };
export const deleteTable = (id: string) => { const all: TableItem[] = JSON.parse(localStorage.getItem(TABLES_KEY) || "[]"); localStorage.setItem(TABLES_KEY, JSON.stringify(all.filter(t => t.id !== id))); };

export const getOrders = (businessId: string): Order[] => {
  const all: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  return all.filter(o => o.businessId === businessId);
};
export const updateOrder = (id: string, updates: Partial<Order>) => {
  const all: Order[] = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all.map(o => o.id === id ? { ...o, ...updates } : o)));
};

export interface StaffMember {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  nationality: string;
  jobTitle: string;
  customJobTitle?: string;
  shifts: string;
  startTime: string;
  endTime: string;
  username?: string;
  password?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  businessId: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpent: number;
  loyaltyPoints: number;
  registeredAt: string;
}

const STAFF_KEY = "dp_staff";
const CUSTOMERS_KEY = "dp_customers";

export const getStaff = (businessId: string): StaffMember[] => {
  const all: StaffMember[] = JSON.parse(localStorage.getItem(STAFF_KEY) || "[]");
  return all.filter(s => s.businessId === businessId);
};
export const saveStaff = (staff: StaffMember) => { const all: StaffMember[] = JSON.parse(localStorage.getItem(STAFF_KEY) || "[]"); all.push(staff); localStorage.setItem(STAFF_KEY, JSON.stringify(all)); };
export const updateStaff = (id: string, updates: Partial<StaffMember>) => { const all: StaffMember[] = JSON.parse(localStorage.getItem(STAFF_KEY) || "[]"); localStorage.setItem(STAFF_KEY, JSON.stringify(all.map(s => s.id === id ? { ...s, ...updates } : s))); };
export const deleteStaff = (id: string) => { const all: StaffMember[] = JSON.parse(localStorage.getItem(STAFF_KEY) || "[]"); localStorage.setItem(STAFF_KEY, JSON.stringify(all.filter(s => s.id !== id))); };
export const getStaffByUsername = (username: string): StaffMember | undefined => {
  const all: StaffMember[] = JSON.parse(localStorage.getItem(STAFF_KEY) || "[]");
  return all.find(s => s.username === username);
};

export const getCustomers = (businessId: string): Customer[] => {
  const all: Customer[] = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || "[]");
  return all.filter(c => c.businessId === businessId);
};
export const saveCustomer = (customer: Customer) => { const all: Customer[] = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || "[]"); all.push(customer); localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(all)); };
export const updateCustomer = (id: string, updates: Partial<Customer>) => { const all: Customer[] = JSON.parse(localStorage.getItem(CUSTOMERS_KEY) || "[]"); localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(all.map(c => c.id === id ? { ...c, ...updates } : c))); };

export interface HotelRoom {
  id: string;
  businessId: string;
  roomNumber: string;
  type: "single" | "double" | "suite" | "deluxe" | "family";
  floor: number;
  pricePerNight: number;
  status: "available" | "occupied" | "maintenance" | "reserved";
  amenities: string[];
  image: string;
  maxGuests: number;
}

export interface HotelBooking {
  id: string;
  businessId: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  guestNationality: string;
  idNumber: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  totalPrice: number;
  status: "confirmed" | "checked-in" | "checked-out" | "cancelled";
  specialRequests: string;
  createdAt: string;
}

const HOTEL_ROOMS_KEY = "dp_hotel_rooms";
const HOTEL_BOOKINGS_KEY = "dp_hotel_bookings";

export const getHotelRooms = (businessId: string): HotelRoom[] => {
  const all: HotelRoom[] = JSON.parse(localStorage.getItem(HOTEL_ROOMS_KEY) || "[]");
  return all.filter(r => r.businessId === businessId);
};
export const saveHotelRoom = (room: HotelRoom) => { const all: HotelRoom[] = JSON.parse(localStorage.getItem(HOTEL_ROOMS_KEY) || "[]"); all.push(room); localStorage.setItem(HOTEL_ROOMS_KEY, JSON.stringify(all)); };
export const updateHotelRoom = (id: string, updates: Partial<HotelRoom>) => { const all: HotelRoom[] = JSON.parse(localStorage.getItem(HOTEL_ROOMS_KEY) || "[]"); localStorage.setItem(HOTEL_ROOMS_KEY, JSON.stringify(all.map(r => r.id === id ? { ...r, ...updates } : r))); };
export const deleteHotelRoom = (id: string) => { const all: HotelRoom[] = JSON.parse(localStorage.getItem(HOTEL_ROOMS_KEY) || "[]"); localStorage.setItem(HOTEL_ROOMS_KEY, JSON.stringify(all.filter(r => r.id !== id))); };

export const getHotelBookings = (businessId: string): HotelBooking[] => {
  const all: HotelBooking[] = JSON.parse(localStorage.getItem(HOTEL_BOOKINGS_KEY) || "[]");
  return all.filter(b => b.businessId === businessId);
};
export const saveHotelBooking = (booking: HotelBooking) => { const all: HotelBooking[] = JSON.parse(localStorage.getItem(HOTEL_BOOKINGS_KEY) || "[]"); all.push(booking); localStorage.setItem(HOTEL_BOOKINGS_KEY, JSON.stringify(all)); };
export const updateHotelBooking = (id: string, updates: Partial<HotelBooking>) => { const all: HotelBooking[] = JSON.parse(localStorage.getItem(HOTEL_BOOKINGS_KEY) || "[]"); localStorage.setItem(HOTEL_BOOKINGS_KEY, JSON.stringify(all.map(b => b.id === id ? { ...b, ...updates } : b))); };
export const deleteHotelBooking = (id: string) => { const all: HotelBooking[] = JSON.parse(localStorage.getItem(HOTEL_BOOKINGS_KEY) || "[]"); localStorage.setItem(HOTEL_BOOKINGS_KEY, JSON.stringify(all.filter(b => b.id !== id))); };

export const generateId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const seedDemoData = (businessId: string) => {
  const existingCats = getCategories(businessId);
  if (existingCats.length > 0) return;

  const cats: Category[] = [
    { id: "cat-mains", businessId, name: "Cuntada Aasaasiga", icon: "🍛", order: 1 },
    { id: "cat-breakfast", businessId, name: "Quraac", icon: "🍳", order: 2 },
    { id: "cat-grills", businessId, name: "Shiilka", icon: "🥩", order: 3 },
    { id: "cat-pasta", businessId, name: "Baasto", icon: "🍝", order: 4 },
    { id: "cat-seafood", businessId, name: "Kalluunka", icon: "🐟", order: 5 },
    { id: "cat-drinks", businessId, name: "Cabbitaanka", icon: "🥤", order: 6 },
    { id: "cat-desserts", businessId, name: "Macmacaan", icon: "🍰", order: 7 },
    { id: "cat-salads", businessId, name: "Salad", icon: "🥗", order: 8 },
  ];

  const items: MenuItem[] = [
    { id: "item-1", businessId, categoryId: "cat-mains", name: "Bariis Hilib Ari", description: "Bariis cad oo lagu daray hilib ari iyo xawaash macaan", price: 8.50, image: "🍛", rating: 4.8, available: true },
    { id: "item-2", businessId, categoryId: "cat-mains", name: "Bariis Iskukaris", description: "Bariis la iskukaris oo leh khudrad iyo hilib", price: 7.00, image: "🍚", rating: 4.5, available: true },
    { id: "item-3", businessId, categoryId: "cat-mains", name: "Suqaar iyo Canjeero", description: "Suqaar hilib lo'aad oo leh canjeero cusub", price: 6.50, image: "🥘", rating: 4.7, available: true },
    { id: "item-4", businessId, categoryId: "cat-mains", name: "Hilib Geel", description: "Hilib geel la dubay oo leh baradho", price: 9.00, image: "🥩", rating: 4.6, available: true },
    { id: "item-5", businessId, categoryId: "cat-breakfast", name: "Canjeero iyo Subag", description: "Canjeero cusub oo leh subag iyo malab", price: 3.50, image: "🫓", rating: 4.9, available: true },
    { id: "item-6", businessId, categoryId: "cat-breakfast", name: "Bur Shax", description: "Bur kulul oo leh ukun iyo shaah", price: 4.00, image: "🍳", rating: 4.3, available: true },
    { id: "item-7", businessId, categoryId: "cat-breakfast", name: "Fool iyo Canjeero", description: "Fool Masri oo leh saliid saytuun iyo canjeero", price: 4.50, image: "🫘", rating: 4.4, available: true },
    { id: "item-8", businessId, categoryId: "cat-grills", name: "Chicken Tikka", description: "Digaag la dubay oo leh xawaash gaar ah", price: 10.00, image: "🍗", rating: 4.7, available: true },
    { id: "item-9", businessId, categoryId: "cat-grills", name: "Mishkaki", description: "Hilib lo'aad oo la dubay oo usha ku jira", price: 8.00, image: "🥩", rating: 4.8, available: true },
    { id: "item-10", businessId, categoryId: "cat-grills", name: "Burger Gaar ah", description: "Burger weyn oo leh salad iyo cheese", price: 7.50, image: "🍔", rating: 4.5, available: true },
    { id: "item-11", businessId, categoryId: "cat-pasta", name: "Baasto Suugo", description: "Baasto leh suugo hilib iyo khudrad", price: 6.00, image: "🍝", rating: 4.4, available: true },
    { id: "item-12", businessId, categoryId: "cat-pasta", name: "Baasto Cream", description: "Baasto leh cream sauce iyo mushroom", price: 7.00, image: "🍝", rating: 4.3, available: true },
    { id: "item-13", businessId, categoryId: "cat-pasta", name: "Lasagna", description: "Lasagna hilib oo leh cheese badan", price: 8.50, image: "🫕", rating: 4.6, available: true },
    { id: "item-14", businessId, categoryId: "cat-seafood", name: "Kalluun la Dubay", description: "Kalluun cusub oo la dubay oo leh liin", price: 12.00, image: "🐟", rating: 4.9, available: true },
    { id: "item-15", businessId, categoryId: "cat-seafood", name: "Calamari", description: "Calamari la shiilshiilay oo leh sauce", price: 9.50, image: "🦑", rating: 4.5, available: true },
    { id: "item-16", businessId, categoryId: "cat-seafood", name: "Prawns Garlic", description: "Prawns leh toon iyo butter", price: 11.00, image: "🦐", rating: 4.7, available: true },
    { id: "item-17", businessId, categoryId: "cat-drinks", name: "Shaah Cadays", description: "Shaah xawaash leh caano", price: 1.50, image: "☕", rating: 4.8, available: true },
    { id: "item-18", businessId, categoryId: "cat-drinks", name: "Juice Mango", description: "Cambe cusub oo la miixay", price: 3.00, image: "🥭", rating: 4.6, available: true },
    { id: "item-19", businessId, categoryId: "cat-drinks", name: "Smoothie Berry", description: "Berry iyo yogurt la isku daray", price: 4.00, image: "🫐", rating: 4.5, available: true },
    { id: "item-20", businessId, categoryId: "cat-drinks", name: "Juice Avocado", description: "Avocado iyo caano la isku daray", price: 3.50, image: "🥑", rating: 4.7, available: true },
    { id: "item-21", businessId, categoryId: "cat-desserts", name: "Halwo", description: "Halwo Soomaali oo macaan", price: 3.00, image: "🍮", rating: 4.8, available: true },
    { id: "item-22", businessId, categoryId: "cat-desserts", name: "Ice Cream", description: "Ice cream vanilla iyo chocolate", price: 3.50, image: "🍨", rating: 4.4, available: true },
    { id: "item-23", businessId, categoryId: "cat-desserts", name: "Cheesecake", description: "Cheesecake leh berry sauce", price: 5.00, image: "🍰", rating: 4.6, available: true },
    { id: "item-24", businessId, categoryId: "cat-salads", name: "Caesar Salad", description: "Salad Caesar oo leh digaag la dubay", price: 5.50, image: "🥗", rating: 4.3, available: true },
    { id: "item-25", businessId, categoryId: "cat-salads", name: "Fattoush", description: "Salad Fattoush oo cusub oo dhadhan fiican", price: 4.50, image: "🥬", rating: 4.4, available: true },
  ];

  const allCats: Category[] = JSON.parse(localStorage.getItem(CATEGORIES_KEY) || "[]");
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify([...allCats, ...cats]));
  const allItems: MenuItem[] = JSON.parse(localStorage.getItem(MENU_ITEMS_KEY) || "[]");
  localStorage.setItem(MENU_ITEMS_KEY, JSON.stringify([...allItems, ...items]));
};
