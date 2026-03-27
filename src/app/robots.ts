import type { MetadataRoute } from "next";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://www.jeffdash.com");

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: [
                    "/dashboard/",   // Authenticated pages
                    "/r/",           // QR redirect routes — not indexable content
                    "/api/",         // API endpoints
                    "/sign-in/",     // Auth pages (optional — can be removed)
                ],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
