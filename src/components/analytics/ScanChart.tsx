"use client";

import { useState } from "react";

interface ScanChartProps {
    data: { date: string; count: number }[];
    hourData?: { hour: string; count: number }[];
}

function formatHour(hour: number): string {
    if (hour === 0) return "12a";
    if (hour < 12) return `${hour}a`;
    if (hour === 12) return "12p";
    return `${hour - 12}p`;
}

export default function ScanChart({ data, hourData }: ScanChartProps) {
    const [view, setView] = useState<"day" | "hour">("day");

    const activeData = view === "day" ? data : (hourData ?? []);
    const maxCount = Math.max(...activeData.map((d) => d.count), 1);

    const total = data.reduce((s, d) => s + d.count, 0);
    const avg = total / Math.max(data.length, 1);
    const peak = Math.max(...data.map((d) => d.count));

    // For hour view, find the peak hour label
    const peakHourEntry = hourData
        ? hourData.reduce((a, b) => (a.count >= b.count ? a : b), { hour: "0", count: 0 })
        : null;

    return (
        <div className="card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", gap: "0.5rem", flexWrap: "wrap" }}>
                <h3 style={{ fontWeight: 700, fontSize: "0.9rem", margin: 0 }}>
                    Scan activiteit
                </h3>
                {hourData && (
                    <div style={{ display: "flex", gap: "0.25rem" }}>
                        {(["day", "hour"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => setView(v)}
                                className={`btn btn-sm ${view === v ? "btn-primary" : "btn-ghost"}`}
                                style={{ fontSize: "0.75rem", padding: "0.25rem 0.625rem", minHeight: "unset" }}
                            >
                                {v === "day" ? "Per dag" : "Per uur"}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Chart bars */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: view === "hour" ? "2px" : "3px",
                    height: "100px",
                    padding: "0 0.25rem",
                }}
            >
                {activeData.map((d, i) => {
                    const isDay = view === "day";
                    const isHighlight = isDay ? i === activeData.length - 1 : d.count === maxCount;
                    const height = Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 1);
                    const label = isDay
                        ? `${(d as { date: string }).date}: ${d.count} scan${d.count !== 1 ? "s" : ""}`
                        : `${formatHour(Number((d as { hour: string }).hour))} — ${d.count} scan${d.count !== 1 ? "s" : ""}`;
                    return (
                        <div
                            key={isDay ? (d as { date: string }).date : (d as { hour: string }).hour}
                            title={label}
                            style={{
                                flex: 1,
                                height: `${height}%`,
                                minHeight: "2px",
                                borderRadius: "3px 3px 0 0",
                                background: isHighlight
                                    ? "var(--gradient-brand)"
                                    : d.count > 0
                                        ? "rgba(56,189,248,0.5)"
                                        : "var(--color-surface-2)",
                                transition: "height 0.4s ease",
                                cursor: "default",
                            }}
                        />
                    );
                })}
            </div>

            {/* X-axis labels */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "0.5rem",
                    fontSize: "0.68rem",
                    color: "var(--color-text-faint)",
                }}
            >
                {view === "day" ? (
                    [data[0], data[Math.floor(data.length / 2)], data[data.length - 1]].map((d) =>
                        d ? (
                            <span key={d.date}>
                                {new Date(d.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                            </span>
                        ) : null
                    )
                ) : (
                    [0, 6, 12, 18, 23].map((h) => (
                        <span key={h}>{formatHour(h)}</span>
                    ))
                )}
            </div>

            {/* Summary stats */}
            <div
                style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    gap: "1.5rem",
                    flexWrap: "wrap",
                }}
            >
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Totaal (periode)</div>
                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>{total}</div>
                </div>
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Gem. per dag</div>
                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>{avg.toFixed(1)}</div>
                </div>
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Piekdag</div>
                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>{peak}</div>
                </div>
                {peakHourEntry && peakHourEntry.count > 0 && (
                    <div>
                        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Piekuur</div>
                        <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                            {formatHour(Number(peakHourEntry.hour))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
