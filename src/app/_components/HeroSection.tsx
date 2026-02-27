import Link from "next/link";
import { SparkleIcon } from "@/components/ui/icons";
import { STATS } from "../_data/homepage";

export function HeroSection() {
    return (
        <section
            id="hero"
            className="hero-section animate-fade-in-up"
            style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center", paddingTop: "5rem" }}
        >
            {/* Badge */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 1rem", borderRadius: "100px", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", fontSize: "0.8125rem", color: "var(--color-accent)", fontWeight: 600, marginBottom: "1.5rem" }}>
                <SparkleIcon size={14} />
                Professionele dynamische QR codes
            </div>

            <h1 style={{ fontSize: "clamp(2rem, 6vw, 4.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1.25rem", letterSpacing: "-0.02em" }}>
                QR codes die{" "}
                <span className="gradient-text">mee veranderen</span>
                {" "}met jouw merk
            </h1>

            <p style={{ fontSize: "clamp(0.9375rem, 2.5vw, 1.125rem)", color: "var(--color-text-muted)", maxWidth: "560px", margin: "0 auto 2rem", lineHeight: 1.7 }}>
                Maak professionele QR codes die je op elk moment kunt aanpassen.
                Volg scans in realtime, analyseer je publiek en download in hoge kwaliteit.
            </p>

            <div className="hero-cta-group">
                <Link href="/sign-up" className="btn btn-primary btn-lg">Start gratis</Link>
                <a href="#features" className="btn btn-secondary btn-lg">Bekijk functies</a>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {STATS.map(({ value, label, Icon }) => (
                    <div key={label} className="card" style={{ padding: "1.25rem 1rem" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: "var(--color-accent)" }}>
                            <Icon size={18} />
                        </div>
                        <div style={{ fontSize: "clamp(1.5rem, 4vw, 2rem)", fontWeight: 800, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "0.25rem" }}>
                            {value}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>{label}</div>
                    </div>
                ))}
            </div>
        </section>
    );
}
