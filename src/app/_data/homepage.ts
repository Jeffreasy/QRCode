import {
    BarChartIcon,
    LinkIcon,
    PaletteIcon,
    PackageIcon,
    ZapIcon,
    UsersIcon,
    RefreshIcon,
} from "@/components/ui/icons";

export const STATS = [
    { value: "8", label: "QR types", Icon: PackageIcon },
    { value: "<50ms", label: "Redirect tijd", Icon: ZapIcon },
    { value: "∞", label: "Wijzigingen", Icon: RefreshIcon },
] as const;

export const FEATURES = [
    {
        Icon: LinkIcon,
        title: "Dynamische bestemmingen",
        desc: "Wijzig de URL achter je QR code op elk moment. De gedrukte code blijft altijd hetzelfde.",
    },
    {
        Icon: BarChartIcon,
        title: "Realtime analytics",
        desc: "Zie precies wanneer, waar en op welk device mensen jouw QR code scannen.",
    },
    {
        Icon: PaletteIcon,
        title: "Volledig aanpasbaar",
        desc: "Voeg jouw logo toe, kies kleuren en dot-stijlen. Download als SVG of PNG.",
    },
    {
        Icon: PackageIcon,
        title: "8 QR types",
        desc: "URL, vCard, WiFi, Email, SMS, Tekst, PDF en Social — alles in één platform.",
    },
    {
        Icon: ZapIcon,
        title: "Razendsnel",
        desc: "Sub-50ms redirects dankzij Next.js Edge Middleware. Scanners wachten nooit.",
    },
    {
        Icon: UsersIcon,
        title: "Multi-user",
        desc: "Meerdere gebruikers op één platform. Iedereen beheert zijn eigen QR codes.",
    },
] as const;
