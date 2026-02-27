"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function DashboardPage() {
    const { user } = useUser();
    const qrCodes = useQuery(
        api.qrCodes.listByUser,
        user ? { userId: user.id } : "skip"
    );

    const totalScans = qrCodes?.reduce((sum, qr) => sum + qr.totalScans, 0) ?? 0;
    const activeCount = qrCodes?.filter((qr) => qr.isActive).length ?? 0;

    return (
        <div style={{ padding: "2rem 2.5rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 800, marginBottom: "0.25rem" }}>
                    Welkom terug{user?.firstName ? `, ${user.firstName}` : ""}! 👋
                </h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem" }}>
                    Beheer al jouw dynamische QR codes op één plek.
                </p>
            </div>

            {/* Stats row */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    marginBottom: "2.5rem",
                }}
            >
                {[
                    { label: "Totale QR codes", value: qrCodes?.length ?? 0, icon: "⬡", color: "var(--color-accent)" },
                    { label: "Actief", value: activeCount, icon: "✓", color: "var(--color-success)" },
                    { label: "Totale scans", value: totalScans, icon: "📊", color: "var(--color-accent-2)" },
                ].map((stat) => (
                    <div
                        key={stat.label}
                        className="card"
                        style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                        <div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                                {stat.label}
                            </div>
                            <div style={{ fontSize: "2rem", fontWeight: 800, color: stat.color }}>
                                {stat.value}
                            </div>
                        </div>
                        <div style={{ fontSize: "2rem", opacity: 0.5 }}>{stat.icon}</div>
                    </div>
                ))}
            </div>

            {/* QR codes grid */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Jouw QR codes</h2>
                <Link href="/dashboard/create" className="btn btn-primary btn-sm">
                    + Nieuwe QR code
                </Link>
            </div>

            {/* Loading state */}
            {qrCodes === undefined && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                    }}
                >
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "180px", borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {qrCodes?.length === 0 && (
                <div
                    className="card"
                    style={{
                        padding: "4rem 2rem",
                        textAlign: "center",
                    }}
                >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⬡</div>
                    <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Nog geen QR codes</h3>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                        Maak je eerste dynamische QR code aan in minder dan een minuut.
                    </p>
                    <Link href="/dashboard/create" className="btn btn-primary">
                        + Eerste QR code aanmaken
                    </Link>
                </div>
            )}

            {/* QR codes grid */}
            {qrCodes && qrCodes.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                        gap: "1rem",
                    }}
                >
                    {qrCodes.map((qr) => (
                        <QRCodeCard key={qr._id} qr={qr} />
                    ))}
                </div>
            )}
        </div>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QRCodeCard({ qr }: { qr: any }) {
    return (
        <Link
            href={`/dashboard/qr/${qr._id}`}
            className="card glass-hover"
            style={{ padding: "1.25rem", textDecoration: "none", display: "block" }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div
                    style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-accent)",
                        background: "rgba(56,189,248,0.1)",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "100px",
                        border: "1px solid rgba(56,189,248,0.15)",
                    }}
                >
                    {qr.type.toUpperCase()}
                </div>
                <span
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "100px",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: qr.isActive ? "rgba(52,211,153,0.1)" : "rgba(148,163,184,0.1)",
                        color: qr.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                        border: `1px solid ${qr.isActive ? "rgba(52,211,153,0.2)" : "rgba(148,163,184,0.1)"}`,
                    }}
                >
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                    {qr.isActive ? "Actief" : "Inactief"}
                </span>
            </div>

            <h3 style={{ fontWeight: 700, marginBottom: "0.375rem", fontSize: "1rem" }}>
                {qr.title}
            </h3>

            <p
                style={{
                    fontSize: "0.8125rem",
                    color: "var(--color-text-faint)",
                    marginBottom: "1rem",
                    fontFamily: "monospace",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                }}
            >
                /r/{qr.slug}
            </p>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid var(--color-border)",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                    <span>📊</span>
                    <span>{qr.totalScans} scans</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-faint)" }}>
                    {new Date(qr.createdAt).toLocaleDateString("nl-NL")}
                </div>
            </div>
        </Link>
    );
}
