import { FEATURES } from "../_data/homepage";

export function FeaturesSection() {
    return (
        <section
            id="features"
            className="features-section"
            style={{ maxWidth: "1100px", margin: "0 auto" }}
        >
            <h2 style={{ textAlign: "center", fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, marginBottom: "2.5rem", letterSpacing: "-0.01em" }}>
                Alles wat je nodig hebt
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: "1.25rem" }}>
                {FEATURES.map(({ Icon, title, desc }) => (
                    <div key={title} className="card" style={{ padding: "1.25rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem", color: "var(--color-accent)", flexShrink: 0 }}>
                            <Icon size={20} />
                        </div>
                        <h3 style={{ fontWeight: 700, marginBottom: "0.375rem", fontSize: "0.9375rem" }}>{title}</h3>
                        <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6, margin: 0 }}>{desc}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
