// Centralized Supabase-based store for DALABplus+
import { supabase } from "@/integrations/supabase/client";

export interface BusinessService {
  id: string;
  title: string;
  description: string;
  icon: string;
}

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
  services?: BusinessService[];
  paymentMethods?: PaymentMethodsConfig;
  permissions?: BusinessPermissions;
}

export interface MobilePaymentProvider {
  id: string;
  name: string;
  accountNumber: string;
}

export interface PaymentMethodsConfig {
  cashEnabled: boolean;
  cardEnabled: boolean;
  mobileEnabled: boolean;
  mobileProviders: MobilePaymentProvider[];
}

export interface BusinessPermissions {
  canEditMenu: boolean;
  canManageStaff: boolean;
  canViewReports: boolean;
  canManageTables: boolean;
  canManageHotel: boolean;
  canManageLoyalty: boolean;
  canManageReceipts: boolean;
  canViewPayments: boolean;
}

export const getDefaultPaymentMethods = (): PaymentMethodsConfig => ({
  cashEnabled: true,
  cardEnabled: false,
  mobileEnabled: false,
  mobileProviders: [],
});

export const getDefaultPermissions = (): BusinessPermissions => ({
  canEditMenu: true,
  canManageStaff: true,
  canViewReports: true,
  canManageTables: true,
  canManageHotel: true,
  canManageLoyalty: true,
  canManageReceipts: true,
  canViewPayments: true,
});

export const getDefaultServices = (type: string): BusinessService[] => {
  if (type === "hotel") return [
    { id: "s1", title: "Room Booking", description: "Book luxurious rooms for a comfortable stay", icon: "🛏️" },
    { id: "s2", title: "Restaurant", description: "Fine dining with local & international dishes", icon: "🍽️" },
    { id: "s3", title: "Room Service", description: "Order food directly to your room 24/7", icon: "🛎️" },
    { id: "s4", title: "Free Wi-Fi", description: "High-speed internet throughout the premises", icon: "📶" },
    { id: "s5", title: "Parking", description: "Complimentary parking for all guests", icon: "🅿️" },
    { id: "s6", title: "Concierge", description: "Our staff is ready to assist with anything", icon: "👨‍💼" },
  ];
  if (type === "cafe") return [
    { id: "s1", title: "Specialty Coffee", description: "Freshly brewed artisan coffee selections", icon: "☕" },
    { id: "s2", title: "Pastries & Snacks", description: "Freshly baked goods and light bites", icon: "🥐" },
    { id: "s3", title: "Free Wi-Fi", description: "Stay connected while you enjoy", icon: "📶" },
    { id: "s4", title: "Takeaway", description: "Grab your favorites on the go", icon: "📦" },
    { id: "s5", title: "Loyalty Program", description: "Earn stamps with every cup", icon: "⭐" },
    { id: "s6", title: "Meeting Space", description: "Cozy spots for meetings and co-working", icon: "👥" },
  ];
  return [
    { id: "s1", title: "Dine-In", description: "Enjoy dishes in a comfortable atmosphere", icon: "🍽️" },
    { id: "s2", title: "Takeaway", description: "Order your favorites and take them to go", icon: "📦" },
    { id: "s3", title: "Loyalty Program", description: "Earn points with every order", icon: "⭐" },
    { id: "s4", title: "Group Dining", description: "Special arrangements for groups and events", icon: "👥" },
    { id: "s5", title: "Delivery", description: "Get your food delivered to your doorstep", icon: "🚗" },
    { id: "s6", title: "Catering", description: "Catering services for your special events", icon: "🎉" },
  ];
};

// ============= MAPPERS: DB row <-> Interface =============

const mapBusinessFromDb = (row: any): Business => ({
  id: row.id,
  name: row.name,
  type: row.type,
  address: row.address || "",
  city: row.city || "",
  country: row.country || "",
  countryCode: row.country_code || "",
  phonePrefix: row.phone_prefix || "",
  phone: row.phone || "",
  email: row.email || "",
  logo: row.logo || "",
  description: row.description || "",
  adminUsername: row.admin_username,
  adminPassword: row.admin_password,
  status: row.status as "active" | "inactive",
  createdAt: row.created_at,
  totalOrders: row.total_orders || 0,
  totalRevenue: Number(row.total_revenue) || 0,
  subscription: row.subscription || "free",
  services: row.services as BusinessService[] || [],
  paymentMethods: row.payment_methods as any || getDefaultPaymentMethods(),
  permissions: row.permissions as any || getDefaultPermissions(),
});

