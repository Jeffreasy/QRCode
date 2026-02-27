import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import "./globals.css";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://qrcodemaster.app");

// Ensure protocol is always present (Vercel env vars sometimes omit it)
const siteUrl = rawSiteUrl.startsWith("http") ? rawSiteUrl : `https://${rawSiteUrl}`;


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "QRCodeMaster — Professionele Dynamische QR Codes",
    template: "%s | QRCodeMaster",
  },
  description:
    "Maak, beheer en analyseer professionele dynamische QR codes. Wijzig de bestemming op elk moment zonder de QR code opnieuw te printen.",
  keywords: ["dynamische QR codes", "QR generator", "QR analytics", "dynamic QR"],
  openGraph: {
    title: "QRCodeMaster — Professionele Dynamische QR Codes",
    description: "Maak professionele dynamische QR codes die je altijd kunt aanpassen.",
    url: siteUrl,
    siteName: "QRCodeMaster",
    locale: "nl_NL",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QRCodeMaster",
    description: "Professionele dynamische QR codes",
  },
  robots: {
    index: process.env.NODE_ENV === "production",
    follow: process.env.NODE_ENV === "production",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? ""} dynamic>
      <html lang="nl">
        <body>
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
