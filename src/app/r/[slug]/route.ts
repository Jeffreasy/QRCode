import { NextRequest, NextResponse } from "next/server";

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
        // Direct Convex HTTP API — no package dependency, works in all runtimes
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

        // Fire-and-forget scan logging
        const ua = req.headers.get("user-agent") ?? "";
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip") ??
            "unknown";

        fetch(`${req.nextUrl.origin}/api/scan`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                qrCodeId: qrCode._id,
                userId: qrCode.userId,
                userAgent: ua,
                ip,
            }),
        }).catch(() => { });

        // HTTP 302 redirect — fast, standard, works everywhere
        return NextResponse.redirect(redirectUrl, { status: 302 });
    } catch (err) {
        console.error(`[QR Redirect] Error for slug "${slug}":`, err);
        return NextResponse.redirect(new URL("/not-found", req.url));
    }
}
