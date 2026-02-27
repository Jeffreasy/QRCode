import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { qrCodeId, userId, userAgent, ip } = body;

        if (!qrCodeId || !userId) {
            return NextResponse.json({ ok: false }, { status: 400 });
        }

        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) {
            console.error("[Scan API] NEXT_PUBLIC_CONVEX_URL is not set");
            return NextResponse.json({ ok: false }, { status: 500 });
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

        // Geo lookup (best-effort, 2s timeout)
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
            // Geo is best-effort, never block
        }

        // Write to Convex via direct HTTP API (no auth required — internal server call)
        const mutRes = await fetch(`${convexUrl}/api/mutation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: "analytics:logScan",
                format: "json",
                args: {
                    qrCodeId,
                    userId,
                    country: country ?? null,
                    city: city ?? null,
                    device: deviceType,
                    browser: browser.name ?? null,
                    os: os.name ?? null,
                },
            }),
        });

        if (!mutRes.ok) {
            const text = await mutRes.text();
            console.error(`[Scan API] Convex mutation failed: ${mutRes.status}`, text);
            return NextResponse.json({ ok: false }, { status: 500 });
        }

        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error("[Scan API] Error logging scan:", err);
        return NextResponse.json({ ok: false }, { status: 500 });
    }
}
