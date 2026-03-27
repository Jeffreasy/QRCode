"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import ScanChart from "@/components/analytics/ScanChart";
import Link from "next/link";
import {
    BarChartIcon,
    SmartphoneIcon,
    GlobeIcon,
    QrCodeIcon,
    MapPinIcon,
    ZapIcon,
    ShareIcon,
    MonitorIcon,
    BrowserIcon,
    DownloadIcon,
    ClockIcon,
    ChevronRightIcon,
} from "@/components/ui/icons";

const DAY_OPTIONS = [7, 14, 30, 90] as const;

// Color palette for breakdown cards
const BREAKDOWN_COLORS: Record<string, string> = {
    device: "56, 189, 248",      // sky blue
    country: "52, 211, 153",     // emerald
    browser: "251, 191, 36",     // amber
    city: "244, 114, 182",       // pink
    region: "139, 92, 246",      // violet
    os: "99, 102, 241",          // indigo
    referrer: "251, 146, 60",    // orange
    abVariant: "34, 211, 238",   // cyan
};

interface QRCode {
    _id: Id<"qr_codes">;
    title: string;
    totalScans: number;
    type: string;
    tags?: string[];
}

export default function GlobalAnalyticsPage() {
    const [days, setDays] = useState<typeof DAY_OPTIONS[number]>(30);
    const [filterType, setFilterType] = useState<string>("all");
    const [filterTag, setFilterTag] = useState<string>("all");

    const stats = useQuery(api.analytics.getGlobalScanStats, { days });
    const qrCodes = useQuery(api.qrCodes.listByUser, {}) as QRCode[] | undefined;
    const recentScans = useQuery(api.analytics.getGlobalRecentScans, { limit: 15 });

    // Convert hourly data format for ScanChart
    const hourData = stats?.scansByHour?.map((h) => ({
        hour: String(h.hour),
        count: h.count,
    }));

    // Extract unique tags for filter
    const allTags = useMemo(() => {
        if (!qrCodes) return [];
        const tagSet = new Set<string>();
        qrCodes.forEach((qr) => qr.tags?.forEach((t) => tagSet.add(t)));
        return Array.from(tagSet).sort();
    }, [qrCodes]);

    // Top QR codes — period-filtered via stats.qrBreakdown (#3)
    const topQRCodes = useMemo(() => {
        if (!stats?.qrBreakdown || !qrCodes) return [];
        const qrMap = new Map(qrCodes.map((qr) => [qr._id as string, qr]));

        return Object.entries(stats.qrBreakdown)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([id, count]) => {
                const qr = qrMap.get(id);
                return qr ? { ...qr, periodScans: count } : null;
            })
            .filter(Boolean) as (QRCode & { periodScans: number })[];
    }, [stats?.qrBreakdown, qrCodes]);

    // Trend calculation (#7)
    const trend = useMemo(() => {
        if (!stats || stats.previousTotal === undefined) return null;
        if (stats.previousTotal === 0) return stats.total > 0 ? 100 : 0;
        return Math.round(((stats.total - stats.previousTotal) / stats.previousTotal) * 100);
    }, [stats]);

    // CSV export handler
    function exportCSV() {
        if (!stats) return;
        const header = "Metric,Categorie,Waarde";
        const rows: string[] = [];
        const addBreakdown = (metric: string, data: Record<string, number>) => {
            Object.entries(data).forEach(([key, val]) => {
                rows.push([metric, key, String(val)].map(v => `"${v}"`).join(","));
            });
        };
        addBreakdown("Apparaat", stats.deviceBreakdown);
        addBreakdown("Browser", stats.browserBreakdown);
        addBreakdown("Land", stats.countryBreakdown);
        addBreakdown("Stad", stats.cityBreakdown);
        addBreakdown("Regio", stats.regionBreakdown);
        addBreakdown("OS", stats.osBreakdown);
        addBreakdown("Referrer", stats.referrerBreakdown);
        if (Object.keys(stats.abVariantBreakdown).length > 0) {
            addBreakdown("A/B Variant", stats.abVariantBreakdown);
        }
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `analytics_${days}d.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return (
        <div id="main-content" className="dashboard-main" style={{ padding: "clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2.5rem)" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)", fontWeight: 800, marginBottom: "0.25rem" }}>
                        Globale Analytics
                    </h1>
                    <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                        Totaaloverzicht van alle QR code scans in jouw account.
                    </p>
                </div>

                {/* Controls row */}
                <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", alignItems: "center" }}>
                    {DAY_OPTIONS.map((d) => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`btn btn-sm ${days === d ? "btn-primary" : "btn-secondary"}`}
                            style={{ minWidth: "44px" }}
                        >
                            {d}d
                        </button>
                    ))}
                    {/* CSV button — always visible (#1) */}
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={exportCSV}
                        disabled={!stats || stats.total === 0}
                        style={{
                            display: "flex", alignItems: "center", gap: "0.375rem", marginLeft: "0.25rem",
                            opacity: !stats || stats.total === 0 ? 0.4 : 1,
                        }}
                        title={stats?.total === 0 ? "Geen data om te exporteren" : "Exporteer analytics als CSV"}
                    >
                        <DownloadIcon size={14} />
                        CSV
                    </button>
                </div>
            </div>

            {/* Tag/Type filter row (#10) */}
            {qrCodes && qrCodes.length > 0 && (
                <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
                    <select
                        className="input"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        style={{ fontSize: "0.8125rem", padding: "0.375rem 0.625rem", width: "auto" }}
                    >
                        <option value="all">Alle types</option>
                        {[...new Set(qrCodes.map((qr) => qr.type))].sort().map((t) => (
                            <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                    </select>
                    {allTags.length > 0 && (
                        <select
                            className="input"
                            value={filterTag}
                            onChange={(e) => setFilterTag(e.target.value)}
                            style={{ fontSize: "0.8125rem", padding: "0.375rem 0.625rem", width: "auto" }}
                        >
                            <option value="all">Alle tags</option>
                            {allTags.map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    )}
                </div>
            )}

            {/* Top KPI stats with trend (#7) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { label: "Totale scans", value: stats?.total ?? "—", Icon: BarChartIcon, showTrend: true },
                    { label: "QR codes", value: qrCodes?.length ?? "—", Icon: QrCodeIcon, showTrend: false },
                    { label: "Landen bereikt", value: stats ? Object.keys(stats.countryBreakdown).filter(c => c !== "Unknown").length : "—", Icon: GlobeIcon, showTrend: false },
                    { label: "Steden bereikt", value: stats ? Object.keys(stats.cityBreakdown).filter(c => c !== "Unknown").length : "—", Icon: MapPinIcon, showTrend: false },
                ].map(({ label, value, Icon, showTrend }) => (
                    <div key={label} className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>{label}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-accent)" }}>{value}</div>
                                {showTrend && trend !== null && trend !== 0 && (
                                    <span style={{
                                        fontSize: "0.6875rem",
                                        fontWeight: 600,
                                        padding: "0.125rem 0.5rem",
                                        borderRadius: "100px",
                                        background: trend > 0 ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)",
                                        color: trend > 0 ? "#34d399" : "#ef4444",
                                        border: `1px solid ${trend > 0 ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                                    }}>
                                        {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
                                    </span>
                                )}
                            </div>
                        </div>
                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
                            <Icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Scan activity chart */}
            {stats ? (
                <div style={{ marginBottom: "2rem" }}>
                    <ScanChart data={stats.scansByDay} hourData={hourData} />
                </div>
            ) : (
                <div className="skeleton" style={{ height: "220px", borderRadius: "var(--radius-lg)", marginBottom: "2rem" }} />
            )}

            {/* Row 1: Device + Country + Browser */}
            {stats ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <BreakdownCard icon={<SmartphoneIcon size={14} />} title="Apparaat" data={stats.deviceBreakdown} colorKey="device" />
                    <BreakdownCard icon={<GlobeIcon size={14} />} title="Land" data={stats.countryBreakdown} colorKey="country" />
                    <BreakdownCard icon={<BrowserIcon size={14} />} title="Browser" data={stats.browserBreakdown} colorKey="browser" />
                </div>
            ) : <SkeletonRow count={3} />}

            {/* Row 2: City + Region + OS + Referrer */}
            {stats ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
                    <BreakdownCard icon={<MapPinIcon size={14} />} title="Stad" data={stats.cityBreakdown} colorKey="city" />
                    <BreakdownCard icon={<ZapIcon size={14} />} title="Regio / Provincie" data={stats.regionBreakdown} colorKey="region" />
                    <BreakdownCard icon={<MonitorIcon size={14} />} title="Besturingssysteem" data={stats.osBreakdown} colorKey="os" />
                    <BreakdownCard icon={<ShareIcon size={14} />} title="Herkomst (Referrer)" data={stats.referrerBreakdown} colorKey="referrer" />
                </div>
            ) : <SkeletonRow count={4} />}

            {/* A/B Variant breakdown (#6) */}
            {stats && Object.keys(stats.abVariantBreakdown).length > 0 && (
                <div style={{ marginBottom: "1.5rem" }}>
                    <BreakdownCard icon={<ZapIcon size={14} />} title="A/B Variant" data={stats.abVariantBreakdown} colorKey="abVariant" />
                </div>
            )}

            {/* Recent scans feed (#2) */}
            {recentScans && recentScans.length > 0 && (
                <div className="card" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <ClockIcon size={16} style={{ color: "var(--color-accent)" }} />
                        Recente scans
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {recentScans.map((scan) => (
                            <div key={scan._id as string} style={{
                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                padding: "0.625rem 0.75rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-sm)",
                                fontSize: "0.8125rem", gap: "0.75rem",
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0, flex: 1 }}>
                                    <Link
                                        href={`/dashboard/qr/${scan.qrCodeId}`}
                                        style={{ fontWeight: 600, color: "var(--color-accent)", textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                                    >
                                        {scan.qrTitle}
                                    </Link>
                                    <span style={{ color: "var(--color-text-faint)", fontSize: "0.75rem", flexShrink: 0 }}>
                                        {[scan.device, scan.browser].filter(Boolean).join(" · ")}
                                    </span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                                    {scan.country && scan.country !== "Unknown" && (
                                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                                            {scan.city && scan.city !== "Unknown" ? `${scan.city}, ` : ""}{scan.country}
                                        </span>
                                    )}
                                    {scan.abVariant && (
                                        <span style={{
                                            fontSize: "0.625rem", padding: "0.125rem 0.375rem", borderRadius: "100px",
                                            background: "rgba(34,211,238,0.1)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)",
                                        }}>
                                            {scan.abVariant}
                                        </span>
                                    )}
                                    <span style={{ fontSize: "0.6875rem", color: "var(--color-text-faint)", fontFamily: "monospace" }}>
                                        {new Date(scan.scannedAt).toLocaleString("nl-NL", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Per-QR leaderboard — clickable with clear CTA */}
            {topQRCodes.length > 0 && (
                <div className="card" style={{ padding: "1.5rem", marginTop: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                        <h3 style={{ fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
                            <QrCodeIcon size={16} style={{ color: "var(--color-accent)" }} />
                            Jouw QR codes (laatste {days} dagen)
                        </h3>
                        <Link
                            href="/dashboard"
                            style={{ fontSize: "0.75rem", color: "var(--color-accent)", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}
                        >
                            Alle QR codes <ChevronRightIcon size={12} />
                        </Link>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {topQRCodes.map((qr, i) => {
                            const maxScans = Math.max(topQRCodes[0]?.periodScans ?? 1, 1);
                            const pct = Math.round((qr.periodScans / maxScans) * 100);
                            return (
                                <Link
                                    key={qr._id as string}
                                    href={`/dashboard/qr/${qr._id}`}
                                    style={{ textDecoration: "none", color: "inherit" }}
                                >
                                    <div style={{
                                        display: "flex", alignItems: "center", gap: "0.875rem",
                                        padding: "0.75rem 1rem", borderRadius: "var(--radius-md)",
                                        background: "var(--color-bg-2)", border: "1px solid transparent",
                                        transition: "all 0.2s ease", cursor: "pointer",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "var(--color-accent-border)";
                                        e.currentTarget.style.background = "var(--color-accent-bg)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "transparent";
                                        e.currentTarget.style.background = "var(--color-bg-2)";
                                    }}
                                    >
                                        {/* Rank badge */}
                                        <span style={{
                                            width: "24px", height: "24px", borderRadius: "6px",
                                            background: i < 3 ? "var(--color-accent-bg)" : "var(--color-surface-2)",
                                            border: i < 3 ? "1px solid var(--color-accent-border)" : "1px solid transparent",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            fontSize: "0.6875rem", fontWeight: 700,
                                            color: i < 3 ? "var(--color-accent)" : "var(--color-text-faint)",
                                            flexShrink: 0,
                                        }}>
                                            {i + 1}
                                        </span>

                                        {/* QR info */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                                                <span style={{
                                                    fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-text)",
                                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                                }}>
                                                    {qr.title}
                                                </span>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, marginLeft: "0.75rem" }}>
                                                    <span style={{
                                                        fontSize: "0.75rem", fontWeight: 700, color: "var(--color-accent)",
                                                        padding: "0.125rem 0.5rem", borderRadius: "100px",
                                                        background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)",
                                                    }}>
                                                        {qr.periodScans} scans
                                                    </span>
                                                    <ChevronRightIcon size={14} style={{ color: "var(--color-text-faint)" }} />
                                                </div>
                                            </div>
                                            <div style={{ height: "3px", background: "var(--color-surface-2)", borderRadius: "100px", overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-brand)", borderRadius: "100px", transition: "width 0.5s ease" }} />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                    {/* Explicit call-to-action */}
                    <p style={{
                        fontSize: "0.6875rem", color: "var(--color-text-faint)", marginTop: "1rem",
                        textAlign: "center", fontStyle: "italic",
                    }}>
                        Klik op een QR code voor gedetailleerde analytics
                    </p>
                </div>
            )}
        </div>
    );
}


function SkeletonRow({ count }: { count: number }) {
    return (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(min(100%, 240px), 1fr))`, gap: "1.5rem", marginBottom: "1.5rem" }}>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "var(--radius-lg)" }} />
            ))}
        </div>
    );
}

function BreakdownCard({ icon, title, data, colorKey }: { icon?: React.ReactNode; title: string; data: Record<string, number>; colorKey?: string }) {
    const [expanded, setExpanded] = useState(false);
    const unknownCount = data["Unknown"] ?? 0;
    const filtered = Object.entries(data).filter(([key]) => key !== "Unknown");
    const knownTotal = filtered.reduce((s, [, n]) => s + n, 0);
    const sorted = filtered.sort(([, a], [, b]) => b - a);
    const visible = expanded ? sorted : sorted.slice(0, 5);
    const hiddenCount = sorted.length - 5;
    const rgb = BREAKDOWN_COLORS[colorKey ?? "device"] ?? "56, 189, 248";

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                {icon && (
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "6px",
                        background: `rgba(${rgb}, 0.1)`, border: `1px solid rgba(${rgb}, 0.2)`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: `rgb(${rgb})`,
                    }}>
                        {icon}
                    </div>
                )}
                <h4 style={{ fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>{title}</h4>
            </div>
            {sorted.length === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-faint)" }}>Nog geen data</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {visible.map(([key, count]) => {
                        const pct = knownTotal > 0 ? Math.round((count / knownTotal) * 100) : 0;
                        return (
                            <div key={key}>
                                {/* Fixed label overflow (#8) */}
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                                    <span style={{ color: "var(--color-text-muted)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "0.5rem" }}>
                                        {key}
                                    </span>
                                    <span style={{ fontWeight: 600, flexShrink: 0 }}>
                                        {count} <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>({pct}%)</span>
                                    </span>
                                </div>
                                {/* Colored progress bar (#5) */}
                                <div style={{ height: "4px", background: "var(--color-surface-2)", borderRadius: "100px", overflow: "hidden" }}>
                                    <div
                                        style={{
                                            height: "100%",
                                            width: `${pct}%`,
                                            background: `linear-gradient(135deg, rgba(${rgb}, 0.8), rgba(${rgb}, 1))`,
                                            borderRadius: "100px",
                                            transition: "width 0.5s ease",
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {/* "Meer tonen" toggle (#4) */}
                    {hiddenCount > 0 && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            style={{
                                background: "none", border: "none", cursor: "pointer",
                                fontSize: "0.75rem", color: "var(--color-accent)", fontWeight: 500,
                                padding: "0.25rem 0", textAlign: "left",
                            }}
                        >
                            {expanded ? "Minder tonen" : `+ ${hiddenCount} meer tonen`}
                        </button>
                    )}
                    {unknownCount > 0 && (
                        <p style={{ fontSize: "0.6875rem", color: "var(--color-text-faint)", marginTop: "0.25rem", fontStyle: "italic" }}>
                            + {unknownCount} scan{unknownCount !== 1 ? "s" : ""} zonder {title.toLowerCase()}-data
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}
