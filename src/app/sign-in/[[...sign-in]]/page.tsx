import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
                        Welkom terug
                    </p>
                </div>
                <SignIn />
            </div>
        </div>
    );
}
