import { v } from "convex/values";
import { internalMutation, query } from "./_generated/server";

/** Normalize country names to fix ipapi.co inconsistencies (e.g., "The Netherlands" → "Netherlands"). */
function normalizeCountry(raw: string | undefined): string {
    if (!raw) return "Unknown";
    const ALIASES: Record<string, string> = {
        "The Netherlands": "Netherlands",
        "Russian Federation": "Russia",
        "Korea, Republic of": "South Korea",
        "United States of America": "United States",
    };
    return ALIASES[raw] ?? raw;
}

// Log a scan event — internal only, called via Convex action from the redirect route.
// Not exposed on the public HTTP API to prevent scan data injection.
export const logScan = internalMutation({
    args: {
        qrCodeId: v.id("qr_codes"),
        userId: v.string(),
        country: v.optional(v.string()),
        region: v.optional(v.string()),
        city: v.optional(v.string()),
        device: v.optional(v.string()),
        browser: v.optional(v.string()),
        os: v.optional(v.string()),
        referrer: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("scan_events", {
            qrCodeId: args.qrCodeId,
            userId: args.userId,
            scannedAt: Date.now(),
            country: args.country,
            region: args.region,
            city: args.city,
            device: args.device,
            browser: args.browser,
            os: args.os,
            referrer: args.referrer,
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
    args: { qrCodeId: v.id("qr_codes") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (!qrCode || qrCode.userId !== identity.subject) return null;

        // Guard: cap at 10k events to prevent OOM on very popular QR codes.
        // For heavy QR codes, aggregate tables should be used instead.
        const events = await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code", (q) => q.eq("qrCodeId", args.qrCodeId))
            .take(10_000);

        const deviceCounts: Record<string, number> = {};
        const browserCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};
        const cityCounts: Record<string, number> = {};
        const regionCounts: Record<string, number> = {};
        const osCounts: Record<string, number> = {};
        const referrerCounts: Record<string, number> = {};

        for (const e of events) {
            const dev = e.device ?? "Unknown";
            const br = e.browser ?? "Unknown";
            const co = normalizeCountry(e.country);
            const ci = e.city ?? "Unknown";
            const re = e.region ?? "Unknown";
            const os = e.os ?? "Unknown";
            const ref = e.referrer ?? "Direct";
            deviceCounts[dev] = (deviceCounts[dev] ?? 0) + 1;
            browserCounts[br] = (browserCounts[br] ?? 0) + 1;
            countryCounts[co] = (countryCounts[co] ?? 0) + 1;
            cityCounts[ci] = (cityCounts[ci] ?? 0) + 1;
            regionCounts[re] = (regionCounts[re] ?? 0) + 1;
            osCounts[os] = (osCounts[os] ?? 0) + 1;
            referrerCounts[ref] = (referrerCounts[ref] ?? 0) + 1;
        }

        return {
            total: events.length,
            deviceBreakdown: deviceCounts,
            browserBreakdown: browserCounts,
            countryBreakdown: countryCounts,
            cityBreakdown: cityCounts,
            regionBreakdown: regionCounts,
            osBreakdown: osCounts,
            referrerBreakdown: referrerCounts,
        };
    },
});

// Get scans per day for the last N days (for bar chart)
export const getScansByDay = query({
    args: {
        qrCodeId: v.id("qr_codes"),
        days: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (!qrCode || qrCode.userId !== identity.subject) return [];

        const since = Date.now() - args.days * 24 * 60 * 60 * 1000;

        const events = await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code_time", (q) =>
                q.eq("qrCodeId", args.qrCodeId).gte("scannedAt", since)
            )
            .collect();

        const byDay: Record<string, number> = {};
        for (let i = 0; i < args.days; i++) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            byDay[d.toISOString().split("T")[0]] = 0;
        }

        for (const e of events) {
            const key = new Date(e.scannedAt).toISOString().split("T")[0];
            if (byDay[key] !== undefined) byDay[key] += 1;
        }

        return Object.entries(byDay)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, count]) => ({ date, count }));
    },
});

