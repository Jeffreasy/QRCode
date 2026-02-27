"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QR_TYPE_META } from "@/lib/qr-types";
import QRPreview from "@/components/qr/QRPreview";
import QRDownload from "@/components/qr/QRDownload";
import ScanChart from "@/components/analytics/ScanChart";
import Link from "next/link";
import {
    BarChartIcon,
    SmartphoneIcon,
    GlobeIcon,
    LinkIcon,
    TrashIcon,
    CheckIcon,
    BanIcon,
    ZapIcon,
    ArrowUpRightIcon,
    ChevronRightIcon,
    EditIcon,
    XIcon,
} from "@/components/ui/icons";

const DOT_STYLES = [
    { value: "square", label: "Vierkant" },
    { value: "rounded", label: "Afgerond" },
    { value: "dots", label: "Dots" },
    { value: "classy", label: "Classy" },
    { value: "classy-rounded", label: "Classy Rond" },
];

export default function QRDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [editingDest, setEditingDest] = useState(false);
    const [newDest, setNewDest] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    // Design edit state
    const [editingDesign, setEditingDesign] = useState(false);
    const [isSavingDesign, setIsSavingDesign] = useState(false);
    const [designDraft, setDesignDraft] = useState<{
        fgColor: string;
        bgColor: string;
        dotStyle: string;
        cornerColor: string;
        cornerSquareType: string;
        cornerDotType: string;
        qrShape: "square" | "circle";
        backgroundRound: number;
        errorCorrectionLevel: string;
        logoUrl: string;
        borderEnabled: boolean;
        borderColor: string;
        borderWidth: number;
        borderRadius: number;
        logoSize: number;
        logoMargin: number;
        logoHideDots: boolean;
    } | null>(null);

    const qrId = params.id as Id<"qr_codes">;

    const qrCode = useQuery(
        api.qrCodes.getById,
        { id: qrId }
    );

    const scanStats = useQuery(
        api.analytics.getScanStats,
        { qrCodeId: qrId }
    );

    const scansByDay = useQuery(
        api.analytics.getScansByDay,
        { qrCodeId: qrId, days: 30 }
    );

    const updateDest = useMutation(api.qrCodes.updateDestination);
    const toggleActive = useMutation(api.qrCodes.toggleActive);
    const deleteQR = useMutation(api.qrCodes.deleteQRCode);
    const updateCustomization = useMutation(api.qrCodes.updateCustomization);

    if (qrCode === undefined) {
        return (
            <div style={{ padding: "2rem 2.5rem" }}>
                <div className="skeleton" style={{ height: "40px", width: "300px", marginBottom: "2rem" }} />
                <div className="dashboard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
                    <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
                    <div className="skeleton" style={{ height: "400px", borderRadius: "var(--radius-lg)" }} />
                </div>
            </div>
        );
    }

    if (!qrCode) {
        return (
            <div style={{ padding: "2rem 2.5rem", textAlign: "center" }}>
                <h2>QR code niet gevonden</h2>
                <Link href="/dashboard" className="btn btn-secondary" style={{ marginTop: "1rem" }}>
                    ← Terug naar dashboard
                </Link>
            </div>
        );
    }

    const typeMeta = QR_TYPE_META[qrCode.type as keyof typeof QR_TYPE_META];

    const clientOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const siteUrl = clientOrigin || envSiteUrl || "https://www.jeffdash.com";

    const redirectUrl = `${siteUrl}/r/${qrCode.slug}`;

    async function handleSaveDest() {
        if (!newDest.trim()) return;
        setIsSaving(true);
        try {
            await updateDest({ id: qrId, destination: newDest.trim() });
            setEditingDest(false);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggle() {
        await toggleActive({ id: qrId });
    }

    async function handleDelete() {
        if (!confirm(`Weet je zeker dat je '${qrCode!.title}' wil verwijderen?`)) return;
        await deleteQR({ id: qrId });
        router.push("/dashboard");
    }

    function handleCopyUrl() {
        navigator.clipboard.writeText(redirectUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function openDesignEdit() {
        setDesignDraft({
            fgColor: qrCode!.customization?.fgColor ?? "#000000",
            bgColor: qrCode!.customization?.bgColor ?? "#ffffff",
            dotStyle: qrCode!.customization?.dotStyle ?? "square",
            cornerColor: qrCode!.customization?.cornerColor ?? "",
            cornerSquareType: qrCode!.customization?.cornerSquareType ?? "",
            cornerDotType: qrCode!.customization?.cornerDotType ?? "",
            qrShape: (qrCode!.customization?.qrShape as "square" | "circle") ?? "square",
            backgroundRound: qrCode!.customization?.backgroundRound ?? 0,
            errorCorrectionLevel: qrCode!.customization?.errorCorrectionLevel ?? "M",
            logoUrl: qrCode!.customization?.logoUrl ?? "",
            borderEnabled: qrCode!.customization?.borderEnabled ?? false,
            borderColor: qrCode!.customization?.borderColor ?? "#38bdf8",
            borderWidth: qrCode!.customization?.borderWidth ?? 4,
            borderRadius: qrCode!.customization?.borderRadius ?? 16,
            logoSize: qrCode!.customization?.logoSize ?? 0.35,
            logoMargin: qrCode!.customization?.logoMargin ?? 4,
            logoHideDots: qrCode!.customization?.logoHideDots ?? true,
        });
        setEditingDesign(true);
    }

    async function handleSaveDesign() {
        if (!designDraft) return;
        setIsSavingDesign(true);
        try {
            await updateCustomization({
                id: qrId,
                customization: {
                    fgColor: designDraft.fgColor,
                    bgColor: designDraft.bgColor,
                    dotStyle: designDraft.dotStyle as "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded",
                    cornerColor: designDraft.cornerColor || undefined,
                    cornerSquareType: (designDraft.cornerSquareType || undefined) as "square" | "dot" | "extra-rounded" | undefined,
                    cornerDotType: (designDraft.cornerDotType || undefined) as "square" | "dot" | undefined,
                    qrShape: designDraft.qrShape,
                    backgroundRound: designDraft.backgroundRound,
                    errorCorrectionLevel: designDraft.errorCorrectionLevel,
                    logoUrl: designDraft.logoUrl || undefined,
                    borderEnabled: designDraft.borderEnabled,
                    borderColor: designDraft.borderColor,
                    borderWidth: designDraft.borderWidth,
                    borderRadius: designDraft.borderRadius,
                    logoSize: designDraft.logoSize,
                    logoMargin: designDraft.logoMargin,
                    logoHideDots: designDraft.logoHideDots,
                },
            });
            setEditingDesign(false);
        } finally {
            setIsSavingDesign(false);
        }
    }

    // Active customization — use draft values if editing for live preview
    const activeCustom = editingDesign && designDraft ? designDraft : {
        fgColor: qrCode.customization?.fgColor ?? "#000000",
        bgColor: qrCode.customization?.bgColor ?? "#ffffff",
        dotStyle: qrCode.customization?.dotStyle ?? "square",
        cornerColor: qrCode.customization?.cornerColor ?? "",
        cornerSquareType: qrCode.customization?.cornerSquareType ?? "",
        cornerDotType: qrCode.customization?.cornerDotType ?? "",
        qrShape: (qrCode.customization?.qrShape ?? "square") as "square" | "circle",
        backgroundRound: qrCode.customization?.backgroundRound ?? 0,
        errorCorrectionLevel: qrCode.customization?.errorCorrectionLevel ?? "M",
        logoUrl: qrCode.customization?.logoUrl ?? "",
        borderEnabled: qrCode.customization?.borderEnabled ?? false,
        borderColor: qrCode.customization?.borderColor ?? "#38bdf8",
        borderWidth: qrCode.customization?.borderWidth ?? 4,
        borderRadius: qrCode.customization?.borderRadius ?? 16,
        logoSize: qrCode.customization?.logoSize ?? 0.35,
        logoMargin: qrCode.customization?.logoMargin ?? 4,
        logoHideDots: qrCode.customization?.logoHideDots ?? true,
    };

    const DETAIL_STATS = [
        { label: "Totale scans", value: qrCode.totalScans, Icon: BarChartIcon },
        { label: "Unieke apparaten", value: scanStats ? Object.keys(scanStats.deviceBreakdown).length : "-", Icon: SmartphoneIcon },
        { label: "Landen bereikt", value: scanStats ? Object.keys(scanStats.countryBreakdown).filter(c => c !== "Unknown").length : "-", Icon: GlobeIcon },
    ];

    return (
        <div className="dashboard-main" style={{ padding: "2rem 2.5rem" }}>
            {/* Breadcrumb */}
            <nav
                aria-label="Broodkruimelpad"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}
            >
                <Link
                    href="/dashboard"
                    style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >
                    Dashboard
                </Link>
                <ChevronRightIcon size={14} />
                <span style={{ color: "var(--color-text)" }}>{qrCode.title}</span>
            </nav>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                        {typeMeta?.icon && (
                            <span style={{ fontSize: "1.5rem" }}>{typeMeta.icon}</span>
                        )}
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{qrCode.title}</h1>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.625rem",
                                borderRadius: "100px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                background: qrCode.isActive ? "var(--color-success-bg)" : "var(--color-muted-bg)",
                                color: qrCode.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                                border: `1px solid ${qrCode.isActive ? "var(--color-success-border)" : "var(--color-muted-border)"}`,
                            }}
                        >
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                            {qrCode.isActive ? "Actief" : "Inactief"}
                        </span>
                    </div>
                    <p style={{ color: "var(--color-text-faint)", fontFamily: "monospace", fontSize: "0.875rem" }}>
                        /r/{qrCode.slug}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleToggle}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                    >
                        {qrCode.isActive ? <BanIcon size={14} /> : <CheckIcon size={14} />}
                        {qrCode.isActive ? "Deactiveren" : "Activeren"}
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleDelete}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                    >
                        <TrashIcon size={14} />
                        Verwijderen
                    </button>
                </div>
            </div>

            <div className="qr-detail-grid">
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Stats */}
                    <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                        {DETAIL_STATS.map(({ label, value, Icon }) => (
                            <div key={label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "var(--radius-md)",
                                        background: "var(--color-accent-bg)",
                                        border: "1px solid var(--color-accent-border)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 0.75rem",
                                        color: "var(--color-accent)",
                                    }}
                                >
                                    <Icon size={18} />
                                </div>
                                <div style={{ fontSize: "1.75rem", fontWeight: 800, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                    {value}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Scan chart */}
                    {scansByDay && <ScanChart data={scansByDay} />}

                    {/* Device / Country breakdown */}
                    {scanStats && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <BreakdownCard title="Apparaten" data={scanStats.deviceBreakdown} />
                            <BreakdownCard title="Top landen" data={scanStats.countryBreakdown} />
                        </div>
                    )}

                    {/* Destination editor */}
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <LinkIcon size={16} style={{ color: "var(--color-text-muted)" }} />
                                Bestemming
                            </h3>
                            {!editingDest && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => { setNewDest(qrCode.destination); setEditingDest(true); }}
                                    style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                                >
                                    <EditIcon size={13} />
                                    Wijzigen
                                </button>
                            )}
                        </div>

                        {editingDest ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <input
                                    className="input"
                                    value={newDest}
                                    onChange={(e) => setNewDest(e.target.value)}
                                    placeholder="Nieuwe bestemming..."
                                    autoFocus
                                />
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleSaveDest}
                                        disabled={isSaving}
                                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                                    >
                                        <CheckIcon size={14} />
                                        {isSaving ? "Opslaan..." : "Opslaan"}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setEditingDest(false)}
                                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                                    >
                                        <XIcon size={14} />
                                        Annuleren
                                    </button>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                    <ZapIcon size={12} />
                                    De QR code zelf verandert niet — alleen de bestemming.
                                </p>
                            </div>
                        ) : (
                            <p style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--color-text-muted)", wordBreak: "break-all" }}>
                                {qrCode.destination}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right column: QR + design edit + download */}
                <div className="qr-detail-right" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "2rem" }}>
                    {/* QR Preview card */}
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <QRPreview
                            value={redirectUrl}
                            fgColor={activeCustom.fgColor}
                            bgColor={activeCustom.bgColor}
                            dotStyle={activeCustom.dotStyle}
                            errorCorrectionLevel={(activeCustom.errorCorrectionLevel ?? "M") as "L" | "M" | "Q" | "H"}
                            size={220}
                            logoUrl={activeCustom.logoUrl || undefined}
                            cornerColor={activeCustom.cornerColor || undefined}
                            cornerSquareType={(activeCustom.cornerSquareType || undefined) as "square" | "dot" | "extra-rounded" | undefined}
                            cornerDotType={(activeCustom.cornerDotType || undefined) as "square" | "dot" | undefined}
                            qrShape={activeCustom.qrShape}
                            backgroundRound={activeCustom.backgroundRound}
                            borderEnabled={activeCustom.borderEnabled}
                            borderColor={activeCustom.borderColor}
                            borderWidth={activeCustom.borderWidth}
                            borderRadius={activeCustom.borderRadius}
                            logoSize={activeCustom.logoSize}
                            logoMargin={activeCustom.logoMargin}
                            logoHideDots={activeCustom.logoHideDots}
                        />

                        {/* Redirect destination info */}
                        <div style={{ marginTop: "1rem", padding: "0.625rem 0.875rem", background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-md)" }}>
                            <div style={{ fontSize: "0.7rem", color: "var(--color-success)", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <ArrowUpRightIcon size={11} />
                                Scannen stuurt door naar:
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text)", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {qrCode.destination}
                            </div>
                        </div>

                        {/* Redirect URL with copy button */}
                        <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                            <p style={{ fontSize: "0.65rem", color: "var(--color-text-faint)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "220px" }}>
                                via {redirectUrl}
                            </p>
                            <button
                                onClick={handleCopyUrl}
                                title="Kopieer redirect URL"
                                aria-label={copied ? "URL gekopieerd!" : "Kopieer redirect URL naar klembord"}
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    padding: "2px",
                                    color: copied ? "var(--color-success)" : "var(--color-text-faint)",
                                    transition: "color 0.2s ease",
                                    flexShrink: 0,
                                }}
                            >
                                {copied ? (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                ) : (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Design edit panel */}
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editingDesign ? "1.25rem" : 0 }}>
                            <h4 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                Design
                            </h4>
                            {!editingDesign ? (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={openDesignEdit}
                                    style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                                >
                                    <EditIcon size={13} />
                                    Bewerken
                                </button>
                            ) : (
                                <button className="btn btn-ghost btn-sm" onClick={() => setEditingDesign(false)}>
                                    <XIcon size={13} />
                                </button>
                            )}
                        </div>

                        {editingDesign && designDraft && (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

                                {/* Colors */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                                    <div>
                                        <label className="input-label">Voorgrond</label>
                                        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                                            <input type="color" value={designDraft.fgColor}
                                                onChange={(e) => setDesignDraft(d => d ? { ...d, fgColor: e.target.value } : d)}
                                                style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                                            <input className="input" value={designDraft.fgColor}
                                                onChange={(e) => setDesignDraft(d => d ? { ...d, fgColor: e.target.value } : d)}
                                                style={{ flex: 1, fontSize: "0.75rem", padding: "0.375rem 0.5rem" }} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="input-label">Achtergrond</label>
                                        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                                            <input type="color" value={designDraft.bgColor}
                                                onChange={(e) => setDesignDraft(d => d ? { ...d, bgColor: e.target.value } : d)}
                                                style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                                            <input className="input" value={designDraft.bgColor}
                                                onChange={(e) => setDesignDraft(d => d ? { ...d, bgColor: e.target.value } : d)}
                                                style={{ flex: 1, fontSize: "0.75rem", padding: "0.375rem 0.5rem" }} />
                                        </div>
                                    </div>
                                </div>

                                {/* Corner color */}
                                <div>
                                    <label className="input-label">Hoekkleur <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(optioneel)</span></label>
                                    <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                                        <input type="color" value={designDraft.cornerColor || designDraft.fgColor}
                                            onChange={(e) => setDesignDraft(d => d ? { ...d, cornerColor: e.target.value } : d)}
                                            style={{ width: "36px", height: "36px", border: "none", cursor: "pointer", borderRadius: "6px" }} />
                                        <input className="input" value={designDraft.cornerColor}
                                            onChange={(e) => setDesignDraft(d => d ? { ...d, cornerColor: e.target.value } : d)}
                                            placeholder="Zelfde als voorgrond"
                                            style={{ flex: 1, fontSize: "0.75rem", padding: "0.375rem 0.5rem" }} />
                                        {designDraft.cornerColor && (
                                            <button className="btn btn-ghost btn-sm"
                                                onClick={() => setDesignDraft(d => d ? { ...d, cornerColor: "" } : d)}
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
                                            <button
                                                key={ds.value}
                                                onClick={() => setDesignDraft(d => d ? { ...d, dotStyle: ds.value } : d)}
                                                style={{
                                                    padding: "0.375rem 0.75rem",
                                                    borderRadius: "var(--radius-md)",
                                                    background: designDraft.dotStyle === ds.value ? "var(--color-accent-bg)" : "var(--color-bg-2)",
                                                    border: `1px solid ${designDraft.dotStyle === ds.value ? "var(--color-accent-border-active)" : "var(--color-border)"}`,
                                                    cursor: "pointer", color: "var(--color-text)", fontSize: "0.75rem",
                                                    fontWeight: designDraft.dotStyle === ds.value ? 600 : 400,
                                                    transition: "var(--transition)",
                                                }}
                                            >
                                                {ds.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Logo URL */}
                                <div>
                                    <label className="input-label">Logo URL <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>(optioneel)</span></label>
                                    <input
                                        className="input"
                                        placeholder="https://..."
                                        value={designDraft.logoUrl}
                                        onChange={(e) => setDesignDraft(d => d ? { ...d, logoUrl: e.target.value } : d)}
                                        style={{ fontSize: "0.8rem" }}
                                    />
                                </div>

                                {/* Actions */}
                                <div style={{ display: "flex", gap: "0.75rem", paddingTop: "0.25rem" }}>
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleSaveDesign}
                                        disabled={isSavingDesign}
                                        style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}
                                    >
                                        <CheckIcon size={14} />
                                        {isSavingDesign ? "Opslaan..." : "Design opslaan"}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setEditingDesign(false)}
                                    >
                                        Annuleren
                                    </button>
                                </div>
                            </div>
                        )}

                        {!editingDesign && (
                            <div style={{ marginTop: "0.75rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                    <div style={{ width: "16px", height: "16px", borderRadius: "3px", background: qrCode.customization?.fgColor ?? "#000", border: "1px solid var(--color-border)", flexShrink: 0 }} title={`Voorgrond: ${qrCode.customization?.fgColor ?? "#000000"}`} />
                                    <div style={{ width: "16px", height: "16px", borderRadius: "3px", background: qrCode.customization?.bgColor ?? "#fff", border: "1px solid var(--color-border)", flexShrink: 0 }} title={`Achtergrond: ${qrCode.customization?.bgColor ?? "#ffffff"}`} />
                                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                                        {DOT_STYLES.find(d => d.value === (qrCode.customization?.dotStyle ?? "square"))?.label ?? "Vierkant"}
                                    </span>
                                </div>
                                {qrCode.customization?.logoUrl && (
                                    <span style={{ fontSize: "0.72rem", color: "var(--color-accent)", background: "var(--color-accent-bg)", padding: "0.125rem 0.5rem", borderRadius: "100px", border: "1px solid var(--color-accent-border)" }}>
                                        ✓ Logo
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <QRDownload
                        value={redirectUrl}
                        fgColor={activeCustom.fgColor}
                        bgColor={activeCustom.bgColor}
                        dotStyle={activeCustom.dotStyle}
                        errorCorrectionLevel={(activeCustom.errorCorrectionLevel ?? "M") as "L" | "M" | "Q" | "H"}
                        filename={qrCode.slug}
                        logoUrl={activeCustom.logoUrl || undefined}
                        cornerColor={activeCustom.cornerColor || undefined}
                        cornerSquareType={(activeCustom.cornerSquareType || undefined) as "square" | "dot" | "extra-rounded" | undefined}
                        cornerDotType={(activeCustom.cornerDotType || undefined) as "square" | "dot" | undefined}
                        qrShape={activeCustom.qrShape}
                        backgroundRound={activeCustom.backgroundRound}
                        logoSize={activeCustom.logoSize}
                        logoMargin={activeCustom.logoMargin}
                        logoHideDots={activeCustom.logoHideDots}
                    />

                </div>
            </div>
        </div>
    );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
    const total = Object.values(data).reduce((s, n) => s + n, 0);
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 5);

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.9rem" }}>{title}</h4>
            {sorted.length === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-faint)" }}>Nog geen data</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {sorted.map(([key, count]) => {
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                            <div key={key}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                                    <span style={{ color: "var(--color-text-muted)" }}>{key}</span>
                                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                                </div>
                                <div style={{ height: "4px", background: "var(--color-surface-2)", borderRadius: "100px", overflow: "hidden" }}>
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${pct}%`,
                                            background: "var(--gradient-brand)",
                                            borderRadius: "100px",
                                            transition: "width 0.5s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
