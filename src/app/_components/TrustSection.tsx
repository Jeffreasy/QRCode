import { CheckIcon } from "@/components/ui/icons";

const TRUST_POINTS = [
    {
        label: "Codes nooit zomaar uitgeschakeld",
        detail:
            "Gedrukt materiaal blijft altijd scanbaar. Ook na downgrade of opzegging.",
    },
    {
        label: "Prijzen altijd zichtbaar",
        detail:
            "Geen 'op aanvraag'. Geen verborgen creditmaatschappijen. Gewoon open.",
    },
    {
        label: "Geen creditcard-vereiste voor de gratis tier",
        detail: "Start zonder verplichting. Upgrade wanneer het voor jou klopt.",
    },
] as const;

export function TrustSection() {
    return (
        <section
            className="trust-section"
            style={{ maxWidth: "1100px", margin: "0 auto" }}
        >
            <div className="trust-inner">
                {/* Left: statement */}
                <div className="trust-statement">
                    <p
                        style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: "var(--color-text-faint)",
                            marginBottom: "1rem",
                        }}
                    >
                        Waarom QRCodeMaster
                    </p>
                    <h2
                        style={{
                            fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            lineHeight: 1.1,
                            marginBottom: "1rem",
                        }}
                    >
                        Jouw QR-code
                        <br />
                        werkt.{" "}
                        <span className="gradient-text">Altijd.</span>
                    </h2>
                    <p
                        style={{
                            color: "var(--color-text-muted)",
                            fontSize: "0.9375rem",
                            lineHeight: 1.7,
                            maxWidth: "400px",
                        }}
                    >
                        Gevestigde platforms schakelen codes uit nadat een
                        &apos;gratis&apos; proefperiode eindigt — na maanden of jaren
                        op je geprinte materialen. Wij niet.
                    </p>
                </div>

                {/* Right: trust points */}
                <ul
                    style={{
                        listStyle: "none",
                        padding: 0,
                        margin: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.25rem",
                    }}
                >
                    {TRUST_POINTS.map((point) => (
                        <li
                            key={point.label}
                            className="card trust-point-card"
                            style={{ padding: "1.25rem 1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}
                        >
                            <span
                                style={{
                                    flexShrink: 0,
                                    width: "32px",
                                    height: "32px",
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--color-success-bg)",
                                    border: "1px solid var(--color-success-border)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--color-success)",
                                    marginTop: "2px",
                                }}
                            >
                                <CheckIcon size={15} />
                            </span>
                            <div>
                                <p
                                    style={{
                                        fontWeight: 700,
                                        fontSize: "0.9375rem",
                                        marginBottom: "0.25rem",
                                    }}
                                >
                                    {point.label}
                                </p>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "var(--color-text-muted)",
                                        margin: 0,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {point.detail}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
