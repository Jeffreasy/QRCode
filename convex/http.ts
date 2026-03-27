import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

/**
 * Internal scan logging endpoint — secured with a shared secret.
 * Called by the Next.js /r/[slug] redirect route after responding to the user.
 */
http.route({
    path: "/logScan",
    method: "POST",
    handler: httpAction(async (ctx, request) => {
        // Verify shared secret
        const authHeader = request.headers.get("Authorization");
        const secret = process.env.SCAN_LOG_SECRET;
        if (!secret || authHeader !== `Bearer ${secret}`) {
            return new Response("Unauthorized", { status: 401 });
        }

        const body = await request.json();
        await ctx.runMutation(internal.analytics.logScan, {
            qrCodeId: body.qrCodeId,
            userId: body.userId,
            device: body.device,
            browser: body.browser,
            os: body.os,
            country: body.country,
            region: body.region,
            city: body.city,
            referrer: body.referrer,
        });

        return new Response(JSON.stringify({ ok: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});

export default http;
