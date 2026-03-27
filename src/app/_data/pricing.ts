/**
 * Type definitions for plan data coming from Convex.
 * The actual plan data lives in Convex — this file only exports the type.
 */
export interface PricingFeature {
    text: string;
    included: boolean;
}

export interface PricingTier {
    id: "starter" | "pro";
    name: string;
    price: number;
    period: string;
    description: string;
    badge?: string;
    highlighted: boolean;
    features: PricingFeature[];
    cta: string;
    ctaHref: string;
}
