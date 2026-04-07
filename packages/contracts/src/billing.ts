import { z } from "zod";

export const subscriptionStatusSchema = z.enum([
  "trialing",
  "active",
  "past_due",
  "canceled",
  "incomplete",
]);
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;

export const tokenLedgerEntryTypeSchema = z.enum([
  "plan_grant",
  "token_purchase",
  "hold",
  "release",
  "charge",
  "refund",
  "adjustment",
]);
export type TokenLedgerEntryType = z.infer<typeof tokenLedgerEntryTypeSchema>;

export const planSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  monthlyPriceCents: z.number().int().nonnegative(),
  includedTokens: z.number().int().nonnegative(),
  monthlyRunQuota: z.number().int().positive(),
  isActive: z.boolean(),
});
export type Plan = z.infer<typeof planSchema>;

export const tokenWalletSchema = z.object({
  organizationId: z.string().min(1),
  balance: z.number().int(),
  reserved: z.number().int(),
  lifetimeSpent: z.number().int().nonnegative(),
});
export type TokenWallet = z.infer<typeof tokenWalletSchema>;

export const purchaseTokensRequestSchema = z.object({
  organizationId: z.string().min(1),
  tokens: z.number().int().positive().max(1_000_000),
});
export type PurchaseTokensRequest = z.infer<typeof purchaseTokensRequestSchema>;

export const purchaseTokensResponseSchema = z.object({
  tokenPurchaseId: z.string().min(1),
  stripeCheckoutUrl: z.string().url().nullable(),
});
export type PurchaseTokensResponse = z.infer<
  typeof purchaseTokensResponseSchema
>;
