"use client";

import { useState } from "react";
import { useParams } from "next/navigation";

export default function PasswordPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
            const res = await fetch(`${convexUrl}/api/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    path: "qrCodes:verifyPassword",
                    args: { slug, password },
                    format: "json",
                }),
            });

            const data = await res.json();
            const result = data.value;

            if (result?.valid && result?.destination) {
                const dest = result.destination.startsWith("http")
                    ? result.destination
                    : `https://${result.destination}`;
                window.location.href = dest;
            } else {
                setError("Onjuist wachtwoord. Probeer het opnieuw.");
                setLoading(false);
            }
        } catch {
            setError("Er ging iets mis. Probeer het opnieuw.");
            setLoading(false);
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0c0f1a",
            color: "#e2e8f0",
            fontFamily: "system-ui, -apple-system, sans-serif",
            padding: "1rem",
        }}>
            <div style={{
                width: "100%",
                maxWidth: "380px",
                textAlign: "center",
            }}>
                {/* Logo / Brand */}
                <div style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: "linear-gradient(135deg, #38bdf8, #06b6d4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    fontSize: "1.5rem",
                }}>
                    🔒
                </div>

                <h1 style={{
                    fontSize: "1.5rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    background: "linear-gradient(135deg, #38bdf8, #06b6d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                }}>
                    Beveiligde QR Code
                </h1>

                <p style={{
                    color: "#94a3b8",
                    fontSize: "0.875rem",
                    marginBottom: "1.5rem",
                    lineHeight: 1.6,
                }}>
                    Deze inhoud is beschermd met een wachtwoord.<br />
                    Voer het wachtwoord in om door te gaan.
                </p>

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        placeholder="Wachtwoord"
                        autoFocus
                        required
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            borderRadius: "10px",
                            border: error ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(255,255,255,0.05)",
                            color: "#e2e8f0",
                            fontSize: "0.9375rem",
                            outline: "none",
                            transition: "border-color 0.2s ease",
                        }}
                    />

                    {error && (
                        <p style={{
                            color: "#ef4444",
                            fontSize: "0.8125rem",
                            margin: 0,
                        }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !password}
                        style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            borderRadius: "10px",
                            border: "none",
                            background: loading || !password ? "rgba(56,189,248,0.3)" : "linear-gradient(135deg, #38bdf8, #06b6d4)",
                            color: "#fff",
                            fontSize: "0.9375rem",
                            fontWeight: 600,
                            cursor: loading || !password ? "not-allowed" : "pointer",
                            transition: "opacity 0.2s ease, transform 0.1s ease",
                        }}
                    >
                        {loading ? "Controleren..." : "Doorgaan"}
                    </button>
                </form>

                <p style={{
                    marginTop: "2rem",
                    fontSize: "0.6875rem",
                    color: "#475569",
                }}>
                    Powered by JeffDash QR
                </p>
            </div>
        </div>
    );
}
