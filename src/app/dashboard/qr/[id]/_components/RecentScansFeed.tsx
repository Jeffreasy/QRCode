"use client";

import { SmartphoneIcon, ZapIcon, DownloadIcon } from "@/components/ui/icons";

type Scan = {
    _id: unknown;
    scannedAt: number;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
};

export function RecentScansFeed({
    recentScans,
    onExportCSV,
}: {
    recentScans: Scan[] | undefined;
    onExportCSV: () => void;
}) {
    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "6px", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent)" }}>
                        <ZapIcon size={14} />
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>Recente scans</h4>
                </div>
                {recentScans && recentScans.length > 0 && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={onExportCSV}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem" }}
                        title="Exporteer scan data als CSV"
                    >
                        <DownloadIcon size={13} />
                        CSV
                    </button>
                )}
            </div>

            {!recentScans ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: "48px", borderRadius: "var(--radius-sm)" }} />)}
                </div>
            ) : recentScans.length === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-faint)", textAlign: "center", padding: "1rem 0" }}>
                    Nog geen scans geregistreerd.
                </p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {recentScans.map((scan) => (
                        <div
                            key={scan._id as string}
                            style={{
                                display: "flex", alignItems: "center", gap: "0.75rem",
                                padding: "0.625rem 0.75rem",
                                background: "var(--color-surface-2)",
                                borderRadius: "var(--radius-sm)",
                                fontSize: "0.8125rem",
                            }}
                        >
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <SmartphoneIcon size={13} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 500, color: "var(--color-text)" }}>
                                    {scan.country ?? "Onbekend land"}{scan.city ? ` · ${scan.city}` : ""}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "var(--color-text-faint)" }}>
                                    {scan.device ?? "?"} · {scan.browser ?? "?"} · {scan.os ?? "?"}
                                </div>
                            </div>
                            <div style={{ fontSize: "0.72rem", color: "var(--color-text-faint)", flexShrink: 0, whiteSpace: "nowrap" }}>
                                {new Date(scan.scannedAt).toLocaleTimeString("nl-NL", { hour: "2-digit", minute: "2-digit" })}
                                <br />
                                <span style={{ fontSize: "0.65rem" }}>{new Date(scan.scannedAt).toLocaleDateString("nl-NL")}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
