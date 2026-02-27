"use client";

import { useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRDownloadProps {
    value: string;
    fgColor?: string;
    bgColor?: string;
    dotStyle?: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    filename?: string;
    logoUrl?: string;
}

export default function QRDownload({
    value,
    fgColor = "#000000",
    bgColor = "#ffffff",
    dotStyle = "square",
    errorCorrectionLevel = "M",
    filename = "qr-code",
    logoUrl,
}: QRDownloadProps) {
    const [loadingPng, setLoadingPng] = useState(false);
    const [loadingSvg, setLoadingSvg] = useState(false);
    const [justDownloaded, setJustDownloaded] = useState<"png" | "svg" | null>(null);

    function getQR(size: number) {
        return new QRCodeStyling({
            width: size,
            height: size,
            data: value,
            image: logoUrl,
            dotsOptions: {
                color: fgColor,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: dotStyle as any,
            },
            backgroundOptions: { color: bgColor },
            cornersSquareOptions: { color: fgColor },
            cornersDotOptions: { color: fgColor },
            qrOptions: { errorCorrectionLevel },
            imageOptions: {
                crossOrigin: "anonymous",
                hideBackgroundDots: true,
                imageSize: 0.35,
                margin: 4,
            },
        });
    }

    async function downloadPNG() {
        setLoadingPng(true);
        try {
            const qr = getQR(1024);
            await qr.download({ name: filename, extension: "png" });
            setJustDownloaded("png");
            setTimeout(() => setJustDownloaded(null), 2000);
        } finally {
            setLoadingPng(false);
        }
    }

    async function downloadSVG() {
        setLoadingSvg(true);
        try {
            const qr = getQR(1024);
            await qr.download({ name: filename, extension: "svg" });
            setJustDownloaded("svg");
            setTimeout(() => setJustDownloaded(null), 2000);
        } finally {
            setLoadingSvg(false);
        }
    }

    return (
        <div
            className="card"
            style={{ padding: "1.5rem" }}
        >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                <div style={{
                    width: "32px", height: "32px", borderRadius: "8px",
                    background: "var(--color-accent-bg)",
                    border: "1px solid var(--color-accent-border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </div>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>Download QR code</h4>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-text-faint)", margin: 0 }}>
                        Hoge resolutie · 1024 × 1024 px
                    </p>
                </div>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
                {/* PNG */}
                <button
                    onClick={downloadPNG}
                    disabled={loadingPng || loadingSvg}
                    style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${justDownloaded === "png" ? "var(--color-success)" : "var(--color-border)"}`,
                        background: justDownloaded === "png"
                            ? "var(--color-success-bg)"
                            : "var(--color-surface-2)",
                        color: justDownloaded === "png" ? "var(--color-success)" : "var(--color-text)",
                        cursor: (loadingPng || loadingSvg) ? "not-allowed" : "pointer",
                        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                        opacity: loadingSvg ? 0.5 : 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.375rem",
                    }}
                    onMouseEnter={(e) => {
                        if (!loadingPng && !loadingSvg && justDownloaded !== "png") {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-accent-border-active)";
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-accent-bg)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (justDownloaded !== "png") {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)";
                        }
                    }}
                >
                    {loadingPng ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    ) : justDownloaded === "png" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                    )}
                    <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                        {loadingPng ? "Genereren..." : justDownloaded === "png" ? "Opgeslagen!" : "PNG"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--color-text-faint)" }}>Foto formaat</span>
                </button>

                {/* SVG */}
                <button
                    onClick={downloadSVG}
                    disabled={loadingPng || loadingSvg}
                    style={{
                        flex: 1,
                        padding: "0.75rem 1rem",
                        borderRadius: "var(--radius-md)",
                        border: `1px solid ${justDownloaded === "svg" ? "var(--color-success)" : "var(--color-border)"}`,
                        background: justDownloaded === "svg"
                            ? "var(--color-success-bg)"
                            : "var(--color-surface-2)",
                        color: justDownloaded === "svg" ? "var(--color-success)" : "var(--color-text)",
                        cursor: (loadingPng || loadingSvg) ? "not-allowed" : "pointer",
                        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                        opacity: loadingPng ? 0.5 : 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.375rem",
                    }}
                    onMouseEnter={(e) => {
                        if (!loadingPng && !loadingSvg && justDownloaded !== "svg") {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-accent-border-active)";
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-accent-bg)";
                        }
                    }}
                    onMouseLeave={(e) => {
                        if (justDownloaded !== "svg") {
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                            (e.currentTarget as HTMLButtonElement).style.background = "var(--color-surface-2)";
                        }
                    }}
                >
                    {loadingSvg ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    ) : justDownloaded === "svg" ? (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    ) : (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="12 2 2 7 12 12 22 7 12 2" />
                            <polyline points="2 17 12 22 22 17" />
                            <polyline points="2 12 12 17 22 12" />
                        </svg>
                    )}
                    <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                        {loadingSvg ? "Genereren..." : justDownloaded === "svg" ? "Opgeslagen!" : "SVG"}
                    </span>
                    <span style={{ fontSize: "0.68rem", color: "var(--color-text-faint)" }}>Vectorformaat</span>
                </button>
            </div>

            {/* Footer note */}
            <div style={{
                marginTop: "0.875rem",
                padding: "0.5rem 0.75rem",
                background: "var(--color-accent-bg)",
                border: "1px solid var(--color-accent-border)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
            }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                    SVG is schaalbaar voor print zonder kwaliteitsverlies
                </span>
            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
