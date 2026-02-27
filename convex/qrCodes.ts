import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { customAlphabet } from "nanoid";

const generateSlug = customAlphabet(
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    6
);

function validateUrl(destination: string, type: string): void {
    if (type !== "url" && type !== "file" && type !== "social") return;
    const trimmed = destination.trim();
    if (!trimmed) throw new Error("Destination URL mag niet leeg zijn.");
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
        throw new Error("URL moet beginnen met http:// of https://");
    }
}

// Create a new QR code
export const createQRCode = mutation({
    args: {
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
                backgroundRound: v.optional(v.number()),
                borderEnabled: v.optional(v.boolean()),
                borderColor: v.optional(v.string()),
                borderWidth: v.optional(v.number()),
                borderRadius: v.optional(v.number()),
                logoSize: v.optional(v.number()),
                logoMargin: v.optional(v.number()),
                logoHideDots: v.optional(v.boolean()),
                errorCorrectionLevel: v.optional(v.string()),
            })
        ),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        const userId = identity.subject;

        validateUrl(args.destination, args.type);

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
            userId,
            slug,
            type: args.type,
            destination: args.destination.trim(),
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
        destination: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        const userId = identity.subject;

        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== userId) {
            throw new Error("QR code not found or access denied");
        }
        validateUrl(args.destination, qrCode.type);
        await ctx.db.patch(args.id, {
            destination: args.destination.trim(),
            updatedAt: Date.now(),
        });
    },
});

// Update title
export const updateTitle = mutation({
    args: {
        id: v.id("qr_codes"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        const userId = identity.subject;

        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== userId) {
            throw new Error("QR code not found or access denied");
        }
        await ctx.db.patch(args.id, { title: args.title, updatedAt: Date.now() });
    },
});

// Update customization (colors, logo, dot style)
export const updateCustomization = mutation({
    args: {
        id: v.id("qr_codes"),
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
            backgroundRound: v.optional(v.number()),
            borderEnabled: v.optional(v.boolean()),
            borderColor: v.optional(v.string()),
            borderWidth: v.optional(v.number()),
            borderRadius: v.optional(v.number()),
            logoSize: v.optional(v.number()),
            logoMargin: v.optional(v.number()),
            logoHideDots: v.optional(v.boolean()),
            errorCorrectionLevel: v.optional(v.string()),
        }),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        const userId = identity.subject;

        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== userId) {
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
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        const userId = identity.subject;

        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== userId) {
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
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        const userId = identity.subject;

        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== userId) {
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

// List all QR codes for the authenticated user (with optional cursor pagination)
export const listByUser = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const limit = args.limit ?? 100;
        return await ctx.db
            .query("qr_codes")
            .withIndex("by_user", (q) => q.eq("userId", identity.subject))
            .order("desc")
            .take(limit);
    },
});

// Duplicate an existing QR code with a new slug and title
export const duplicateQRCode = mutation({
    args: {
        id: v.id("qr_codes"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        const userId = identity.subject;

        const source = await ctx.db.get(args.id);
        if (!source || source.userId !== userId) {
            throw new Error("QR code niet gevonden of geen toegang.");
        }

        // Generate a unique new slug
        let slug = generateSlug();
        let existing = await ctx.db
            .query("qr_codes")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();
        while (existing) {
            slug = generateSlug();
            existing = await ctx.db
                .query("qr_codes")
                .withIndex("by_slug", (q) => q.eq("slug", slug))
                .first();
        }

        const now = Date.now();
        const newId = await ctx.db.insert("qr_codes", {
            userId,
            slug,
            type: source.type,
            destination: source.destination,
            title: `${source.title} (kopie)`,
            isActive: false, // start as inactive to avoid accidental redirects
            customization: source.customization,
            totalScans: 0,
            createdAt: now,
            updatedAt: now,
        });

        return { id: newId, slug };
    },
});

// Get a single QR code by ID (for dashboard detail view)
export const getById = query({
    args: { id: v.id("qr_codes") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const qrCode = await ctx.db.get(args.id);
        if (!qrCode || qrCode.userId !== identity.subject) return null;
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
