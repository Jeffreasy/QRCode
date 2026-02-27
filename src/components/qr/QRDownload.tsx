"use client";

import { useState } from "react";
import QRCodeStyling from "qr-code-styling";
import type { QRCustomization } from "./QRPreview";
import {
    cleanSVG,
    pngInjectDPI,
    pngToWebp,
    triggerDownload,
    QR_SIZE_PRESETS,
    type SizePreset,
} from "@/lib/qr-export-utils";

// ─────────────────────────────────────────────────────────────────────────────

interface QRDownloadProps extends QRCustomization {
    value: string;
    filename?: string;
}

type Format = "png" | "svg" | "webp";

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build a QRCodeStyling instance at the given pixel size.
 * roundSize: false → shape-rendering="crispEdges" for maximum dot sharpness.
 */
function buildQR(
    size: number,
    {
        value,
        fgColor,
        bgColor,
        dotStyle,
        errorCorrectionLevel,
        logoUrl,
        cornerColor,
        cornerSquareType,
        cornerDotType,
        qrShape,
        backgroundRound,
        logoSize,
        logoMargin,
        logoHideDots,
    }: QRDownloadProps,
) {
    const resolvedCorner = cornerColor ?? fgColor ?? "#000000";
    return new QRCodeStyling({
        width: size,
        height: size,
        data: value,
        image: logoUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shape: qrShape as any,
        dotsOptions: {
            color: fgColor,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: dotStyle as any,
            roundSize: false, // crispEdges — no integer rounding artifacts
        },
        backgroundOptions: { color: bgColor, round: backgroundRound },
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
}

// ─────────────────────────────────────────────────────────────────────────────

export default function QRDownload(props: QRDownloadProps) {
    const { filename = "qr-code" } = props;

    const [sizePreset, setSizePreset] = useState<SizePreset>("print");
    const [loading, setLoading] = useState<Format | null>(null);
    const [done, setDone] = useState<Format | null>(null);

    function flash(fmt: Format) {
        setDone(fmt);
        setTimeout(() => setDone(null), 2200);
    }

    const preset = QR_SIZE_PRESETS[sizePreset];
    const isBusy = loading !== null;

    // ── PNG ──────────────────────────────────────────────────────────────────
    async function downloadPNG() {
        setLoading("png");
        try {
            const qr = buildQR(preset.px, props);
            const raw = await qr.getRawData("png") as Blob;
            const withDPI = await pngInjectDPI(raw, preset.dpi);
            triggerDownload(withDPI, `${filename}_${sizePreset}.png`);
            flash("png");
        } finally { setLoading(null); }
    }

    // ── SVG ──────────────────────────────────────────────────────────────────
    async function downloadSVG() {
        setLoading("svg");
        try {
            // SVG is vector — size param only affects internal coordinate space
            const qr = buildQR(1024, props);
            const raw = await qr.getRawData("svg") as Blob;
            const svgText = await raw.text();
            const clean = cleanSVG(svgText, 1024);
            const blob = new Blob([clean], { type: "image/svg+xml;charset=utf-8" });
            triggerDownload(blob, `${filename}.svg`);
            flash("svg");
        } finally { setLoading(null); }
    }

    // ── WEBP ─────────────────────────────────────────────────────────────────
    async function downloadWEBP() {
        setLoading("webp");
        try {
            const qr = buildQR(preset.px, props);
            const raw = await qr.getRawData("png") as Blob;
            const webp = await pngToWebp(raw, 0.92);
            triggerDownload(webp, `${filename}_${sizePreset}.webp`);
            flash("webp");
        } finally { setLoading(null); }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Render
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="card" style={{ padding: "1.5rem" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </div>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>Download QR code</h4>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-text-faint)", margin: 0 }}>
                        SVG vectorformaat · PNG/WEBP tot 4800 px · 300 DPI metadata
                    </p>
                </div>
            </div>

            {/* Size preset selector — only relevant for pixel formats */}
            <div style={{ marginBottom: "1rem" }}>
                <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                    Resolutie (PNG · WEBP)
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {(Object.entries(QR_SIZE_PRESETS) as [SizePreset, typeof QR_SIZE_PRESETS[SizePreset]][]).map(([key, p]) => (
                        <button
                            key={key}
                            onClick={() => setSizePreset(key)}
                            disabled={isBusy}
                            style={{
                                flex: 1,
                                padding: "0.5rem 0.375rem",
                                borderRadius: "var(--radius-md)",
                                border: `1px solid ${sizePreset === key ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                background: sizePreset === key ? "var(--color-accent-bg)" : "var(--color-surface-2)",
                                color: sizePreset === key ? "var(--color-accent)" : "var(--color-text)",
                                cursor: isBusy ? "not-allowed" : "pointer",
                                transition: "all 0.15s ease",
                                textAlign: "center",
                            }}
                        >
                            <div style={{ fontSize: "0.78rem", fontWeight: sizePreset === key ? 700 : 500 }}>{p.label}</div>
                            <div style={{ fontSize: "0.62rem", color: sizePreset === key ? "var(--color-accent)" : "var(--color-text-faint)", marginTop: "0.125rem" }}>{p.sub}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Screen reader status announcer */}
            <div role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                {done === "png" && "PNG bestand opgeslagen"}
                {done === "svg" && "SVG bestand opgeslagen"}
                {done === "webp" && "WEBP bestand opgeslagen"}
            </div>

            {/* Format buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                <FormatButton
                    label="PNG"
                    sub="Foto formaat"
                    state={loading === "png" ? "loading" : done === "png" ? "done" : "idle"}
                    disabled={isBusy}
                    onClick={downloadPNG}
                    icon={<ImageIcon />}
                />
                <FormatButton
                    label="WEBP"
                    sub="Web geoptimaliseerd"
                    state={loading === "webp" ? "loading" : done === "webp" ? "done" : "idle"}
                    disabled={isBusy}
                    onClick={downloadWEBP}
                    icon={<ImageIcon />}
                />
                <FormatButton
                    label="SVG"
                    sub="Vectorformaat"
                    state={loading === "svg" ? "loading" : done === "svg" ? "done" : "idle"}
                    disabled={isBusy}
                    onClick={downloadSVG}
                    icon={<VectorIcon />}
                />
            </div>

            {/* Info footer */}
            <div style={{ marginTop: "0.875rem", padding: "0.5rem 0.75rem", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                    SVG → onbeperkt schaalbaar · PNG/WEBP Print-preset bevat 300 DPI metadata
                </span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

type ButtonState = "idle" | "loading" | "done";

function FormatButton({
    label, sub, state, disabled, onClick, icon,
}: {
    label: string;
    sub: string;
    state: ButtonState;
    disabled: boolean;
    onClick: () => void;
    icon: React.ReactNode;
}) {
    const isDone = state === "done";
    const isLoading = state === "loading";

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={`Download QR code als ${label}`}
            style={{
                padding: "0.75rem 0.5rem",
                borderRadius: "var(--radius-md)",
                border: `1px solid ${isDone ? "var(--color-success)" : "var(--color-border)"}`,
                background: isDone ? "var(--color-success-bg)" : "var(--color-surface-2)",
                color: isDone ? "var(--color-success)" : "var(--color-text)",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled && !isLoading ? 0.5 : 1,
                transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.375rem",
            }}
            onMouseEnter={(e) => {
                if (!disabled && !isDone) {
                    const el = e.currentTarget;
                    el.style.borderColor = "var(--color-accent-border-active)";
                    el.style.background = "var(--color-accent-bg)";
                }
            }}
            onMouseLeave={(e) => {
                if (!isDone) {
                    const el = e.currentTarget;
                    el.style.borderColor = "var(--color-border)";
                    el.style.background = "var(--color-surface-2)";
                }
            }}
        >
            {isLoading ? <SpinnerIcon /> : isDone ? <CheckIcon /> : icon}
            <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>
                {isLoading ? "Bezig..." : isDone ? "Klaar!" : label}
            </span>
            <span style={{ fontSize: "0.62rem", color: isDone ? "var(--color-success)" : "var(--color-text-faint)" }}>
                {sub}
            </span>
        </button>
    );
}

// ── Inline SVG icons ─────────────────────────────────────────────────────────

function SpinnerIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function ImageIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

function VectorIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}
