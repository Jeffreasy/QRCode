"use client";

import { CheckIcon, EditIcon, XIcon } from "@/components/ui/icons";
import { DesignDraft } from "../_hooks/useDesignDraft";
import { DOT_STYLES } from "@/app/dashboard/create/_constants";

type Props = {
    editingDesign: boolean;
    isSavingDesign: boolean;
    designDraft: DesignDraft | null;
    setDesignDraft: React.Dispatch<React.SetStateAction<DesignDraft | null>>;
    onOpen: () => void;
    onSave: () => void;
    onClose: () => void;
    // Read-only summary data when not editing
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    logoUrl?: string;
};

export function DesignEditPanel({
    editingDesign, isSavingDesign,
    designDraft, setDesignDraft,
    onOpen, onSave, onClose,
    fgColor, bgColor, dotStyle, logoUrl,
}: Props) {
    const set = <K extends keyof DesignDraft>(key: K, value: DesignDraft[K]) =>
        setDesignDraft(d => d ? { ...d, [key]: value } : d);

    return (
        <div className="card" style={{ padding: "1.5rem" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editingDesign ? "1.25rem" : 0 }}>
                <h4 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                    Design
                </h4>
                {!editingDesign ? (
                    <button className="btn btn-secondary btn-sm" onClick={onOpen} style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <EditIcon size={13} /> Bewerken
                    </button>
                ) : (
                    <button className="btn btn-ghost btn-sm" onClick={onClose}><XIcon size={13} /></button>
                )}
            </div>

            {/* Edit form */}
            {editingDesign && designDraft && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                    {/* Colors */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                        <div>
                            <label className="input-label">Voorgrond</label>
                            <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                                <input type="color" value={designDraft.fgColor}
                                    onChange={(e) => set("fgColor", e.target.value)}
                                    style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                                <input className="input" value={designDraft.fgColor}
                                    onChange={(e) => set("fgColor", e.target.value)}
                                    style={{ flex: 1, fontSize: "0.75rem", padding: "0.375rem 0.5rem" }} />
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Achtergrond</label>
                            <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                                <input type="color" value={designDraft.bgColor}
                                    onChange={(e) => set("bgColor", e.target.value)}
                                    style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                                <input className="input" value={designDraft.bgColor}
                                    onChange={(e) => set("bgColor", e.target.value)}
                                    style={{ flex: 1, fontSize: "0.75rem", padding: "0.375rem 0.5rem" }} />
                            </div>
                        </div>
                    </div>

                    {/* Corner color */}
                    <div>
                        <label className="input-label">Hoekkleur <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(optioneel)</span></label>
                        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                            <input type="color" value={designDraft.cornerColor || designDraft.fgColor}
                                onChange={(e) => set("cornerColor", e.target.value)}
                                style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                            <input className="input" value={designDraft.cornerColor}
                                onChange={(e) => set("cornerColor", e.target.value)}
                                placeholder="Zelfde als voorgrond"
                                style={{ flex: 1, fontSize: "0.75rem", padding: "0.375rem 0.5rem" }} />
                            {designDraft.cornerColor && (
                                <button className="btn btn-ghost btn-sm"
                                    onClick={() => set("cornerColor", "")}
                                    title="Reset naar voorgrondkleur"
                                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.7rem" }}>
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Dot style */}
                    <div>
                        <label className="input-label">Dot stijl</label>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                            {DOT_STYLES.map((ds) => (
                                <button key={ds.value}
                                    onClick={() => set("dotStyle", ds.value)}
                                    style={{
                                        padding: "0.375rem 0.75rem", borderRadius: "var(--radius-md)",
                                        background: designDraft.dotStyle === ds.value ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                        border: `1px solid ${designDraft.dotStyle === ds.value ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                        cursor: "pointer", color: "var(--color-text)", fontSize: "0.75rem",
                                        fontWeight: designDraft.dotStyle === ds.value ? 600 : 400,
                                        transition: "var(--transition)",
                                    }}>
                                    {ds.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Logo URL */}
                    <div>
                        <label className="input-label">Logo URL <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(optioneel)</span></label>
                        <input className="input" placeholder="https://..."
                            value={designDraft.logoUrl}
                            onChange={(e) => set("logoUrl", e.target.value)}
                            style={{ fontSize: "0.8rem" }} />
                    </div>

                    {/* Logo options — only when logo active */}
                    {designDraft.logoUrl && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "0.875rem", background: "var(--color-surface-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                            <p style={{ fontSize: "0.75rem", fontWeight: 600, margin: 0, color: "var(--color-text)" }}>Logo opties</p>

                            {/* Zoom */}
                            <div>
                                <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Grootte (zoom)</span>
                                    <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{Math.round((designDraft.logoSize ?? 0.35) * 100)}%</span>
                                </label>
                                <input type="range" min={10} max={50} step={1}
                                    value={Math.round((designDraft.logoSize ?? 0.35) * 100)}
                                    onChange={(e) => set("logoSize", Number(e.target.value) / 100)}
                                    style={{ width: "100%", accentColor: "var(--color-accent)" }} />
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "var(--color-text-faint)", marginTop: "0.125rem" }}>
                                    <span>Klein (10%)</span><span>Groot (50%)</span>
                                </div>
                            </div>

                            {/* Margin */}
                            <div>
                                <label className="input-label" style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Witruimte rondom</span>
                                    <span style={{ color: "var(--color-accent)", fontWeight: 500 }}>{designDraft.logoMargin ?? 4}px</span>
                                </label>
                                <input type="range" min={0} max={20} step={1}
                                    value={designDraft.logoMargin ?? 4}
                                    onChange={(e) => set("logoMargin", Number(e.target.value))}
                                    style={{ width: "100%", accentColor: "var(--color-accent)" }} />
                            </div>

                            {/* Hide dots toggle */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: "0.8125rem", fontWeight: 500 }}>Dots achter logo verbergen</p>
                                    <p style={{ margin: 0, fontSize: "0.7rem", color: "var(--color-text-muted)" }}>Aanbevolen voor een cleaner resultaat</p>
                                </div>
                                <button
                                    onClick={() => set("logoHideDots", !(designDraft.logoHideDots ?? true))}
                                    style={{
                                        width: "44px", height: "24px", borderRadius: "100px",
                                        background: (designDraft.logoHideDots ?? true) ? "var(--color-accent)" : "var(--color-surface-3, var(--color-surface-2))",
                                        border: "none", cursor: "pointer", position: "relative", flexShrink: 0,
                                        transition: "background 0.2s ease",
                                    }}
                                    role="switch" aria-checked={designDraft.logoHideDots ?? true} aria-label="Dots achter logo verbergen"
                                >
                                    <span style={{
                                        position: "absolute", top: "3px",
                                        left: (designDraft.logoHideDots ?? true) ? "23px" : "3px",
                                        width: "18px", height: "18px", borderRadius: "50%",
                                        background: "#fff", transition: "left 0.2s ease",
                                        boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                                    }} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
                        <button className="btn btn-primary btn-sm" onClick={onSave} disabled={isSavingDesign}
                            style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                            <CheckIcon size={14} />
                            {isSavingDesign ? "Opslaan..." : "Design opslaan"}
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>
                            Annuleren
                        </button>
                    </div>
                </div>
            )}

            {/* Summary view when not editing */}
            {!editingDesign && (
                <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <div style={{ width: "16px", height: "16px", borderRadius: "3px", background: fgColor, border: "1px solid var(--color-border)", flexShrink: 0 }} title={`Voorgrond: ${fgColor}`} />
                        <div style={{ width: "16px", height: "16px", borderRadius: "3px", background: bgColor, border: "1px solid var(--color-border)", flexShrink: 0 }} title={`Achtergrond: ${bgColor}`} />
                        <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                            {DOT_STYLES.find(d => d.value === dotStyle)?.label ?? "Vierkant"}
                        </span>
                    </div>
                    {logoUrl && (
                        <span style={{ fontSize: "0.72rem", color: "var(--color-accent)", background: "var(--color-accent-bg)", padding: "0.125rem 0.5rem", borderRadius: "100px", border: "1px solid var(--color-accent-border)" }}>
                            ✓ Logo
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
