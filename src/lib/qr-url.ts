/**
 * Returns the base URL used for QR code redirect links.
 *
 * Priority:
 * 1. NEXT_PUBLIC_QR_BASE_URL — custom short domain (e.g. "https://qrm.to")
 * 2. NEXT_PUBLIC_SITE_URL — main site URL
 * 3. window.location.origin — current browser origin (client-side only)
 * 4. Fallback: "https://qrcodemaster.app"
 */
export function getQRBaseUrl(): string {
    const envShort = process.env.NEXT_PUBLIC_QR_BASE_URL;
    if (envShort) return envShort.replace(/\/$/, "");

    const envSite = process.env.NEXT_PUBLIC_SITE_URL;
    if (envSite) return envSite.replace(/\/$/, "");

    if (typeof window !== "undefined") return window.location.origin;

    return "https://qrcodemaster.app";
}

/** Full redirect URL for a given QR slug */
export function getQRRedirectUrl(slug: string): string {
    return `${getQRBaseUrl()}/r/${slug}`;
}

/**
 * Display-friendly short URL shown in the dashboard.
 * Strips protocol for cleaner display. E.g.:
 *   "https://qrm.to/r/AbCd3F" → "qrm.to/r/AbCd3F"
 */
export function getQRDisplayUrl(slug: string): string {
    return getQRRedirectUrl(slug).replace(/^https?:\/\//, "");
}
