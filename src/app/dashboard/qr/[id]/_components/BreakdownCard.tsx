"use client";

import { useState } from "react";

const BREAKDOWN_COLORS: Record<string, string> = {
    device: "56, 189, 248",
    country: "52, 211, 153",
    browser: "251, 191, 36",
    city: "244, 114, 182",
    region: "139, 92, 246",
    os: "99, 102, 241",
    referrer: "251, 146, 60",
    abVariant: "34, 211, 238",
};

export function BreakdownCard({ icon, title, data, colorKey }: {
    icon?: React.ReactNode;
    title: string;
    data: Record<string, number>;
    colorKey?: string;
}) {
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
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                                    <span style={{ color: "var(--color-text-muted)", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: "0.5rem" }}>
                                        {key}
                                    </span>
                                    <span style={{ fontWeight: 600, flexShrink: 0 }}>
                                        {count} <span style={{ color: "var(--color-text-faint)", fontWeight: 400 }}>({pct}%)</span>
                                    </span>
                                </div>
                                <div style={{ height: "4px", background: "var(--color-surface-2)", borderRadius: "100px", overflow: "hidden" }}>
                                    <div style={{
                                        height: "100%", width: `${pct}%`,
                                        background: `linear-gradient(135deg, rgba(${rgb}, 0.8), rgba(${rgb}, 1))`,
                                        borderRadius: "100px", transition: "width 0.5s ease",
                                    }} />
                                </div>
                            </div>
                        );
                    })}
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
