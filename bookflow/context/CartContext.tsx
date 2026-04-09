"use client";

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react";

export type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  format: string;
  slug: string;
  cover_image_url: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
};

type CartAction =
  | { type: "ADD"; item: CartItem }
  | { type: "REMOVE"; id: string; format: string }
  | { type: "UPDATE_QTY"; id: string; format: string; quantity: number }
  | { type: "CLEAR" }
  | { type: "HYDRATE"; items: CartItem[] };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return { items: action.items };
    case "ADD": {
      const existing = state.items.find(
        (i) => i.id === action.item.id && i.format === action.item.format
      );
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === action.item.id && i.format === action.item.format
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }
      return { items: [...state.items, action.item] };
    }
    case "REMOVE":
      return {
        items: state.items.filter(
          (i) => !(i.id === action.id && i.format === action.format)
        ),
      };
    case "UPDATE_QTY":
      return {
        items: state.items.map((i) =>
          i.id === action.id && i.format === action.format
            ? { ...i, quantity: Math.max(1, action.quantity) }
            : i
        ),
      };
    case "CLEAR":
      return { items: [] };
    default:
      return state;
  }
}

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string, format: string) => void;
  updateQty: (id: string, format: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookflow_cart");
      if (saved) {
        dispatch({ type: "HYDRATE", items: JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem("bookflow_cart", JSON.stringify(state.items));
  }, [state.items]);

  const count = state.items.reduce((acc, i) => acc + i.quantity, 0);
  const total = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items: state.items,
        count,
        total,
        addItem: (item) => dispatch({ type: "ADD", item }),
        removeItem: (id, format) => dispatch({ type: "REMOVE", id, format }),
        updateQty: (id, format, quantity) =>
          dispatch({ type: "UPDATE_QTY", id, format, quantity }),
        clearCart: () => dispatch({ type: "CLEAR" }),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
