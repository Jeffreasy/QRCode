"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { QR_TYPE_META } from "@/lib/qr-types";
import QRPreview from "@/components/qr/QRPreview";
import QRDownload from "@/components/qr/QRDownload";
import ScanChart from "@/components/analytics/ScanChart";
import Link from "next/link";

export default function QRDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useUser();
    const [editingDest, setEditingDest] = useState(false);
    const [newDest, setNewDest] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const qrId = params.id as Id<"qr_codes">;

    const qrCode = useQuery(
        api.qrCodes.getById,
        user ? { id: qrId, userId: user.id } : "skip"
    );

    const scanStats = useQuery(
        api.analytics.getScanStats,
        user ? { qrCodeId: qrId, userId: user.id } : "skip"
    );

    const scansByDay = useQuery(
        api.analytics.getScansByDay,
        user ? { qrCodeId: qrId, userId: user.id, days: 30 } : "skip"
    );

    const updateDest = useMutation(api.qrCodes.updateDestination);
    const toggleActive = useMutation(api.qrCodes.toggleActive);
    const deleteQR = useMutation(api.qrCodes.deleteQRCode);

    if (qrCode === undefined) {
        return (
            <div style={{ padding: "2rem 2.5rem" }}>
                <div className="skeleton" style={{ height: "40px", width: "300px", marginBottom: "2rem" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
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

    const typeMeta = QR_TYPE_META[qrCode.type as keyof typeof QR_TYPE_META];
    const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
        (typeof window !== "undefined" ? window.location.origin : "");
    const redirectUrl = `${siteUrl}/r/${qrCode.slug}`;

    async function handleSaveDest() {
        if (!user || !newDest.trim()) return;
        setIsSaving(true);
        try {
            await updateDest({ id: qrId, userId: user.id, destination: newDest.trim() });
            setEditingDest(false);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggle() {
        if (!user) return;
        await toggleActive({ id: qrId, userId: user.id });
    }

    async function handleDelete() {
        if (!user || !confirm(`Weet je zeker dat je '${qrCode!.title}' wil verwijderen?`)) return;
        await deleteQR({ id: qrId, userId: user.id });
        router.push("/dashboard");
    }

    return (
        <div style={{ padding: "2rem 2.5rem" }}>
            {/* Breadcrumb */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                <Link href="/dashboard" style={{ color: "inherit", textDecoration: "none" }}>Dashboard</Link>
                <span>/</span>
                <span style={{ color: "var(--color-text)" }}>{qrCode.title}</span>
            </div>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem" }}>
                        <span style={{ fontSize: "1.5rem" }}>{typeMeta?.icon}</span>
                        <h1 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{qrCode.title}</h1>
                        <span
                            style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.25rem",
                                padding: "0.25rem 0.625rem",
                                borderRadius: "100px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                background: qrCode.isActive ? "rgba(52,211,153,0.1)" : "rgba(148,163,184,0.1)",
                                color: qrCode.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                                border: `1px solid ${qrCode.isActive ? "rgba(52,211,153,0.2)" : "rgba(148,163,184,0.1)"}`,
                            }}
                        >
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                            {qrCode.isActive ? "Actief" : "Inactief"}
                        </span>
                    </div>
                    <p style={{ color: "var(--color-text-faint)", fontFamily: "monospace", fontSize: "0.875rem" }}>
                        /r/{qrCode.slug}
                    </p>
                </div>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button className="btn btn-secondary btn-sm" onClick={handleToggle}>
                        {qrCode.isActive ? "⊘ Deactiveren" : "✓ Activeren"}
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                        🗑 Verwijderen
                    </button>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Stats */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                        {[
                            { label: "Totale scans", value: qrCode.totalScans, icon: "📊" },
                            { label: "Unieke apparaten", value: scanStats ? Object.keys(scanStats.deviceBreakdown).length : "-", icon: "📱" },
                            { label: "Landen bereikt", value: scanStats ? Object.keys(scanStats.countryBreakdown).filter(c => c !== "Unknown").length : "-", icon: "🌍" },
                        ].map((stat) => (
                            <div key={stat.label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
                                <div style={{ fontSize: "1.5rem", marginBottom: "0.25rem" }}>{stat.icon}</div>
                                <div style={{ fontSize: "1.75rem", fontWeight: 800, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Scan chart */}
                    {scansByDay && <ScanChart data={scansByDay} />}

                    {/* Device / Country breakdown */}
                    {scanStats && (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                            <BreakdownCard title="Apparaten" data={scanStats.deviceBreakdown} />
                            <BreakdownCard title="Top landen" data={scanStats.countryBreakdown} />
                        </div>
                    )}

                    {/* Destination editor */}
                    <div className="card" style={{ padding: "1.5rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                            <h3 style={{ fontWeight: 700 }}>🔗 Bestemming</h3>
                            {!editingDest && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => { setNewDest(qrCode.destination); setEditingDest(true); }}
                                >
                                    Wijzigen
                                </button>
                            )}
                        </div>

                        {editingDest ? (
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                                <input
                                    className="input"
                                    value={newDest}
                                    onChange={(e) => setNewDest(e.target.value)}
                                    placeholder="Nieuwe bestemming..."
                                    autoFocus
                                />
                                <div style={{ display: "flex", gap: "0.75rem" }}>
                                    <button className="btn btn-primary btn-sm" onClick={handleSaveDest} disabled={isSaving}>
                                        {isSaving ? "Opslaan..." : "✓ Opslaan"}
                                    </button>
                                    <button className="btn btn-ghost btn-sm" onClick={() => setEditingDest(false)}>
                                        Annuleren
                                    </button>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-accent)" }}>
                                    ⚡ De QR code zelf verandert niet — alleen de bestemming.
                                </p>
                            </div>
                        ) : (
                            <p style={{ fontFamily: "monospace", fontSize: "0.875rem", color: "var(--color-text-muted)", wordBreak: "break-all" }}>
                                {qrCode.destination}
                            </p>
                        )}
                    </div>
                </div>

                {/* Right column: QR + download */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "2rem" }}>
                    <div className="card" style={{ padding: "1.5rem", textAlign: "center" }}>
                        <QRPreview
                            value={redirectUrl}
                            fgColor={qrCode.customization?.fgColor ?? "#000000"}
                            bgColor={qrCode.customization?.bgColor ?? "#ffffff"}
                            dotStyle={qrCode.customization?.dotStyle ?? "square"}
                            errorCorrectionLevel={(qrCode.customization?.errorCorrectionLevel ?? "M") as "L" | "M" | "Q" | "H"}
                            size={220}
                            logoUrl={qrCode.customization?.logoUrl}
                        />
                        <p style={{ fontSize: "0.75rem", color: "var(--color-text-faint)", marginTop: "1rem", fontFamily: "monospace" }}>
                            {redirectUrl}
                        </p>
                    </div>

                    <QRDownload
                        value={redirectUrl}
                        fgColor={qrCode.customization?.fgColor ?? "#000000"}
                        bgColor={qrCode.customization?.bgColor ?? "#ffffff"}
                        dotStyle={qrCode.customization?.dotStyle ?? "square"}
                        errorCorrectionLevel={(qrCode.customization?.errorCorrectionLevel ?? "M") as "L" | "M" | "Q" | "H"}
                        filename={qrCode.slug}
                    />
                </div>
            </div>
        </div>
    );
}

function BreakdownCard({ title, data }: { title: string; data: Record<string, number> }) {
    const total = Object.values(data).reduce((s, n) => s + n, 0);
    const sorted = Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 5);

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.9rem" }}>{title}</h4>
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
                </div>
            )}
        </div>
    );
}
