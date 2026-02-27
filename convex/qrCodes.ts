import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { customAlphabet } from "nanoid";

const generateSlug = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    6
);

// Create a new QR code
export const createQRCode = mutation({
    args: {
        userId: v.string(),
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
        destination: v.string(),
        title: v.string(),
        customization: v.optional(
            v.object({
                fgColor: v.optional(v.string()),
                bgColor: v.optional(v.string()),
                logoUrl: v.optional(v.string()),
                dotStyle: v.optional(v.string()),
                errorCorrectionLevel: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        // Generate a unique slug
        let slug = generateSlug();
        let existing = await ctx.db
            .query("qr_codes")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();

        // Retry if collision (very rare with 62^6 = 56B possibilities)
        while (existing) {
            slug = generateSlug();
            existing = await ctx.db
                .query("qr_codes")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .first();
        }

        const now = Date.now();
        const id = await ctx.db.insert("qr_codes", {
            userId: args.userId,
            slug,
            type: args.type,
            destination: args.destination,
            title: args.title,
            isActive: true,
            customization: args.customization ?? {},
            totalScans: 0,
            createdAt: now,
            updatedAt: now,
        });

        return { id, slug };
    },
});

// Update destination URL (core of "dynamic" QR)
export const updateDestination = mutation({
    args: {
        id: v.id("qr_codes"),
        userId: v.string(),
        destination: v.string(),
    },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== args.userId) {
            throw new Error("QR code not found or access denied");
        }
        await ctx.db.patch(args.id, {
            destination: args.destination,
            updatedAt: Date.now(),
        });
    },
});

// Update title
export const updateTitle = mutation({
    args: {
        id: v.id("qr_codes"),
        userId: v.string(),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== args.userId) {
            throw new Error("QR code not found or access denied");
        }
        await ctx.db.patch(args.id, { title: args.title, updatedAt: Date.now() });
    },
});

// Update customization (colors, logo, dot style)
export const updateCustomization = mutation({
    args: {
        id: v.id("qr_codes"),
        userId: v.string(),
        customization: v.object({
            fgColor: v.optional(v.string()),
            bgColor: v.optional(v.string()),
            logoUrl: v.optional(v.string()),
            dotStyle: v.optional(v.string()),
            errorCorrectionLevel: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== args.userId) {
            throw new Error("QR code not found or access denied");
        }
        await ctx.db.patch(args.id, {
            customization: args.customization,
            updatedAt: Date.now(),
        });
    },
});

// Toggle active/inactive
export const toggleActive = mutation({
    args: {
        id: v.id("qr_codes"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== args.userId) {
            throw new Error("QR code not found or access denied");
        }
        await ctx.db.patch(args.id, {
            isActive: !qrCode.isActive,
            updatedAt: Date.now(),
        });
    },
});

// Delete a QR code (and its scan events)
export const deleteQRCode = mutation({
    args: {
        id: v.id("qr_codes"),
        userId: v.string(),
    },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== args.userId) {
            throw new Error("QR code not found or access denied");
        }
        // Delete all scan events for this QR code
        const events = await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code", (q) => q.eq("qrCodeId", args.id))
            .collect();
        await Promise.all(events.map((e) => ctx.db.delete(e._id)));
        await ctx.db.delete(args.id);
    },
});

// List all QR codes for a user
export const listByUser = query({
    args: { userId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("qr_codes")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .collect();
    },
});

// Get a single QR code by ID (for dashboard detail view)
export const getById = query({
    args: { id: v.id("qr_codes"), userId: v.string() },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== args.userId) return null;
        return qrCode;
    },
});

// Public lookup by slug (used by redirect middleware)
export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("qr_codes")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});
