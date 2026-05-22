"use client";

import { useState, useEffect, createContext, useContext, type ReactNode } from "react";
import type { CartItem, User } from "./types";

interface AppState {
  user: User | null;
  cart: CartItem[];
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  addToCart: (blueprintId: string) => void;
  removeFromCart: (blueprintId: string) => void;
  clearCart: () => void;
  isInCart: (blueprintId: string) => boolean;
  cartCount: number;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("forge_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("forge_user");
      }
    }
    const storedCart = localStorage.getItem("forge_cart");
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch {
        localStorage.removeItem("forge_cart");
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("forge_user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("forge_user");
  };

  const addToCart = (blueprintId: string) => {
    setCart((prev) => {
      if (prev.some((item) => item.blueprintId === blueprintId)) return prev;
      const next = [...prev, { blueprintId, addedAt: new Date().toISOString() }];
      localStorage.setItem("forge_cart", JSON.stringify(next));
      return next;
    });
  };

  const removeFromCart = (blueprintId: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.blueprintId !== blueprintId);
      localStorage.setItem("forge_cart", JSON.stringify(next));
      return next;
    });
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("forge_cart");
  };

  const isInCart = (blueprintId: string) =>
    cart.some((item) => item.blueprintId === blueprintId);

  return (
    <AppContext.Provider
      value={{
        user,
        cart,
        isAuthenticated: user !== null,
        login,
        logout,
        addToCart,
        removeFromCart,
        clearCart,
        isInCart,
        cartCount: cart.length,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
