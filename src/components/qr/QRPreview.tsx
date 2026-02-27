"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";

export interface QRCustomization {
    fgColor?: string;
    bgColor?: string;
    dotStyle?: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    logoUrl?: string;
    cornerColor?: string;
    cornerSquareType?: "square" | "dot" | "extra-rounded";
    cornerDotType?: "square" | "dot";
    qrShape?: "square" | "circle";
    backgroundRound?: number;
    // Border properties (CSS-level)
    borderEnabled?: boolean;
    borderColor?: string;
    borderWidth?: number;
    borderRadius?: number;
    // Logo image options
    logoSize?: number;       // 0.1 – 0.5 (imageSize fraction)
    logoMargin?: number;     // 0 – 20 px
    logoHideDots?: boolean;  // hide QR dots behind logo
}

interface QRPreviewProps extends QRCustomization {
    value: string;
    size?: number;
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
    cornerSquareType,
    cornerDotType,
    qrShape = "square",
    backgroundRound = 0,
    borderEnabled = false,
    borderColor = "#38bdf8",
    borderWidth = 4,
    borderRadius = 16,
    logoSize = 0.35,
    logoMargin = 4,
    logoHideDots = true,
}: QRPreviewProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [isRendering, setIsRendering] = useState(true);

    const resolvedCorner = cornerColor ?? fgColor;

    useEffect(() => {
        if (!ref.current) return;
        setIsRendering(true);
        ref.current.innerHTML = "";

        const qr = new QRCodeStyling({
            width: size,
            height: size,
            data: value || "https://qrcodemaster.app",
            image: logoUrl,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            shape: qrShape as any,
            dotsOptions: {
                color: fgColor,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: dotStyle as any,
            },
            backgroundOptions: {
                color: bgColor,
                round: backgroundRound,
            },
            cornersSquareOptions: {
                color: resolvedCorner,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: cornerSquareType as any,
            },
            cornersDotOptions: {
                color: resolvedCorner,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type: cornerDotType as any,
            },
            qrOptions: { errorCorrectionLevel },
            imageOptions: {
                crossOrigin: "anonymous",
                hideBackgroundDots: logoHideDots,
                imageSize: logoSize,
                margin: logoMargin,
            },
        });

        qr.append(ref.current);
        const timer = setTimeout(() => setIsRendering(false), 150);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, fgColor, bgColor, dotStyle, errorCorrectionLevel, size, logoUrl,
        cornerColor, cornerSquareType, cornerDotType, qrShape, backgroundRound,
        logoSize, logoMargin, logoHideDots]);

    const activeBorderRadius = borderEnabled ? borderRadius ?? 16 : 20;
    const activeBorderStyle = borderEnabled
        ? `${borderWidth ?? 4}px solid ${borderColor ?? "#38bdf8"}`
        : "none";

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <div
                style={{
                    position: "relative",
                    padding: "1.25rem",
                    background: "#ffffff",
                    borderRadius: `${activeBorderRadius}px`,
                    border: activeBorderStyle,
                    boxShadow: borderEnabled
                        ? `0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.15), 0 0 48px ${borderColor ?? "#38bdf8"}33`
                        : "0 0 0 1px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.15), 0 0 48px rgba(56,189,248,0.12)",
                    display: "inline-block",
                    transition: "border 0.2s ease, border-radius 0.2s ease, box-shadow 0.2s ease",
                }}
            >
                {/* Skeleton */}
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

                {/* QR Canvas */}
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

                {/* Corner accents — hidden when border is on */}
                {!borderEnabled && ["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => {
                    const [v, h] = pos.split("-");
                    return (
                        <div key={pos} style={{
                            position: "absolute",
                            [v]: "6px", [h]: "6px",
                            width: "12px", height: "12px",
                            borderTop: v === "top" ? "2px solid rgba(56,189,248,0.5)" : "none",
                            borderBottom: v === "bottom" ? "2px solid rgba(56,189,248,0.5)" : "none",
                            borderLeft: h === "left" ? "2px solid rgba(56,189,248,0.5)" : "none",
                            borderRight: h === "right" ? "2px solid rgba(56,189,248,0.5)" : "none",
                            borderRadius: v === "top" && h === "left" ? "3px 0 0 0"
                                : v === "top" && h === "right" ? "0 3px 0 0"
                                    : v === "bottom" && h === "left" ? "0 0 0 3px" : "0 0 3px 0",
                        }} />
                    );
                })}
            </div>

            {/* Live indicator */}
            <div style={{
                display: "flex", alignItems: "center", gap: "0.375rem",
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
