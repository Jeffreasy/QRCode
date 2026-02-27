import { v } from "convex/values";
import { mutation } from "./_generated/server";

/**
 * Generates a short-lived upload URL for Convex File Storage.
 * The client uses this URL to PUT a file directly to Convex.
 */
export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        return await ctx.storage.generateUploadUrl();
    },
});

/**
 * Returns the public URL for a stored file by its storage ID.
 */
export const getStorageUrl = mutation({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const url = await ctx.storage.getUrl(args.storageId as any);
        return url;
    },
});

/**
 * Deletes a stored file (e.g. when user removes logo or replaces it).
 */
export const deleteStorageFile = mutation({
    args: { storageId: v.string() },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await ctx.storage.delete(args.storageId as any);
    },
});
