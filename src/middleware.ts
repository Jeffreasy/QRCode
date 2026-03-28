import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
    "/",
    "/sign-in(.*)",
    "/sign-up(.*)",
    "/r/(.*)",        // QR redirect routes — handled by /app/r/[slug]/route.ts
    "/not-found",
    "/sitemap.xml",   // SEO: must be public for Google crawlers
    "/robots.txt",    // SEO: must be public for Google crawlers
    "/opengraph-image(.*)",  // OG image for social sharing
]);

export default clerkMiddleware(async (auth, req) => {
    if (!isPublicRoute(req)) {
        const { userId, redirectToSignIn } = await auth();
        if (!userId) {
            // Preserve the original URL so the user lands back after sign-in
            return redirectToSignIn({ returnBackUrl: req.url });
        }
    }
    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
