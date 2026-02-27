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
            v.literal("social")
        ),
        destination: v.string(), // Encoded payload (URL, vCard string, etc.)
        title: v.string(), // Display name in dashboard
        isActive: v.boolean(),
        customization: v.object({
            fgColor: v.optional(v.string()),
            bgColor: v.optional(v.string()),
            logoUrl: v.optional(v.string()),
            dotStyle: v.optional(v.string()), // "square" | "rounded" | "dots" | "classy"
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
        city: v.optional(v.string()),
        device: v.optional(v.string()), // "mobile" | "tablet" | "desktop"
        browser: v.optional(v.string()),
        os: v.optional(v.string()),
    })
        .index("by_qr_code", ["qrCodeId"])
        .index("by_qr_code_time", ["qrCodeId", "scannedAt"])
        .index("by_user", ["userId"]),
});
