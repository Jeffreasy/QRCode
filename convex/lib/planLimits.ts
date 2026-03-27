import { ConvexError } from "convex/values";
import { MutationCtx, QueryCtx } from "../_generated/server";

export type PlanLimits = {
    deviceAnalytics: boolean;
    whatsappEvent: boolean;
    advancedQrTypes: boolean; // file & social QR types
};

/** Default limits applied when a user has no subscription (equivalent to Starter). */
const STARTER_LIMITS: PlanLimits = {
    deviceAnalytics: false,
    whatsappEvent: false,
    advancedQrTypes: false,
};

/**
 * Resolve the plan limits for a given userId.
 * Falls back to Starter limits if no subscription exists.
 */
export async function getPlanLimits(
    ctx: QueryCtx | MutationCtx,
    userId: string
): Promise<PlanLimits> {
    const sub = await ctx.db
        .query("subscriptions")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

    if (!sub || sub.status === "cancelled") return STARTER_LIMITS;

    const plan = await ctx.db
        .query("plans")
        .withIndex("by_planId", (q) => q.eq("planId", sub.planId))
        .first();

    if (!plan) return STARTER_LIMITS;

    // Map optional schema fields to required PlanLimits booleans
    return {
        deviceAnalytics: plan.limits.deviceAnalytics ?? false,
        whatsappEvent: plan.limits.whatsappEvent ?? false,
        advancedQrTypes: plan.limits.advancedQrTypes ?? false,
    };
}

/**
 * Assert that the user's plan includes a given boolean feature.
 * Throws a ConvexError (shown as a user-facing error) if not allowed.
 */
export async function assertFeature(
    ctx: QueryCtx | MutationCtx,
    userId: string,
    feature: keyof PlanLimits
): Promise<void> {
    const limits = await getPlanLimits(ctx, userId);
    if (!limits[feature]) {
        throw new ConvexError(
            `Dit feature is niet beschikbaar in jouw huidige plan. Upgrade naar Pro of Business om toegang te krijgen.`
        );
    }
}
