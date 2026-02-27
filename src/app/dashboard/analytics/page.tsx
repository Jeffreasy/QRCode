"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import ScanChart from "@/components/analytics/ScanChart";
import { BarChartIcon, SmartphoneIcon, GlobeIcon, QrCodeIcon } from "@/components/ui/icons";

// Browser icon
function BrowserIcon({ size = 16 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

const DAY_OPTIONS = [7, 14, 30, 90] as const;

export default function GlobalAnalyticsPage() {
    const [days, setDays] = useState<typeof DAY_OPTIONS[number]>(30);
    const stats = useQuery(api.analytics.getGlobalScanStats, { days });
    const qrCodes = useQuery(api.qrCodes.listByUser, {});

    return (
        <div className="dashboard-main" style={{ padding: "2rem 2.5rem" }}>
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

                {/* Period picker */}
                <div style={{ display: "flex", gap: "0.375rem" }}>
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
                </div>
            </div>

            {/* Top stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
                {[
                    { label: "Totale scans", value: stats?.total ?? "—", Icon: BarChartIcon },
                    { label: "QR codes", value: qrCodes?.length ?? "—", Icon: QrCodeIcon },
                    { label: "Unieke apparaten", value: stats ? Object.keys(stats.deviceBreakdown).length : "—", Icon: SmartphoneIcon },
                    { label: "Landen bereikt", value: stats ? Object.keys(stats.countryBreakdown).filter(c => c !== "Unknown").length : "—", Icon: GlobeIcon },
                ].map(({ label, value, Icon }) => (
                    <div key={label} className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>{label}</div>
                            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--color-accent)" }}>{value}</div>
                        </div>
                        <div style={{ width: "40px", height: "40px", borderRadius: "var(--radius-md)", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
                            <Icon size={18} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Scans over time chart */}
            {stats ? (
                <div className="card" style={{ padding: "1.5rem", marginBottom: "2rem" }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1rem" }}>
                        Scans over de laatste {days} dagen
                    </h3>
                    <ScanChart data={stats.scansByDay} />
                </div>
            ) : (
                <div className="skeleton" style={{ height: "200px", borderRadius: "var(--radius-lg)", marginBottom: "2rem" }} />
            )}

            {/* Breakdown cards */}
            {stats ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: "1.5rem" }}>
                    <BreakdownCard icon={<SmartphoneIcon size={14} />} title="Apparaat verdeling" data={stats.deviceBreakdown} />
                    <BreakdownCard icon={<GlobeIcon size={14} />} title="Land verdeling" data={stats.countryBreakdown} />
                    <BreakdownCard icon={<BrowserIcon size={14} />} title="Browser verdeling" data={stats.browserBreakdown} />
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "200px", borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
            )}

            {/* Per-QR code scan leaderboard */}
            {qrCodes && qrCodes.length > 0 && (
                <div className="card" style={{ padding: "1.5rem", marginTop: "2rem" }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "1rem" }}>Top QR codes (op scans)</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                        {[...qrCodes]
                            .sort((a, b) => b.totalScans - a.totalScans)
                            .slice(0, 10)
                            .map((qr, i) => {
                                const maxScans = qrCodes[0] ? Math.max(...qrCodes.map(q => q.totalScans)) : 1;
                                const pct = maxScans > 0 ? Math.round((qr.totalScans / maxScans) * 100) : 0;
                                return (
                                    <div key={qr._id as string} style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-text-faint)", minWidth: "1.25rem" }}>
                                            {i + 1}
                                        </span>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                                                <span style={{ fontSize: "0.8125rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{qr.title}</span>
                                                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-accent)", flexShrink: 0, marginLeft: "0.5rem" }}>{qr.totalScans}</span>
                                            </div>
                                            <div style={{ height: "4px", background: "var(--color-surface-2)", borderRadius: "100px", overflow: "hidden" }}>
                                                <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-brand)", borderRadius: "100px", transition: "width 0.5s ease" }} />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </div>
            )}
        </div>
    );
}

function BreakdownCard({ icon, title, data }: { icon?: React.ReactNode; title: string; data: Record<string, number> }) {
    const total = Object.values(data).reduce((s, n) => s + n, 0);
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 5);

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                {icon && (
                    <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
                        {icon}
                    </div>
                )}
                <h4 style={{ fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>{title}</h4>
            </div>
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
                                    <div style={{ height: "100%", width: `${pct}%`, background: "var(--gradient-brand)", borderRadius: "100px", transition: "width 0.5s ease" }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
