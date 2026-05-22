/**
 * Internationalization (i18n) Preparation Layer
 *
 * This module provides a lightweight translation framework that
 * makes the entire frontend ready for localization without
 * requiring backend re-engineering.
 *
 * Usage:
 *   import { t, setLocale } from "@/lib/i18n";
 *   setLocale("fr");
 *   t("marketplace.title"); // => "Marketplace" (or French translation)
 *
 * To add a new language:
 *   1. Add a new file in src/locales/{lang}.json
 *   2. Import and register it below
 *   3. The entire UI will switch without code changes
 */

import { useCallback, useState } from "react";

// Supported locales
export type Locale = "en" | "fr" | "es" | "de" | "ja" | "zh";

// Translation dictionary shape
type TranslationDict = Record<string, string>;

// Default English strings (complete coverage)
const en: TranslationDict = {
  // Global
  "app.name": "Prompt Blueprint Forge",
  "app.tagline": "The premier marketplace for AI prompt chains and blueprints.",

  // Navigation
  "nav.home": "Home",
  "nav.marketplace": "Marketplace",
  "nav.create": "Create",
  "nav.dashboard": "Dashboard",
  "nav.cart": "Cart",
  "nav.signin": "Sign In",
  "nav.signout": "Sign Out",

  // Home page
  "home.hero.title": "Craft the Perfect Prompt. Every Time.",
  "home.hero.subtitle": "Discover, buy, and sell premium AI prompt chains and blueprints.",
  "home.hero.cta": "Explore Marketplace",
  "home.hero.cta.sell": "Start Selling",
  "home.stats.title": "Platform Statistics",
  "home.featured.title": "Featured Blueprints",
  "home.categories.title": "Browse by Category",

  // Marketplace
  "marketplace.title": "Marketplace",
  "marketplace.search.placeholder": "Search blueprints...",
  "marketplace.filter.category": "Category",
  "marketplace.filter.difficulty": "Difficulty",
  "marketplace.filter.price": "Price Range",
  "marketplace.filter.tags": "Tags",
  "marketplace.filter.model": "Model Compatibility",
  "marketplace.sort": "Sort By",
  "marketplace.sort.newest": "Newest",
  "marketplace.sort.rating": "Highest Rated",
  "marketplace.sort.popular": "Most Popular",
  "marketplace.sort.price_low": "Price: Low to High",
  "marketplace.sort.price_high": "Price: High to Low",
  "marketplace.results": "Showing {count} blueprint(s)",
  "marketplace.empty": "No blueprints found",

  // Blueprint card
  "blueprint.difficulty.beginner": "Beginner",
  "blueprint.difficulty.intermediate": "Intermediate",
  "blueprint.difficulty.advanced": "Advanced",
  "blueprint.sold": "{count} sold",
  "blueprint.steps": "{count} steps",
  "blueprint.add_to_cart": "Add to Cart",
  "blueprint.in_cart": "In Cart",

  // Cart
  "cart.title": "Shopping Cart",
  "cart.empty": "Your cart is empty",
  "cart.checkout": "Proceed to Checkout",
  "cart.total": "Total",
  "cart.remove": "Remove",

  // Checkout
  "checkout.title": "Secure Checkout",
  "checkout.payment": "Payment Method",
  "checkout.card_name": "Cardholder Name",
  "checkout.card_number": "Card Number",
  "checkout.card_expiry": "Expiry Date",
  "checkout.card_cvv": "CVV",
  "checkout.pay": "Pay {amount}",
  "checkout.processing": "Processing Payment...",
  "checkout.summary": "Payment Summary",
  "checkout.subtotal": "Subtotal",
  "checkout.commission": "Platform Commission (20%)",
  "checkout.tax": "Sales Tax",
  "checkout.total": "Total Charged",
  "checkout.success": "Payment Successful!",
  "checkout.success.message": "Your order {order} is confirmed.",
  "checkout.error.declined": "Payment declined by issuer.",
  "checkout.error.lost_card": "Card reported as lost.",
  "checkout.error.duplicate": "This purchase has already been processed.",

  // Dashboard
  "dashboard.welcome": "Welcome, {name}!",
  "dashboard.tab.overview": "Overview",
  "dashboard.tab.listings": "My Listings",
  "dashboard.tab.purchases": "Purchase History",
  "dashboard.tab.subscription": "Subscription",

  // Subscription
  "subscription.plans.title": "Choose a Plan",
  "subscription.active": "Active",
  "subscription.canceled": "Canceled",
  "subscription.past_due": "Past Due",
  "subscription.expired": "Expired",
  "subscription.cancel": "Cancel Subscription",
  "subscription.subscribe": "Subscribe - {price}/mo",

  // Admin
  "admin.title": "Admin Dashboard",
  "admin.tab.overview": "Overview",
  "admin.tab.queue": "Review Queue",
  "admin.tab.transactions": "Transactions",
  "admin.tab.payouts": "Payouts",
  "admin.tab.analytics": "Analytics",

  // Common
  "common.loading": "Loading...",
  "common.error": "An error occurred",
  "common.retry": "Try Again",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.confirm": "Confirm",
  "common.search": "Search",
  "common.filter": "Filter",
  "common.sort": "Sort",
  "common.back": "Back",
  "common.learn_more": "Learn More",
  "common.contact": "Contact Support",
  "common.monthly": "/mo",
  "common.free": "Free",
};

// Language registry
const translations: Record<Locale, TranslationDict> = {
  en,
  fr: {}, // French translations (to be added)
  es: {}, // Spanish translations (to be added)
  de: {}, // German translations (to be added)
  ja: {}, // Japanese translations (to be added)
  zh: {}, // Chinese translations (to be added)
};

// Current locale state (module-level, overridden by provider)
let currentLocale: Locale = "en";

/**
 * Translate a key into the current locale.
 * Falls back to English if the key or translation is missing.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  const dict = translations[currentLocale] || translations.en;
  let value = dict[key] || translations.en[key] || key;

  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(`{${k}}`, String(v));
    }
  }

  return value;
}

/**
 * Change the current locale at runtime.
 */
export function setLocale(locale: Locale): void {
  currentLocale = locale;
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

/**
 * Get the current locale.
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * React hook for locale state management.
 * Use in client components that need to re-render on locale change.
 */
export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>(currentLocale);

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    setLocale(newLocale);
  }, []);

  return {
    locale,
    setLocale: changeLocale,
    t: (key: string, params?: Record<string, string | number>) => {
      const dict = translations[locale] || translations.en;
      let value = dict[key] || translations.en[key] || key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          value = value.replace(`{${k}}`, String(v));
        }
      }
      return value;
    },
  };
}
