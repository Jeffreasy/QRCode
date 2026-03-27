import { QRType, QRPayload, isValidUrl } from "@/lib/qr-types";

// ── Colour contrast helpers ───────────────────────────────────────────────────

export function hexToLuminance(hex: string): number {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return 0;
    const [r, g, b] = [0, 2, 4].map((i) => {
        const c = parseInt(clean.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(fg: string, bg: string): number {
    const l1 = hexToLuminance(fg);
    const l2 = hexToLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// ── Step validation ───────────────────────────────────────────────────────────

export function isStepOneComplete(type: QRType | null, formData: Record<string, string>): boolean {
    if (!type) return false;
    switch (type) {
        case "url": return isValidUrl(formData.url ?? "");
        case "vcard": return !!(formData.firstName?.trim() && formData.lastName?.trim());
        case "wifi": return !!(formData.ssid?.trim());
        case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email ?? "");
        case "sms": return !!(formData.phone?.trim());
        case "text": return !!(formData.text?.trim());
        case "file": return isValidUrl(formData.fileUrl ?? "");
        case "social": return isValidUrl(formData.pageUrl ?? "");
        case "whatsapp": return !!(formData.phone?.trim());
        case "event": return !!(formData.title?.trim() && formData.startDate?.trim());
        default: return true;
    }
}

// ── Payload builder ───────────────────────────────────────────────────────────

export function getPayload(type: QRType, formData: Record<string, string>): QRPayload {
    switch (type) {
        case "url": return { url: formData.url || "" };
        case "vcard": return { firstName: formData.firstName || "", lastName: formData.lastName || "", organization: formData.organization, phone: formData.phone, email: formData.email, website: formData.website, address: formData.address };
        case "wifi": return { ssid: formData.ssid || "", password: formData.password || "", security: (formData.security || "WPA") as "WPA" | "WEP" | "nopass", hidden: formData.hidden === "true" };
        case "text": return { text: formData.text || "" };
        case "email": return { email: formData.email || "", subject: formData.subject, body: formData.body };
        case "sms": return { phone: formData.phone || "", message: formData.message };
        case "file": return { fileUrl: formData.fileUrl || "" };
        case "social": return { pageUrl: formData.pageUrl || "" };
        case "whatsapp": return { phone: formData.phone || "", message: formData.message };
        case "event": return { title: formData.title || "", location: formData.location, startDate: formData.startDate || "", endDate: formData.endDate, description: formData.description };
        default: return { url: "" };
    }
}
