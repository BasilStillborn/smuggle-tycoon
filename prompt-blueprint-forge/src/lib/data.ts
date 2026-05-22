import blueprintsData from "../../data/blueprints.json";
import usersData from "../../data/users.json";
import categoriesData from "../../data/categories.json";
import sellerPayoutsData from "../../data/seller-payouts.json";
import transactionsData from "../../data/transactions.json";
import purchasesData from "../../data/purchases.json";
import subscriptionsData from "../../data/subscriptions.json";
import type { Blueprint, User, Category, SellerPayout, Transaction, Purchase, Subscription } from "./types";

export function getBlueprints(): Blueprint[] {
  return blueprintsData as Blueprint[];
}

export function getApprovedBlueprints(): Blueprint[] {
  return (blueprintsData as Blueprint[]).filter(
    (bp) => bp.submissionStatus === "approved"
  );
}

export function getBlueprintById(id: string): Blueprint | undefined {
  return (blueprintsData as Blueprint[]).find((bp) => bp.id === id);
}

export function incrementBlueprintSales(id: string): boolean {
  const bp = getBlueprintById(id);
  if (!bp) return false;
  bp.sales = (bp.sales || 0) + 1;
  return true;
}

export function getFeaturedBlueprints(): Blueprint[] {
  return (blueprintsData as Blueprint[]).filter(
    (bp) => bp.featured && bp.submissionStatus === "approved"
  );
}

export function getBlueprintsByCategory(categoryId: string): Blueprint[] {
  return (blueprintsData as Blueprint[]).filter(
    (bp) => bp.categoryId === categoryId
  );
}

export function getBlueprintsByAuthor(authorId: string): Blueprint[] {
  return (blueprintsData as Blueprint[]).filter(
    (bp) => bp.authorId === authorId
  );
}

export function getUsers(): User[] {
  return usersData as User[];
}

export function getUserById(id: string): User | undefined {
  return (usersData as User[]).find((u) => u.id === id);
}

export function getAdminUser(): User | undefined {
  return (usersData as User[]).find((u) => u.role === "admin");
}

export function getCategories(): Category[] {
  return categoriesData as Category[];
}

export function getCategoryById(id: string): Category | undefined {
  return (categoriesData as Category[]).find((c) => c.id === id);
}

export function searchBlueprints(query: string): Blueprint[] {
  const q = query.toLowerCase();
  return (blueprintsData as Blueprint[]).filter(
    (bp) =>
      bp.submissionStatus === "approved" &&
      (bp.title.toLowerCase().includes(q) ||
        bp.description.toLowerCase().includes(q) ||
        bp.tags.some((t) => t.toLowerCase().includes(q)))
  );
}

export function getBlueprintAuthor(blueprint: Blueprint): User | undefined {
  return getUserById(blueprint.authorId);
}

export function getBlueprintCategory(blueprint: Blueprint): Category | undefined {
  return getCategoryById(blueprint.categoryId);
}

export function getSellerPayouts(): SellerPayout[] {
  return sellerPayoutsData as SellerPayout[];
}

export function getPayoutsBySeller(sellerId: string): SellerPayout[] {
  return (sellerPayoutsData as SellerPayout[]).filter(
    (p) => p.sellerId === sellerId
  );
}

export function getPendingPayouts(): SellerPayout[] {
  return (sellerPayoutsData as SellerPayout[]).filter(
    (p) => p.status === "pending_payout"
  );
}

export function getTransactions(): Transaction[] {
  return transactionsData as Transaction[];
}

export function getTransactionsByBuyer(buyerId: string): Transaction[] {
  return (transactionsData as Transaction[]).filter(
    (t) => t.buyerId === buyerId
  );
}

export function getSuccessfulTransactions(): Transaction[] {
  return (transactionsData as Transaction[]).filter(
    (t) => t.status === "success"
  );
}

export function getPurchases(): Purchase[] {
  return purchasesData as Purchase[];
}

export function getPurchasesByUser(userId: string): Purchase[] {
  return (purchasesData as Purchase[]).filter((p) => p.userId === userId);
}

export function getPlatformRevenue(): number {
  return (transactionsData as Transaction[])
    .filter((t) => t.status === "success")
    .reduce((sum, t) => sum + t.platformFeeAmount, 0);
}

export function calculateNetEarnings(
  price: number,
  commissionRate: number = 0.2
): { platformFee: number; netAmount: number } {
  const platformFee = price * commissionRate;
  return {
    platformFee,
    netAmount: price - platformFee,
  };
}

export function getSubscriptionByUser(userId: string): Subscription | undefined {
  return (subscriptionsData as Subscription[]).find((s) => s.userId === userId);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatSalesCount(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1) + "k";
  }
  return count.toString();
}
