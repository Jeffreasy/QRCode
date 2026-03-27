import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get the authenticated user's active subscription + plan limits.
 * Returns null if no subscription exists (treat as free/starter access).
 */
export const getMySubscription = query({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const sub = await ctx.db
            .query("subscriptions")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        if (!sub) return null;

        const plan = await ctx.db
            .query("plans")
            .withIndex("by_planId", (q) => q.eq("planId", sub.planId))
            .first();

        return { subscription: sub, plan };
    },
});

/**
 * Assign or update a user's subscription plan.
 * Called internally (e.g., from a Stripe webhook handler).
 */
export const assignPlan = mutation({
    args: {
        planId: v.string(),
        status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("trialing")),
        stripeSubscriptionId: v.optional(v.string()),
        currentPeriodEnd: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");

        const existing = await ctx.db
            .query("subscriptions")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .first();

        const now = Date.now();

        if (existing) {
            await ctx.db.patch(existing._id, {
                planId: args.planId,
                status: args.status,
                ...(args.stripeSubscriptionId ? { stripeSubscriptionId: args.stripeSubscriptionId } : {}),
                ...(args.currentPeriodEnd ? { currentPeriodEnd: args.currentPeriodEnd } : {}),
                updatedAt: now,
            });
        } else {
            await ctx.db.insert("subscriptions", {
                userId: identity.subject,
                planId: args.planId,
                status: args.status,
                stripeSubscriptionId: args.stripeSubscriptionId,
                currentPeriodEnd: args.currentPeriodEnd,
                createdAt: now,
                updatedAt: now,
            });
        }
    },
});