const mapBusinessToDb = (biz: Partial<Business>): any => {
  const m: any = {};
  if (biz.name !== undefined) m.name = biz.name;
  if (biz.type !== undefined) m.type = biz.type;
  if (biz.address !== undefined) m.address = biz.address;
  if (biz.city !== undefined) m.city = biz.city;
  if (biz.country !== undefined) m.country = biz.country;
  if (biz.countryCode !== undefined) m.country_code = biz.countryCode;
  if (biz.phonePrefix !== undefined) m.phone_prefix = biz.phonePrefix;
  if (biz.phone !== undefined) m.phone = biz.phone;
  if (biz.email !== undefined) m.email = biz.email;
  if (biz.logo !== undefined) m.logo = biz.logo;
  if (biz.description !== undefined) m.description = biz.description;
  if (biz.adminUsername !== undefined) m.admin_username = biz.adminUsername;
  if (biz.adminPassword !== undefined) m.admin_password = biz.adminPassword;
  if (biz.status !== undefined) m.status = biz.status;
  if (biz.totalOrders !== undefined) m.total_orders = biz.totalOrders;
  if (biz.totalRevenue !== undefined) m.total_revenue = biz.totalRevenue;
  if (biz.subscription !== undefined) m.subscription = biz.subscription;
  if (biz.services !== undefined) m.services = biz.services;
  if (biz.paymentMethods !== undefined) m.payment_methods = biz.paymentMethods;
  if (biz.permissions !== undefined) m.permissions = biz.permissions;
  return m;
};

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
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled" | "paid";
  createdAt: string;
  orderedBy?: string;
  paymentMethod?: "cash" | "card" | "mobile";
  paidAt?: string;
  cashierId?: string;
}

export interface LoyaltyLevelConfig {
  name: string;
  min: number;
  max: number;
  icon: string;
  reward: string;
  color: string;
}

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
  checkedInAt?: string;
}

// ============= BUSINESSES =============

export const getBusinesses = async (): Promise<Business[]> => {
  const { data, error } = await supabase.from("businesses").select("*").order("created_at", { ascending: false });
  if (error) { console.error("getBusinesses error:", error); return []; }
  return (data || []).map(mapBusinessFromDb);
};

export const saveBusiness = async (business: Business): Promise<Business | null> => {
  const dbRow = mapBusinessToDb(business);
  // Let DB auto-generate id if not a valid UUID
  if (business.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(business.id)) {
    dbRow.id = business.id;
  }
  const { data, error } = await supabase.from("businesses").insert(dbRow).select().single();
  if (error) { console.error("saveBusiness error:", error); return null; }
  return data ? mapBusinessFromDb(data) : null;
};

export const updateBusiness = async (id: string, updates: Partial<Business>): Promise<void> => {
  const dbUpdates = mapBusinessToDb(updates);
  const { error } = await supabase.from("businesses").update(dbUpdates).eq("id", id);
  if (error) console.error("updateBusiness error:", error);
};

export const deleteBusiness = async (id: string): Promise<void> => {
  const { error } = await supabase.from("businesses").delete().eq("id", id);
  if (error) console.error("deleteBusiness error:", error);
};

export const getBusinessByAdmin = async (username: string): Promise<Business | undefined> => {
  const { data, error } = await supabase.from("businesses").select("*").eq("admin_username", username).maybeSingle();
  if (error || !data) return undefined;
  return mapBusinessFromDb(data);
};

export const getBusinessById = async (id: string): Promise<Business | undefined> => {
  const { data, error } = await supabase.from("businesses").select("*").eq("id", id).maybeSingle();
  if (error || !data) return undefined;
  return mapBusinessFromDb(data);
};

// ============= CATEGORIES =============

const mapCategoryFromDb = (row: any): Category => ({
  id: row.id,
  businessId: row.business_id,
  name: row.name,
  icon: row.icon || "📁",
  order: row.sort_order || 0,
});

export const getCategories = async (businessId: string): Promise<Category[]> => {
  const { data, error } = await supabase.from("categories").select("*").eq("business_id", businessId).order("sort_order");
  if (error) { console.error("getCategories error:", error); return []; }
  return (data || []).map(mapCategoryFromDb);
};

