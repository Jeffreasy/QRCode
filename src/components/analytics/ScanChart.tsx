"use client";

interface ScanChartProps {
    data: { date: string; count: number }[];
}

export default function ScanChart({ data }: ScanChartProps) {
    const maxCount = Math.max(...data.map((d) => d.count), 1);

    return (
        <div className="card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "1.25rem", fontSize: "0.9rem" }}>
                📈 Scans — laatste 30 dagen
            </h3>

            {/* Chart */}
            <div
                style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "3px",
                    height: "100px",
                    padding: "0 0.25rem",
                }}
            >
                {data.map((d, i) => {
                    const height = Math.max((d.count / maxCount) * 100, d.count > 0 ? 4 : 1);
                    const isToday = i === data.length - 1;
                    return (
                        <div
                            key={d.date}
                            title={`${d.date}: ${d.count} scan${d.count !== 1 ? "s" : ""}`}
                            style={{
                                flex: 1,
                                height: `${height}%`,
                                minHeight: "2px",
                                borderRadius: "3px 3px 0 0",
                                background: isToday
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
                    fontSize: "0.7rem",
                    color: "var(--color-text-faint)",
                }}
            >
                {[data[0], data[Math.floor(data.length / 2)], data[data.length - 1]].map((d) =>
                    d ? (
                        <span key={d.date}>
                            {new Date(d.date).toLocaleDateString("nl-NL", { day: "numeric", month: "short" })}
                        </span>
                    ) : null
                )}
            </div>

            {/* Summary */}
            <div
                style={{
                    marginTop: "1rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid var(--color-border)",
                    display: "flex",
                    gap: "2rem",
                }}
            >
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Totaal (30d)</div>
                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                        {data.reduce((s, d) => s + d.count, 0)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Gem. per dag</div>
                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                        {(data.reduce((s, d) => s + d.count, 0) / 30).toFixed(1)}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Piekdag</div>
                    <div style={{ fontWeight: 700, fontSize: "1.25rem" }}>
                        {Math.max(...data.map((d) => d.count))}
                    </div>
                </div>
            </div>
        </div>
    );
}
