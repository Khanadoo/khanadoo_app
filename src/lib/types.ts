export type UserRole = "student" | "vendor" | "admin";

export type FoodCategory = "Veg" | "Non-Veg" | "Snacks" | "Drinks";

export type FoodItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  rating: number;
  category: FoodCategory;
  vendor: string;
  availability: "Available" | "Limited" | "Sold out";
  popularity: number;
  prepTime: string;
  image: string;
  accent: string;
};

export type CartItem = {
  itemId: string;
  quantity: number;
};

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export type Order = {
  id: string;
  userId: string;
  vendor: string;
  items: string[];
  total: number;
  status: "Preparing" | "On the way" | "Delivered";
  eta: string;
  placedAt: string;
};