export const saveCategory = async (cat: Category): Promise<void> => {
  const { error } = await supabase.from("categories").insert({
    id: cat.id, business_id: cat.businessId, name: cat.name, icon: cat.icon, sort_order: cat.order,
  });
  if (error) console.error("saveCategory error:", error);
};

export const updateCategory = async (id: string, updates: Partial<Category>): Promise<void> => {
  const m: any = {};
  if (updates.name !== undefined) m.name = updates.name;
  if (updates.icon !== undefined) m.icon = updates.icon;
  if (updates.order !== undefined) m.sort_order = updates.order;
  const { error } = await supabase.from("categories").update(m).eq("id", id);
  if (error) console.error("updateCategory error:", error);
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) console.error("deleteCategory error:", error);
};

// ============= MENU ITEMS =============

const mapMenuItemFromDb = (row: any): MenuItem => ({
  id: row.id,
  businessId: row.business_id,
  categoryId: row.category_id,
  name: row.name,
  description: row.description || "",
  price: Number(row.price) || 0,
  image: row.image || "",
  rating: Number(row.rating) || 0,
  available: row.available ?? true,
});

export const getMenuItems = async (businessId: string): Promise<MenuItem[]> => {
  const { data, error } = await supabase.from("menu_items").select("*").eq("business_id", businessId);
  if (error) { console.error("getMenuItems error:", error); return []; }
  return (data || []).map(mapMenuItemFromDb);
};

export const saveMenuItem = async (item: MenuItem): Promise<void> => {
  const { error } = await supabase.from("menu_items").insert({
    id: item.id, business_id: item.businessId, category_id: item.categoryId,
    name: item.name, description: item.description, price: item.price,
    image: item.image, rating: item.rating, available: item.available,
  });
  if (error) console.error("saveMenuItem error:", error);
};

export const updateMenuItem = async (id: string, updates: Partial<MenuItem>): Promise<void> => {
  const m: any = {};
  if (updates.name !== undefined) m.name = updates.name;
  if (updates.description !== undefined) m.description = updates.description;
  if (updates.price !== undefined) m.price = updates.price;
  if (updates.image !== undefined) m.image = updates.image;
  if (updates.rating !== undefined) m.rating = updates.rating;
  if (updates.available !== undefined) m.available = updates.available;
  if (updates.categoryId !== undefined) m.category_id = updates.categoryId;
  const { error } = await supabase.from("menu_items").update(m).eq("id", id);
  if (error) console.error("updateMenuItem error:", error);
};

export const deleteMenuItem = async (id: string): Promise<void> => {
  const { error } = await supabase.from("menu_items").delete().eq("id", id);
  if (error) console.error("deleteMenuItem error:", error);
};

// ============= TABLES =============

const mapTableFromDb = (row: any): TableItem => ({
  id: row.id,
  businessId: row.business_id,
  number: row.table_number,
  seats: row.seats || 4,
  status: row.status as TableItem["status"],
});

export const getTables = async (businessId: string): Promise<TableItem[]> => {
  const { data, error } = await supabase.from("restaurant_tables").select("*").eq("business_id", businessId).order("table_number");
  if (error) { console.error("getTables error:", error); return []; }
  return (data || []).map(mapTableFromDb);
};

export const saveTable = async (table: TableItem): Promise<void> => {
  const { error } = await supabase.from("restaurant_tables").insert({
    id: table.id, business_id: table.businessId, table_number: table.number, seats: table.seats, status: table.status,
  });
  if (error) console.error("saveTable error:", error);
};

export const updateTable = async (id: string, updates: Partial<TableItem>): Promise<void> => {
  const m: any = {};
  if (updates.number !== undefined) m.table_number = updates.number;
  if (updates.seats !== undefined) m.seats = updates.seats;
  if (updates.status !== undefined) m.status = updates.status;
  const { error } = await supabase.from("restaurant_tables").update(m).eq("id", id);
  if (error) console.error("updateTable error:", error);
};

export const deleteTable = async (id: string): Promise<void> => {
  const { error } = await supabase.from("restaurant_tables").delete().eq("id", id);
  if (error) console.error("deleteTable error:", error);
};

// ============= ORDERS =============

