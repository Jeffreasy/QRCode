import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    qr_codes: defineTable({
        userId: v.string(), // Clerk user ID
        slug: v.string(), // Unique short code e.g. "AbCd3F"
        type: v.union(
            v.literal("url"),
            v.literal("vcard"),
            v.literal("wifi"),
            v.literal("text"),
            v.literal("email"),
            v.literal("sms"),
            v.literal("file"),
            v.literal("social"),
            v.literal("whatsapp"),
            v.literal("event")
        ),
        destination: v.string(), // Encoded payload (URL, vCard string, etc.)
        title: v.string(), // Display name in dashboard
        isActive: v.boolean(),
        customization: v.object({
            fgColor: v.optional(v.string()),
            bgColor: v.optional(v.string()),
            logoUrl: v.optional(v.string()),
            dotStyle: v.optional(v.union(
                v.literal("square"),
                v.literal("rounded"),
                v.literal("dots"),
                v.literal("classy"),
                v.literal("classy-rounded"),
                v.literal("extra-rounded")
            )),
            cornerColor: v.optional(v.string()),
            cornerSquareType: v.optional(v.union(
                v.literal("square"),
                v.literal("dot"),
                v.literal("extra-rounded")
            )),
            cornerDotType: v.optional(v.union(
                v.literal("square"),
                v.literal("dot")
            )),
            qrShape: v.optional(v.union(
                v.literal("square"),
                v.literal("circle")
            )),
            backgroundRound: v.optional(v.number()), // 0-1
            // Border (CSS-level frame around the white QR background)
            borderEnabled: v.optional(v.boolean()),
            borderColor: v.optional(v.string()),
            borderWidth: v.optional(v.number()), // px
            borderRadius: v.optional(v.number()), // px
            // Logo image options
            logoSize: v.optional(v.number()),   // 0.1 – 0.5 (imageSize)
            logoMargin: v.optional(v.number()), // 0 – 20 (margin px)
            logoHideDots: v.optional(v.boolean()), // hideBackgroundDots
            errorCorrectionLevel: v.optional(v.string()), // "L" | "M" | "Q" | "H"
        }),
        totalScans: v.number(),
        createdAt: v.number(),
        updatedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_slug", ["slug"])
        .index("by_user_active", ["userId", "isActive"]),

    scan_events: defineTable({
        qrCodeId: v.id("qr_codes"),
        userId: v.string(), // For efficient user-scoped queries
        scannedAt: v.number(),
        country: v.optional(v.string()),
        region: v.optional(v.string()),  // Province / state
        city: v.optional(v.string()),
        device: v.optional(v.string()), // "mobile" | "tablet" | "desktop"
        browser: v.optional(v.string()),
        os: v.optional(v.string()),
        referrer: v.optional(v.string()), // "Direct" | "Instagram" | "Google" | etc.
    })
        .index("by_qr_code", ["qrCodeId"])
        .index("by_qr_code_time", ["qrCodeId", "scannedAt"])
        .index("by_user", ["userId"])
        .index("by_user_time", ["userId", "scannedAt"]),

    // Plan tier definitions — seeded via seedPlans mutation, rarely changed
    plans: defineTable({
        planId: v.string(),       // "starter" | "pro" | "business"
        name: v.string(),
        price: v.number(),        // monthly price in EUR
        period: v.string(),       // "per maand"
        description: v.string(),
        badge: v.optional(v.string()),
        highlighted: v.boolean(),
        ctaText: v.string(),
        ctaHref: v.string(),
        features: v.array(v.object({ text: v.string(), included: v.boolean() })),
        limits: v.object({
            // Required in new plans — optional for backwards compat during migration
            deviceAnalytics: v.optional(v.boolean()),
            whatsappEvent: v.optional(v.boolean()),
            advancedQrTypes: v.optional(v.boolean()),
            // Legacy fields — removed after seed migration
            bulkMax: v.optional(v.union(v.number(), v.null())),
            landingPages: v.optional(v.boolean()),
            apiAccess: v.optional(v.boolean()),
            whiteLabel: v.optional(v.boolean()),
        }),
        sortOrder: v.number(),
    }).index("by_planId", ["planId"]),

    // User subscriptions — Stripe-ready, single row per user
    subscriptions: defineTable({
        userId: v.string(),                        // Clerk userId
        planId: v.string(),                        // ref to plans.planId
        status: v.union(
            v.literal("active"),
            v.literal("cancelled"),
            v.literal("trialing"),
        ),
        stripeSubscriptionId: v.optional(v.string()),
        currentPeriodEnd: v.optional(v.number()),  // Unix timestamp
        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),
});
