"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { foodItems, mockUsers } from "@/lib/mock-data";
import type { CartItem, FoodItem, MockUser, UserRole } from "@/lib/types";

type AppContextValue = {
  hydrated: boolean;
  user: MockUser | null;
  cart: CartItem[];
  cartCount: number;
  cartItemsDetailed: Array<{ item: FoodItem; quantity: number }>;
  subtotal: number;
  login: (role: UserRole, name?: string, email?: string) => void;
  logout: () => void;
  addToCart: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
};

const USER_KEY = "khanadoo-user";
const CART_KEY = "khanadoo-cart";

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const hydrated = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const [user, setUser] = useState<MockUser | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storedUser = window.localStorage.getItem(USER_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === "undefined") {
      return [];
    }

    const storedCart = window.localStorage.getItem(CART_KEY);
    return storedCart ? JSON.parse(storedCart) : [];
  });

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    if (user) {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(USER_KEY);
    }
  }, [hydrated, user]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  const cartItemsDetailed = cart
    .map((entry) => {
      const item = foodItems.find((food) => food.id === entry.itemId);
      return item ? { item, quantity: entry.quantity } : null;
    })
    .filter((value): value is { item: FoodItem; quantity: number } => Boolean(value));

  const subtotal = cartItemsDetailed.reduce(
    (sum, entry) => sum + entry.item.price * entry.quantity,
    0,
  );

  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);

  function login(role: UserRole, name?: string, email?: string) {
    const templateUser = mockUsers.find((entry) => entry.role === role) ?? mockUsers[0];
    setUser({
      ...templateUser,
      name: name || templateUser.name,
      email: email || templateUser.email,
    });
  }

  function logout() {
    setUser(null);
  }

  function addToCart(itemId: string) {
    setCart((current) => {
      const existing = current.find((entry) => entry.itemId === itemId);
      if (existing) {
        return current.map((entry) =>
          entry.itemId === itemId
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry,
        );
      }

      return [...current, { itemId, quantity: 1 }];
    });
  }

  function decreaseItem(itemId: string) {
    setCart((current) =>
      current
        .map((entry) =>
          entry.itemId === itemId
            ? { ...entry, quantity: entry.quantity - 1 }
            : entry,
        )
        .filter((entry) => entry.quantity > 0),
    );
  }

  function removeFromCart(itemId: string) {
    setCart((current) => current.filter((entry) => entry.itemId !== itemId));
  }

  function clearCart() {
    setCart([]);
  }

  return (
    <AppContext.Provider
      value={{
        hydrated,
        user,
        cart,
        cartCount,
        cartItemsDetailed,
        subtotal,
        login,
        logout,
        addToCart,
        decreaseItem,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
