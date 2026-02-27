"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import {
    QrCodeIcon,
    BarChartIcon,
    CheckIcon,
    PlusIcon,
} from "@/components/ui/icons";

export default function DashboardPage() {
    const { user } = useUser();
    const qrCodes = useQuery(api.qrCodes.listByUser);

    const totalScans = qrCodes?.reduce((sum, qr) => sum + qr.totalScans, 0) ?? 0;
    const activeCount = qrCodes?.filter((qr) => qr.isActive).length ?? 0;

    const STATS = [
        { label: "Totale QR codes", value: qrCodes?.length ?? 0, Icon: QrCodeIcon, color: "var(--color-accent)", bg: "var(--color-accent-bg)", border: "var(--color-accent-border)" },
        { label: "Actief", value: activeCount, Icon: CheckIcon, color: "var(--color-success)", bg: "var(--color-success-bg)", border: "var(--color-success-border)" },
        { label: "Totale scans", value: totalScans, Icon: BarChartIcon, color: "var(--color-accent)", bg: "var(--color-accent-bg)", border: "var(--color-accent-border)" },
    ];

    return (
        <div className="dashboard-main" style={{ padding: "2rem 2.5rem" }}>
            {/* Header */}
            <div style={{ marginBottom: "2rem" }}>
                <h1 style={{ fontSize: "clamp(1.25rem, 5vw, 1.75rem)", fontWeight: 800, marginBottom: "0.25rem" }}>
                    Welkom terug{user?.firstName ? `, ${user.firstName}` : ""}!
                </h1>
                <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                    Beheer al jouw dynamische QR codes op één plek.
                </p>
            </div>

            {/* Stats row */}
            <div
                className="dashboard-stats-grid"
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "1rem",
                    marginBottom: "2.5rem",
                }}
            >
                {STATS.map(({ label, value, Icon, color, bg, border }) => (
                    <div
                        key={label}
                        className="card"
                        style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                    >
                        <div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                                {label}
                            </div>
                            <div style={{ fontSize: "2rem", fontWeight: 800, color }}>
                                {value}
                            </div>
                        </div>
                        <div
                            style={{
                                width: "44px",
                                height: "44px",
                                borderRadius: "var(--radius-md)",
                                background: bg,
                                border: `1px solid ${border}`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color,
                                flexShrink: 0,
                            }}
                        >
                            <Icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* QR codes grid header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "0.75rem" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Jouw QR codes</h2>
                <Link href="/dashboard/create" className="btn btn-primary btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <PlusIcon size={15} />
                    Nieuwe QR code
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
                    <div
                        style={{
                            width: "56px",
                            height: "56px",
                            borderRadius: "var(--radius-lg)",
                            background: "var(--color-accent-bg)",
                            border: "1px solid var(--color-accent-border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 1.25rem",
                            color: "var(--color-accent)",
                        }}
                    >
                        <QrCodeIcon size={26} />
                    </div>
                    <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Nog geen QR codes</h3>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                        Maak je eerste dynamische QR code aan in minder dan een minuut.
                    </p>
                    <Link href="/dashboard/create" className="btn btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
                        <PlusIcon size={16} />
                        Eerste QR code aanmaken
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

interface QRCodeCardProps {
    _id: string;
    slug: string;
    title: string;
    type: string;
    isActive: boolean;
    totalScans: number;
    createdAt: number;
}

function QRCodeCard({ qr }: { qr: QRCodeCardProps }) {
    return (
        <Link
            href={`/dashboard/qr/${qr._id}`}
            className="card glass-hover"
            style={{ padding: "1.25rem", textDecoration: "none", display: "block", cursor: "pointer" }}
        >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                <div
                    style={{
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        color: "var(--color-accent)",
                        background: "var(--color-accent-bg)",
                        padding: "0.25rem 0.625rem",
                        borderRadius: "100px",
                        border: "1px solid var(--color-accent-border)",
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
                        background: qr.isActive ? "var(--color-success-bg)" : "var(--color-muted-bg)",
                        color: qr.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                        border: `1px solid ${qr.isActive ? "var(--color-success-border)" : "var(--color-muted-border)"}`,
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
                    <BarChartIcon size={14} />
                    <span>{qr.totalScans} scans</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-faint)" }}>
                    {new Date(qr.createdAt).toLocaleDateString("nl-NL")}
                </div>
            </div>
        </Link>
    );
}