const mapOrderFromDb = (row: any): Order => ({
  id: row.id,
  businessId: row.business_id,
  tableId: row.table_id || "",
  customerId: row.customer_id || undefined,
  items: (row.items as any) || [],
  total: Number(row.total) || 0,
  status: row.status as Order["status"],
  createdAt: row.created_at,
  orderedBy: row.ordered_by || undefined,
  paymentMethod: row.payment_method as Order["paymentMethod"] || undefined,
  paidAt: row.paid_at || undefined,
  cashierId: row.cashier_id || undefined,
});

export const getOrders = async (businessId: string): Promise<Order[]> => {
  const { data, error } = await supabase.from("orders").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
  if (error) { console.error("getOrders error:", error); return []; }
  return (data || []).map(mapOrderFromDb);
};

export const saveOrder = async (order: Order): Promise<void> => {
  const { error } = await supabase.from("orders").insert({
    id: order.id, business_id: order.businessId, table_id: order.tableId,
    customer_id: order.customerId || null, items: order.items as any, total: order.total,
    status: order.status, ordered_by: order.orderedBy || "", payment_method: order.paymentMethod || null,
    paid_at: order.paidAt || null, cashier_id: order.cashierId || "",
    created_at: order.createdAt,
  });
  if (error) console.error("saveOrder error:", error);
};

export const updateOrder = async (id: string, updates: Partial<Order>): Promise<void> => {
  const m: any = {};
  if (updates.status !== undefined) m.status = updates.status;
  if (updates.paymentMethod !== undefined) m.payment_method = updates.paymentMethod;
  if (updates.paidAt !== undefined) m.paid_at = updates.paidAt;
  if (updates.cashierId !== undefined) m.cashier_id = updates.cashierId;
  if (updates.items !== undefined) m.items = updates.items;
  if (updates.total !== undefined) m.total = updates.total;
  if (updates.tableId !== undefined) m.table_id = updates.tableId;
  if (updates.orderedBy !== undefined) m.ordered_by = updates.orderedBy;
  const { error } = await supabase.from("orders").update(m).eq("id", id);
  if (error) console.error("updateOrder error:", error);
};

export const deleteOrder = async (id: string): Promise<void> => {
  const { error } = await supabase.from("orders").delete().eq("id", id);
  if (error) console.error("deleteOrder error:", error);
};

// ============= STAFF =============

const mapStaffFromDb = (row: any): StaffMember => ({
  id: row.id,
  businessId: row.business_id,
  name: row.name,
  phone: row.phone || "",
  nationality: row.nationality || "",
  jobTitle: row.job_title,
  customJobTitle: row.custom_job_title || "",
  shifts: row.shifts || "",
  startTime: row.start_time || "",
  endTime: row.end_time || "",
  username: row.username || undefined,
  password: row.password || undefined,
  createdAt: row.created_at,
});

export const getStaff = async (businessId: string): Promise<StaffMember[]> => {
  const { data, error } = await supabase.from("staff").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
  if (error) { console.error("getStaff error:", error); return []; }
  return (data || []).map(mapStaffFromDb);
};

export const saveStaff = async (staff: StaffMember): Promise<void> => {
  const { error } = await supabase.from("staff").insert({
    id: staff.id, business_id: staff.businessId, name: staff.name, phone: staff.phone,
    nationality: staff.nationality, job_title: staff.jobTitle, custom_job_title: staff.customJobTitle || "",
    shifts: staff.shifts, start_time: staff.startTime, end_time: staff.endTime,
    username: staff.username || null, password: staff.password || "",
    created_at: staff.createdAt,
  });
  if (error) console.error("saveStaff error:", error);
};

export const updateStaff = async (id: string, updates: Partial<StaffMember>): Promise<void> => {
  const m: any = {};
  if (updates.name !== undefined) m.name = updates.name;
  if (updates.phone !== undefined) m.phone = updates.phone;
  if (updates.nationality !== undefined) m.nationality = updates.nationality;
  if (updates.jobTitle !== undefined) m.job_title = updates.jobTitle;
  if (updates.customJobTitle !== undefined) m.custom_job_title = updates.customJobTitle;
  if (updates.shifts !== undefined) m.shifts = updates.shifts;
  if (updates.startTime !== undefined) m.start_time = updates.startTime;
  if (updates.endTime !== undefined) m.end_time = updates.endTime;
  if (updates.username !== undefined) m.username = updates.username;
  if (updates.password !== undefined) m.password = updates.password;
  const { error } = await supabase.from("staff").update(m).eq("id", id);
  if (error) console.error("updateStaff error:", error);
};

