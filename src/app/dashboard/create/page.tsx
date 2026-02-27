"use client";

import { useState, useCallback, useEffect } from "react";



import { useMutation, useConvexAuth } from "convex/react";

import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

import { QR_TYPE_META, QRType, QRPayload, encodePayload, isValidUrl } from "@/lib/qr-types";
import QRPreview from "@/components/qr/QRPreview";
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    QrCodeIcon,
    LinkIcon,
    WifiIcon,
    MailIcon,
    MessageSquareIcon,
    TypeIcon,
    ShareIcon,
    FileIcon,
    UsersIcon,
} from "@/components/ui/icons";

const STEPS = ["Type", "Inhoud", "Design", "Bevestigen"];

const QR_TYPE_ICONS: Record<string, React.FC<{ size?: number }>> = {
    url: LinkIcon,
    vcard: UsersIcon,
    wifi: WifiIcon,
    email: MailIcon,
    sms: MessageSquareIcon,
    text: TypeIcon,
    social: ShareIcon,
    file: FileIcon,
};

const DOT_STYLES = [
    { value: "square", label: "Vierkant", icon: "⬛" },
    { value: "rounded", label: "Afgerond", icon: "🟦" },
    { value: "dots", label: "Dots", icon: "🔵" },
    { value: "classy", label: "Classy", icon: "◆" },
    { value: "classy-rounded", label: "Classy Rond", icon: "◈" },
];

const ERROR_CORRECTION_LEVELS = [
    { value: "L", label: "L — Laag" },
    { value: "M", label: "M — Midden" },
    { value: "Q", label: "Q — Hoog" },
    { value: "H", label: "H — Max (logo)" },
];

