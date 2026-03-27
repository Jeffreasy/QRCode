"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QR_TYPE_META } from "@/lib/qr-types";
import { getQRRedirectUrl, getQRDisplayUrl } from "@/lib/qr-url";
import QRPreview from "@/components/qr/QRPreview";
import QRDownload from "@/components/qr/QRDownload";
import ScanChart from "@/components/analytics/ScanChart";
import Link from "next/link";
import {
    BarChartIcon, SmartphoneIcon, GlobeIcon, LinkIcon,
    TrashIcon, CheckIcon, BanIcon, ZapIcon, ArrowUpRightIcon,
    ChevronRightIcon, EditIcon, XIcon, CopyIcon, BrowserIcon,
    ShareIcon, MonitorIcon, MapPinIcon, DownloadIcon, ClockIcon,
} from "@/components/ui/icons";
import { useDesignDraft } from "./_hooks/useDesignDraft";
import { useQRDetailActions } from "./_hooks/useQRDetailActions";
import { DesignEditPanel } from "./_components/DesignEditPanel";
import { BreakdownCard } from "./_components/BreakdownCard";
import { RecentScansFeed } from "./_components/RecentScansFeed";
import { ScheduleCard, PasswordCard, TagsCard, ABTestCard, GeoRulesCard } from "./_components/PremiumFeatures";

const DAY_OPTIONS = [7, 14, 30, 90] as const;

