import Link from "next/link";

export default function NotFoundPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "2rem",
                background: "var(--color-bg)",
            }}
            className="bg-grid"
        >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⬡</div>
            <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "0.5rem" }}>404</h1>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", maxWidth: "400px" }}>
                Deze QR code bestaat niet of is niet actief. Mogelijk is de link verlopen of verwijderd.
            </p>
            <Link href="/" className="btn btn-primary">
                ← Terug naar home
            </Link>
        </div>
    );
}