export const deleteStaff = async (id: string): Promise<void> => {
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) console.error("deleteStaff error:", error);
};

export const getStaffByUsername = async (username: string): Promise<StaffMember | undefined> => {
  const { data, error } = await supabase.from("staff").select("*").eq("username", username).maybeSingle();
  if (error || !data) return undefined;
  return mapStaffFromDb(data);
};

// ============= CUSTOMERS =============

const mapCustomerFromDb = (row: any): Customer => ({
  id: row.id,
  businessId: row.business_id,
  name: row.name,
  phone: row.phone || "",
  email: row.email || "",
  totalOrders: row.total_orders || 0,
  totalSpent: Number(row.total_spent) || 0,
  loyaltyPoints: row.loyalty_points || 0,
  registeredAt: row.registered_at || row.created_at,
});

export const getCustomers = async (businessId: string): Promise<Customer[]> => {
  const { data, error } = await supabase.from("customers").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
  if (error) { console.error("getCustomers error:", error); return []; }
  return (data || []).map(mapCustomerFromDb);
};

export const saveCustomer = async (customer: Customer): Promise<void> => {
  const { error } = await supabase.from("customers").insert({
    id: customer.id, business_id: customer.businessId, name: customer.name,
    phone: customer.phone, email: customer.email || "", total_orders: customer.totalOrders,
    total_spent: customer.totalSpent, loyalty_points: customer.loyaltyPoints,
    registered_at: customer.registeredAt,
  });
  if (error) console.error("saveCustomer error:", error);
};

export const updateCustomer = async (id: string, updates: Partial<Customer>): Promise<void> => {
  const m: any = {};
  if (updates.name !== undefined) m.name = updates.name;
  if (updates.phone !== undefined) m.phone = updates.phone;
  if (updates.email !== undefined) m.email = updates.email;
  if (updates.totalOrders !== undefined) m.total_orders = updates.totalOrders;
  if (updates.totalSpent !== undefined) m.total_spent = updates.totalSpent;
  if (updates.loyaltyPoints !== undefined) m.loyalty_points = updates.loyaltyPoints;
  const { error } = await supabase.from("customers").update(m).eq("id", id);
  if (error) console.error("updateCustomer error:", error);
};

// ============= HOTEL ROOMS =============

const mapHotelRoomFromDb = (row: any): HotelRoom => ({
  id: row.id,
  businessId: row.business_id,
  roomNumber: row.room_number,
  type: row.type as HotelRoom["type"],
  floor: row.floor || 1,
  pricePerNight: Number(row.price_per_night) || 0,
  status: row.status as HotelRoom["status"],
  amenities: (row.amenities as string[]) || [],
  image: row.image || "",
  maxGuests: row.max_guests || 2,
});

export const getHotelRooms = async (businessId: string): Promise<HotelRoom[]> => {
  const { data, error } = await supabase.from("hotel_rooms").select("*").eq("business_id", businessId).order("room_number");
  if (error) { console.error("getHotelRooms error:", error); return []; }
  return (data || []).map(mapHotelRoomFromDb);
};

export const saveHotelRoom = async (room: HotelRoom): Promise<void> => {
  const { error } = await supabase.from("hotel_rooms").insert({
    id: room.id, business_id: room.businessId, room_number: room.roomNumber,
    type: room.type, floor: room.floor, price_per_night: room.pricePerNight,
    status: room.status, amenities: room.amenities as any, image: room.image, max_guests: room.maxGuests,
  });
  if (error) console.error("saveHotelRoom error:", error);
};

export const updateHotelRoom = async (id: string, updates: Partial<HotelRoom>): Promise<void> => {
  const m: any = {};
  if (updates.roomNumber !== undefined) m.room_number = updates.roomNumber;
  if (updates.type !== undefined) m.type = updates.type;
  if (updates.floor !== undefined) m.floor = updates.floor;
  if (updates.pricePerNight !== undefined) m.price_per_night = updates.pricePerNight;
  if (updates.status !== undefined) m.status = updates.status;
  if (updates.amenities !== undefined) m.amenities = updates.amenities;
  if (updates.image !== undefined) m.image = updates.image;
  if (updates.maxGuests !== undefined) m.max_guests = updates.maxGuests;
  const { error } = await supabase.from("hotel_rooms").update(m).eq("id", id);
  if (error) console.error("updateHotelRoom error:", error);
};

