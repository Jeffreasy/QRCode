"use client";

export function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
    const unknownCount = data["Unknown"] ?? 0;
    const filtered = Object.entries(data).filter(([key]) => key !== "Unknown");
    const knownTotal = filtered.reduce((s, [, n]) => s + n, 0);
    const sorted = filtered.sort(([, a], [, b]) => b - a).slice(0, 5);

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.9rem" }}>{title}</h4>
            {sorted.length === 0 ? (
                <p style={{ fontSize: "0.8125rem", color: "var(--color-text-faint)" }}>Nog geen data</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                    {sorted.map(([key, count]) => {
                        const pct = knownTotal > 0 ? Math.round((count / knownTotal) * 100) : 0;
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

