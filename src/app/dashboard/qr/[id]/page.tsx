"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QR_TYPE_META } from "@/lib/qr-types";
import QRPreview from "@/components/qr/QRPreview";
import QRDownload from "@/components/qr/QRDownload";
import ScanChart from "@/components/analytics/ScanChart";
import Link from "next/link";
import {
    BarChartIcon, SmartphoneIcon, GlobeIcon, LinkIcon,
    TrashIcon, CheckIcon, BanIcon, ZapIcon, ArrowUpRightIcon,
    ChevronRightIcon, EditIcon, XIcon, CopyIcon, BrowserIcon,
} from "@/components/ui/icons";
import { useDesignDraft } from "./_hooks/useDesignDraft";
import { useQRDetailActions } from "./_hooks/useQRDetailActions";
import { DesignEditPanel } from "./_components/DesignEditPanel";
import { BreakdownCard } from "./_components/BreakdownCard";
import { RecentScansFeed } from "./_components/RecentScansFeed";

export default function QRDetailPage() {
    const params = useParams();
    const qrId = params.id as Id<"qr_codes">;

    // ── Queries ──────────────────────────────────────────────────────────────
    const qrCode = useQuery(api.qrCodes.getById, { id: qrId });
    const scanStats = useQuery(api.analytics.getScanStats, { qrCodeId: qrId });
    const scansByDay = useQuery(api.analytics.getScansByDay, { qrCodeId: qrId, days: 30 });
    const recentScans = useQuery(api.analytics.getRecentScans, { qrCodeId: qrId, limit: 10 });

    // ── Hooks ─────────────────────────────────────────────────────────────────
    const design = useDesignDraft(qrId);
    const actions = useQRDetailActions(qrId, recentScans, qrCode ?? null);


    // ── Loading / not found states ────────────────────────────────────────────
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

    // ── Derived values ────────────────────────────────────────────────────────
    const typeMeta = QR_TYPE_META[qrCode.type as keyof typeof QR_TYPE_META];
    const clientOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const siteUrl = clientOrigin || process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://qrcodemaster.app";
    const redirectUrl = `${siteUrl}/r/${qrCode.slug}`;

    const activeCustom = design.editingDesign && design.designDraft ? design.designDraft : {
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
        <div className="dashboard-main" style={{ padding: "clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2.5rem)" }}>
            {/* Breadcrumb */}
            <nav aria-label="Broodkruimelpad" style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <Link href="/dashboard" className="breadcrumb-link">Dashboard</Link>
                <ChevronRightIcon size={14} />
                <span style={{ color: "var(--color-text)" }}>{qrCode.title}</span>
            </nav>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                        {typeMeta?.icon && <span style={{ fontSize: "1.5rem" }}>{typeMeta.icon}</span>}

                        {/* Inline title edit */}
                        {actions.editingTitle ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1, minWidth: 0 }}>
                                <input className="input" value={actions.newTitle}
                                    onChange={(e) => actions.setNewTitle(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && actions.handleSaveTitle()}
                                    autoFocus style={{ fontSize: "1.3rem", fontWeight: 700, minWidth: 0, width: "100%" }} />
                                <button className="btn btn-primary btn-sm" onClick={actions.handleSaveTitle} disabled={actions.isSavingTitle}>
                                    {actions.isSavingTitle ? "..." : "Opslaan"}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => actions.setEditingTitle(false)}><XIcon size={14} /></button>
                            </div>
                        ) : (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{qrCode.title}</h1>
                                <button className="btn btn-ghost btn-sm"
                                    onClick={() => { actions.setNewTitle(qrCode.title); actions.setEditingTitle(true); }}
                                    aria-label="Titel bewerken" title="Titel bewerken"
                                    style={{ padding: "0.25rem", color: "var(--color-text-faint)" }}>
                                    <EditIcon size={15} />
                                </button>
                            </div>
                        )}

                        {/* Active/inactive badge */}
                        <span style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            padding: "0.25rem 0.625rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 600,
                            background: qrCode.isActive ? "var(--color-success-bg)" : "var(--color-muted-bg)",
                            color: qrCode.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                            border: `1px solid ${qrCode.isActive ? "var(--color-success-border)" : "var(--color-muted-border)"}`,
                        }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                            {qrCode.isActive ? "Actief" : "Inactief"}
                        </span>
                    </div>
                    <p style={{ color: "var(--color-text-faint)", fontFamily: "monospace", fontSize: "0.875rem" }}>/r/{qrCode.slug}</p>
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button className="btn btn-secondary btn-sm" onClick={actions.handleDuplicate} disabled={actions.isDuplicating}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }} title="Dupliceer deze QR code">
                        <CopyIcon size={14} />
                        {actions.isDuplicating ? "..." : "Dupliceren"}
                    </button>
                    <button className="btn btn-secondary btn-sm" onClick={actions.handleToggle}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        {qrCode.isActive ? <BanIcon size={14} /> : <CheckIcon size={14} />}
                        {qrCode.isActive ? "Deactiveren" : "Activeren"}
                    </button>

                    {!actions.showDeleteConfirm ? (
                        <button className="btn btn-danger btn-sm" onClick={() => actions.setShowDeleteConfirm(true)}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <TrashIcon size={14} /> Verwijderen
                        </button>
                    ) : (
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Weet je het zeker?</span>
                            <button className="btn btn-danger btn-sm" onClick={actions.handleDelete} disabled={actions.isDeleting}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <TrashIcon size={14} />
                                {actions.isDeleting ? "Verwijderen..." : "Ja, verwijder"}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => actions.setShowDeleteConfirm(false)}>Annuleren</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="qr-detail-grid">
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* Stats */}
                    <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                        {DETAIL_STATS.map(({ label, value, Icon }) => (
                            <div key={label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: "var(--color-accent)" }}>
                                    <Icon size={18} />
                                </div>
                                <div style={{ fontSize: "1.75rem", fontWeight: 800, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{value}</div>
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
                                <LinkIcon size={16} style={{ color: "var(--color-text-muted)" }} /> Bestemming
                            </h3>
                            {!actions.editingDest && (
                                <button className="btn btn-secondary btn-sm"
                                    onClick={() => { actions.setNewDest(qrCode.destination); actions.setEditingDest(true); }}
                                    style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                    <EditIcon size={13} /> Wijzigen
                                </button>
                            )}
                        </div>

                        {actions.editingDest ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <input className="input" value={actions.newDest}
                                    onChange={(e) => actions.setNewDest(e.target.value)}
                                    placeholder="Nieuwe bestemming..." autoFocus />
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <button className="btn btn-primary btn-sm" onClick={actions.handleSaveDest} disabled={actions.isSaving}
                                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                        <CheckIcon size={14} /> {actions.isSaving ? "Opslaan..." : "Opslaan"}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => actions.setEditingDest(false)}
                                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                        <XIcon size={14} /> Annuleren
                                    </button>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                    <ZapIcon size={12} /> De QR code zelf verandert niet — alleen de bestemming.
                                </p>
                            </div>
                        ) : (
                            <p style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--color-text-muted)", wordBreak: "break-all" }}>
                                {qrCode.destination}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right column */}
                <div className="qr-detail-right" style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "2rem" }}>

                    {/* QR Preview card */}
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <QRPreview
                            value={redirectUrl}
                            fgColor={activeCustom.fgColor} bgColor={activeCustom.bgColor}
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

                        {/* Destination info */}
                        <div style={{ marginTop: "1rem", padding: "0.625rem 0.875rem", background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-md)" }}>
                            <div style={{ fontSize: "0.7rem", color: "var(--color-success)", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <ArrowUpRightIcon size={11} /> Scannen stuurt door naar:
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text)", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {qrCode.destination}
                            </div>
                        </div>

                        {/* Redirect URL + copy */}
                        <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                            <p style={{ fontSize: "0.65rem", color: "var(--color-text-faint)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "220px" }}>
                                via {redirectUrl}
                            </p>
                            <button onClick={() => actions.handleCopyUrl(redirectUrl)} title="Kopieer redirect URL"
                                aria-label={actions.copied ? "URL gekopieerd!" : "Kopieer redirect URL naar klembord"}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: actions.copied ? "var(--color-success)" : "var(--color-text-faint)", transition: "color 0.2s ease", flexShrink: 0 }}>
                                {actions.copied ? (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                ) : (
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Design edit panel */}
                    <DesignEditPanel
                        editingDesign={design.editingDesign}
                        isSavingDesign={design.isSavingDesign}
                        designDraft={design.designDraft}
                        setDesignDraft={design.setDesignDraft}
                        onOpen={() => design.openDesignEdit(qrCode)}
                        onSave={design.handleSaveDesign}
                        onClose={() => design.setEditingDesign(false)}
                        fgColor={qrCode.customization?.fgColor ?? "#000000"}
                        bgColor={qrCode.customization?.bgColor ?? "#ffffff"}
                        dotStyle={qrCode.customization?.dotStyle ?? "square"}
                        logoUrl={qrCode.customization?.logoUrl}
                    />

                    {/* Download */}
                    <QRDownload
                        value={redirectUrl}
                        fgColor={activeCustom.fgColor} bgColor={activeCustom.bgColor}
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

            {/* Bottom: browser breakdown + recent scans */}
            <div style={{ marginTop: "2rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "1.5rem" }}>
                {scanStats && (
                    <div className="card" style={{ padding: "1.25rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
                                <BrowserIcon size={14} />
                            </div>
                            <h4 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>Browser verdeling</h4>
                        </div>
                        <BreakdownCard title="" data={scanStats.browserBreakdown} />
                    </div>
                )}
                <RecentScansFeed recentScans={recentScans} onExportCSV={actions.handleExportCSV} />
            </div>
        </div>
    );
}