export const deleteHotelRoom = async (id: string): Promise<void> => {
  const { error } = await supabase.from("hotel_rooms").delete().eq("id", id);
  if (error) console.error("deleteHotelRoom error:", error);
};

// ============= HOTEL BOOKINGS =============

const mapHotelBookingFromDb = (row: any): HotelBooking => ({
  id: row.id,
  businessId: row.business_id,
  roomId: row.room_id,
  guestName: row.guest_name,
  guestPhone: row.guest_phone || "",
  guestEmail: row.guest_email || "",
  guestNationality: row.guest_nationality || "",
  idNumber: row.id_number || "",
  checkIn: row.check_in,
  checkOut: row.check_out,
  nights: row.nights || 1,
  totalPrice: Number(row.total_price) || 0,
  status: row.status as HotelBooking["status"],
  specialRequests: row.special_requests || "",
  createdAt: row.created_at,
  checkedInAt: row.checked_in_at || undefined,
});

export const getHotelBookings = async (businessId: string): Promise<HotelBooking[]> => {
  const { data, error } = await supabase.from("hotel_bookings").select("*").eq("business_id", businessId).order("created_at", { ascending: false });
  if (error) { console.error("getHotelBookings error:", error); return []; }
  return (data || []).map(mapHotelBookingFromDb);
};

export const saveHotelBooking = async (booking: HotelBooking): Promise<void> => {
  const { error } = await supabase.from("hotel_bookings").insert({
    id: booking.id, business_id: booking.businessId, room_id: booking.roomId,
    guest_name: booking.guestName, guest_phone: booking.guestPhone, guest_email: booking.guestEmail,
    guest_nationality: booking.guestNationality, id_number: booking.idNumber,
    check_in: booking.checkIn, check_out: booking.checkOut, nights: booking.nights,
    total_price: booking.totalPrice, status: booking.status, special_requests: booking.specialRequests,
    checked_in_at: booking.checkedInAt || null, created_at: booking.createdAt,
  });
  if (error) console.error("saveHotelBooking error:", error);
};

export const updateHotelBooking = async (id: string, updates: Partial<HotelBooking>): Promise<void> => {
  const m: any = {};
  if (updates.status !== undefined) m.status = updates.status;
  if (updates.checkIn !== undefined) m.check_in = updates.checkIn;
  if (updates.checkOut !== undefined) m.check_out = updates.checkOut;
  if (updates.nights !== undefined) m.nights = updates.nights;
  if (updates.totalPrice !== undefined) m.total_price = updates.totalPrice;
  if (updates.checkedInAt !== undefined) m.checked_in_at = updates.checkedInAt;
  if (updates.specialRequests !== undefined) m.special_requests = updates.specialRequests;
  if (updates.guestName !== undefined) m.guest_name = updates.guestName;
  if (updates.guestPhone !== undefined) m.guest_phone = updates.guestPhone;
  if (updates.guestEmail !== undefined) m.guest_email = updates.guestEmail;
  const { error } = await supabase.from("hotel_bookings").update(m).eq("id", id);
  if (error) console.error("updateHotelBooking error:", error);
};

export const deleteHotelBooking = async (id: string): Promise<void> => {
  const { error } = await supabase.from("hotel_bookings").delete().eq("id", id);
  if (error) console.error("deleteHotelBooking error:", error);
};

// ============= LOYALTY LEVELS =============

export const getLoyaltyLevels = async (businessId: string): Promise<LoyaltyLevelConfig[]> => {
  const { data, error } = await supabase.from("loyalty_levels").select("*").eq("business_id", businessId).order("sort_order");
  if (error || !data || data.length === 0) {
    return [
      { name: "Bronze", min: 0, max: 99, icon: "🥉", reward: "5% discount on next order", color: "bg-amber-700/15 text-amber-700 border-amber-700/30" },
      { name: "Silver", min: 100, max: 299, icon: "🥈", reward: "10% discount + free drink", color: "bg-slate-400/15 text-slate-500 border-slate-400/30" },
      { name: "Gold", min: 300, max: 599, icon: "🥇", reward: "15% discount + free dessert", color: "bg-yellow-500/15 text-yellow-600 border-yellow-500/30" },
      { name: "Platinum", min: 600, max: 99999, icon: "💎", reward: "20% discount + free meal", color: "bg-purple-500/15 text-purple-600 border-purple-500/30" },
    ];
  }
  return data.map(row => ({
    name: row.name,
    min: row.min_points || 0,
    max: row.max_points || 0,
    icon: row.icon || "🥉",
    reward: row.reward || "",
    color: row.color || "",
  }));
};

