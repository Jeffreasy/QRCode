"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRPreviewProps {
    value: string;
    fgColor?: string;
    bgColor?: string;
    dotStyle?: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    size?: number;
    logoUrl?: string;
    cornerColor?: string;
}

export default function QRPreview({
    value,
    fgColor = "#000000",
    bgColor = "#ffffff",
    dotStyle = "square",
    errorCorrectionLevel = "M",
    size = 220,
    logoUrl,
    cornerColor,
}: QRPreviewProps) {
    const ref = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);
    const [isRendering, setIsRendering] = useState(true);

    const resolvedCorner = cornerColor ?? fgColor;

    useEffect(() => {
        if (!ref.current) return;
        setIsRendering(true);
        ref.current.innerHTML = "";

        qrRef.current = new QRCodeStyling({
            width: size,
            height: size,
            data: value || "https://qrcodemaster.app",
            image: logoUrl,
            dotsOptions: {
                color: fgColor,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: dotStyle as any,
            },
            backgroundOptions: { color: bgColor },
            cornersSquareOptions: { color: resolvedCorner },
            cornersDotOptions: { color: resolvedCorner },
            qrOptions: { errorCorrectionLevel },
            imageOptions: {
                crossOrigin: "anonymous",
                hideBackgroundDots: true,
                imageSize: 0.35,
                margin: 4,
            },
        });

        qrRef.current.append(ref.current);

        // Small delay to let the canvas render before removing the skeleton
        const timer = setTimeout(() => setIsRendering(false), 150);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, fgColor, bgColor, dotStyle, errorCorrectionLevel, size, logoUrl, cornerColor]);

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            {/* QR Frame — hover effect handled by .card CSS class on parent */}
            <div
                style={{
                    position: "relative",
                    padding: "1.25rem",
                    background: "#ffffff",
                    borderRadius: "var(--radius-xl)",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.15), 0 0 48px rgba(56,189,248,0.12)",
                    display: "inline-block",
                }}
            >
                {/* Skeleton overlay while rendering */}
                {isRendering && (
                    <div style={{
                        position: "absolute",
                        inset: "1.25rem",
                        borderRadius: "var(--radius-md)",
                        background: "linear-gradient(90deg, var(--skeleton-from) 25%, var(--skeleton-to) 50%, var(--skeleton-from) 75%)",
                        backgroundSize: "200% 100%",
                        animation: "shimmer 1.2s infinite",
                        zIndex: 2,
                    }} />
                )}

                {/* Actual QR canvas */}
                <div
                    ref={ref}
                    aria-label="QR code preview"
                    role="img"
                    style={{
                        opacity: isRendering ? 0 : 1,
                        transition: "opacity 0.25s ease",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                    }}
                />

                {/* Corner accents */}
                {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => {
                    const [v, h] = pos.split("-");
                    return (
                        <div
                            key={pos}
                            style={{
                                position: "absolute",
                                [v]: "6px",
                                [h]: "6px",
                                width: "12px",
                                height: "12px",
                                borderTop: v === "top" ? "2px solid rgba(56,189,248,0.5)" : "none",
                                borderBottom: v === "bottom" ? "2px solid rgba(56,189,248,0.5)" : "none",
                                borderLeft: h === "left" ? "2px solid rgba(56,189,248,0.5)" : "none",
                                borderRight: h === "right" ? "2px solid rgba(56,189,248,0.5)" : "none",
                                borderRadius: v === "top" && h === "left" ? "3px 0 0 0"
                                    : v === "top" && h === "right" ? "0 3px 0 0"
                                        : v === "bottom" && h === "left" ? "0 0 0 3px"
                                            : "0 0 3px 0",
                            }}
                        />
                    );
                })}
            </div>

            {/* Preview label */}
            <div style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.25rem 0.75rem",
                background: "rgba(56,189,248,0.08)",
                border: "1px solid rgba(56,189,248,0.15)",
                borderRadius: "100px",
            }}>
                <div style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "var(--color-accent)",
                    animation: "qr-pulse 2s ease-in-out infinite",
                }} />
                <span style={{ fontSize: "0.7rem", color: "var(--color-accent)", fontWeight: 500, letterSpacing: "0.03em" }}>
                    Live preview
                </span>
            </div>

            <style>{`
                @keyframes qr-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.8); }
                }
            `}</style>
        </div>
    );
}
