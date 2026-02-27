"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { QR_TYPE_META, QRType, QRPayload, encodePayload } from "@/lib/qr-types";
import QRPreview from "@/components/qr/QRPreview";

const STEPS = ["Type", "Inhoud", "Design", "Opslaan"];

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

    // For dynamic types the actual QR encodes the redirect URL, not the raw destination.
    // Show the correct format in the preview so it matches the saved QR.
    const isDynamic = selectedType ? ["url", "file", "social"].includes(selectedType) : false;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== "undefined" ? window.location.origin : "");
    const previewValue = isDynamic && computedDestination
        ? `${siteUrl}/r/xxxxxx`
        : computedDestination || `${siteUrl}`;

    async function handleCreate() {
        if (!user || !selectedType) return;
        setIsLoading(true);
        try {
            const result = await createQRCode({
                userId: user.id,
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

    return (
        <div style={{ padding: "2rem 2.5rem", maxWidth: "1000px" }}>
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
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2.5rem" }}>
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
                                background:
                                    i < step
                                        ? "var(--color-success)"
                                        : i === step
                                            ? "var(--gradient-brand)"
                                            : "var(--color-surface-2)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "#fff",
                                backgroundImage: i === step ? "var(--gradient-brand)" : undefined,
                                flexShrink: 0,
                            }}
                        >
                            {i < step ? "✓" : i + 1}
                        </div>
                        <span
                            style={{
                                fontSize: "0.8125rem",
                                fontWeight: i === step ? 600 : 400,
                                color: i === step ? "var(--color-text)" : "var(--color-text-muted)",
                            }}
                        >
                            {s}
                        </span>
                        {i < STEPS.length - 1 && (
                            <div
                                style={{
                                    width: "24px",
                                    height: "1px",
                                    background: i < step ? "var(--color-success)" : "var(--color-border)",
                                    marginLeft: "0.25rem",
                                }}
                            />
                        )}
                    </div>
                ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
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
                                    ([type, meta]) => (
                                        <button
                                            key={type}
                                            onClick={() => setSelectedType(type)}
                                            style={{
                                                padding: "1rem",
                                                textAlign: "left",
                                                background:
                                                    selectedType === type
                                                        ? "rgba(56,189,248,0.1)"
                                                        : "var(--color-bg-2)",
                                                border: `1px solid ${selectedType === type
                                                    ? "rgba(56,189,248,0.4)"
                                                    : "var(--color-border)"
                                                    }`,
                                                borderRadius: "var(--radius-md)",
                                                cursor: "pointer",
                                                transition: "var(--transition)",
                                                color: "var(--color-text)",
                                                width: "100%",
                                            }}
                                        >
                                            <div style={{ fontSize: "1.5rem", marginBottom: "0.375rem" }}>{meta.icon}</div>
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
                                                    ⚡ Dynamisch
                                                </div>
                                            )}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Content */}
                    {step === 1 && selectedType && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>
                                {QR_TYPE_META[selectedType].icon} {QR_TYPE_META[selectedType].label} — Inhoud
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
                                        {["square", "rounded", "dots", "classy", "classy-rounded"].map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => setCustomization({ ...customization, dotStyle: style })}
                                                style={{
                                                    padding: "0.5rem 1rem",
                                                    borderRadius: "var(--radius-md)",
                                                    background:
                                                        customization.dotStyle === style
                                                            ? "rgba(56,189,248,0.15)"
                                                            : "var(--color-bg-2)",
                                                    border: `1px solid ${customization.dotStyle === style
                                                        ? "rgba(56,189,248,0.4)"
                                                        : "var(--color-border)"
                                                        }`,
                                                    cursor: "pointer",
                                                    color: "var(--color-text)",
                                                    fontSize: "0.8125rem",
                                                    fontWeight: customization.dotStyle === style ? 600 : 400,
                                                    transition: "var(--transition)",
                                                }}
                                            >
                                                {style.charAt(0).toUpperCase() + style.slice(1)}
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
                                                onClick={() =>
                                                    setCustomization({ ...customization, errorCorrectionLevel: ec.value })
                                                }
                                                style={{
                                                    padding: "0.5rem 0.875rem",
                                                    borderRadius: "var(--radius-md)",
                                                    background:
                                                        customization.errorCorrectionLevel === ec.value
                                                            ? "rgba(56,189,248,0.15)"
                                                            : "var(--color-bg-2)",
                                                    border: `1px solid ${customization.errorCorrectionLevel === ec.value
                                                        ? "rgba(56,189,248,0.4)"
                                                        : "var(--color-border)"
                                                        }`,
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
                            style={{ opacity: step === 0 ? 0.4 : 1 }}
                        >
                            ← Vorige
                        </button>

                        {step < STEPS.length - 1 ? (
                            <button
                                className="btn btn-primary"
                                onClick={() => setStep(step + 1)}
                                disabled={step === 0 && !selectedType}
                            >
                                Volgende →
                            </button>
                        ) : (
                            <button
                                className="btn btn-primary"
                                onClick={handleCreate}
                                disabled={isLoading}
                            >
                                {isLoading ? "Opslaan..." : "✓ QR code aanmaken"}
                            </button>
                        )}
                    </div>
                </div>

                {/* Live preview */}
                <div style={{ position: "sticky", top: "2rem" }}>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem", fontWeight: 500 }}>
                            Live preview
                        </div>
                        <QRPreview
                            value={previewValue}
                            fgColor={customization.fgColor}
                            bgColor={customization.bgColor}
                            dotStyle={customization.dotStyle}
                            errorCorrectionLevel={
                                customization.errorCorrectionLevel as "L" | "M" | "Q" | "H"
                            }
                            size={220}
                        />
                        {computedDestination && (
                            <div style={{ marginTop: "0.875rem" }}>
                                {isDynamic && (
                                    <p style={{ fontSize: "0.7rem", color: "var(--color-accent)", marginBottom: "0.25rem", fontWeight: 600 }}>
                                        ⚡ Dynamisch — unieke slug na opslaan
                                    </p>
                                )}
                                <p
                                    style={{
                                        fontSize: "0.7rem",
                                        color: "var(--color-text-faint)",
                                        fontFamily: "monospace",
                                        wordBreak: "break-all",
                                    }}
                                >
                                    {isDynamic ? `${siteUrl}/r/` : computedDestination.slice(0, 50)}
                                    {isDynamic ? <strong style={{ color: "var(--color-text-muted)" }}>AbCd3F</strong> : (computedDestination.length > 50 ? "..." : "")}
                                </p>
                            </div>
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
}: {
    type: QRType;
    formData: Record<string, string>;
    setFormData: (d: Record<string, string>) => void;
    title: string;
    setTitle: (t: string) => void;
}) {
    const set = (key: string, value: string) =>
        setFormData({ ...formData, [key]: value });

    const f = (key: string) =>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "1rem" }}>
            <label className="input-label">{key}</label>
            <input className="input" value={formData[key] ?? ""} onChange={(e) => set(key, e.target.value)} />
        </div>;

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
                    <label className="input-label">Website URL</label>
                    <input
                        className="input"
                        placeholder="https://jouwwebsite.nl"
                        value={formData.url ?? ""}
                        onChange={(e) => set("url", e.target.value)}
                    />
                    <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", marginTop: "0.375rem" }}>
                        ⚡ Je kunt deze URL later altijd wijzigen zonder de QR opnieuw te printen.
                    </p>
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
                        ⚡ Je kunt deze URL later altijd wijzigen.
                    </p>
                </div>
            )}

            {/* Prevent unused var warning */}
            {void f}
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
