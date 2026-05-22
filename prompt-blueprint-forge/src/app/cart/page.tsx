"use client";

import Link from "next/link";
import { useApp } from "@/lib/store";
import { getBlueprintById, formatPrice } from "@/lib/data";
import { TrustBadges } from "@/components/TrustBadges";

export default function CartPage() {
  const { cart, removeFromCart, clearCart, user } = useApp();

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
        <p className="text-(--muted) mb-6">Sign in to view your cart.</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const cartItems = cart
    .map((item) => {
      const bp = getBlueprintById(item.blueprintId);
      return bp ? { ...item, blueprint: bp } : null;
    })
    .filter(Boolean);

  const total = cartItems.reduce((sum, item) => sum + item!.blueprint.price, 0);

  if (cartItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="text-4xl mb-4">🛒</div>
        <h1 className="text-2xl font-bold mb-3">Your Cart is Empty</h1>
        <p className="text-(--muted) mb-6">Discover premium blueprints to add to your cart.</p>
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
        >
          Browse Marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-sm text-(--muted)">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-(--muted) hover:text-red-400 transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="space-y-4 mb-8">
        {cartItems.map((item) => (
          <div
            key={item!.blueprint.id}
            className="flex items-center gap-4 p-4 rounded-xl border border-(--border) bg-(--card)"
          >
            <Link href={`/blueprint/${item!.blueprint.id}`} className="flex-shrink-0">
              <div className="w-20 h-16 rounded-lg overflow-hidden">
                <img
                  src={item!.blueprint.image}
                  alt={item!.blueprint.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/blueprint/${item!.blueprint.id}`}
                className="font-medium text-sm hover:text-indigo-400 transition-colors"
              >
                {item!.blueprint.title}
              </Link>
              <div className="text-xs text-(--muted) mt-0.5">
                {item!.blueprint.steps} steps · {item!.blueprint.difficulty}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="font-bold gradient-text">{formatPrice(item!.blueprint.price)}</div>
            </div>
            <button
              onClick={() => removeFromCart(item!.blueprint.id)}
              className="p-2 text-(--muted) hover:text-red-400 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
        <div className="flex items-center justify-between mb-4">
          <span className="text-(--muted)">Subtotal</span>
          <span className="font-bold gradient-text text-xl">{formatPrice(total)}</span>
        </div>
        <div className="mb-4">
          <TrustBadges variant="compact" />
        </div>
        <Link
          href="/checkout"
          className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.98]"
        >
          Proceed to Checkout
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
