/**
 * QR Type Engine
 * Converts user-provided data into the correct QR payload string per type.
 */

export type QRType =
    | "url"
    | "vcard"
    | "wifi"
    | "text"
    | "email"
    | "sms"
    | "file"
    | "social"
    | "whatsapp"
    | "event";

// --- URL ---
export interface URLPayload {
    url: string;
}

// --- vCard ---
export interface VCardPayload {
    firstName: string;
    lastName: string;
    organization?: string;
    phone?: string;
    email?: string;
    website?: string;
    address?: string;
}

// --- WiFi ---
export interface WiFiPayload {
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden?: boolean;
}

// --- Plain Text ---
export interface TextPayload {
    text: string;
}

// --- Email ---
export interface EmailPayload {
    email: string;
    subject?: string;
    body?: string;
}

// --- SMS ---
export interface SMSPayload {
    phone: string;
    message?: string;
}

// --- File (resolves via redirect slug URL) ---
export interface FilePayload {
    fileUrl: string; // Direct URL to the file
}

// --- Social Aggregator (resolves via redirect slug URL) ---
export interface SocialPayload {
    pageUrl: string; // URL to the social aggregator page
}

// --- WhatsApp ---
export interface WhatsAppPayload {
    phone: string;
    message?: string;
}

// --- Event / Calendar (vCalendar 2.0) ---
export interface EventPayload {
    title: string;
    location?: string;
    startDate: string; // ISO datetime string e.g. "2026-03-01T10:00"
    endDate?: string;
    description?: string;
}

export type QRPayload =
    | URLPayload
    | VCardPayload
    | WiFiPayload
    | TextPayload
    | EmailPayload
    | SMSPayload
    | FilePayload
    | SocialPayload
    | WhatsAppPayload
    | EventPayload;

/**
 * Validates that a URL is non-empty and starts with http:// or https://.
 */
export function isValidUrl(url: string): boolean {
    const trimmed = url.trim();
    return trimmed.startsWith("http://") || trimmed.startsWith("https://");
}

/**
 * Encode payload into the QR code data string
 * For dynamic types (url, file, social) this returns the redirect slug URL.
 * For static types (vcard, wifi, text, email, sms) this returns the raw encoded string.
 */
export function encodePayload(type: QRType, payload: QRPayload): string {
    switch (type) {
        case "url":
            return (payload as URLPayload).url.trim();

        case "vcard": {
            const v = payload as VCardPayload;
            const lines = [
                "BEGIN:VCARD",
                "VERSION:3.0",
                `FN:${v.firstName} ${v.lastName}`,
                `N:${v.lastName};${v.firstName};;;`,
            ];
            if (v.organization) lines.push(`ORG:${v.organization}`);
            if (v.phone) lines.push(`TEL:${v.phone}`);
            if (v.email) lines.push(`EMAIL:${v.email}`);
            if (v.website) lines.push(`URL:${v.website}`);
            if (v.address) lines.push(`ADR:;;${v.address};;;;`);
            lines.push("END:VCARD");
            return lines.join("\n");
        }

        case "wifi": {
            const w = payload as WiFiPayload;
            const hidden = w.hidden ? "true" : "false";
            return `WIFI:T:${w.security};S:${w.ssid};P:${w.password};H:${hidden};;`;
        }

        case "text":
            return (payload as TextPayload).text;

        case "email": {
            const e = payload as EmailPayload;
            let mailto = `mailto:${e.email}`;
            const params: string[] = [];
            if (e.subject) params.push(`subject=${encodeURIComponent(e.subject)}`);
            if (e.body) params.push(`body=${encodeURIComponent(e.body)}`);
            if (params.length) mailto += `?${params.join("&")}`;
            return mailto;
        }

        case "sms": {
            const s = payload as SMSPayload;
            let sms = `smsto:${s.phone}`;
            if (s.message) sms += `:${s.message}`;
            return sms;
        }

        case "file":
            return (payload as FilePayload).fileUrl;

        case "social":
            return (payload as SocialPayload).pageUrl;

        case "whatsapp": {
            const w = payload as WhatsAppPayload;
            const phone = w.phone.replace(/\D/g, ""); // strip non-digits
            const base = `https://wa.me/${phone}`;
            return w.message ? `${base}?text=${encodeURIComponent(w.message)}` : base;
        }

        case "event": {
            const e = payload as EventPayload;
            // RFC 5545: escape backslash, semicolon, comma, and newlines in text fields
            const vcalEscape = (s: string) =>
                s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
            const fmt = (iso: string) => iso.replace(/[-:]/g, "").replace("T", "T").slice(0, 15);
            const lines = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//QRCodeMaster//EN",
                "BEGIN:VEVENT",
                `SUMMARY:${vcalEscape(e.title)}`,
                `DTSTART:${fmt(e.startDate)}`,
                e.endDate ? `DTEND:${fmt(e.endDate)}` : `DTEND:${fmt(e.startDate)}`,
            ];
            if (e.location) lines.push(`LOCATION:${vcalEscape(e.location)}`);
            if (e.description) lines.push(`DESCRIPTION:${vcalEscape(e.description)}`);
            lines.push("END:VEVENT", "END:VCALENDAR");
            return lines.join("\r\n");
        }

        default:
            throw new Error(`Unknown QR type: ${type}`);
    }
}

/**
 * Type meta: labels, icons, descriptions for the UI
 */
export const QR_TYPE_META: Record<
    QRType,
    { label: string; icon: string; description: string; isDynamic: boolean }
> = {
    url: {
        label: "URL / Website",
        icon: "🌐",
        description: "Link naar een website of webpagina",
        isDynamic: true,
    },
    vcard: {
        label: "vCard (Contactpersoon)",
        icon: "👤",
        description: "Sla contactgegevens op in de telefoon",
        isDynamic: false,
    },
    wifi: {
        label: "WiFi Netwerk",
        icon: "📶",
        description: "Automatisch verbinden met een WiFi netwerk",
        isDynamic: false,
    },
    text: {
        label: "Tekst",
        icon: "📝",
        description: "Vrije tekst of een bericht weergeven",
        isDynamic: false,
    },
    email: {
        label: "E-mail",
        icon: "✉️",
        description: "Open emailclient met vooringevuld adres",
        isDynamic: false,
    },
    sms: {
        label: "SMS / Telefoon",
        icon: "📱",
        description: "Open SMS-app met vooringevuld telefoonnummer",
        isDynamic: false,
    },
    file: {
        label: "Bestand / PDF",
        icon: "📄",
        description: "Link naar een downloadbaar bestand",
        isDynamic: true,
    },
    social: {
        label: "Social Media",
        icon: "📲",
        description: "Link naar een social media profiel of pagina",
        isDynamic: true,
    },
    whatsapp: {
        label: "WhatsApp",
        icon: "💬",
        description: "Open WhatsApp met vooringevuld nummer en bericht",
        isDynamic: false,
    },
    event: {
        label: "Evenement",
        icon: "📅",
        description: "Voeg een afspraak toe aan de kalender",
        isDynamic: false,
    },
};
