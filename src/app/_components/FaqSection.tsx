import { FAQ_ITEMS } from "../_data/faq";

export function FaqSection() {
    return (
        <section
            id="faq"
            className="faq-section"
            style={{ maxWidth: "760px", margin: "0 auto" }}
        >
            <h2
                style={{
                    textAlign: "center",
                    fontSize: "clamp(1.5rem, 3.5vw, 2rem)",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    marginBottom: "2.5rem",
                }}
            >
                Veelgestelde vragen
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {FAQ_ITEMS.map((item) => (
                    <details key={item.id} className="faq-item">
                        <summary className="faq-summary">
                            <span>{item.question}</span>
                            <span className="faq-chevron" aria-hidden="true" />
                        </summary>
                        <div className="faq-answer">
                            <p style={{ margin: 0, lineHeight: 1.7 }}>{item.answer}</p>
                        </div>
                    </details>
                ))}
            </div>

            <p
                style={{
                    textAlign: "center",
                    marginTop: "2.5rem",
                    fontSize: "0.875rem",
                    color: "var(--color-text-muted)",
                }}
            >
                Meer vragen?{" "}
                <a
                    href="mailto:support@qrcodemaster.nl"
                    style={{
                        color: "var(--color-accent)",
                        textDecoration: "none",
                        fontWeight: 600,
                    }}
                >
                    Mail ons direct
                </a>
            </p>
        </section>
    );
}
