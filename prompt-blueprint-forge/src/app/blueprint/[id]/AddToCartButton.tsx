"use client";

import { useApp } from "@/lib/store";
import { getBlueprintById } from "@/lib/data";

export function AddToCartButton({ blueprintId }: { blueprintId: string }) {
  const { isAuthenticated, isInCart, addToCart, removeFromCart } = useApp();
  const blueprint = getBlueprintById(blueprintId);
  const inCart = isInCart(blueprintId);

  if (!blueprint) return null;

  if (!isAuthenticated) {
    return (
      <a
        href="/auth/login"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
      >
        Sign In to Purchase
      </a>
    );
  }

  if (inCart) {
    return (
      <button
        onClick={() => removeFromCart(blueprintId)}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold transition-all active:scale-[0.98]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
        Remove from Cart
      </button>
    );
  }

  return (
    <button
      onClick={() => addToCart(blueprintId)}
      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all hover:shadow-lg hover:shadow-indigo-500/25 active:scale-[0.98]"
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
      </svg>
      Add to Cart
    </button>
  );
}
