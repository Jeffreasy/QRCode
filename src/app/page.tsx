import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  QrCodeIcon,
  BarChartIcon,
  LinkIcon,
  PaletteIcon,
  PackageIcon,
  ZapIcon,
  UsersIcon,
  RefreshIcon,
  SparkleIcon,
} from "@/components/ui/icons";

// Stat and feature data — typed for safety
const STATS = [
  { value: "8", label: "QR types", Icon: PackageIcon },
  { value: "<50ms", label: "Redirect tijd", Icon: ZapIcon },
  { value: "∞", label: "Wijzigingen", Icon: RefreshIcon },
] as const;

const FEATURES = [
  {
    Icon: LinkIcon,
    title: "Dynamische bestemmingen",
    desc: "Wijzig de URL achter je QR code op elk moment. De gedrukte code blijft altijd hetzelfde.",
  },
  {
    Icon: BarChartIcon,
    title: "Realtime analytics",
    desc: "Zie precies wanneer, waar en op welk device mensen jouw QR code scannen.",
  },
  {
    Icon: PaletteIcon,
    title: "Volledig aanpasbaar",
    desc: "Voeg jouw logo toe, kies kleuren en dot-stijlen. Download als SVG of PNG.",
  },
  {
    Icon: PackageIcon,
    title: "8 QR types",
    desc: "URL, vCard, WiFi, Email, SMS, Tekst, PDF en Social — alles in één platform.",
  },
  {
    Icon: ZapIcon,
    title: "Razendsnel",
    desc: "Sub-50ms redirects dankzij Next.js Edge Middleware. Scanners wachten nooit.",
  },
  {
    Icon: UsersIcon,
    title: "Multi-user",
    desc: "Meerdere gebruikers op één platform. Iedereen beheert zijn eigen QR codes.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="min-h-screen bg-grid relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "20%",
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Navbar — floating style */}
      <nav
        className="glass"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          borderBottom: "1px solid var(--color-border)",
        }}
        aria-label="Hoofdnavigatie"
      >
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
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              textDecoration: "none",
            }}
          >
            <span
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "var(--gradient-brand)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCodeIcon size={18} style={{ color: "#fff" }} />
            </span>
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
          </Link>
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
                Dashboard
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
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.375rem",
            padding: "0.375rem 1rem",
            borderRadius: "100px",
            background: "var(--color-accent-bg)",
            border: "1px solid var(--color-accent-border)",
            fontSize: "0.8125rem",
            color: "var(--color-accent)",
            fontWeight: 600,
            marginBottom: "2rem",
          }}
        >
          <SparkleIcon size={14} />
          Professionele dynamische QR codes
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
            Start gratis
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
          {STATS.map(({ value, label, Icon }) => (
            <div key={label} className="card" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-accent-bg)",
                  border: "1px solid var(--color-accent-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 0.75rem",
                  color: "var(--color-accent)",
                }}
              >
                <Icon size={18} />
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  background: "var(--gradient-brand)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "0.25rem",
                }}
              >
                {value}
              </div>
              <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                {label}
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
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="card glass-hover" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-accent-bg)",
                  border: "1px solid var(--color-accent-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1rem",
                  color: "var(--color-accent)",
                }}
              >
                <Icon size={20} />
              </div>
              <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", fontSize: "1rem" }}>
                {title}
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                {desc}
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
          color: "var(--color-text-faint)",
          fontSize: "0.8125rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <QrCodeIcon size={14} />
            © {new Date().getFullYear()} QRCodeMaster
          </div>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <Link href="/sign-up" style={{ color: "inherit", textDecoration: "none" }}>
              Gratis starten
            </Link>
            <Link href="/sign-in" style={{ color: "inherit", textDecoration: "none" }}>
              Inloggen
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
