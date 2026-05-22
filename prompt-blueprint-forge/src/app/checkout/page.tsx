"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/lib/store";
import { getBlueprintById, getBlueprintAuthor, formatPrice, calculateNetEarnings } from "@/lib/data";
import { TrustBadges } from "@/components/TrustBadges";

export default function CheckoutPage() {
  const { cart, clearCart, user } = useApp();
  const router = useRouter();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    orderNumber: string;
    totalPaid: number;
    itemCount: number;
  } | null>(null);

  // Mock payment form state
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvv, setCardCvv] = useState("123");
  const [cardName, setCardName] = useState("");

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-2xl font-bold mb-3">Sign In Required</h1>
        <p className="text-(--muted) mb-6">Sign in to checkout.</p>
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const cartItems = useMemo(
    () =>
      cart
        .map((item) => {
          const bp = getBlueprintById(item.blueprintId);
          return bp ? { ...item, blueprint: bp } : null;
        })
        .filter(Boolean),
    [cart]
  );

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + item!.blueprint.price, 0),
    [cartItems]
  );

  const totalCommission = useMemo(
    () => cartItems.reduce((sum, item) => {
      const net = calculateNetEarnings(item!.blueprint.price);
      return sum + net.platformFee;
    }, 0),
    [cartItems]
  );

  const totalSellerRevenue = useMemo(
    () => cartItems.reduce((sum, item) => {
      const net = calculateNetEarnings(item!.blueprint.price);
      return sum + net.netAmount;
    }, 0),
    [cartItems]
  );

  const handlePurchase = async () => {
    if (!user) return;

    setProcessing(true);
    setError(null);

    // Generate unique idempotency key: user_timestamp_random
    const idempotencyKey = `order_${user.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    try {
      const res = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cartItems.map((item) => item!.blueprint.id),
          buyerId: user.id,
          idempotencyKey,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        clearCart();
        setResult({
          orderNumber: data.orderNumber,
          totalPaid: data.totalPaid,
          itemCount: data.itemsPurchased,
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setError(data.error || "Payment failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setProcessing(false);
    }
  };

  // ================================================================
  // SUCCESS STATE
  // ================================================================
  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-sm text-(--muted) mb-1">
          Your order <span className="font-mono text-indigo-400">{result.orderNumber}</span> is confirmed.
        </p>
        <p className="text-sm text-(--muted) mb-8">
          {result.itemCount} blueprint{result.itemCount > 1 ? "s" : ""} purchased for {formatPrice(result.totalPaid)}
        </p>
        <p className="text-xs text-(--muted) mb-8">
          A confirmation has been logged. Check your dashboard to access your purchases.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition-all"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-(--border) text-(--foreground) font-semibold transition-all hover:bg-(--card-hover)"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // ================================================================
  // EMPTY CART — Redirect
  // ================================================================
  if (cartItems.length === 0) {
    router.push("/cart");
    return null;
  }

  // ================================================================
  // CHECKOUT FORM
  // ================================================================
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="mb-6">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1 text-sm text-(--muted) hover:text-(--foreground) transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
          Back to Cart
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-8">Secure Checkout</h1>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
          </svg>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* LEFT COLUMN: Payment Form + Order Items */}
        <div className="lg:col-span-3 space-y-6">
          {/* Payment Form */}
          <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
            <h2 className="font-semibold mb-4">Payment Method</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Cardholder Name</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                    className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 font-mono tracking-wider"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <div className="w-8 h-5 rounded bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[8px] font-bold">
                      MC
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Expiry Date</label>
                  <input
                    type="text"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">CVV</label>
                  <input
                    type="text"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className="w-full px-4 py-2.5 rounded-xl border border-(--border) bg-(--background) text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                <p className="text-xs text-amber-500 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                  </svg>
                  Demo mode: Use card ending in <strong>0000</strong> to simulate a declined payment.
                </p>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {cartItems.map((item) => {
                const author = getBlueprintAuthor(item!.blueprint);
                const earnings = calculateNetEarnings(item!.blueprint.price);
                return (
                  <div
                    key={item!.blueprint.id}
                    className="p-4 rounded-xl border border-(--border) bg-(--card-hover)"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{item!.blueprint.title}</div>
                        <div className="text-xs text-(--muted)">
                          by {author?.name || "Unknown"} · {item!.blueprint.steps} steps
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-bold">{formatPrice(item!.blueprint.price)}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-(--muted) pt-2 border-t border-(--border)">
                      <span>Platform fee (20%): {formatPrice(earnings.platformFee)}</span>
                      <span>Seller receives: <span className="text-emerald-500">{formatPrice(earnings.netAmount)}</span></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Summary + Pay Button */}
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-6">
            {/* Buyer Info */}
            <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
              <h2 className="font-semibold mb-3">Buyer</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0)}
                </div>
                <div className="text-sm">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-xs text-(--muted)">{user.email}</div>
                </div>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="p-6 rounded-2xl border border-(--border) bg-(--card)">
              <h2 className="font-semibold mb-4">Payment Summary</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-(--muted)">Subtotal ({cartItems.length} item{cartItems.length > 1 ? "s" : ""})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-(--muted)">Platform Commission (20%)</span>
                  <span className="text-amber-500">{formatPrice(totalCommission)}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-(--border)">
                  <span className="text-(--muted)">Total Charged to You</span>
                  <span className="font-bold gradient-text text-lg">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                  </svg>
                  <div className="text-xs text-(--muted)">
                    <span className="text-indigo-400 font-medium">Seller Earnings:</span>{" "}
                    Sellers receive <strong>{formatPrice(totalSellerRevenue)}</strong> of the{" "}
                    {formatPrice(total)} total. The 20% commission covers platform operations,
                    payment processing, and creator tools.
                  </div>
                </div>
              </div>
            </div>

            {/* Pay Button */}
            <button
              onClick={handlePurchase}
              disabled={processing}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-500/50 text-white font-semibold transition-all hover:shadow-xl hover:shadow-indigo-500/25 active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {processing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing Payment...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                  </svg>
                  Pay {formatPrice(total)}
                </>
              )}
            </button>

            <p className="text-xs text-center text-(--muted)">
              Secured by <span className="text-indigo-400">PromptForge Payments</span>
            </p>

            <div className="pt-2">
              <TrustBadges variant="compact" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
