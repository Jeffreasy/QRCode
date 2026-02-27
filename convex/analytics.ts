import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Log a scan event (called from the redirect API route)
export const logScan = mutation({
    args: {
        qrCodeId: v.id("qr_codes"),
        userId: v.string(),
        country: v.optional(v.string()),
        city: v.optional(v.string()),
        device: v.optional(v.string()),
        browser: v.optional(v.string()),
        os: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("scan_events", {
            qrCodeId: args.qrCodeId,
            userId: args.userId,
            scannedAt: Date.now(),
            country: args.country,
            city: args.city,
            device: args.device,
            browser: args.browser,
            os: args.os,
        });
        // Increment total scan counter on the QR code
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (qrCode) {
            await ctx.db.patch(args.qrCodeId, {
                totalScans: qrCode.totalScans + 1,
            });
        }
    },
});

// Get aggregate stats for a single QR code
export const getScanStats = query({
    args: { qrCodeId: v.id("qr_codes"), userId: v.string() },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (!qrCode || qrCode.userId !== args.userId) return null;

        const events = await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code", (q) => q.eq("qrCodeId", args.qrCodeId))
            .collect();

        // Device breakdown
        const deviceCounts: Record<string, number> = {};
        const browserCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};

        for (const e of events) {
            const dev = e.device ?? "Unknown";
            const br = e.browser ?? "Unknown";
            const co = e.country ?? "Unknown";
            deviceCounts[dev] = (deviceCounts[dev] ?? 0) + 1;
            browserCounts[br] = (browserCounts[br] ?? 0) + 1;
            countryCounts[co] = (countryCounts[co] ?? 0) + 1;
        }

        return {
            total: events.length,
            deviceBreakdown: deviceCounts,
            browserBreakdown: browserCounts,
            countryBreakdown: countryCounts,
        };
    },
});

// Get scans per day for the last N days (for line chart)
export const getScansByDay = query({
    args: {
        qrCodeId: v.id("qr_codes"),
        userId: v.string(),
        days: v.number(),
    },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (!qrCode || qrCode.userId !== args.userId) return [];

        const since = Date.now() - args.days * 24 * 60 * 60 * 1000;

        const events = await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code_time", (q) =>
                q.eq("qrCodeId", args.qrCodeId).gte("scannedAt", since)
            )
            .collect();

        // Group by date string (YYYY-MM-DD)
        const byDay: Record<string, number> = {};

        // Pre-fill all days with 0
        for (let i = 0; i < args.days; i++) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            const key = d.toISOString().split("T")[0];
            byDay[key] = 0;
        }

        for (const e of events) {
            const key = new Date(e.scannedAt).toISOString().split("T")[0];
            if (byDay[key] !== undefined) {
                byDay[key] += 1;
            }
        }

        return Object.entries(byDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));
    },
});

// Get recent scans for a QR code (for event feed)
export const getRecentScans = query({
    args: { qrCodeId: v.id("qr_codes"), userId: v.string(), limit: v.number() },
    handler: async (ctx, args) => {
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (!qrCode || qrCode.userId !== args.userId) return [];

        return await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code_time", (q) =>
                q.eq("qrCodeId", args.qrCodeId)
            )
            .order("desc")
            .take(args.limit);
    },
});
