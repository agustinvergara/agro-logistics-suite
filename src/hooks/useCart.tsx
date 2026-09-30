import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import type { Producto } from "@/lib/mock";

export type CartItem = {
  producto: Producto;
  cantidad: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  total: number;
  addItem: (producto: Producto, cantidad: number) => void;
  updateCantidad: (productId: number, cantidad: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

// Mantener un único contexto aunque el módulo se recargue en caliente (HMR).
const g = globalThis as unknown as { __mangoCartCtx?: React.Context<CartContextValue | null> };
const CartContext = (g.__mangoCartCtx ??= createContext<CartContextValue | null>(null));

const STORAGE_KEY = "mango_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CartItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  const addItem = useCallback((producto: Producto, cantidad: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.producto.id === producto.id);
      if (existing) {
        return prev.map((i) =>
          i.producto.id === producto.id
            ? { ...i, cantidad: Math.min(i.cantidad + cantidad, producto.stockAvailable) }
            : i,
        );
      }
      return [...prev, { producto, cantidad }];
    });
  }, []);

  const updateCantidad = useCallback((productId: number, cantidad: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.producto.id === productId
          ? { ...i, cantidad: Math.max(1, Math.min(cantidad, i.producto.stockAvailable)) }
          : i,
      ),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);
  const total = items.reduce((acc, i) => acc + i.cantidad * Number(i.producto.basePricePerUnit), 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, total, addItem, updateCantidad, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}
