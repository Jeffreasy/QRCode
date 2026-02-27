import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";
import { QrCodeIcon } from "@/components/ui/icons";

export default function SignUpPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "var(--color-bg)",
                padding: "1.5rem",
            }}
            className="bg-grid"
        >
            <div>
                <div style={{ textAlign: "center", marginBottom: "2rem" }}>
                    <div
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.625rem",
                            fontSize: "1.5rem",
                            fontWeight: 900,
                        }}
                    >
                        <span
                            style={{
                                width: "36px",
                                height: "36px",
                                borderRadius: "9px",
                                background: "var(--gradient-brand)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <QrCodeIcon size={20} style={{ color: "#fff" }} />
                        </span>
                        <span
                            style={{
                                background: "var(--gradient-brand)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            QRCodeMaster
                        </span>
                    </div>
                    <p style={{ color: "var(--color-text-muted)", marginTop: "0.75rem", fontSize: "0.9rem" }}>
                        Maak gratis een account aan
                    </p>
                </div>
                <SignUp appearance={clerkAppearance} />
            </div>
        </div>
    );
}