export const saveLoyaltyLevels = async (businessId: string, levels: LoyaltyLevelConfig[]): Promise<void> => {
  // Delete existing and re-insert
  await supabase.from("loyalty_levels").delete().eq("business_id", businessId);
  const rows = levels.map((l, i) => ({
    business_id: businessId, name: l.name, min_points: l.min, max_points: l.max,
    icon: l.icon, reward: l.reward, color: l.color, sort_order: i,
  }));
  if (rows.length > 0) {
    const { error } = await supabase.from("loyalty_levels").insert(rows);
    if (error) console.error("saveLoyaltyLevels error:", error);
  }
};

// ============= UTILITIES =============

export const generateId = (_prefix?: string) => crypto.randomUUID();

export const calcRunningTotal = (booking: HotelBooking, pricePerNight: number): { elapsedNights: number; runningTotal: number } => {
  if (booking.status !== "checked-in" || !booking.checkedInAt) {
    return { elapsedNights: booking.nights, runningTotal: booking.totalPrice };
  }
  const checkedInTime = new Date(booking.checkedInAt).getTime();
  const now = Date.now();
  const elapsedMs = now - checkedInTime;
  const elapsedNights = Math.max(1, Math.ceil(elapsedMs / (24 * 60 * 60 * 1000)));
  return { elapsedNights, runningTotal: elapsedNights * pricePerNight };
};

// ============= SEED DEMO DATA =============

