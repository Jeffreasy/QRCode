"use client";

import { useEffect, useRef } from "react";
import QRCodeStyling from "qr-code-styling";

interface QRPreviewProps {
    value: string;
    fgColor?: string;
    bgColor?: string;
    dotStyle?: string;
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    size?: number;
    logoUrl?: string;
}

export default function QRPreview({
    value,
    fgColor = "#000000",
    bgColor = "#ffffff",
    dotStyle = "square",
    errorCorrectionLevel = "M",
    size = 220,
    logoUrl,
}: QRPreviewProps) {
    const ref = useRef<HTMLDivElement>(null);
    const qrRef = useRef<QRCodeStyling | null>(null);

    useEffect(() => {
        if (!ref.current) return;
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
        qrRef.current.append(ref.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, fgColor, bgColor, dotStyle, errorCorrectionLevel, size, logoUrl]);

    return (
        <div className="qr-preview" style={{ display: "inline-block" }}>
            <div ref={ref} />
        </div>
    );
}
