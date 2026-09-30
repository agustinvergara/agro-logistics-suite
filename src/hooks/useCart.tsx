import type React from "react";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export type CartItem = {
  producto: any; // Mapeado del backend
  cantidad: number;
};

type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  total: number;
  loading: boolean;
  addItem: (producto: any, cantidad: number) => Promise<void>;
  updateCantidad: (productId: number, cantidad: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
};

const g = globalThis as unknown as { __mangoCartCtx?: React.Context<CartContextValue | null> };
const CartContext = (g.__mangoCartCtx ??= createContext<CartContextValue | null>(null));

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    try {
      const data = await apiFetch<any[]>("/api/marketplace/cart");
      if (Array.isArray(data)) {
        const mapped = data.map((i) => {
          let urls = [];
          try {
            urls = typeof i.photoUrls === 'string' ? JSON.parse(i.photoUrls) : (i.photoUrls || []);
          } catch (e) {}

          return {
            cantidad: i.quantity,
            producto: {
              id: i.productId,
              name: i.name,
              basePricePerUnit: i.basePricePerUnit,
              stockAvailable: i.stockAvailable,
              unit: i.unit,
              image: Array.isArray(urls) && urls.length > 0 ? urls[0] : undefined,
              requiresRefrigeration: Boolean(i.requiresRefrigeration),
              producer: i.producer,
            },
          };
        });
        setItems(mapped);
      }
    } catch {
      // Ignorar, prob de auth
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (producto: any, cantidad: number) => {
    // Optimistic update
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
    
    // Sync backend
    await apiFetch("/api/marketplace/cart/add", {
      method: "POST",
      body: { productId: producto.id, quantity: cantidad },
    });
    await fetchCart();
  }, [fetchCart]);

  const updateCantidad = useCallback(async (productId: number, cantidad: number) => {
    setItems((prev) =>
      prev.map((i) =>
        i.producto.id === productId
          ? { ...i, cantidad }
          : i,
      ),
    );
    await apiFetch("/api/marketplace/cart/add", {
      method: "POST",
      body: { productId, quantity: cantidad },
    });
    await fetchCart();
  }, [fetchCart]);

  const removeItem = useCallback(async (productId: number) => {
    setItems((prev) => prev.filter((i) => i.producto.id !== productId));
    await apiFetch(`/api/marketplace/cart/remove/${productId}`, { method: "DELETE" });
    await fetchCart();
  }, [fetchCart]);

  const clearCart = useCallback(async () => {
    setItems([]);
    await apiFetch("/api/marketplace/cart/clear", { method: "DELETE" });
  }, []);

  const totalItems = items.reduce((acc, i) => acc + i.cantidad, 0);
  const total = items.reduce((acc, i) => acc + i.cantidad * Number(i.producto.basePricePerUnit || 0), 0);

  return (
    <CartContext.Provider
      value={{ items, totalItems, total, loading, addItem, updateCantidad, removeItem, clearCart, fetchCart }}
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