export const seedDemoData = async (businessId: string): Promise<void> => {
  const existingCats = await getCategories(businessId);
  if (existingCats.length > 0) return;

  const catIds = {
    mains: generateId("cat"),
    breakfast: generateId("cat"),
    grills: generateId("cat"),
    pasta: generateId("cat"),
    seafood: generateId("cat"),
    drinks: generateId("cat"),
    desserts: generateId("cat"),
    salads: generateId("cat"),
  };

  const cats = [
    { id: catIds.mains, business_id: businessId, name: "Cuntada Aasaasiga", icon: "🍛", sort_order: 1 },
    { id: catIds.breakfast, business_id: businessId, name: "Quraac", icon: "🍳", sort_order: 2 },
    { id: catIds.grills, business_id: businessId, name: "Shiilka", icon: "🥩", sort_order: 3 },
    { id: catIds.pasta, business_id: businessId, name: "Baasto", icon: "🍝", sort_order: 4 },
    { id: catIds.seafood, business_id: businessId, name: "Kalluunka", icon: "🐟", sort_order: 5 },
    { id: catIds.drinks, business_id: businessId, name: "Cabbitaanka", icon: "🥤", sort_order: 6 },
    { id: catIds.desserts, business_id: businessId, name: "Macmacaan", icon: "🍰", sort_order: 7 },
    { id: catIds.salads, business_id: businessId, name: "Salad", icon: "🥗", sort_order: 8 },
  ];

  const { error: catError } = await supabase.from("categories").insert(cats);
  if (catError) { console.error("seedDemoData cats error:", catError); return; }

  const items = [
    { business_id: businessId, category_id: catIds.mains, name: "Bariis Hilib Ari", description: "Bariis cad oo lagu daray hilib ari iyo xawaash macaan", price: 8.50, image: "🍛", rating: 4.8, available: true },
    { business_id: businessId, category_id: catIds.mains, name: "Bariis Iskukaris", description: "Bariis la iskukaris oo leh khudrad iyo hilib", price: 7.00, image: "🍚", rating: 4.5, available: true },
    { business_id: businessId, category_id: catIds.mains, name: "Suqaar iyo Canjeero", description: "Suqaar hilib lo'aad oo leh canjeero cusub", price: 6.50, image: "🥘", rating: 4.7, available: true },
    { business_id: businessId, category_id: catIds.mains, name: "Hilib Geel", description: "Hilib geel la dubay oo leh baradho", price: 9.00, image: "🥩", rating: 4.6, available: true },
    { business_id: businessId, category_id: catIds.breakfast, name: "Canjeero iyo Subag", description: "Canjeero cusub oo leh subag iyo malab", price: 3.50, image: "🫓", rating: 4.9, available: true },
    { business_id: businessId, category_id: catIds.breakfast, name: "Bur Shax", description: "Bur kulul oo leh ukun iyo shaah", price: 4.00, image: "🍳", rating: 4.3, available: true },
    { business_id: businessId, category_id: catIds.breakfast, name: "Fool iyo Canjeero", description: "Fool Masri oo leh saliid saytuun iyo canjeero", price: 4.50, image: "🫘", rating: 4.4, available: true },
    { business_id: businessId, category_id: catIds.grills, name: "Chicken Tikka", description: "Digaag la dubay oo leh xawaash gaar ah", price: 10.00, image: "🍗", rating: 4.7, available: true },
    { business_id: businessId, category_id: catIds.grills, name: "Mishkaki", description: "Hilib lo'aad oo la dubay oo usha ku jira", price: 8.00, image: "🥩", rating: 4.8, available: true },
    { business_id: businessId, category_id: catIds.grills, name: "Burger Gaar ah", description: "Burger weyn oo leh salad iyo cheese", price: 7.50, image: "🍔", rating: 4.5, available: true },
    { business_id: businessId, category_id: catIds.pasta, name: "Baasto Suugo", description: "Baasto leh suugo hilib iyo khudrad", price: 6.00, image: "🍝", rating: 4.4, available: true },
    { business_id: businessId, category_id: catIds.pasta, name: "Baasto Cream", description: "Baasto leh cream sauce iyo mushroom", price: 7.00, image: "🍝", rating: 4.3, available: true },
    { business_id: businessId, category_id: catIds.pasta, name: "Lasagna", description: "Lasagna hilib oo leh cheese badan", price: 8.50, image: "🫕", rating: 4.6, available: true },
    { business_id: businessId, category_id: catIds.seafood, name: "Kalluun la Dubay", description: "Kalluun cusub oo la dubay oo leh liin", price: 12.00, image: "🐟", rating: 4.9, available: true },
    { business_id: businessId, category_id: catIds.seafood, name: "Calamari", description: "Calamari la shiilshiilay oo leh sauce", price: 9.50, image: "🦑", rating: 4.5, available: true },
    { business_id: businessId, category_id: catIds.seafood, name: "Prawns Garlic", description: "Prawns leh toon iyo butter", price: 11.00, image: "🦐", rating: 4.7, available: true },
    { business_id: businessId, category_id: catIds.drinks, name: "Shaah Cadays", description: "Shaah xawaash leh caano", price: 1.50, image: "☕", rating: 4.8, available: true },
    { business_id: businessId, category_id: catIds.drinks, name: "Juice Mango", description: "Cambe cusub oo la miixay", price: 3.00, image: "🥭", rating: 4.6, available: true },
    { business_id: businessId, category_id: catIds.drinks, name: "Smoothie Berry", description: "Berry iyo yogurt la isku daray", price: 4.00, image: "🫐", rating: 4.5, available: true },
    { business_id: businessId, category_id: catIds.drinks, name: "Juice Avocado", description: "Avocado iyo caano la isku daray", price: 3.50, image: "🥑", rating: 4.7, available: true },
    { business_id: businessId, category_id: catIds.desserts, name: "Halwo", description: "Halwo Soomaali oo macaan", price: 3.00, image: "🍮", rating: 4.8, available: true },
    { business_id: businessId, category_id: catIds.desserts, name: "Ice Cream", description: "Ice cream vanilla iyo chocolate", price: 3.50, image: "🍨", rating: 4.4, available: true },
    { business_id: businessId, category_id: catIds.desserts, name: "Cheesecake", description: "Cheesecake leh berry sauce", price: 5.00, image: "🍰", rating: 4.6, available: true },
    { business_id: businessId, category_id: catIds.salads, name: "Caesar Salad", description: "Salad Caesar oo leh digaag la dubay", price: 5.50, image: "🥗", rating: 4.3, available: true },
    { business_id: businessId, category_id: catIds.salads, name: "Fattoush", description: "Salad Fattoush oo cusub oo dhadhan fiican", price: 4.50, image: "🥬", rating: 4.4, available: true },
  ];

  const { error: itemError } = await supabase.from("menu_items").insert(items);
  if (itemError) console.error("seedDemoData items error:", itemError);
};
