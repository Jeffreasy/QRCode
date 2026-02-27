import { SignUp } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk-appearance";

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
                            fontSize: "2rem",
                            fontWeight: 900,
                            background: "var(--gradient-brand)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        ⬡ QRCodeMaster
                    </div>
                    <p style={{ color: "var(--color-text-muted)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
                        Maak gratis een account aan
                    </p>
                </div>
                <SignUp appearance={clerkAppearance} />
            </div>
        </div>
    );
}

