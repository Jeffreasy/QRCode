import Link from "next/link";
import { QrCodeIcon } from "@/components/ui/icons";

export function HomeFooter() {
    return (
        <footer style={{ borderTop: "1px solid var(--color-border)", padding: "1.5rem 1rem", color: "var(--color-text-faint)", fontSize: "0.8125rem" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <QrCodeIcon size={14} />
                    <span>© {new Date().getFullYear()} QRCodeMaster</span>
                </div>
                <div style={{ display: "flex", gap: "1.25rem" }}>
                    <Link href="/sign-up" style={{ color: "inherit", textDecoration: "none" }} className="footer-link">
                        Gratis starten
                    </Link>
                    <Link href="/sign-in" style={{ color: "inherit", textDecoration: "none" }} className="footer-link">
                        Inloggen
                    </Link>
                </div>
            </div>
        </footer>
    );
}
