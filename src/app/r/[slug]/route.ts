import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    console.log(`[QR Redirect] Resolving slug: "${slug}"`);

    try {
        const qrCode = await fetchQuery(api.qrCodes.getBySlug, { slug });
        console.log(`[QR Redirect] Convex result for "${slug}":`, qrCode ? `found (isActive=${qrCode.isActive})` : "null");

        if (!qrCode || !qrCode.isActive) {
            console.log(`[QR Redirect] Not found or inactive → /not-found`);
            return NextResponse.redirect(new URL("/not-found", req.url));
        }

        const destination = qrCode.destination;
        console.log(`[QR Redirect] Destination: "${destination}"`);

        // Ensure absolute URL
        const redirectUrl =
            destination.startsWith("http://") || destination.startsWith("https://")
                ? destination
                : `https://${destination}`;

        console.log(`[QR Redirect] Redirecting to: "${redirectUrl}"`);

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
        }).catch((err) => {
            console.error("[QR Redirect] Scan logging failed:", err);
        });

        return NextResponse.redirect(redirectUrl, { status: 302 });
    } catch (err) {
        console.error(`[QR Redirect] Error for slug "${slug}":`, err);
        return NextResponse.redirect(new URL("/not-found", req.url));
    }
}