export default function QRDetailPage() {
    const params = useParams();
    const qrId = params.id as Id<"qr_codes">;
    const [days, setDays] = useState<typeof DAY_OPTIONS[number]>(30);

    // ── Queries ──────────────────────────────────────────────────────────────
    const qrCode = useQuery(api.qrCodes.getById, { id: qrId });
    const scanStats = useQuery(api.analytics.getScanStats, { qrCodeId: qrId, days });
    const scansByDay = useQuery(api.analytics.getScansByDay, { qrCodeId: qrId, days });
    const scansByHour = useQuery(api.analytics.getScansByHour, { qrCodeId: qrId, days });
    const recentScans = useQuery(api.analytics.getRecentScans, { qrCodeId: qrId, limit: 10 });

    // ── Hooks ─────────────────────────────────────────────────────────────────
    const design = useDesignDraft(qrId);
    const actions = useQRDetailActions(qrId, recentScans, qrCode ?? null);

    // Convert hourly data for ScanChart
    const hourData = scansByHour?.map((h) => ({
        hour: String(h.hour),
        count: h.count,
    }));

    // Trend calculation (#7)
    const trend = useMemo(() => {
        if (!scanStats || scanStats.previousTotal === undefined) return null;
        if (scanStats.previousTotal === 0) return scanStats.total > 0 ? 100 : 0;
        return Math.round(((scanStats.total - scanStats.previousTotal) / scanStats.previousTotal) * 100);
    }, [scanStats]);

    // "Laatst gescand" (#14)
    const lastScannedLabel = useMemo(() => {
        if (!scanStats?.lastScannedAt) return null;
        const diff = Date.now() - scanStats.lastScannedAt;
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Zojuist";
        if (mins < 60) return `${mins} min geleden`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours} uur geleden`;
        const daysAgo = Math.floor(hours / 24);
        return `${daysAgo} dag${daysAgo !== 1 ? "en" : ""} geleden`;
    }, [scanStats?.lastScannedAt]);

    // Full analytics CSV export (#12)
    function exportFullCSV() {
        if (!scanStats) return;
        const header = "Metric,Categorie,Waarde";
        const rows: string[] = [];
        const addBreakdown = (metric: string, data: Record<string, number>) => {
            Object.entries(data).forEach(([key, val]) => {
                rows.push([metric, key, String(val)].map(v => `"${v}"`).join(","));
            });
        };
        addBreakdown("Apparaat", scanStats.deviceBreakdown);
        addBreakdown("Browser", scanStats.browserBreakdown);
        addBreakdown("Land", scanStats.countryBreakdown);
        addBreakdown("Stad", scanStats.cityBreakdown);
        addBreakdown("Regio", scanStats.regionBreakdown);
        addBreakdown("OS", scanStats.osBreakdown);
        addBreakdown("Referrer", scanStats.referrerBreakdown);
        if (Object.keys(scanStats.abVariantBreakdown).length > 0) {
            addBreakdown("A/B Variant", scanStats.abVariantBreakdown);
        }
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics_${qrCode?.slug ?? "qr"}_${days}d.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

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
    const redirectUrl = getQRRedirectUrl(qrCode.slug);
    const displayUrl = getQRDisplayUrl(qrCode.slug);

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
        { label: "Scans", value: scanStats?.total ?? "—", Icon: BarChartIcon, showTrend: true },
        { label: "Apparaten", value: scanStats ? Object.keys(scanStats.deviceBreakdown).filter(c => c !== "Unknown").length : "—", Icon: SmartphoneIcon, showTrend: false },
        { label: "Landen", value: scanStats ? Object.keys(scanStats.countryBreakdown).filter(c => c !== "Unknown").length : "—", Icon: GlobeIcon, showTrend: false },
        { label: "Steden", value: scanStats ? Object.keys(scanStats.cityBreakdown).filter(c => c !== "Unknown").length : "—", Icon: MapPinIcon, showTrend: false },
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
            <div className="qr-detail-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
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
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                        <p style={{ color: "var(--color-text-faint)", fontFamily: "monospace", fontSize: "0.875rem" }}>{displayUrl}</p>
                        {/* Laatst gescand (#14) */}
                        {lastScannedLabel && (
                            <span style={{
                                fontSize: "0.6875rem", color: "var(--color-text-faint)", display: "flex", alignItems: "center", gap: "0.25rem",
                                padding: "0.125rem 0.5rem", borderRadius: "100px", background: "var(--color-bg-2)",
                            }}>
                                <ClockIcon size={11} /> Laatste scan: {lastScannedLabel}
                            </span>
                        )}
                    </div>
                </div>

                {/* Action buttons */}
                <div className="qr-detail-actions" style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                    <button className="btn btn-secondary btn-sm" onClick={actions.handleDuplicate} disabled={actions.isDuplicating}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }} title="Dupliceer deze QR code">
                        <CopyIcon size={14} />
                        {actions.isDuplicating ? "..." : "Dupliceren"}
                    </button>
                    <button className="btn btn-secondary btn-sm"
                        onClick={() => {
                            if (navigator.share) {
                                navigator.share({ title: qrCode.title, text: `Scan de QR code: ${qrCode.title}`, url: redirectUrl }).catch(() => {});
                            } else {
                                actions.handleCopyUrl(redirectUrl);
                            }
                        }}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }} title="Deel deze QR code">
                        <ShareIcon size={14} />
                        Delen
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
                {/* ═══════════════════ LEFT COLUMN ═══════════════════ */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

                    {/* ─── SECTION 1: ANALYTICS ─── */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                            <BarChartIcon size={16} style={{ color: "var(--color-accent)" }} />
                            Analytics
                        </h2>
                        <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
                            {DAY_OPTIONS.map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDays(d)}
                                    className={`btn btn-sm ${days === d ? "btn-primary" : "btn-secondary"}`}
                                    style={{ minWidth: "40px" }}
                                >
                                    {d}d
                                </button>
                            ))}
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={exportFullCSV}
                                disabled={!scanStats || scanStats.total === 0}
                                style={{
                                    display: "flex", alignItems: "center", gap: "0.375rem",
                                    opacity: !scanStats || scanStats.total === 0 ? 0.4 : 1,
                                    marginLeft: "0.25rem",
                                }}
                                title={scanStats?.total === 0 ? "Geen data" : "Exporteer als CSV"}
                            >
                                <DownloadIcon size={14} />
                                CSV
                            </button>
                        </div>
                    </div>

                    {/* KPI Stats with trend */}
                    <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
                        {DETAIL_STATS.map(({ label, value, Icon, showTrend }) => (
                            <div key={label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
                                <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 0.75rem", color: "var(--color-accent)" }}>
                                    <Icon size={18} />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.375rem" }}>
                                    <div style={{ fontSize: "1.75rem", fontWeight: 800, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{value}</div>
                                    {showTrend && trend !== null && trend !== 0 && (
                                        <span style={{
                                            fontSize: "0.625rem", fontWeight: 600, padding: "0.125rem 0.375rem", borderRadius: "100px",
                                            background: trend > 0 ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                                            color: trend > 0 ? "#34d399" : "#ef4444",
                                            border: `1px solid ${trend > 0 ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                                        }}>
                                            {trend > 0 ? "↑" : "↓"}{Math.abs(trend)}%
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Scan chart with hour toggle (#2) */}
                    {scansByDay && <ScanChart data={scansByDay} hourData={hourData} />}

                    {/* All 7 breakdowns (#3) — Row 1: Device + Country + Browser */}
                    {scanStats && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "1rem" }}>
                            <BreakdownCard icon={<SmartphoneIcon size={14} />} title="Apparaat" data={scanStats.deviceBreakdown} colorKey="device" />
                            <BreakdownCard icon={<GlobeIcon size={14} />} title="Land" data={scanStats.countryBreakdown} colorKey="country" />
                            <BreakdownCard icon={<BrowserIcon size={14} />} title="Browser" data={scanStats.browserBreakdown} colorKey="browser" />
                        </div>
                    )}

                    {/* Row 2: City + Region + OS + Referrer */}
                    {scanStats && (
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: "1rem" }}>
                            <BreakdownCard icon={<MapPinIcon size={14} />} title="Stad" data={scanStats.cityBreakdown} colorKey="city" />
                            <BreakdownCard icon={<ZapIcon size={14} />} title="Regio" data={scanStats.regionBreakdown} colorKey="region" />
                            <BreakdownCard icon={<MonitorIcon size={14} />} title="OS" data={scanStats.osBreakdown} colorKey="os" />
                            <BreakdownCard icon={<ShareIcon size={14} />} title="Referrer" data={scanStats.referrerBreakdown} colorKey="referrer" />
                        </div>
                    )}

                    {/* A/B Variant breakdown if applicable */}
                    {scanStats && Object.keys(scanStats.abVariantBreakdown).length > 0 && (
                        <BreakdownCard icon={<ZapIcon size={14} />} title="A/B Variant" data={scanStats.abVariantBreakdown} colorKey="abVariant" />
                    )}

                    {/* Recent scans feed */}
                    <RecentScansFeed recentScans={recentScans} onExportCSV={actions.handleExportCSV} />

                    {/* ─── SECTION 2: MANAGEMENT ─── */}
                    <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1.5rem", marginTop: "0.5rem" }}>
                        <h2 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                            <LinkIcon size={16} style={{ color: "var(--color-accent)" }} />
                            Beheer
                        </h2>

                        {/* Destination editor */}
                        <div className="card" style={{ padding: "1.5rem", marginBottom: "1rem" }}>
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

                        {/* Premium features */}
                        <div className="qr-detail-premium-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                            <ScheduleCard qr={qrCode} />
                            <PasswordCard qr={qrCode} />
                        </div>
                        <TagsCard qr={qrCode} />
                        <div style={{ marginTop: "1rem" }}><ABTestCard qr={qrCode} /></div>
                        <div style={{ marginTop: "1rem" }}><GeoRulesCard qr={qrCode} /></div>
                    </div>
                </div>

                {/* ═══════════════════ RIGHT COLUMN (sidebar) ═══════════════════ */}
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
        </div>
    );
}
