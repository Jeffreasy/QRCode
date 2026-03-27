"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

export type PlanLimits = {
    deviceAnalytics: boolean;
    whatsappEvent: boolean;
    advancedQrTypes: boolean;
};

export type MyPlan = {
    planId: string;
    name: string;
    price: number;
    limits: PlanLimits;
} | null;

/**
 * Returns the authenticated user's active subscription + plan details.
 * Returns null if loading or no subscription exists (defaults to Starter behaviour).
 */
export function useMyPlan(): { plan: MyPlan; isLoading: boolean } {
    const result = useQuery(api.subscriptions.getMySubscription);
    const isLoading = result === undefined;

    if (!result) return { plan: null, isLoading };

    return {
        plan: {
            planId: result.plan?.planId ?? "starter",
            name: result.plan?.name ?? "Starter",
            price: result.plan?.price ?? 14.99,
            limits: {
                deviceAnalytics: result.plan?.limits?.deviceAnalytics ?? false,
                whatsappEvent: result.plan?.limits?.whatsappEvent ?? false,
                advancedQrTypes: result.plan?.limits?.advancedQrTypes ?? false,
            },
        },
        isLoading,
    };
}
