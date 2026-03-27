import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Plan definitions — gebaseerd op werkelijk bestaande features in de codebase.
 *
 * Starter → basis QR types + design + eenvoudige scan-teller
 * Pro     → alles van Starter + device/locatie analytics + alle QR types
 */
const PLAN_SEED = [
    {
        planId: "starter",
        name: "Starter",
        price: 14.99,
        period: "per maand",
        description: "Voor de ZZP'er en kleine horeca. Alles wat je nodig hebt om te beginnen.",
        highlighted: false,
        ctaText: "Begin met Starter",
        ctaHref: "/sign-up?plan=starter",
        features: [
            { text: "Onbeperkte dynamische QR codes", included: true },
            { text: "Sub-50ms redirects", included: true },
            { text: "Volledig aanpasbaar design + logo upload", included: true },
            { text: "Download SVG & PNG", included: true },
            { text: "6 QR types: URL, vCard, WiFi, E-mail, SMS, Tekst", included: true },
            { text: "Basisanalytics: totaal scans & scans per dag", included: true },
            { text: "QR codes dupliceren", included: true },
            { text: "Device, OS & locatie analytics", included: false },
            { text: "WhatsApp & Agenda (Event) QR types", included: false },
            { text: "Bestand & Social media QR types", included: false },
        ],
        limits: {
            deviceAnalytics: false,
            whatsappEvent: false,
            advancedQrTypes: false,
        },
        sortOrder: 1,
    },
    {
        planId: "pro",
        name: "Pro",
        price: 24.99,
        period: "per maand",
        description: "Het volledige product voor MKB. Alle QR types en diepgaande analytics.",
        badge: "Meest Populair",
        highlighted: true,
        ctaText: "Kies Pro",
        ctaHref: "/sign-up?plan=pro",
        features: [
            { text: "Onbeperkte dynamische QR codes", included: true },
            { text: "Sub-50ms redirects", included: true },
            { text: "Volledig aanpasbaar design + logo upload", included: true },
            { text: "Download SVG & PNG", included: true },
            { text: "Alle 10 QR types (incl. WhatsApp, Agenda, Bestand, Social)", included: true },
            { text: "Basisanalytics: totaal scans & scans per dag", included: true },
            { text: "QR codes dupliceren", included: true },
            { text: "Device, OS & locatie analytics", included: true },
            { text: "WhatsApp & Agenda (Event) QR types", included: true },
            { text: "Bestand & Social media QR types", included: true },
        ],
        limits: {
            deviceAnalytics: true,
            whatsappEvent: true,
            advancedQrTypes: true,
        },
        sortOrder: 2,
    },
];

/**
 * Upsert seed mutation — inserts or updates each plan.
 * Removes plans no longer in PLAN_SEED (e.g. Business was removed).
 * Safe to run multiple times; always synchronizes plans with PLAN_SEED.
 */
export const seedPlans = mutation({
    args: {},
    handler: async (ctx) => {
        const activePlanIds = PLAN_SEED.map((p) => p.planId);

        // Remove plans that are no longer in PLAN_SEED
        const allPlans = await ctx.db.query("plans").collect();
        for (const existing of allPlans) {
            if (!activePlanIds.includes(existing.planId)) {
                await ctx.db.delete(existing._id);
            }
        }

        // Upsert each plan from PLAN_SEED
        for (const plan of PLAN_SEED) {
            const existing = await ctx.db
                .query("plans")
                .withIndex("by_planId", (q) => q.eq("planId", plan.planId))
                .first();

            if (existing) {
                await ctx.db.replace(existing._id, plan);
            } else {
                await ctx.db.insert("plans", plan);
            }
        }

        return { active: activePlanIds };
    },
});

/**
 * Public query — no auth required (used by the homepage PricingSection).
 * Returns plans ordered by sortOrder ascending.
 */
export const listPlans = query({
    args: {},
    handler: async (ctx) => {
        const plans = await ctx.db.query("plans").collect();
        return plans.sort((a, b) => a.sortOrder - b.sortOrder);
    },
});

/**
 * Get a single plan by planId.
 */
export const getPlanById = query({
    args: { planId: v.string() },
    handler: async (ctx, { planId }) => {
        return await ctx.db
            .query("plans")
            .withIndex("by_planId", (q) => q.eq("planId", planId))
            .first();
    },
});
