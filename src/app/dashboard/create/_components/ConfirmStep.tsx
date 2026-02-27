"use client";

import { QR_TYPE_META, QRType } from "@/lib/qr-types";
import { QRCustomization } from "../_hooks/useQRCustomization";
import { DOT_STYLES } from "../_constants";

export function ConfirmStep({
    title,
    selectedType,
    computedDestination,
    customization,
    siteUrl,
    errorMsg,
    hasLowContrast,
}: {
    title: string;
    selectedType: QRType;
    computedDestination: string;
    customization: QRCustomization;
    siteUrl: string;
    errorMsg: string;
    hasLowContrast: boolean;
}) {
    return (
        <div>
            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Bevestigen &amp; opslaan</h2>

            {errorMsg && (
                <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "var(--color-error-bg, #fef2f2)", border: "1px solid var(--color-error-border, #fca5a5)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", color: "var(--color-error, #dc2626)", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <span>⚠</span>
                    <span>{errorMsg}</span>
                </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {[
                    { label: "Naam", value: title || "Naamloos" },
                    { label: "Type", value: QR_TYPE_META[selectedType].label },
                    { label: "Bestemming", value: computedDestination || "-" },
                    { label: "Dot stijl", value: DOT_STYLES.find(d => d.value === customization.dotStyle)?.label ?? customization.dotStyle },
                    { label: "Foutcorrectie", value: customization.errorCorrectionLevel },
                    ...(QR_TYPE_META[selectedType].isDynamic
                        ? [{ label: "Redirect URL", value: `${siteUrl}/r/[slug]` }]
                        : []),
                ].map((item) => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-md)", gap: "1rem" }}>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{item.label}</span>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500, maxWidth: "260px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
                            {item.value}
                        </span>
                    </div>
                ))}

                {/* Color swatches */}
                <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-md)", gap: "1rem", alignItems: "center" }}>
                    <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Kleuren</span>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: customization.fgColor, border: "1px solid var(--color-border)" }} title={`Voorgrond: ${customization.fgColor}`} />
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>op</span>
                        <div style={{ width: "20px", height: "20px", borderRadius: "4px", background: customization.bgColor, border: "1px solid var(--color-border)" }} title={`Achtergrond: ${customization.bgColor}`} />
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", fontFamily: "monospace" }}>{customization.fgColor} / {customization.bgColor}</span>
                    </div>
                </div>

                {/* Logo preview */}
                {customization.logoUrl && (
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-md)", gap: "1rem", alignItems: "center" }}>
                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Logo</span>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={customization.logoUrl} alt="Logo" style={{ width: "32px", height: "32px", objectFit: "contain", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "#fff" }} />
                    </div>
                )}

                {/* Low contrast warning */}
                {hasLowContrast && (
                    <div style={{ padding: "0.625rem 0.875rem", background: "var(--color-warning-bg, #fef3c7)", border: "1px solid var(--color-warning-border, #fcd34d)", borderRadius: "var(--radius-md)", fontSize: "0.8125rem", color: "var(--color-warning, #92400e)" }}>
                        ⚠️ Let op: laag kleurcontrast kan de scanbaarheid verminderen.
                    </div>
                )}
            </div>
        </div>
    );
}
