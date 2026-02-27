"use client";

import { useRef } from "react";
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
    const qrRef = useRef<QRCodeStyling | null>(null);

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

    function downloadPNG() {
        const qr = getQR(1024);
        qr.download({ name: filename, extension: "png" });
    }

    function downloadSVG() {
        const qr = getQR(1024);
        qr.download({ name: filename, extension: "svg" });
    }

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.9rem" }}>⬇ Download QR code</h4>
            <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={downloadPNG}>
                    📷 PNG (1024px)
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={downloadSVG}>
                    ⬡ SVG (vector)
                </button>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--color-text-faint)", marginTop: "0.625rem" }}>
                SVG is schaalbaar voor print zonder kwaliteitsverlies.
            </p>
        </div>
    );
}
