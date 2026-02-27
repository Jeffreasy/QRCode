import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) {
        console.error("[QR Redirect] NEXT_PUBLIC_CONVEX_URL is not set");
        return NextResponse.redirect(new URL("/not-found", req.url));
    }

    try {
        // Lookup the QR code by slug via Convex HTTP API
        const res = await fetch(`${convexUrl}/api/query`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: "qrCodes:getBySlug",
                args: { slug },
                format: "json",
            }),
        });

        if (!res.ok) {
            console.error(`[QR Redirect] Convex HTTP error: ${res.status} for slug "${slug}"`);
            return NextResponse.redirect(new URL("/not-found", req.url));
        }

        const data = await res.json();
        const qrCode = data.value;

        if (!qrCode || !qrCode.isActive) {
            console.warn(`[QR Redirect] Slug "${slug}" not found or inactive`);
            return NextResponse.redirect(new URL("/not-found", req.url));
        }

        const destination = qrCode.destination;
        const redirectUrl =
            destination.startsWith("http://") || destination.startsWith("https://")
                ? destination
                : `https://${destination}`;

        // Fire-and-forget: log scan directly to Convex (no internal HTTP round-trip)
        const ua = req.headers.get("user-agent") ?? "";
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        // Parse UA here to avoid needing a second API call
        const parser = new UAParser(ua);
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const deviceType =
            device.type === "mobile" ? "mobile" : device.type === "tablet" ? "tablet" : "desktop";

        // Geo lookup (best-effort, 2s timeout)
        let country: string | null = null;
        let city: string | null = null;
        try {
            if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
                    signal: AbortSignal.timeout(2000),
                });
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    country = geo.country_name ?? null;
                    city = geo.city ?? null;
                }
            }
        } catch {
            // Geo is best-effort
        }

        // Write scan event directly via Convex HTTP mutation (no auth required)
        fetch(`${convexUrl}/api/mutation`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                path: "analytics:logScan",
                format: "json",
                args: {
                    qrCodeId: qrCode._id,
                    userId: qrCode.userId,
                    device: deviceType,
                    ...(browser.name ? { browser: browser.name } : {}),
                    ...(os.name ? { os: os.name } : {}),
                    ...(country ? { country } : {}),
                    ...(city ? { city } : {}),
                },
            }),
        }).catch((err) => console.error("[QR Redirect] Scan log failed:", err));


        // HTTP 302 redirect — fast, standard, works everywhere
        return NextResponse.redirect(redirectUrl, { status: 302 });
    } catch (err) {
        console.error(`[QR Redirect] Error for slug "${slug}":`, err);
        return NextResponse.redirect(new URL("/not-found", req.url));
    }
}
