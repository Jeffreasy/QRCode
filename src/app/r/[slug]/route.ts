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

/** Select a destination from A/B test variants using weighted random. */
function selectABVariant(destinations: { url: string; weight: number; label: string }[]): { url: string; label: string } {
    const rand = Math.random() * 100;
    let cumulative = 0;
    for (const dest of destinations) {
        cumulative += dest.weight;
        if (rand < cumulative) return { url: dest.url, label: dest.label };
    }
    // Fallback to last variant
    const last = destinations[destinations.length - 1];
    return { url: last.url, label: last.label };
}

/** Render a minimal branded HTML page for status messages. */
function renderStatusPage(title: string, message: string): NextResponse {
    const html = `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${title} — JeffDash QR</title>
    <style>
        *{margin:0;padding:0;box-sizing:border-box}
        body{min-height:100vh;display:flex;align-items:center;justify-content:center;
            background:#0c0f1a;color:#e2e8f0;font-family:system-ui,-apple-system,sans-serif}
        .container{text-align:center;max-width:400px;padding:2rem}
        h1{font-size:1.5rem;font-weight:800;margin-bottom:0.75rem;
            background:linear-gradient(135deg,#38bdf8,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
        p{color:#94a3b8;font-size:0.875rem;line-height:1.6}
        .icon{font-size:3rem;margin-bottom:1rem}
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔒</div>
        <h1>${title}</h1>
        <p>${message}</p>
    </div>
</body>
</html>`;
    return new NextResponse(html, {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
    });
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

        // ── Schedule check ───────────────────────────────────────────────────
        const now = Date.now();
        if (qrCode.scheduledStart && now < qrCode.scheduledStart) {
            const startDate = new Date(qrCode.scheduledStart).toLocaleDateString("nl-NL", {
                day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit",
            });
            return renderStatusPage(
                "Nog niet beschikbaar",
                `Deze QR code wordt actief op ${startDate}.`,
            );
        }
        if (qrCode.scheduledEnd && now > qrCode.scheduledEnd) {
            return renderStatusPage(
                "Verlopen",
                "Deze QR code is niet meer actief. De campagne is beëindigd.",
            );
        }

        // ── Password check ───────────────────────────────────────────────────
        if (qrCode.password) {
            // Redirect to password interstitial page
            const passwordUrl = new URL(`/r/${slug}/password`, req.url);
            return NextResponse.redirect(passwordUrl, { status: 302 });
        }

        // ── Geo-targeting headers ────────────────────────────────────────────
        const vercelCountry = req.headers.get("x-vercel-ip-country");
        let resolvedCountry: string | null = null;

        if (vercelCountry && vercelCountry !== "XX") {
            resolvedCountry = isoToCountryName(vercelCountry);
        }

        // ── Determine destination ────────────────────────────────────────────
        let destination = qrCode.destination;
        let abVariant: string | undefined;

        // 1. Geo-targeting: country → destination override
        if (qrCode.geoRules && qrCode.geoRules.length > 0 && resolvedCountry) {
            const geoMatch = qrCode.geoRules.find(
                (r: { country: string; destination: string }) =>
                    r.country.toLowerCase() === resolvedCountry!.toLowerCase()
            );
            if (geoMatch) {
                destination = geoMatch.destination;
            }
        }

        // 2. A/B Testing: weighted random selection (only if no geo override matched)
        if (!abVariant && qrCode.abDestinations && qrCode.abDestinations.length > 0) {
            const selected = selectABVariant(qrCode.abDestinations);
            destination = selected.url;
            abVariant = selected.label;
        }

        const redirectUrl =
            destination.startsWith("http://") || destination.startsWith("https://")
                ? destination
                : `https://${destination}`;

        // Respond immediately
        const response = NextResponse.redirect(redirectUrl, { status: 302 });

        // Use Next.js after() — guaranteed to run after response is sent
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

            let country: string | null = resolvedCountry;
            let region: string | null = null;
            let city: string | null = null;

            const vercelRegion = req.headers.get("x-vercel-ip-country-region");
            const vercelCity = req.headers.get("x-vercel-ip-city");

            if (vercelCountry && vercelCountry !== "XX") {
                if (!country) country = isoToCountryName(vercelCountry);
                region = vercelRegion ? decodeURIComponent(vercelRegion) : null;
                city = vercelCity ? decodeURIComponent(vercelCity) : null;
            }

            // Strategy 2: ipapi.co fallback (non-Vercel environments)
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
                    ...(abVariant ? { abVariant } : {}),
                }),
            }).catch((err) => console.error("[QR Redirect] Scan log failed:", err));
        });

        return response;
    } catch (err) {
        console.error(`[QR Redirect] Error for slug "${slug}":`, err);
        return NextResponse.redirect(new URL("/not-found", req.url));
    }
}
