export type SubmissionStatus = "pending_review" | "approved" | "rejected";
export type PayoutStatus = "pending_payout" | "paid_out";
export type TransactionStatus = "success" | "failed" | "refunded";
export type UserRole = "admin" | "creator" | "buyer";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedDate: string;
  role: UserRole;
  stripeConnectId?: string;
  stripeAccountStatus?: StripeAccountStatus;
}

export type StripeAccountStatus = "none" | "pending" | "onboarding" | "active" | "rejected";

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  color: string;
}

export interface Blueprint {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  categoryId: string;
  authorId: string;
  rating: number;
  reviewCount: number;
  sales: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  createdAt: string;
  updatedAt: string;
  image: string;
  featured: boolean;
  steps: number;
  tokens: number;
  compatibleModels: string[];
  includes: string[];
  submissionStatus: SubmissionStatus;
  reviewNotes: string;
  platformCommissionRate: number;
}

export interface PendingBlueprint {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  price: number;
  categoryId: string;
  authorId: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  createdAt: string;
  updatedAt?: string;
  image: string;
  steps: number;
  tokens: number;
  compatibleModels: string[];
  includes: string[];
  submissionStatus: "pending_review" | "rejected";
  reviewNotes: string;
  platformCommissionRate: number;
}

export interface Transaction {
  transactionId: string;
  purchaseId: string;
  buyerId: string;
  blueprintId: string;
  amountPaid: number;
  platformFeeAmount: number;
  sellerNetRevenue: number;
  timestamp: string;
  status: TransactionStatus;
}

export interface SellerPayout {
  payoutId: string;
  sellerId: string;
  amountEarned: number;
  platformFee: number;
  netAmount: number;
  dateRecorded: string;
  status: PayoutStatus;
  blueprintId: string;
  purchaseId: string;
}

export interface CartItem {
  blueprintId: string;
  addedAt: string;
}

export interface Review {
  id: string;
  blueprintId: string;
  userId: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Purchase {
  id: string;
  blueprintId: string;
  userId: string;
  purchaseDate: string;
  amount: number;
  platformFee: number;
  sellerPayoutId: string;
  transactionId: string;
}

export type SubscriptionPlan = "basic" | "pro" | "enterprise";
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "expired";

export interface SubscriptionPlanInfo {
  id: SubscriptionPlan;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  canceledAt?: string;
  autoRenew: boolean;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlanInfo[] = [
  { id: "basic", name: "Basic", price: 9.99, description: "Essential access for casual buyers", features: ["Browse marketplace", "Purchase blueprints", "Basic support"] },
  { id: "pro", name: "Pro", price: 19.99, description: "For power users and creators", features: ["Everything in Basic", "Early access to new blueprints", "Priority support", "Creator analytics"] },
  { id: "enterprise", name: "Enterprise", price: 49.99, description: "For teams and organizations", features: ["Everything in Pro", "Team accounts (up to 5)", "API access", "Custom blueprint requests", "Dedicated account manager"] },
];
