import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-grid relative overflow-hidden">
      {/* Ambient background glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            right: "15%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "64px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.5rem" }}>⬡</span>
            <span
              style={{
                fontWeight: 800,
                fontSize: "1.125rem",
                background: "var(--gradient-brand)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              QRCodeMaster
            </span>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <SignedOut>
              <Link href="/sign-in" className="btn btn-ghost btn-sm">
                Inloggen
              </Link>
              <Link href="/sign-up" className="btn btn-primary btn-sm">
                Gratis starten
              </Link>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard" className="btn btn-primary btn-sm">
                Dashboard →
              </Link>
            </SignedIn>
          </div>
        </div>
      </nav>

      {/* Hero section */}
      <section
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "8rem 1.5rem 6rem",
          textAlign: "center",
        }}
        className="animate-fade-in-up"
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.375rem 1rem",
            borderRadius: "100px",
            background: "rgba(56,189,248,0.1)",
            border: "1px solid rgba(56,189,248,0.2)",
            fontSize: "0.8125rem",
            color: "var(--color-accent)",
            fontWeight: 600,
            marginBottom: "2rem",
          }}
        >
          ✦ Professionele dynamische QR codes
        </div>

        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "1.5rem",
            letterSpacing: "-0.02em",
          }}
        >
          QR codes die{" "}
          <span className="gradient-text">mee veranderen</span>
          {" "}met jouw merk
        </h1>

        <p
          style={{
            fontSize: "1.125rem",
            color: "var(--color-text-muted)",
            maxWidth: "560px",
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Maak professionele QR codes die je op elk moment kunt aanpassen.
          Volg scans in realtime, analyseer je publiek en download in hoge kwaliteit.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/sign-up" className="btn btn-primary btn-lg">
            Start gratis →
          </Link>
          <Link href="/sign-in" className="btn btn-secondary btn-lg">
            Demo bekijken
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1.5rem",
            marginTop: "5rem",
          }}
        >
          {[
            { value: "8", label: "QR types", icon: "📦" },
            { value: "<50ms", label: "Redirect tijd", icon: "⚡" },
            { value: "∞", label: "Wijzigingen", icon: "🔄" },
          ].map((stat) => (
            <div key={stat.label} className="card" style={{ padding: "1.5rem" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: "var(--gradient-brand)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features section */}
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "4rem 1.5rem 8rem",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "2rem",
            fontWeight: 800,
            marginBottom: "3rem",
            letterSpacing: "-0.01em",
          }}
        >
          Alles wat je nodig hebt
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {[
            {
              icon: "🔗",
              title: "Dynamische bestemmingen",
              desc: "Wijzig de URL achter je QR code op elk moment. De gedrukte code blijft altijd hetzelfde.",
            },
            {
              icon: "📊",
              title: "Realtime analytics",
              desc: "Zie precies wanneer, waar en op welk device mensen jouw QR code scannen.",
            },
            {
              icon: "🎨",
              title: "Volledig aanpasbaar",
              desc: "Voeg jouw logo toe, kies kleuren en dot-stijlen. Download als SVG of PNG.",
            },
            {
              icon: "📦",
              title: "8 QR types",
              desc: "URL, vCard, WiFi, Email, SMS, Tekst, PDF en Social — alles in één platform.",
            },
            {
              icon: "⚡",
              title: "Razendsnel",
              desc: "Sub-50ms redirects dankzij Next.js Edge Middleware. Scanners wachten nooit.",
            },
            {
              icon: "👥",
              title: "Multi-user",
              desc: "Meerdere gebruikers op één platform. Iedereen beheert zijn eigen QR codes.",
            },
          ].map((feature) => (
            <div key={feature.title} className="card glass-hover" style={{ padding: "1.5rem" }}>
              <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{feature.icon}</div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid var(--color-border)",
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: "var(--color-text-faint)",
          fontSize: "0.8125rem",
        }}
      >
        © {new Date().getFullYear()} QRCodeMaster — Gebouwd met Next.js & Convex
      </footer>
    </main>
  );
}
