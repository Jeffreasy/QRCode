"use client";

import { QRType, isValidUrl } from "@/lib/qr-types";
import { CheckIcon } from "@/components/ui/icons";

export function ContentForm({
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
            {/* Dashboard title */}
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
                    <div
                        style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                        onClick={() => toggle("hidden")}
                    >
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
