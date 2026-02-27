"use client";

import { QRCustomization } from "../_hooks/useQRCustomization";
import { DOT_STYLES, ERROR_CORRECTION_LEVELS } from "../_constants";

type DesignStepProps = {
    customization: QRCustomization;
    setCustomField: (key: keyof QRCustomization, value: string | boolean | number | undefined) => void;
    // Logo upload props
    logoInput: string;
    setLogoInput: (v: string) => void;
    isUploadingLogo: boolean;
    handleLogoApply: () => void;
    handleLogoFile: (file: File) => void;
    handleLogoClear: () => void;
    hasLowContrast: boolean;
};

export function DesignStep({
    customization,
    setCustomField,
    logoInput,
    setLogoInput,
    isUploadingLogo,
    handleLogoApply,
    handleLogoFile,
    handleLogoClear,
    hasLowContrast,
}: DesignStepProps) {
    return (
        <div>
            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Design aanpassen</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                {/* Colors */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label className="input-label">Voorgrondkleur</label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input type="color" value={customization.fgColor} onChange={(e) => setCustomField("fgColor", e.target.value)} style={{ width: "40px", height: "40px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                            <input className="input" value={customization.fgColor} onChange={(e) => setCustomField("fgColor", e.target.value)} style={{ flex: 1 }} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Achtergrondkleur</label>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input type="color" value={customization.bgColor} onChange={(e) => setCustomField("bgColor", e.target.value)} style={{ width: "40px", height: "40px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                            <input className="input" value={customization.bgColor} onChange={(e) => setCustomField("bgColor", e.target.value)} style={{ flex: 1 }} />
                        </div>
                    </div>
                </div>

                {/* Contrast warning */}
                {hasLowContrast && (
                    <div style={{ padding: "0.625rem 0.875rem", background: "var(--color-warning-bg, #fef3c7)", border: "1px solid var(--color-warning-border, #fcd34d)", borderRadius: "var(--radius-md)", fontSize: "0.8125rem", color: "var(--color-warning, #92400e)", display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        ⚠️ <strong>Laag contrast</strong> — de QR code is mogelijk moeilijk te scannen. Zorg voor voldoende verschil tussen voor- en achtergrond.
                    </div>
                )}

                {/* Dot style */}
                <div>
                    <label className="input-label">Dot stijl</label>
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        {DOT_STYLES.map((ds) => (
                            <button
                                key={ds.value}
                                onClick={() => setCustomField("dotStyle", ds.value)}
                                style={{
                                    padding: "0.5rem 0.875rem",
                                    borderRadius: "var(--radius-md)",
                                    background: customization.dotStyle === ds.value ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                    border: `1px solid ${customization.dotStyle === ds.value ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                    cursor: "pointer", color: "var(--color-text)", fontSize: "0.8125rem",
                                    fontWeight: customization.dotStyle === ds.value ? 600 : 400,
                                    transition: "var(--transition)",
                                    display: "flex", alignItems: "center", gap: "0.5rem",
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={customization.dotStyle === ds.value ? "var(--color-accent)" : "var(--color-text-muted)"} stroke="none">
                                    {ds.shape}
                                </svg>
                                {ds.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error correction */}
                <div>
                    <label className="input-label">Foutcorrectie niveau</label>
                    <div style={{ display: "flex", gap: "0.75rem" }}>
                        {ERROR_CORRECTION_LEVELS.map((ec) => (
                            <button
                                key={ec.value}
                                onClick={() => setCustomField("errorCorrectionLevel", ec.value)}
                                style={{
                                    padding: "0.5rem 0.875rem", borderRadius: "var(--radius-md)",
                                    background: customization.errorCorrectionLevel === ec.value ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                    border: `1px solid ${customization.errorCorrectionLevel === ec.value ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                    cursor: "pointer", color: "var(--color-text)", fontSize: "0.75rem",
                                    fontWeight: customization.errorCorrectionLevel === ec.value ? 600 : 400,
                                    transition: "var(--transition)", flex: 1,
                                }}
                            >
                                {ec.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Corner color + corner style */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label className="input-label">Hoekkleur <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(opt.)</span></label>
                        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                            <input type="color"
                                value={customization.cornerColor ?? customization.fgColor}
                                onChange={(e) => setCustomField("cornerColor", e.target.value)}
                                style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px", flexShrink: 0 }} />
                            <input className="input"
                                value={customization.cornerColor ?? ""}
                                onChange={(e) => setCustomField("cornerColor", e.target.value || undefined)}
                                placeholder={customization.fgColor}
                                style={{ flex: 1, fontSize: "0.75rem" }} />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Hoek type</label>
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
                            {([undefined, "square", "dot", "extra-rounded"] as const).map((t) => (
                                <button key={String(t)} onClick={() => setCustomField("cornerSquareType", t)}
                                    style={{
                                        padding: "0.375rem 0.625rem", fontSize: "0.72rem", borderRadius: "var(--radius-sm)",
                                        background: customization.cornerSquareType === t ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                        border: `1px solid ${customization.cornerSquareType === t ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                        cursor: "pointer", color: "var(--color-text)",
                                        fontWeight: customization.cornerSquareType === t ? 600 : 400,
                                    }}>
                                    {t === undefined ? "Auto" : t === "extra-rounded" ? "Rond" : t === "dot" ? "Dot" : "Vierkant"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Corner dot type + QR shape */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                        <label className="input-label">Interne hoek stip</label>
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                            {([undefined, "square", "dot"] as const).map((t) => (
                                <button key={String(t)} onClick={() => setCustomField("cornerDotType", t)}
                                    style={{
                                        flex: 1, padding: "0.375rem 0.5rem", fontSize: "0.72rem", borderRadius: "var(--radius-sm)",
                                        background: customization.cornerDotType === t ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                        border: `1px solid ${customization.cornerDotType === t ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                        cursor: "pointer", color: "var(--color-text)",
                                        fontWeight: customization.cornerDotType === t ? 600 : 400,
                                    }}>
                                    {t === undefined ? "Auto" : t === "dot" ? "Dot" : "Vierkant"}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="input-label">QR Vorm</label>
                        <div style={{ display: "flex", gap: "0.375rem" }}>
                            {(["square", "circle"] as const).map((s) => (
                                <button key={s} onClick={() => setCustomField("qrShape", s)}
                                    style={{
                                        flex: 1, padding: "0.375rem 0.5rem", fontSize: "0.72rem", borderRadius: "var(--radius-sm)",
                                        background: customization.qrShape === s ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                        border: `1px solid ${customization.qrShape === s ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                        cursor: "pointer", color: "var(--color-text)",
                                        fontWeight: customization.qrShape === s ? 600 : 400,
                                        display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem",
                                    }}>
                                    {s === "square"
                                        ? <svg width="12" height="12" fill="currentColor"><rect width="12" height="12" rx="1" /></svg>
                                        : <svg width="12" height="12" fill="currentColor"><circle cx="6" cy="6" r="6" /></svg>}
                                    {s === "square" ? "Vierkant" : "Cirkel"}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Border frame */}
                <div style={{
                    padding: "1rem",
                    borderRadius: "var(--radius-md)",
                    border: `1px solid ${customization.borderEnabled ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                    background: customization.borderEnabled ? "var(--color-accent-bg)" : "var(--color-surface-2)",
                    transition: "var(--transition)",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: customization.borderEnabled ? "1rem" : 0 }}>
                        <div>
                            <p style={{ fontWeight: 600, fontSize: "0.875rem", margin: 0 }}>Frame / Border</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", margin: 0 }}>Zichtbare rand rondom de QR code</p>
                        </div>
                        <button
                            onClick={() => setCustomField("borderEnabled", !customization.borderEnabled)}
                            style={{
                                width: "44px", height: "24px", borderRadius: "100px",
                                background: customization.borderEnabled ? "var(--color-accent)" : "var(--color-surface-3, var(--color-surface-2))",
                                border: "none", cursor: "pointer", position: "relative", flexShrink: 0,
                                transition: "background 0.2s ease",
                            }}
                            aria-label={customization.borderEnabled ? "Border uitschakelen" : "Border inschakelen"}
                            role="switch"
                            aria-checked={customization.borderEnabled}
                        >
                            <span style={{
                                position: "absolute", top: "3px",
                                left: customization.borderEnabled ? "23px" : "3px",
                                width: "18px", height: "18px", borderRadius: "50%",
                                background: "#fff", transition: "left 0.2s ease",
                                boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                            }} />
                        </button>
                    </div>

                    {customization.borderEnabled && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                <div>
                                    <label className="input-label">Kleur</label>
                                    <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                                        <input type="color" value={customization.borderColor}
                                            onChange={(e) => setCustomField("borderColor", e.target.value)}
                                            style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px", flexShrink: 0 }} />
                                        <input className="input" value={customization.borderColor}
                                            onChange={(e) => setCustomField("borderColor", e.target.value)}
                                            style={{ flex: 1, fontSize: "0.75rem" }} />
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Dikte — {customization.borderWidth}px</label>
                                    <input type="range" min={1} max={12} step={1}
                                        value={customization.borderWidth}
                                        onChange={(e) => setCustomField("borderWidth", Number(e.target.value))}
                                        style={{ width: "100%", accentColor: "var(--color-accent)", marginTop: "0.5rem" }} />
                                </div>
                            </div>
                            <div>
                                <label className="input-label">Afronding — {customization.borderRadius}px</label>
                                <input type="range" min={0} max={40} step={2}
                                    value={customization.borderRadius}
                                    onChange={(e) => setCustomField("borderRadius", Number(e.target.value))}
                                    style={{ width: "100%", accentColor: "var(--color-accent)" }} />
                            </div>
                        </div>
                    )}
                </div>

                {/* Logo upload — dual mode: file picker + URL */}
                <div>
                    <label className="input-label">Logo (optioneel)</label>

                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                        <label
                            style={{
                                flex: 1, padding: "0.6rem 0",
                                borderRadius: "var(--radius-md)",
                                border: "2px dashed var(--color-accent-border)",
                                background: "var(--color-accent-bg)",
                                cursor: isUploadingLogo ? "not-allowed" : "pointer",
                                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem",
                                transition: "var(--transition)",
                                opacity: isUploadingLogo ? 0.6 : 1,
                            }}
                        >
                            <input
                                type="file"
                                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                                style={{ display: "none" }}
                                disabled={isUploadingLogo}
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleLogoFile(file);
                                    e.target.value = "";
                                }}
                            />
                            <span style={{ fontSize: "1.25rem" }}>{isUploadingLogo ? "⏳" : "📁"}</span>
                            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-accent)" }}>
                                {isUploadingLogo ? "Uploaden..." : "Uploaden vanaf device"}
                            </span>
                            <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                                PNG, JPG, SVG, WEBP · max 2MB
                            </span>
                        </label>
                    </div>

                    {/* URL fallback */}
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", whiteSpace: "nowrap" }}>Of via URL:</span>
                        <input
                            className="input"
                            placeholder="https://jouwwebsite.nl/logo.png"
                            value={logoInput}
                            onChange={(e) => setLogoInput(e.target.value)}
                            style={{ flex: 1 }}
                        />
                        <button className="btn btn-secondary" onClick={handleLogoApply} style={{ whiteSpace: "nowrap" }}>
                            Toepassen
                        </button>
                    </div>

                    {/* Active logo preview */}
                    {customization.logoUrl && (
                        <div style={{ marginTop: "0.75rem", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem", background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-md)" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={customization.logoUrl} alt="Logo preview" style={{ width: "36px", height: "36px", objectFit: "contain", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "#fff", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-success)", fontWeight: 600 }}>✓ Logo actief</div>
                                <div style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Foutcorrectie automatisch op H gezet</div>
                            </div>
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={handleLogoClear}
                                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
                            >
                                Verwijderen
                            </button>
                        </div>
                    )}
                    {!customization.logoUrl && !isUploadingLogo && (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
                            Een logo in het midden van je QR code verhoogt de herkenbaarheid.
                        </p>
                    )}

                    {/* Logo options — only visible when logo is active */}
                    {customization.logoUrl && (
                        <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.875rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                            <p style={{ fontSize: "0.75rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>Logo opties</p>

                            {/* Zoom */}
                            <div>
                                <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Grootte (zoom)</span>
                                    <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{Math.round((customization.logoSize ?? 0.35) * 100)}%</span>
                                </label>
                                <input type="range" min={10} max={50} step={1}
                                    value={Math.round((customization.logoSize ?? 0.35) * 100)}
                                    onChange={(e) => setCustomField("logoSize", Number(e.target.value) / 100)}
                                    style={{ width: "100%", accentColor: "var(--color-accent)" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--color-text-faint)", marginTop: "0.125rem" }}>
                                    <span>Klein (10%)</span>
                                    <span>Groot (50%)</span>
                                </div>
                            </div>

                            {/* Margin */}
                            <div>
                                <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Witruimte rondom</span>
                                    <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{customization.logoMargin ?? 4}px</span>
                                </label>
                                <input type="range" min={0} max={20} step={1}
                                    value={customization.logoMargin ?? 4}
                                    onChange={(e) => setCustomField("logoMargin", Number(e.target.value))}
                                    style={{ width: "100%", accentColor: "var(--color-accent)" }} />
                            </div>

                            {/* Hide dots behind logo */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500 }}>Dots achter logo verbergen</p>
                                    <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Aanbevolen voor een cleaner resultaat</p>
                                </div>
                                <button
                                    onClick={() => setCustomField("logoHideDots", !(customization.logoHideDots ?? true))}
                                    style={{
                                        width: "44px", height: "24px", borderRadius: "100px",
                                        background: (customization.logoHideDots ?? true) ? "var(--color-accent)" : "var(--color-surface-3, var(--color-surface-2))",
                                        border: "none", cursor: "pointer", position: "relative", flexShrink: 0,
                                        transition: "background 0.2s ease",
                                    }}
                                    role="switch"
                                    aria-checked={customization.logoHideDots ?? true}
                                    aria-label="Dots achter logo verbergen"
                                >
                                    <span style={{
                                        position: "absolute", top: "3px",
                                        left: (customization.logoHideDots ?? true) ? "23px" : "3px",
                                        width: "18px", height: "18px", borderRadius: "50%",
                                        background: "#fff", transition: "left 0.2s ease",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                                    }} />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
