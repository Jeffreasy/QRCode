// Next.js middleware must live in the project root (next to package.json).
// Turbopack requires `config` to be statically defined here — it cannot be re-exported.
// The handler is imported from src/proxy.ts.
export { default } from "./src/proxy";

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};