// Get scans grouped by hour of day (0–23) for heatmap
export const getScansByHour = query({
    args: {
        qrCodeId: v.id("qr_codes"),
        days: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (!qrCode || qrCode.userId !== identity.subject) return [];

        const since = Date.now() - args.days * 24 * 60 * 60 * 1000;

        const events = await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code_time", (q) =>
                q.eq("qrCodeId", args.qrCodeId).gte("scannedAt", since)
            )
            .collect();

        const byHour: number[] = Array(24).fill(0);
        for (const e of events) {
            byHour[new Date(e.scannedAt).getHours()] += 1;
        }

        return byHour.map((count, hour) => ({ hour, count }));
    },
});

// Get recent scans for a QR code (event feed)
export const getRecentScans = query({
    args: { qrCodeId: v.id("qr_codes"), limit: v.number() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];
        const qrCode = await ctx.db.get(args.qrCodeId);
        if (!qrCode || qrCode.userId !== identity.subject) return [];

        return await ctx.db
            .query("scan_events")
            .withIndex("by_qr_code_time", (q) =>
                q.eq("qrCodeId", args.qrCodeId)
            )
            .order("desc")
            .take(args.limit);
    },
});

// Global analytics across ALL QR codes for the authenticated user
export const getGlobalScanStats = query({
    args: {
        days: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return null;

        const days = args.days ?? 30;
        const since = Date.now() - days * 24 * 60 * 60 * 1000;

        // Use compound index by_user_time for efficient time-range filtering
        const events = await ctx.db
            .query("scan_events")
            .withIndex("by_user_time", (q) =>
                q.eq("userId", identity.subject).gte("scannedAt", since)
            )
            .collect();

        const deviceCounts: Record<string, number> = {};
        const browserCounts: Record<string, number> = {};
        const countryCounts: Record<string, number> = {};
        const cityCounts: Record<string, number> = {};
        const regionCounts: Record<string, number> = {};
        const osCounts: Record<string, number> = {};
        const referrerCounts: Record<string, number> = {};
        const byDay: Record<string, number> = {};
        const byHour: number[] = Array(24).fill(0);

        for (let i = 0; i < days; i++) {
            const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
            byDay[d.toISOString().split("T")[0]] = 0;
        }

        for (const e of events) {
            const dev = e.device ?? "Unknown";
            const br = e.browser ?? "Unknown";
            const co = normalizeCountry(e.country);
            const ci = e.city ?? "Unknown";
            const re = e.region ?? "Unknown";
            const os = e.os ?? "Unknown";
            const ref = e.referrer ?? "Direct";
            deviceCounts[dev] = (deviceCounts[dev] ?? 0) + 1;
            browserCounts[br] = (browserCounts[br] ?? 0) + 1;
            countryCounts[co] = (countryCounts[co] ?? 0) + 1;
            cityCounts[ci] = (cityCounts[ci] ?? 0) + 1;
            regionCounts[re] = (regionCounts[re] ?? 0) + 1;
            osCounts[os] = (osCounts[os] ?? 0) + 1;
            referrerCounts[ref] = (referrerCounts[ref] ?? 0) + 1;

            const key = new Date(e.scannedAt).toISOString().split("T")[0];
            if (byDay[key] !== undefined) byDay[key] += 1;

            byHour[new Date(e.scannedAt).getHours()] += 1;
        }

        return {
            total: events.length,
            scansByDay: Object.entries(byDay)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, count]) => ({ date, count })),
            scansByHour: byHour.map((count, hour) => ({ hour, count })),
            deviceBreakdown: deviceCounts,
            browserBreakdown: browserCounts,
            countryBreakdown: countryCounts,
            cityBreakdown: cityCounts,
            regionBreakdown: regionCounts,
            osBreakdown: osCounts,
            referrerBreakdown: referrerCounts,
        };
    },
});
