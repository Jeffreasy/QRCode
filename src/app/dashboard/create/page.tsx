"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
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

const STEPS = ["Type", "Inhoud", "Design", "Opslaan"];

// Map QR types to icons
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

export default function CreateQRPage() {
    const { user } = useUser();
    const router = useRouter();
    const createQRCode = useMutation(api.qrCodes.createQRCode);

    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<QRType | null>(null);
    const [title, setTitle] = useState("");
    const [destination, setDestination] = useState("");
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [customization, setCustomization] = useState({
        fgColor: "#000000",
        bgColor: "#ffffff",
        dotStyle: "square",
        errorCorrectionLevel: "M",
        logoUrl: undefined as string | undefined,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [urlError, setUrlError] = useState("");

    const computedDestination =
        selectedType
            ? (() => {
                try {
                    return encodePayload(selectedType, getPayload(selectedType, formData));
                } catch {
                    return "";
                }
            })()
            : "";

    async function handleCreate() {
        if (!user || !selectedType) return;
        setIsLoading(true);
        try {
            const result = await createQRCode({
                type: selectedType,
                destination: computedDestination || destination,
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
        } finally {
            setIsLoading(false);
        }
    }

    // Determine if the "Next" button should be disabled
    const isNextDisabled =
        (step === 0 && !selectedType) ||
        (step === 1 && selectedType === "url" && !isValidUrl(formData.url ?? ""));

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
                    <div
                        key={s}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            opacity: i > step ? 0.4 : 1,
                        }}
                    >
                        <div
                            style={{
                                width: "28px",
                                height: "28px",
                                borderRadius: "50%",
                                backgroundImage:
                                    i < step
                                        ? undefined
                                        : i === step
                                            ? "var(--gradient-brand)"
                                            : undefined,
                                background:
                                    i < step
                                        ? "var(--color-success)"
                                        : i === step
                                            ? undefined
                                            : "var(--color-surface-2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "#fff",
                                flexShrink: 0,
                            }}
                        >
                            {i < step ? <CheckIcon size={13} /> : i + 1}
                        </div>
                        <span
                            style={{
                                fontSize: "0.8125rem",
                                fontWeight: i === step ? 600 : 400,
                                color: i === step ? "var(--color-text)" : "var(--color-text-muted)",
                                whiteSpace: "nowrap",
                            }}
                        >
                            {s}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div
                                style={{
                                    width: "32px",
                                    height: "2px",
                                    background: i < step ? "var(--color-success)" : "var(--color-border)",
                                    marginLeft: "0.25rem",
                                    borderRadius: "100px",
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="dashboard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
                {/* Main content */}
                <div className="card" style={{ padding: "2rem" }}>
                    {/* Step 0: Type selection */}
                    {step === 0 && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Kies een QR type</h2>
                            <div
                                style={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(2, 1fr)",
                                    gap: "0.75rem",
                                }}
                            >
                                {(Object.entries(QR_TYPE_META) as [QRType, typeof QR_TYPE_META[QRType]][]).map(
                                    ([type, meta]) => {
                                        const TypeIcon = QR_TYPE_ICONS[type] ?? QrCodeIcon;
                                        const isSelected = selectedType === type;
                                        return (
                                            <button
                                                key={type}
                                                onClick={() => setSelectedType(type)}
                                                style={{
                                                    padding: "1rem",
                                                    textAlign: "left",
                                                    background: isSelected ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                                    border: `1px solid ${isSelected ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                                    borderRadius: "var(--radius-md)",
                                                    cursor: "pointer",
                                                    transition: "var(--transition)",
                                                    color: "var(--color-text)",
                                                    width: "100%",
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: "36px",
                                                        height: "36px",
                                                        borderRadius: "var(--radius-sm)",
                                                        background: isSelected ? "var(--color-accent-bg)" : "var(--color-surface)",
                                                        border: `1px solid ${isSelected ? "var(--color-accent-border)" : "var(--color-border)"}`,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        color: isSelected ? "var(--color-accent)" : "var(--color-text-muted)",
                                                        marginBottom: "0.625rem",
                                                    }}
                                                >
                                                    <TypeIcon size={17} />
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                                                    {meta.label}
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                                    {meta.description}
                                                </div>
                                                {meta.isDynamic && (
                                                    <div
                                                        style={{
                                                            marginTop: "0.5rem",
                                                            fontSize: "0.7rem",
                                                            color: "var(--color-accent)",
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        Dynamisch
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    }
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Content */}
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
                                urlError={urlError}
                                setUrlError={setUrlError}
                            />
                        </div>
                    )}

                    {/* Step 2: Design */}
                    {step === 2 && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Design aanpassen</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                                <div>
                                    <label className="input-label">Naam / Titel</label>
                                    <input
                                        className="input"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Mijn QR code"
                                    />
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <label className="input-label">Voorgrondkleur</label>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input
                                                type="color"
                                                value={customization.fgColor}
                                                onChange={(e) => setCustomization({ ...customization, fgColor: e.target.value })}
                                                style={{ width: "40px", height: "40px", border: "none", cursor: "pointer", borderRadius: "6px" }}
                                            />
                                            <input
                                                className="input"
                                                value={customization.fgColor}
                                                onChange={(e) => setCustomization({ ...customization, fgColor: e.target.value })}
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Achtergrondkleur</label>
                                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                            <input
                                                type="color"
                                                value={customization.bgColor}
                                                onChange={(e) => setCustomization({ ...customization, bgColor: e.target.value })}
                                                style={{ width: "40px", height: "40px", border: "none", cursor: "pointer", borderRadius: "6px" }}
                                            />
                                            <input
                                                className="input"
                                                value={customization.bgColor}
                                                onChange={(e) => setCustomization({ ...customization, bgColor: e.target.value })}
                                                style={{ flex: 1 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Dot stijl</label>
                                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                                        {["square", "rounded", "dots", "classy", "classy-rounded"].map((ds) => (
                                            <button
                                                key={ds}
                                                onClick={() => setCustomization({ ...customization, dotStyle: ds })}
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "var(--radius-md)",
                                                    background: customization.dotStyle === ds ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                                    border: `1px solid ${customization.dotStyle === ds ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                                    cursor: "pointer",
                                                    color: "var(--color-text)",
                                                    fontSize: "0.8125rem",
                                                    fontWeight: customization.dotStyle === ds ? 600 : 400,
                                                    transition: "var(--transition)",
                                                }}
                                            >
                                                {ds.charAt(0).toUpperCase() + ds.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="input-label">Foutcorrectie niveau</label>
                                    <div style={{ display: "flex", gap: "0.75rem" }}>
                                        {[
                                            { value: "L", label: "L — Laag" },
                                            { value: "M", label: "M — Midden" },
                                            { value: "Q", label: "Q — Hoog" },
                                            { value: "H", label: "H — Max (logo)" },
                                        ].map((ec) => (
                                            <button
                                                key={ec.value}
                                                onClick={() => setCustomization({ ...customization, errorCorrectionLevel: ec.value })}
                                                style={{
                                                    padding: "0.5rem 0.875rem",
                                                    borderRadius: "var(--radius-md)",
                                                    background: customization.errorCorrectionLevel === ec.value ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                                    border: `1px solid ${customization.errorCorrectionLevel === ec.value ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                                    cursor: "pointer",
                                                    color: "var(--color-text)",
                                                    fontSize: "0.75rem",
                                                    fontWeight: customization.errorCorrectionLevel === ec.value ? 600 : 400,
                                                    transition: "var(--transition)",
                                                    flex: 1,
                                                }}
                                            >
                                                {ec.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === 3 && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Bevestigen & opslaan</h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                {[
                                    { label: "Naam", value: title || "Naamloos" },
                                    { label: "Type", value: selectedType ? QR_TYPE_META[selectedType].label : "-" },
                                    { label: "Bestemming", value: computedDestination || "-" },
                                    { label: "Dot stijl", value: customization.dotStyle },
                                ].map((item) => (
                                    <div
                                        key={item.label}
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            padding: "0.75rem 1rem",
                                            background: "var(--color-bg-2)",
                                            borderRadius: "var(--radius-md)",
                                            gap: "1rem",
                                        }}
                                    >
                                        <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>{item.label}</span>
                                        <span
                                            style={{
                                                fontSize: "0.875rem",
                                                fontWeight: 500,
                                                maxWidth: "220px",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                whiteSpace: "nowrap",
                                                textAlign: "right",
                                            }}
                                        >
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem" }}>
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
                                    ? `${(typeof window !== "undefined" ? window.location.origin : null) ?? process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://www.jeffdash.com"}/r/preview`
                                    : computedDestination || "https://qrcodemaster.app"
                            }
                            fgColor={customization.fgColor}
                            bgColor={customization.bgColor}
                            dotStyle={customization.dotStyle}
                            errorCorrectionLevel={customization.errorCorrectionLevel as "L" | "M" | "Q" | "H"}
                            size={220}
                        />
                        {selectedType && QR_TYPE_META[selectedType].isDynamic && (
                            <p style={{ marginTop: "0.75rem", fontSize: "0.75rem", color: "var(--color-accent)", fontFamily: "monospace" }}>
                                🔗 Verwijst via /r/[slug] naar:
                            </p>
                        )}
                        {computedDestination && (
                            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "var(--color-text-faint)", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {computedDestination.slice(0, 60)}
                                {computedDestination.length > 60 ? "..." : ""}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ---- Content form per type ----
function ContentForm({
    type,
    formData,
    setFormData,
    title,
    setTitle,
    urlError,
    setUrlError,
}: {
    type: QRType;
    formData: Record<string, string>;
    setFormData: (d: Record<string, string>) => void;
    title: string;
    setTitle: (t: string) => void;
    urlError: string;
    setUrlError: (e: string) => void;
}) {
    const set = (key: string, value: string) =>
        setFormData({ ...formData, [key]: value });

    const handleUrlBlur = (val: string) => {
        if (!val.trim()) {
            setUrlError("Voer een geldige URL in (bijv. https://jouwwebsite.nl)");
        } else if (!isValidUrl(val)) {
            setUrlError("URL moet beginnen met https:// of http://");
        } else {
            setUrlError("");
        }
    };

    return (
        <div>
            <div style={{ marginBottom: "1rem" }}>
                <label className="input-label">Naam voor dashboard</label>
                <input
                    className="input"
                    placeholder="Bijv. 'Winkel QR — januari 2026'"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {type === "url" && (
                <div>
                    <label className="input-label">Website URL *</label>
                    <input
                        className="input"
                        placeholder="https://jouwwebsite.nl"
                        value={formData.url ?? ""}
                        onChange={(e) => { set("url", e.target.value); if (urlError) setUrlError(""); }}
                        onBlur={(e) => handleUrlBlur(e.target.value)}
                        style={urlError ? { borderColor: "var(--color-error, #ef4444)" } : undefined}
                    />
                    {urlError ? (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-error, #ef4444)", marginTop: "0.375rem", fontWeight: 500 }}>
                            ⚠ {urlError}
                        </p>
                    ) : (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", marginTop: "0.375rem" }}>
                            Je kunt deze URL later altijd wijzigen zonder de QR opnieuw te printen.
                        </p>
                    )}
                </div>
            )}

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
                </div>
            )}

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
                        <select
                            className="input"
                            value={formData.security ?? "WPA"}
                            onChange={(e) => set("security", e.target.value)}
                        >
                            <option value="WPA">WPA/WPA2</option>
                            <option value="WEP">WEP</option>
                            <option value="nopass">Open (geen wachtwoord)</option>
                        </select>
                    </div>
                </div>
            )}

            {type === "text" && (
                <div>
                    <label className="input-label">Tekst inhoud</label>
                    <textarea
                        className="input"
                        rows={5}
                        placeholder="Jouw tekst hier..."
                        value={formData.text ?? ""}
                        onChange={(e) => set("text", e.target.value)}
                        style={{ resize: "vertical" }}
                    />
                </div>
            )}

            {type === "email" && (
                <div>
                    {[
                        { key: "email", label: "E-mailadres *" },
                        { key: "subject", label: "Onderwerp" },
                    ].map(({ key, label }) => (
                        <div key={key} style={{ marginBottom: "1rem" }}>
                            <label className="input-label">{label}</label>
                            <input className="input" value={formData[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
                        </div>
                    ))}
                    <div>
                        <label className="input-label">Berichttekst</label>
                        <textarea className="input" rows={3} value={formData.body ?? ""} onChange={(e) => set("body", e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                </div>
            )}

            {type === "sms" && (
                <div>
                    <div style={{ marginBottom: "1rem" }}>
                        <label className="input-label">Telefoonnummer *</label>
                        <input className="input" placeholder="+31612345678" value={formData.phone ?? ""} onChange={(e) => set("phone", e.target.value)} />
                    </div>
                    <div>
                        <label className="input-label">Vooringevuld bericht</label>
                        <textarea className="input" rows={3} value={formData.message ?? ""} onChange={(e) => set("message", e.target.value)} style={{ resize: "vertical" }} />
                    </div>
                </div>
            )}

            {(type === "file" || type === "social") && (
                <div>
                    <label className="input-label">
                        {type === "file" ? "Bestand URL (directe link)" : "Social media pagina URL"}
                    </label>
                    <input
                        className="input"
                        placeholder={type === "file" ? "https://example.com/bestand.pdf" : "https://instagram.com/jouwprofiel"}
                        value={formData[type === "file" ? "fileUrl" : "pageUrl"] ?? ""}
                        onChange={(e) => set(type === "file" ? "fileUrl" : "pageUrl", e.target.value)}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", marginTop: "0.375rem" }}>
                        Je kunt deze URL later altijd wijzigen.
                    </p>
                </div>
            )}
        </div>
    );
}

// Helper: transform formData to typed payload
function getPayload(type: QRType, formData: Record<string, string>): QRPayload {
    switch (type) {
        case "url": return { url: formData.url || "" };
        case "vcard": return {
            firstName: formData.firstName || "",
            lastName: formData.lastName || "",
            organization: formData.organization,
            phone: formData.phone,
            email: formData.email,
            website: formData.website,
            address: formData.address,
        };
        case "wifi": return {
            ssid: formData.ssid || "",
            password: formData.password || "",
            security: (formData.security || "WPA") as "WPA" | "WEP" | "nopass",
        };
        case "text": return { text: formData.text || "" };
        case "email": return { email: formData.email || "", subject: formData.subject, body: formData.body };
        case "sms": return { phone: formData.phone || "", message: formData.message };
        case "file": return { fileUrl: formData.fileUrl || "" };
        case "social": return { pageUrl: formData.pageUrl || "" };
        default: return { url: "" };
    }
}