// ── Colour contrast helper ────────────────────────────────────────────────────
function hexToLuminance(hex: string): number {
    const clean = hex.replace("#", "");
    if (clean.length !== 6) return 0;
    const [r, g, b] = [0, 2, 4].map((i) => {
        const c = parseInt(clean.slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(fg: string, bg: string): number {
    const l1 = hexToLuminance(fg);
    const l2 = hexToLuminance(bg);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

// ── Validation per type ───────────────────────────────────────────────────────
function isStepOneComplete(type: QRType | null, formData: Record<string, string>): boolean {
    if (!type) return false;
    switch (type) {
        case "url": return isValidUrl(formData.url ?? "");
        case "vcard": return !!(formData.firstName?.trim() && formData.lastName?.trim());
        case "wifi": return !!(formData.ssid?.trim());
        case "email": return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email ?? "");
        case "sms": return !!(formData.phone?.trim());
        case "text": return !!(formData.text?.trim());
        case "file": return isValidUrl(formData.fileUrl ?? "");
        case "social": return isValidUrl(formData.pageUrl ?? "");
        default: return true;
    }
}

export default function CreateQRPage() {


    const router = useRouter();
    const createQRCode = useMutation(api.qrCodes.createQRCode);

    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<QRType | null>(null);
    const [title, setTitle] = useState("");
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [customization, setCustomization] = useState({
        fgColor: "#000000",
        bgColor: "#ffffff",
        dotStyle: "square",
        errorCorrectionLevel: "M",
        logoUrl: undefined as string | undefined,
    });
    const [logoInput, setLogoInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [logoStorageId, setLogoStorageId] = useState<string | undefined>();
    const [errorMsg, setErrorMsg] = useState("");

    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
    const getStorageUrl = useMutation(api.storage.getStorageUrl);
    const deleteStorageFile = useMutation(api.storage.deleteStorageFile);


    // Resolve the real origin client-side only (avoids SSR/CSR hydration mismatch)
    const [siteUrl, setSiteUrl] = useState(
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.jeffdash.com"
    );
    useEffect(() => { setSiteUrl(window.location.origin); }, []);

    const { isAuthenticated } = useConvexAuth();


    const setCustomField = useCallback(
        (key: keyof typeof customization, value: string | undefined) =>
            setCustomization((prev) => ({ ...prev, [key]: value })),
        []
    );

    const computedDestination =
        selectedType
            ? (() => {
                try { return encodePayload(selectedType, getPayload(selectedType, formData)); }
                catch { return ""; }
            })()
            : "";

    const isNextDisabled =
        (step === 0 && !selectedType) ||
        (step === 1 && !isStepOneComplete(selectedType, formData));

    const contrastRatio = getContrastRatio(customization.fgColor, customization.bgColor);
    const hasLowContrast = contrastRatio < 3;

    // Apply logo and force H error correction
    const handleLogoApply = () => {
        const url = logoInput.trim();
        if (url && isValidUrl(url)) {
            setCustomization((prev) => ({ ...prev, logoUrl: url, errorCorrectionLevel: "H" }));
        }
    };

    const handleLogoFile = async (file: File) => {
        if (!file) return;
        // Only allow images
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Alleen afbeeldingen zijn toegestaan (PNG, JPG, SVG, WEBP).");
            return;
        }
        // Max 2MB
        if (file.size > 2 * 1024 * 1024) {
            setErrorMsg("Afbeelding mag maximaal 2MB zijn.");
            return;
        }
        setIsUploadingLogo(true);
        setErrorMsg("");
        try {
            // Delete previous uploaded file if any
            if (logoStorageId) {
                await deleteStorageFile({ storageId: logoStorageId }).catch(() => { });
            }
            // 1. Get a short-lived upload URL from Convex
            const uploadUrl = await generateUploadUrl();
            // 2. POST the file directly to Convex storage (Convex requires POST, not PUT)
            const putRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!putRes.ok) throw new Error("Upload mislukt.");
            const { storageId } = await putRes.json();
            // 3. Get the public URL
            const publicUrl = await getStorageUrl({ storageId });
            if (!publicUrl) throw new Error("Kon geen publieke URL ophalen.");
            setLogoStorageId(storageId);
            setCustomization((prev) => ({ ...prev, logoUrl: publicUrl, errorCorrectionLevel: "H" }));
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Logo upload mislukt.");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleLogoClear = () => {
        setLogoInput("");
        if (logoStorageId) {
            deleteStorageFile({ storageId: logoStorageId }).catch(() => { });
            setLogoStorageId(undefined);
        }
        setCustomization((prev) => ({ ...prev, logoUrl: undefined }));
    };


    async function handleCreate() {
        if (!isAuthenticated || !selectedType) {
            setErrorMsg("Je bent niet (meer) ingelogd. Herlaad de pagina en log opnieuw in.");
            return;
        }

        setIsLoading(true);
        setErrorMsg("");
        try {
            const result = await createQRCode({
                type: selectedType,
                destination: computedDestination || "",
                title: title || `QR Code ${new Date().toLocaleDateString("nl-NL")}`,
                customization: {
                    fgColor: customization.fgColor,
                    bgColor: customization.bgColor,
                    dotStyle: customization.dotStyle,
                    errorCorrectionLevel: customization.errorCorrectionLevel,
                    logoUrl: customization.logoUrl,
                },
            });
            router.push(`/dashboard/qr/${result.id}`);
        } catch (err) {
            console.error(err);
            setErrorMsg(
                err instanceof Error
                    ? err.message
                    : "Er is een onbekende fout opgetreden. Probeer het opnieuw."
            );
        } finally {
            setIsLoading(false);
        }
    }


    return (
        <div className="dashboard-main" style={{ padding: "2rem 2.5rem", maxWidth: "1000px" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                    Nieuwe QR code aanmaken
                </h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                    Volg de stappen om je dynamische QR code in te stellen.
                </p>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem", alignItems: "center" }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem", opacity: i > step ? 0.4 : 1 }}>
                        <div
                            style={{
                                width: "28px", height: "28px", borderRadius: "50%",
                                backgroundImage: i < step ? undefined : i === step ? "var(--gradient-brand)" : undefined,
                                background: i < step ? "var(--color-success)" : i === step ? undefined : "var(--color-surface-2)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: "0.75rem", fontWeight: 700, color: "#fff", flexShrink: 0,
                            }}
                        >
                            {i < step ? <CheckIcon size={13} /> : i + 1}
                        </div>
                        <span style={{ fontSize: "0.8125rem", fontWeight: i === step ? 600 : 400, color: i === step ? "var(--color-text)" : "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                            {s}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div style={{ width: "32px", height: "2px", background: i < step ? "var(--color-success)" : "var(--color-border)", marginLeft: "0.25rem", borderRadius: "100px" }} />
                        )}
                    </div>
                ))}
            </div>

            <div className="dashboard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
                {/* Main content */}
                <div className="card" style={{ padding: "2rem" }}>

                    {/* ── STEP 0: Type selection ── */}
                    {step === 0 && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Kies een QR type</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.75rem" }}>
                                {(Object.entries(QR_TYPE_META) as [QRType, typeof QR_TYPE_META[QRType]][]).map(([type, meta]) => {
                                    const TypeIcon = QR_TYPE_ICONS[type] ?? QrCodeIcon;
                                    const isSelected = selectedType === type;
                                    return (
                                        <button
                                            key={type}
                                            onClick={() => { setSelectedType(type); setFormData({}); }}
                                            style={{
                                                padding: "1rem", textAlign: "left",
                                                background: isSelected ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                                border: `1px solid ${isSelected ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                                borderRadius: "var(--radius-md)", cursor: "pointer",
                                                transition: "var(--transition)", color: "var(--color-text)", width: "100%",
                                            }}
                                        >
                                            <div style={{ width: "36px", height: "36px", borderRadius: "var(--radius-sm)", background: isSelected ? "var(--color-accent-bg)" : "var(--color-surface)", border: `1px solid ${isSelected ? "var(--color-accent-border)" : "var(--color-border)"}`, display: "flex", alignItems: "center", justifyContent: "center", color: isSelected ? "var(--color-accent)" : "var(--color-text-muted)", marginBottom: "0.625rem" }}>
                                                <TypeIcon size={17} />
                                            </div>
                                            <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{meta.label}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{meta.description}</div>
                                            {meta.isDynamic && (
                                                <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--color-accent)", fontWeight: 600 }}>
                                                    Dynamisch
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: Content ── */}
                    {step === 1 && selectedType && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
                                {QR_TYPE_META[selectedType].label} — Inhoud
                            </h2>
                            <ContentForm
                                type={selectedType}
                                formData={formData}
                                setFormData={setFormData}
                                title={title}
                                setTitle={setTitle}
                            />
                        </div>
                    )}

                    {/* ── STEP 2: Design ── */}
                    {step === 2 && (
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
                                                    padding: "0.5rem 1rem", borderRadius: "var(--radius-md)",
                                                    background: customization.dotStyle === ds.value ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                                    border: `1px solid ${customization.dotStyle === ds.value ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                                    cursor: "pointer", color: "var(--color-text)", fontSize: "0.8125rem",
                                                    fontWeight: customization.dotStyle === ds.value ? 600 : 400,
                                                    transition: "var(--transition)", display: "flex", alignItems: "center", gap: "0.375rem",
                                                }}
                                            >
                                                <span>{ds.icon}</span>
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

                                {/* Logo upload — dual mode: file picker + URL */}
                                <div>
                                    <label className="input-label">Logo (optioneel)</label>

                                    {/* Tab selector */}
                                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem" }}>
                                        <label
                                            style={{
                                                flex: 1,
                                                padding: "0.6rem 0",
                                                borderRadius: "var(--radius-md)",
                                                border: "2px dashed var(--color-accent-border)",
                                                background: "var(--color-accent-bg)",
                                                cursor: isUploadingLogo ? "not-allowed" : "pointer",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                gap: "0.25rem",
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
                                            <span style={{ fontSize: "1.25rem" }}>
                                                {isUploadingLogo ? "⏳" : "📁"}
                                            </span>
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
                                </div>

                            </div>
                        </div>
                    )}

                    {/* ── STEP 3: Confirm ── */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Bevestigen &amp; opslaan</h2>

                            {/* Error message */}
                            {errorMsg && (
                                <div style={{ marginBottom: "1rem", padding: "0.75rem 1rem", background: "var(--color-error-bg, #fef2f2)", border: "1px solid var(--color-error-border, #fca5a5)", borderRadius: "var(--radius-md)", fontSize: "0.875rem", color: "var(--color-error, #dc2626)", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                    <span>⚠</span>
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {/* Text summary rows */}
                                {[
                                    { label: "Naam", value: title || "Naamloos" },
                                    { label: "Type", value: selectedType ? QR_TYPE_META[selectedType].label : "-" },
                                    { label: "Bestemming", value: computedDestination || "-" },
                                    { label: "Dot stijl", value: DOT_STYLES.find(d => d.value === customization.dotStyle)?.label ?? customization.dotStyle },
                                    { label: "Foutcorrectie", value: customization.errorCorrectionLevel },
                                    ...(selectedType && QR_TYPE_META[selectedType].isDynamic
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

                                {/* Logo */}
                                {customization.logoUrl && (
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 1rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-md)", gap: "1rem", alignItems: "center" }}>
                                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>Logo</span>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={customization.logoUrl} alt="Logo" style={{ width: "32px", height: "32px", objectFit: "contain", border: "1px solid var(--color-border)", borderRadius: "var(--radius-sm)", background: "#fff" }} />
                                    </div>
                                )}

                                {/* Low contrast warning on confirm too */}
                                {hasLowContrast && (
                                    <div style={{ padding: "0.625rem 0.875rem", background: "var(--color-warning-bg, #fef3c7)", border: "1px solid var(--color-warning-border, #fcd34d)", borderRadius: "var(--radius-md)", fontSize: "0.8125rem", color: "var(--color-warning, #92400e)" }}>
                                        ⚠️ Let op: laag kleurcontrast kan de scanbaarheid verminderen.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", gap: "1rem" }}>
                        <button
                            className="btn btn-secondary"
                            onClick={() => setStep(Math.max(0, step - 1))}
                            disabled={step === 0}
                            style={{ opacity: step === 0 ? 0.4 : 1, display: "flex", alignItems: "center", gap: "0.375rem" }}
                        >
                            <ChevronLeftIcon size={16} />
                            Vorige
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setStep(step + 1)}
                                disabled={isNextDisabled}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem", opacity: isNextDisabled ? 0.5 : 1 }}
                            >
                                Volgende
                                <ChevronRightIcon size={16} />
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={isLoading}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                            >
                                <PlusIcon size={16} />
                                {isLoading ? "Opslaan..." : "QR code aanmaken"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Live preview */}
                <div style={{ position: "sticky", top: "2rem" }}>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem", fontWeight: 600 }}>
                            Live preview
                        </div>
                        <QRPreview
                            value={
                                selectedType && QR_TYPE_META[selectedType].isDynamic
                                    ? `${siteUrl}/r/preview`
                                    : computedDestination || "https://qrcodemaster.app"
                            }
                            fgColor={customization.fgColor}
                            bgColor={customization.bgColor}
                            dotStyle={customization.dotStyle}
                            errorCorrectionLevel={customization.errorCorrectionLevel as "L" | "M" | "Q" | "H"}
                            size={220}
                            logoUrl={customization.logoUrl}
                        />
                        {selectedType && QR_TYPE_META[selectedType].isDynamic && (
                            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-accent)", fontFamily: "monospace" }}>
                                🔗 Verwijst via /r/[slug] → bestemming
                            </p>
                        )}
                        {computedDestination && !QR_TYPE_META[selectedType!]?.isDynamic && (
                            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--color-text-faint)", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {computedDestination.slice(0, 60)}
                                {computedDestination.length > 60 ? "…" : ""}
                            </p>
                        )}
                        {/* Preview notice */}
                        <p style={{ marginTop: "0.625rem", fontSize: "0.7rem", color: "var(--color-text-faint)" }}>
                            Dit is een visuele preview — de echte slug wordt aangemaakt bij opslaan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Content form per type ──────────────────────────────────────────────────────
function ContentForm({
    type,
    formData,
    setFormData,
    title,
    setTitle,
}: {
    type: QRType;
    formData: Record<string, string>;
    setFormData: (d: Record<string, string>) => void;
    title: string;
    setTitle: (t: string) => void;
}) {
    const set = (key: string, value: string) => setFormData({ ...formData, [key]: value });
    const toggle = (key: string) => setFormData({ ...formData, [key]: formData[key] === "true" ? "false" : "true" });

    return (
        <div>
            {/* Title — single canonical location */}
            <div style={{ marginBottom: "1.25rem" }}>
                <label className="input-label">Naam voor dashboard</label>
                <input
                    className="input"
                    placeholder="Bijv. 'Winkel QR — januari 2026'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* URL */}
            {type === "url" && (
                <div>
                    <label className="input-label">Website URL *</label>
                    <input
                        className="input"
                        placeholder="https://jouwwebsite.nl"
                        value={formData.url ?? ""}
                        onChange={(e) => set("url", e.target.value)}
                        style={formData.url && !isValidUrl(formData.url) ? { borderColor: "var(--color-error, #ef4444)" } : undefined}
                    />
                    {formData.url && !isValidUrl(formData.url) ? (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-error, #ef4444)", marginTop: "0.375rem", fontWeight: 500 }}>
                            ⚠ URL moet beginnen met https:// of http://
                        </p>
                    ) : (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", marginTop: "0.375rem" }}>
                            Je kunt deze URL later altijd wijzigen zonder de QR opnieuw te printen.
                        </p>
                    )}
                </div>
            )}

            {/* vCard */}
            {type === "vcard" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1rem" }}>
                    {[
                        { key: "firstName", label: "Voornaam *" },
                        { key: "lastName", label: "Achternaam *" },
                        { key: "organization", label: "Organisatie" },
                        { key: "phone", label: "Telefoon" },
                        { key: "email", label: "E-mailadres" },
                        { key: "website", label: "Website" },
                    ].map(({ key, label }) => (
                        <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "1rem" }}>
                            <label className="input-label">{label}</label>
                            <input className="input" value={formData[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
                        </div>
                    ))}
                    <div style={{ gridColumn: "1 / -1" }}>
                        <label className="input-label">Adres</label>
                        <input className="input" value={formData.address ?? ""} onChange={(e) => set("address", e.target.value)} />
                    </div>
                    {(!formData.firstName?.trim() || !formData.lastName?.trim()) && (
                        <div style={{ gridColumn: "1 / -1", fontSize: "0.75rem", color: "var(--color-warning, #92400e)", marginTop: "-0.5rem" }}>
                            ⚠ Voornaam en achternaam zijn verplicht.
                        </div>
                    )}
                </div>
            )}

            {/* WiFi */}
            {type === "wifi" && (
                <div>
                    {[
                        { key: "ssid", label: "Netwerknaam (SSID) *" },
                        { key: "password", label: "Wachtwoord" },
                    ].map(({ key, label }) => (
                        <div key={key} style={{ marginBottom: "1rem" }}>
                            <label className="input-label">{label}</label>
                            <input className="input" value={formData[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
                        </div>
                    ))}
                    <div style={{ marginBottom: "1rem" }}>
                        <label className="input-label">Beveiliging</label>
                        <select className="input" value={formData.security ?? "WPA"} onChange={(e) => set("security", e.target.value)}>
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Open (geen wachtwoord)</option>
                        </select>
                    </div>
                    {/* Hidden network toggle */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", cursor: "pointer" }} onClick={() => toggle("hidden")}>
                        <div style={{ width: "18px", height: "18px", border: `2px solid ${formData.hidden === "true" ? "var(--color-accent)" : "var(--color-border)"}`, borderRadius: "4px", background: formData.hidden === "true" ? "var(--color-accent)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "var(--transition)" }}>
                            {formData.hidden === "true" && <CheckIcon size={10} />}
                        </div>
                        <div>
                            <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>Verborgen netwerk</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Vink aan als de SSID niet wordt uitgezonden.</div>
                        </div>
                    </div>
                    {!formData.ssid?.trim() && (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-warning, #92400e)", marginTop: "0.75rem" }}>
                            ⚠ Netwerknaam (SSID) is verplicht.
                        </p>
                    )}
                </div>
            )}

            {/* Text */}
            {type === "text" && (
                <div>
                    <label className="input-label">Tekst inhoud *</label>
                    <textarea
                        className="input"
                        rows={5}
                        placeholder="Jouw tekst hier..."
                        value={formData.text ?? ""}
                        onChange={(e) => set("text", e.target.value)}
                        style={{ resize: "vertical" }}
                    />
                    {!formData.text?.trim() && (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-warning, #92400e)", marginTop: "0.375rem" }}>
                            ⚠ Voer tekst in.
                        </p>
                    )}
                </div>
            )}

            {/* Email */}
            {type === "email" && (
                <div>
                    {[
                        { key: "email", label: "E-mailadres *" },
                        { key: "subject", label: "Onderwerp" },
                    ].map(({ key, label }) => (
                        <div key={key} style={{ marginBottom: "1rem" }}>
                            <label className="input-label">{label}</label>
                            <input
                                className="input"
                                value={formData[key] ?? ""}
                                onChange={(e) => set(key, e.target.value)}
                                style={key === "email" && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ? { borderColor: "var(--color-error, #ef4444)" } : undefined}
                            />
                            {key === "email" && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && (
                                <p style={{ fontSize: "0.75rem", color: "var(--color-error, #ef4444)", marginTop: "0.375rem" }}>
                                    ⚠ Voer een geldig e-mailadres in.
                                </p>
                            )}
                        </div>
                    ))}
                    <div>
                        <label className="input-label">Berichttekst</label>
                        <textarea className="input" rows={3} value={formData.body ?? ""} onChange={(e) => set("body", e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                </div>
            )}

            {/* SMS */}
            {type === "sms" && (
                <div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label className="input-label">Telefoonnummer *</label>
                        <input
                            className="input"
                            placeholder="+31612345678"
                            value={formData.phone ?? ""}
                            onChange={(e) => set("phone", e.target.value)}
                        />
                        {!formData.phone?.trim() && (
                            <p style={{ fontSize: "0.75rem", color: "var(--color-warning, #92400e)", marginTop: "0.375rem" }}>
                                ⚠ Telefoonnummer is verplicht.
                            </p>
                        )}
                    </div>
                    <div>
                        <label className="input-label">Vooringevuld bericht</label>
                        <textarea className="input" rows={3} value={formData.message ?? ""} onChange={(e) => set("message", e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                </div>
            )}

            {/* File / Social */}
            {(type === "file" || type === "social") && (
                <div>
                    <label className="input-label">
                        {type === "file" ? "Bestand URL (directe link) *" : "Social media pagina URL *"}
                    </label>
                    <input
                        className="input"
                        placeholder={type === "file" ? "https://example.com/bestand.pdf" : "https://instagram.com/jouwprofiel"}
                        value={formData[type === "file" ? "fileUrl" : "pageUrl"] ?? ""}
                        onChange={(e) => set(type === "file" ? "fileUrl" : "pageUrl", e.target.value)}
                        style={
                            formData[type === "file" ? "fileUrl" : "pageUrl"] &&
                                !isValidUrl(formData[type === "file" ? "fileUrl" : "pageUrl"] ?? "")
                                ? { borderColor: "var(--color-error, #ef4444)" }
                                : undefined
                        }
                    />
                    {formData[type === "file" ? "fileUrl" : "pageUrl"] &&
                        !isValidUrl(formData[type === "file" ? "fileUrl" : "pageUrl"] ?? "") ? (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-error, #ef4444)", marginTop: "0.375rem" }}>
                            ⚠ URL moet beginnen met https:// of http://
                        </p>
                    ) : (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", marginTop: "0.375rem" }}>
                            Je kunt deze URL later altijd wijzigen.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Payload builder ────────────────────────────────────────────────────────────
function getPayload(type: QRType, formData: Record<string, string>): QRPayload {
    switch (type) {
        case "url": return { url: formData.url || "" };
        case "vcard": return { firstName: formData.firstName || "", lastName: formData.lastName || "", organization: formData.organization, phone: formData.phone, email: formData.email, website: formData.website, address: formData.address };
        case "wifi": return { ssid: formData.ssid || "", password: formData.password || "", security: (formData.security || "WPA") as "WPA" | "WEP" | "nopass", hidden: formData.hidden === "true" };
        case "text": return { text: formData.text || "" };
        case "email": return { email: formData.email || "", subject: formData.subject, body: formData.body };
        case "sms": return { phone: formData.phone || "", message: formData.message };
        case "file": return { fileUrl: formData.fileUrl || "" };
        case "social": return { pageUrl: formData.pageUrl || "" };
        default: return { url: "" };
    }
}
