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
function buildQR(size: number, props: QRDownloadProps): InstanceType<typeof QRCodeStyling> {
    const resolvedCorner = props.cornerColor ?? props.fgColor ?? "#000000";
    return new QRCodeStyling({
        width: size,
        height: size,
        data: props.value,
        image: props.logoUrl,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        shape: props.qrShape as any,
        dotsOptions: {
            color: props.fgColor,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: props.dotStyle as any,
            roundSize: false, // crispEdges — no integer-rounding artifacts
        },
        backgroundOptions: { color: props.bgColor, round: props.backgroundRound },
        cornersSquareOptions: {
            color: resolvedCorner,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: props.cornerSquareType as any,
        },
        cornersDotOptions: {
            color: resolvedCorner,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            type: props.cornerDotType as any,
        },
        qrOptions: { errorCorrectionLevel: props.errorCorrectionLevel },
        imageOptions: {
            crossOrigin: "anonymous",
            hideBackgroundDots: props.logoHideDots,
            imageSize: props.logoSize,
            margin: props.logoMargin,
        },
    });
}

// ─────────────────────────────────────────────────────────────────────────────

export default function QRDownload(props: QRDownloadProps) {
    const { filename = "qr-code" } = props;

    const [sizePreset, setSizePreset] = useState<SizePreset>("print");
    const [loading, setLoading] = useState<Format | null>(null);
    const [done, setDone] = useState<Format | null>(null);

    const preset = QR_SIZE_PRESETS[sizePreset];
    const isBusy = loading !== null;

    function flash(fmt: Format) {
        setDone(fmt);
        setTimeout(() => setDone(null), 2200);
    }

    // ── Downloaders ───────────────────────────────────────────────────────────

    async function downloadPNG() {
        setLoading("png");
        try {
            const raw = await buildQR(preset.px, props).getRawData("png") as Blob;
            const withDPI = await pngInjectDPI(raw, preset.dpi);
            triggerDownload(withDPI, `${filename}_${sizePreset}.png`);
            flash("png");
        } finally { setLoading(null); }
    }

    async function downloadSVG() {
        setLoading("svg");
        try {
            const raw = await buildQR(1024, props).getRawData("svg") as Blob;
            const svgText = await raw.text();
            const clean = cleanSVG(svgText, 1024);
            triggerDownload(new Blob([clean], { type: "image/svg+xml;charset=utf-8" }), `${filename}.svg`);
            flash("svg");
        } finally { setLoading(null); }
    }

    async function downloadWEBP() {
        setLoading("webp");
        try {
            const raw = await buildQR(preset.px, props).getRawData("png") as Blob;
            const webp = await pngToWebp(raw, 0.92);
            triggerDownload(webp, `${filename}_${sizePreset}.webp`);
            flash("webp");
        } finally { setLoading(null); }
    }

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <div className="card" style={{ padding: "1.25rem" }}>

            {/* ── Header ─────────────────────────────────────────────────── */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.125rem" }}>
                <div style={{ width: "32px", height: "32px", minWidth: "32px", borderRadius: "8px", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                </div>
                <div>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>Download QR code</h4>
                    <p style={{ fontSize: "0.72rem", color: "var(--color-text-faint)", margin: 0 }}>
                        SVG vectorformaat · PNG/WEBP tot 4800 px · 300 DPI
                    </p>
                </div>
            </div>

            {/* ── Resolution presets ─────────────────────────────────────── */}
            <p style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0.5rem" }}>
                Resolutie <span style={{ fontWeight: 400, textTransform: "none" }}>(PNG · WEBP)</span>
            </p>

            <div className="qr-preset-grid" style={{ marginBottom: "1rem" }}>
                {(Object.entries(QR_SIZE_PRESETS) as [SizePreset, typeof QR_SIZE_PRESETS[SizePreset]][]).map(([key, p]) => (
                    <button
                        key={key}
                        onClick={() => setSizePreset(key)}
                        disabled={isBusy}
                        aria-pressed={sizePreset === key}
                        className={`qr-preset-btn${sizePreset === key ? " active" : ""}`}
                    >
                        {/* Desktop: stacked. Mobile (CSS): side-by-side icon + text */}
                        <PresetIcon preset={key} />
                        <span className="qr-btn-labels">
                            <span style={{ display: "block", fontSize: "0.78rem", fontWeight: sizePreset === key ? 700 : 500 }}>{p.label}</span>
                            <span style={{ display: "block", fontSize: "0.62rem", color: sizePreset === key ? "var(--color-accent)" : "var(--color-text-faint)", marginTop: "0.1rem" }}>{p.sub}</span>
                        </span>
                    </button>
                ))}
            </div>

            {/* Screen reader status */}
            <div role="status" aria-live="polite" aria-atomic="true" style={{ position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0,0,0,0)", whiteSpace: "nowrap" }}>
                {done === "png" && "PNG bestand opgeslagen"}
                {done === "svg" && "SVG bestand opgeslagen"}
                {done === "webp" && "WEBP bestand opgeslagen"}
            </div>

            {/* ── Format buttons ─────────────────────────────────────────── */}
            <div className="qr-format-grid">
                <FormatButton
                    label="PNG"
                    sub="Foto formaat"
                    ariaLabel={`Download QR code als PNG, ${preset.label} preset (${preset.sub})`}
                    state={loading === "png" ? "loading" : done === "png" ? "done" : "idle"}
                    disabled={isBusy}
                    onClick={downloadPNG}
                    icon={<ImageIcon />}
                />
                <FormatButton
                    label="WEBP"
                    sub="Web — ~30% kleiner"
                    ariaLabel={`Download QR code als WEBP, ${preset.label} preset (${preset.sub})`}
                    state={loading === "webp" ? "loading" : done === "webp" ? "done" : "idle"}
                    disabled={isBusy}
                    onClick={downloadWEBP}
                    icon={<ImageIcon />}
                />
                <FormatButton
                    label="SVG"
                    sub="Vectorformaat"
                    ariaLabel="Download QR code als SVG (onbeperkt schaalbaar)"
                    state={loading === "svg" ? "loading" : done === "svg" ? "done" : "idle"}
                    disabled={isBusy}
                    onClick={downloadSVG}
                    icon={<VectorIcon />}
                />
            </div>

            {/* ── Info footer ────────────────────────────────────────────── */}
            <div style={{ marginTop: "0.875rem", padding: "0.5rem 0.75rem", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }} aria-hidden="true">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", lineHeight: 1.5 }}>
                    SVG → onbeperkt schaalbaar · Print-preset bevat 300 DPI metadata voor drukkerijen
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
    label, sub, ariaLabel, state, disabled, onClick, icon,
}: {
    label: string;
    sub: string;
    ariaLabel: string;
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
            aria-label={ariaLabel}
            className={`qr-format-btn${isDone ? " done" : ""}`}
            style={{ opacity: disabled && !isLoading ? 0.5 : 1 }}
        >
            {isLoading ? <SpinnerIcon /> : isDone ? <CheckIcon /> : icon}
            <span className="qr-btn-labels">
                <span style={{ display: "block", fontSize: "0.78rem", fontWeight: 600 }}>
                    {isLoading ? "Bezig..." : isDone ? "Klaar!" : label}
                </span>
                <span style={{ display: "block", fontSize: "0.62rem", color: isDone ? "var(--color-success)" : "var(--color-text-faint)", marginTop: "0.1rem" }}>
                    {sub}
                </span>
            </span>
        </button>
    );
}

// ── Preset icon (small indicator) ────────────────────────────────────────────

function PresetIcon({ preset }: { preset: SizePreset }) {
    const color = "currentColor";
    if (preset === "screen") return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
    );
    if (preset === "print") return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
            <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
        </svg>
    );
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true">
            <path d="M3 9l4-4 4 4M3 15l4 4 4-4M17 4v16" />
        </svg>
    );
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

function SpinnerIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true" style={{ flexShrink: 0 }}>
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

function CheckIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <polyline points="20 6 9 17 4 12" />
        </svg>
    );
}

function ImageIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
        </svg>
    );
}

function VectorIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}
