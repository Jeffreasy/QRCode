import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { QrCodeIcon } from "@/components/ui/icons";

export function HomeNav() {
    return (
        <nav
            className="glass"
            style={{
                position: "fixed",
                top: "0.875rem",
                left: "0.875rem",
                right: "0.875rem",
                zIndex: 50,
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--color-border)",
            }}
            aria-label="Hoofdnavigatie"
        >
            <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", height: "56px", gap: "0.5rem" }}>
                <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none", flexShrink: 0 }}>
                    <span style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "8px", background: "var(--gradient-brand)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <QrCodeIcon size={18} style={{ color: "#fff" }} />
                    </span>
                    <span
                        className="nav-brand-text"
                        style={{ fontWeight: 800, fontSize: "1rem", background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", whiteSpace: "nowrap" }}
                    >
                        QRCodeMaster
                    </span>
                </Link>

                <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
                    <SignedOut>
                        <Link href="/sign-in" className="btn btn-ghost btn-sm">Inloggen</Link>
                        <Link href="/sign-up" className="btn btn-primary btn-sm">Gratis starten</Link>
                    </SignedOut>
                    <SignedIn>
                        <Link href="/dashboard" className="btn btn-primary btn-sm">Dashboard</Link>
                    </SignedIn>
                </div>
            </div>
        </nav>
    );
}
