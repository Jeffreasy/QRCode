"use client";

import { useState } from "react";
import { useMutation, useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { QR_TYPE_META, QRType, encodePayload } from "@/lib/qr-types";
import { getContrastRatio, getPayload, isStepOneComplete } from "@/lib/create-utils";
import { getQRBaseUrl } from "@/lib/qr-url";
import QRPreview from "@/components/qr/QRPreview";
import {
    CheckIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    PlusIcon,
    QrCodeIcon,
} from "@/components/ui/icons";
import { STEPS, QR_TYPE_ICONS } from "./_constants";
import { useQRCustomization } from "./_hooks/useQRCustomization";
import { useLogoUpload } from "./_hooks/useLogoUpload";
import { ContentForm } from "./_components/ContentForm";
import { DesignStep } from "./_components/DesignStep";
import { ConfirmStep } from "./_components/ConfirmStep";

export default function CreateQRPage() {
    const router = useRouter();
    const createQRCode = useMutation(api.qrCodes.createQRCode);

    const [step, setStep] = useState(0);
    const [selectedType, setSelectedType] = useState<QRType | null>(null);
    const [title, setTitle] = useState("");
    const [formData, setFormData] = useState<Record<string, string>>({});

    const { customization, setCustomization, setCustomField } = useQRCustomization();
    const logo = useLogoUpload(setCustomization);

    const { isAuthenticated } = useConvexAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

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
                    dotStyle: customization.dotStyle as "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded",
                    errorCorrectionLevel: customization.errorCorrectionLevel,
                    logoUrl: customization.logoUrl,
                    cornerColor: customization.cornerColor,
                    cornerSquareType: customization.cornerSquareType,
                    cornerDotType: customization.cornerDotType,
                    qrShape: customization.qrShape,
                    backgroundRound: customization.backgroundRound,
                    borderEnabled: customization.borderEnabled,
                    borderColor: customization.borderColor,
                    borderWidth: customization.borderWidth,
                    borderRadius: customization.borderRadius,
                    logoSize: customization.logoSize,
                    logoMargin: customization.logoMargin,
                    logoHideDots: customization.logoHideDots,
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
        <div className="dashboard-main create-page" style={{ padding: "2rem 2.5rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)", fontWeight: 800, marginBottom: "0.25rem" }}>
                    Nieuwe QR code aanmaken
                </h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                    Volg de stappen om je dynamische QR code in te stellen.
                </p>
            </div>

            {/* Step indicator */}
            <div className="create-step-indicator">
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

            <div className="dashboard-grid-2col create-wizard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
                {/* Main content card */}
                <div className="card" style={{ padding: "2rem" }}>

                    {/* ── STEP 0: Type selection ── */}
                    {step === 0 && (
                        <div>
                            <h2 style={{ fontWeight: 700, marginBottom: "1.25rem" }}>Kies een QR type</h2>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: "0.75rem" }}>
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
                        <DesignStep
                            customization={customization}
                            setCustomField={setCustomField}
                            logoInput={logo.logoInput}
                            setLogoInput={logo.setLogoInput}
                            isUploadingLogo={logo.isUploadingLogo}
                            handleLogoApply={logo.handleLogoApply}
                            handleLogoFile={logo.handleLogoFile}
                            handleLogoClear={logo.handleLogoClear}
                            hasLowContrast={hasLowContrast}
                        />
                    )}

                    {/* ── STEP 3: Confirm ── */}
                    {step === 3 && selectedType && (
                        <ConfirmStep
                            title={title}
                            selectedType={selectedType}
                            computedDestination={computedDestination}
                            customization={customization}
                            errorMsg={errorMsg}
                            hasLowContrast={hasLowContrast}
                        />
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
                                title={isNextDisabled
                                    ? step === 0 ? "Selecteer eerst een QR type" : "Vul eerst alle verplichte velden in"
                                    : undefined}
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

                {/* Live preview sidebar */}
                <div className="create-wizard-preview" style={{ position: "sticky", top: "2rem" }}>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem", fontWeight: 600 }}>
                            Live preview
                        </div>
                        <QRPreview
                            value={
                                selectedType && QR_TYPE_META[selectedType].isDynamic
                                    ? `${getQRBaseUrl()}/r/preview`
                                    : computedDestination || "https://qrcodemaster.app"
                            }
                            fgColor={customization.fgColor}
                            bgColor={customization.bgColor}
                            dotStyle={customization.dotStyle}
                            errorCorrectionLevel={customization.errorCorrectionLevel as "L" | "M" | "Q" | "H"}
                            size={220}
                            logoUrl={customization.logoUrl}
                            cornerColor={customization.cornerColor}
                            cornerSquareType={customization.cornerSquareType}
                            cornerDotType={customization.cornerDotType}
                            qrShape={customization.qrShape}
                            backgroundRound={customization.backgroundRound}
                            borderEnabled={customization.borderEnabled}
                            borderColor={customization.borderColor}
                            borderWidth={customization.borderWidth}
                            borderRadius={customization.borderRadius}
                            logoSize={customization.logoSize}
                            logoMargin={customization.logoMargin}
                            logoHideDots={customization.logoHideDots}
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
                        <p style={{ marginTop: "0.625rem", fontSize: "0.7rem", color: "var(--color-text-faint)" }}>
                            Dit is een visuele preview — de echte slug wordt aangemaakt bij opslaan.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
