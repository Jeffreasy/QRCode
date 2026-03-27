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
 * Kept as mutation for imperative call pattern (useMutation in upload flow).
 * Internally read-only — no database writes.
 */
export const getStorageUrl = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        return await ctx.storage.getUrl(args.storageId);
    },
});

/**
 * Deletes a stored file (e.g. when user removes logo or replaces it).
 */
export const deleteStorageFile = mutation({
    args: { storageId: v.id("_storage") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Niet ingelogd.");
        await ctx.storage.delete(args.storageId);
    },
});
