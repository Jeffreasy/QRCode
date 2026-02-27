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
import {
    BarChartIcon,
    SmartphoneIcon,
    GlobeIcon,
    LinkIcon,
    TrashIcon,
    CheckIcon,
    BanIcon,
    ZapIcon,
    ArrowUpRightIcon,
    ChevronRightIcon,
    EditIcon,
    XIcon,
} from "@/components/ui/icons";

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
                <div className="dashboard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem" }}>
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

    // Always resolve to an absolute URL so QR codes work when scanned.
    // Priority: window.location.origin (always correct on client) → NEXT_PUBLIC_SITE_URL fallback
    // NOTE: This is a "use client" component so window is always available.
    const clientOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const envSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
    const siteUrl = clientOrigin || envSiteUrl || "https://www.jeffdash.com";

    const redirectUrl = `${siteUrl}/r/${qrCode.slug}`;

    async function handleSaveDest() {
        if (!newDest.trim()) return;
        setIsSaving(true);
        try {
            await updateDest({ id: qrId, destination: newDest.trim() });
            setEditingDest(false);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggle() {
        await toggleActive({ id: qrId });
    }

    async function handleDelete() {
        if (!confirm(`Weet je zeker dat je '${qrCode!.title}' wil verwijderen?`)) return;
        await deleteQR({ id: qrId });
        router.push("/dashboard");
    }

    const DETAIL_STATS = [
        { label: "Totale scans", value: qrCode.totalScans, Icon: BarChartIcon },
        { label: "Unieke apparaten", value: scanStats ? Object.keys(scanStats.deviceBreakdown).length : "-", Icon: SmartphoneIcon },
        { label: "Landen bereikt", value: scanStats ? Object.keys(scanStats.countryBreakdown).filter(c => c !== "Unknown").length : "-", Icon: GlobeIcon },
    ];

    return (
        <div className="dashboard-main" style={{ padding: "2rem 2.5rem" }}>
            {/* Breadcrumb */}
            <nav
                aria-label="Broodkruimelpad"
                style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "1.5rem", fontSize: "0.875rem", color: "var(--color-text-muted)" }}
            >
                <Link
                    href="/dashboard"
                    style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s ease" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--color-text)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-text-muted)")}
                >
                    Dashboard
                </Link>
                <ChevronRightIcon size={14} />
                <span style={{ color: "var(--color-text)" }}>{qrCode.title}</span>
            </nav>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.375rem", flexWrap: "wrap" }}>
                        {typeMeta?.icon && (
                            <span style={{ fontSize: "1.5rem" }}>{typeMeta.icon}</span>
                        )}
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
                                background: qrCode.isActive ? "var(--color-success-bg)" : "var(--color-muted-bg)",
                                color: qrCode.isActive ? "var(--color-success)" : "var(--color-text-muted)",
                                border: `1px solid ${qrCode.isActive ? "var(--color-success-border)" : "var(--color-muted-border)"}`,
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
                    <button
                        className="btn btn-secondary btn-sm"
                        onClick={handleToggle}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                    >
                        {qrCode.isActive ? <BanIcon size={14} /> : <CheckIcon size={14} />}
                        {qrCode.isActive ? "Deactiveren" : "Activeren"}
                    </button>
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleDelete}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                    >
                        <TrashIcon size={14} />
                        Verwijderen
                    </button>
                </div>
            </div>

            <div className="dashboard-grid-2col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start" }}>
                {/* Left column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                    {/* Stats */}
                    <div className="dashboard-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                        {DETAIL_STATS.map(({ label, value, Icon }) => (
                            <div key={label} className="card" style={{ padding: "1.25rem", textAlign: "center" }}>
                                <div
                                    style={{
                                        width: "40px",
                                        height: "40px",
                                        borderRadius: "var(--radius-md)",
                                        background: "var(--color-accent-bg)",
                                        border: "1px solid var(--color-accent-border)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        margin: "0 auto 0.75rem",
                                        color: "var(--color-accent)",
                                    }}
                                >
                                    <Icon size={18} />
                                </div>
                                <div style={{ fontSize: "1.75rem", fontWeight: 800, background: "var(--gradient-brand)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                                    {value}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>{label}</div>
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
                            <h3 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <LinkIcon size={16} style={{ color: "var(--color-text-muted)" }} />
                                Bestemming
                            </h3>
                            {!editingDest && (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => { setNewDest(qrCode.destination); setEditingDest(true); }}
                                    style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                                >
                                    <EditIcon size={13} />
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
                                    <button
                                        className="btn btn-primary btn-sm"
                                        onClick={handleSaveDest}
                                        disabled={isSaving}
                                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                                    >
                                        <CheckIcon size={14} />
                                        {isSaving ? "Opslaan..." : "Opslaan"}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => setEditingDest(false)}
                                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                                    >
                                        <XIcon size={14} />
                                        Annuleren
                                    </button>
                                </div>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-accent)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                    <ZapIcon size={12} />
                                    De QR code zelf verandert niet — alleen de bestemming.
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
                        {/* Redirect destination info */}
                        <div style={{ marginTop: "1rem", padding: "0.625rem 0.875rem", background: "var(--color-success-bg)", border: "1px solid var(--color-success-border)", borderRadius: "var(--radius-md)" }}>
                            <div style={{ fontSize: "0.7rem", color: "var(--color-success)", fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                                <ArrowUpRightIcon size={11} />
                                Scannen stuurt door naar:
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text)", fontFamily: "monospace", wordBreak: "break-all" }}>
                                {qrCode.destination}
                            </div>
                        </div>
                        <p style={{ marginTop: "0.5rem", fontSize: "0.65rem", color: "var(--color-text-faint)", fontFamily: "monospace" }}>
                            via {redirectUrl}
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
