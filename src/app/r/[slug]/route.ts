import { NextRequest, NextResponse, after } from "next/server";
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

/** Convert ISO 3166-1 alpha-2 country code to full name via Intl API (zero dependencies). */
function isoToCountryName(code: string): string {
    try {
        const name = new Intl.DisplayNames(["en"], { type: "region" }).of(code.toUpperCase());
        return name ?? code;
    } catch {
        return code; // Return raw ISO code as fallback
    }
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

        // Respond immediately
        const response = NextResponse.redirect(redirectUrl, { status: 302 });

        // Use Next.js after() — guaranteed to run after response is sent,
        // even in serverless/edge environments (Vercel, Cloudflare Workers)
        after(async () => {
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

            const referrer = categorizeReferrer(req.headers.get("referer"));

            let country: string | null = null;
            let region: string | null = null;
            let city: string | null = null;

            // ── Strategy 1: Vercel geo headers (free, unlimited, 0ms) ────────
            const vercelCountry = req.headers.get("x-vercel-ip-country");
            const vercelRegion = req.headers.get("x-vercel-ip-country-region");
            const vercelCity = req.headers.get("x-vercel-ip-city");

            if (vercelCountry && vercelCountry !== "XX") {
                country = isoToCountryName(vercelCountry);
                region = vercelRegion ? decodeURIComponent(vercelRegion) : null;
                city = vercelCity ? decodeURIComponent(vercelCity) : null;
            }

            // ── Strategy 2: ipapi.co fallback (non-Vercel environments) ──────
            if (!country) {
                try {
                    if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
                        const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
                            signal: AbortSignal.timeout(2000),
                        });
                        if (geoRes.ok) {
                            const geo = await geoRes.json();
                            if (!geo.error) {
                                country = geo.country_name ?? null;
                                region = geo.region ?? null;
                                city = geo.city ?? null;
                            }
                        }
                    }
                } catch {
                    // Geo is best-effort — never block the redirect
                }
            }

            // Log scan via secured Convex HTTP action (Bearer token auth)
            const scanLogSecret = process.env.SCAN_LOG_SECRET;
            const convexSiteUrl = convexUrl.replace(/\.cloud$/, ".site");
            fetch(`${convexSiteUrl}/logScan`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(scanLogSecret ? { Authorization: `Bearer ${scanLogSecret}` } : {}),
                },
                body: JSON.stringify({
                    qrCodeId: qrCode._id,
                    userId: qrCode.userId,
                    device: deviceType,
                    ...(browser.name ? { browser: browser.name } : {}),
                    ...(os.name ? { os: os.name } : {}),
                    ...(country ? { country } : {}),
                    ...(region ? { region } : {}),
                    ...(city ? { city } : {}),
                    referrer,
                }),
            }).catch((err) => console.error("[QR Redirect] Scan log failed:", err));
        });

        return response;
    } catch (err) {
        console.error(`[QR Redirect] Error for slug "${slug}":`, err);
        return NextResponse.redirect(new URL("/not-found", req.url));
    }
}

