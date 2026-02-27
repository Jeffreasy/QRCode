import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";
import { fetchMutation } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { qrCodeId, userId, userAgent, ip } = body;

        if (!qrCodeId || !userId) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        // Parse user agent
        const parser = new UAParser(userAgent ?? "");
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        const os = parser.getOS();

        const deviceType =
            device.type === "mobile"
                ? "mobile"
                : device.type === "tablet"
                    ? "tablet"
                    : "desktop";

        // Geo lookup (best-effort, 2s timeout — never blocks)
        let country: string | undefined;
        let city: string | undefined;
        try {
            if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
                    signal: AbortSignal.timeout(2000),
                });
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    country = geo.country_name;
                    city = geo.city;
                }
            }
        } catch {
            // Geo is best-effort
        }

        // Write to Convex using fetchMutation (type-safe, correct format)
        await fetchMutation(api.analytics.logScan, {
            qrCodeId: qrCodeId as Id<"qr_codes">,
            userId,
            country,
            city,
            device: deviceType,
            browser: browser.name,
            os: os.name,
        });

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[Scan API] Error logging scan:", err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
