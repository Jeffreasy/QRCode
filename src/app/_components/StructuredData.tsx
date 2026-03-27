import { FAQ_ITEMS } from "../_data/faq";

const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "https://www.jeffdash.com");

function buildFaqSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ_ITEMS.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };
}

function buildSoftwareSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "QRCodeMaster",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description:
            "Maak, beheer en analyseer professionele dynamische QR codes. Wijzig de bestemming op elk moment zonder opnieuw te printen.",
        offers: [
            {
                "@type": "Offer",
                name: "Starter",
                price: "0",
                priceCurrency: "EUR",
                description: "Gratis plan — tot 5 dynamische QR codes",
            },
            {
                "@type": "Offer",
                name: "Pro",
                price: "9.99",
                priceCurrency: "EUR",
                description: "Onbeperkt dynamische QR codes met geavanceerde analytics",
            },
        ],
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            ratingCount: "120",
            bestRating: "5",
        },
    };
}

function buildOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "QRCodeMaster",
        url: SITE_URL,
        logo: `${SITE_URL}/favicon.ico`,
        description:
            "Professionele dynamische QR codes voor bedrijven en particulieren in Nederland.",
        contactPoint: {
            "@type": "ContactPoint",
            email: "support@qrcodemaster.nl",
            contactType: "customer service",
            availableLanguage: ["Dutch", "English"],
        },
    };
}

export function StructuredData() {
    const faqSchema = buildFaqSchema();
    const softwareSchema = buildSoftwareSchema();
    const orgSchema = buildOrganizationSchema();

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
            />
        </>
    );
}
