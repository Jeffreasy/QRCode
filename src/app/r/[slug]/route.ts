import { NextRequest, NextResponse } from "next/server";
import { UAParser } from "ua-parser-js";

/** Categorize a Referer header into a human-readable source label */
function categorizeReferrer(referer: string | null): string {
    if (!referer) return "Direct";
    const r = referer.toLowerCase();
    if (r.includes("instagram.com")) return "Instagram";
    if (r.includes("facebook.com") || r.includes("fb.com")) return "Facebook";
    if (r.includes("twitter.com") || r.includes("x.com") || r.includes("t.co")) return "Twitter / X";
    if (r.includes("linkedin.com")) return "LinkedIn";
    if (r.includes("tiktok.com")) return "TikTok";
    if (r.includes("youtube.com")) return "YouTube";
    if (r.includes("google.com") || r.includes("google.")) return "Google";
    if (r.includes("bing.com")) return "Bing";
    if (r.includes("duckduckgo.com")) return "DuckDuckGo";
    if (r.includes("whatsapp")) return "WhatsApp";
    return "Other";
}

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
        // Lookup the QR code by slug
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

        // Parse User-Agent
        const ua = req.headers.get("user-agent") ?? "";
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        const parser = new UAParser(ua);
        const device = parser.getDevice();
        const browser = parser.getBrowser();
        const os = parser.getOS();
        const deviceType =
            device.type === "mobile" ? "mobile" : device.type === "tablet" ? "tablet" : "desktop";

        // Categorize referrer source
        const referrer = categorizeReferrer(req.headers.get("referer"));

        // Geo lookup: country + region (province/state) + city — best-effort, 2s timeout
        let country: string | null = null;
        let region: string | null = null;
        let city: string | null = null;
        try {
            if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
                    signal: AbortSignal.timeout(2000),
                });
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    country = geo.country_name ?? null;
                    region = geo.region ?? null;      // province / state
                    city = geo.city ?? null;
                }
            }
        } catch {
            // Geo is best-effort — never block the redirect
        }

        // Fire-and-forget scan log
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
                    ...(region ? { region } : {}),
                    ...(city ? { city } : {}),
                    referrer,
                },
            }),
        }).catch((err) => console.error("[QR Redirect] Scan log failed:", err));

        return NextResponse.redirect(redirectUrl, { status: 302 });
    } catch (err) {
        console.error(`[QR Redirect] Error for slug "${slug}":`, err);
        return NextResponse.redirect(new URL("/not-found", req.url));
    }
}
