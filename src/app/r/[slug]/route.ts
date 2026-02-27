import { NextRequest, NextResponse } from "next/server";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;

    try {
        const qrCode = await fetchQuery(api.qrCodes.getBySlug, { slug });

        if (!qrCode || !qrCode.isActive) {
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

        // Use HTML redirect — works in all QR scanners, in-app browsers, and mobile browsers
        // More reliable than HTTP 302 which some QR scanner apps block or ignore
        const html = `<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
  <title>Doorsturen...</title>
  <script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</head>
<body>
  <p>Je wordt doorgestuurd naar <a href="${redirectUrl}">${redirectUrl}</a>...</p>
</body>
</html>`;

        return new NextResponse(html, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store, no-cache, must-revalidate",
            },
        });
    } catch (err) {
        console.error(`[QR Redirect] Error for slug "${slug}":`, err);
        return NextResponse.redirect(new URL("/not-found", req.url));
    }
}
