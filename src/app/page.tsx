import { HomeNav } from "./_components/HomeNav";
import { HeroSection } from "./_components/HeroSection";
import { FeaturesSection } from "./_components/FeaturesSection";
import { TrustSection } from "./_components/TrustSection";
import { PricingSection } from "./_components/PricingSection";
import { FaqSection } from "./_components/FaqSection";
import { HomeFooter } from "./_components/HomeFooter";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-grid relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div style={{ position: "absolute", top: "10%", left: "20%", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(56,189,248,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "15%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(129,140,248,0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(40px)" }} />
      </div>

      <HomeNav />
      <HeroSection />
      <FeaturesSection />
      <TrustSection />
      <PricingSection />
      <FaqSection />
      <HomeFooter />
    </main>
  );
}
