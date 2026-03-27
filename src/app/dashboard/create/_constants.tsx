import React from "react";
import {
    LinkIcon,
    WifiIcon,
    MailIcon,
    MessageSquareIcon,
    TypeIcon,
    ShareIcon,
    FileIcon,
    UsersIcon,
    WhatsAppIcon,
    CalendarIcon,
} from "@/components/ui/icons";

export const STEPS = ["Type", "Inhoud", "Design", "Bevestigen"];

export const QR_TYPE_ICONS: Record<string, React.FC<{ size?: number }>> = {
    url: LinkIcon,
    vcard: UsersIcon,
    wifi: WifiIcon,
    email: MailIcon,
    sms: MessageSquareIcon,
    text: TypeIcon,
    social: ShareIcon,
    file: FileIcon,
    whatsapp: WhatsAppIcon,
    event: CalendarIcon,
};

export const DOT_STYLES = [
    { value: "square", label: "Vierkant", shape: <rect x="3" y="3" width="18" height="18" rx="0" /> },
    { value: "rounded", label: "Afgerond", shape: <rect x="3" y="3" width="18" height="18" rx="6" /> },
    { value: "dots", label: "Dots", shape: <circle cx="12" cy="12" r="9" /> },
    { value: "classy", label: "Classy", shape: <><rect x="3" y="3" width="18" height="18" rx="3" /><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" /></> },
    { value: "classy-rounded", label: "Classy Rond", shape: <><rect x="3" y="3" width="18" height="18" rx="8" /><line x1="3" y1="9" x2="21" y2="9" stroke="currentColor" strokeWidth="1.5" /></> },
];

export const ERROR_CORRECTION_LEVELS = [
    { value: "L", label: "L — Laag" },
    { value: "M", label: "M — Midden" },
    { value: "Q", label: "Q — Hoog" },
    { value: "H", label: "H — Max (logo)" },
];
