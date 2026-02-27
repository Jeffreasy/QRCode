"use client";

import { useState, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import Link from "next/link";
import QRPreview from "@/components/qr/QRPreview";
import {
    QrCodeIcon,
    BarChartIcon,
    CheckIcon,
    PlusIcon,
    TrashIcon,
    BanIcon,
} from "@/components/ui/icons";

const QR_TYPES = ["url", "vcard", "wifi", "text", "email", "sms", "file", "social"] as const;

type SortKey = "date" | "scans" | "title" | "type";

interface QRCode {
    _id: Id<"qr_codes">;
    slug: string;
    title: string;
    type: string;
    isActive: boolean;
    totalScans: number;
    createdAt: number;
    customization?: {
        fgColor?: string;
        bgColor?: string;
        logoUrl?: string;
        dotStyle?: string;
        cornerColor?: string;
        cornerSquareType?: string;
        cornerDotType?: string;
        qrShape?: string;
        backgroundRound?: number;
        borderEnabled?: boolean;
        borderColor?: string;
        borderWidth?: number;
        borderRadius?: number;
        logoSize?: number;
        logoMargin?: number;
        logoHideDots?: boolean;
        errorCorrectionLevel?: string;
    };
}

export default function DashboardPage() {
    const { user } = useUser();
    const qrCodes = useQuery(api.qrCodes.listByUser, {}) as QRCode[] | undefined;
    const deleteQR = useMutation(api.qrCodes.deleteQRCode);
    const toggleActive = useMutation(api.qrCodes.toggleActive);

    // Search / filter / sort state
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string>("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
    const [sortBy, setSortBy] = useState<SortKey>("date");

    // Bulk select state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [showBulkConfirm, setShowBulkConfirm] = useState(false);

    const totalScans = qrCodes?.reduce((sum, qr) => sum + qr.totalScans, 0) ?? 0;
    const activeCount = qrCodes?.filter((qr) => qr.isActive).length ?? 0;

    const STATS = [
        { label: "Totale QR codes", value: qrCodes?.length ?? 0, Icon: QrCodeIcon, color: "var(--color-accent)", bg: "var(--color-accent-bg)", border: "var(--color-accent-border)" },
        { label: "Actief", value: activeCount, Icon: CheckIcon, color: "var(--color-success)", bg: "var(--color-success-bg)", border: "var(--color-success-border)" },
        { label: "Totale scans", value: totalScans, Icon: BarChartIcon, color: "var(--color-accent)", bg: "var(--color-accent-bg)", border: "var(--color-accent-border)" },
    ];

    // Filtered + sorted list
    const filtered = useMemo(() => {
        if (!qrCodes) return [];
        let list = [...qrCodes];

        // Search
        if (search.trim()) {
            const q = search.toLowerCase();
            list = list.filter(
                (qr) =>
                    qr.title.toLowerCase().includes(q) ||
                    qr.slug.toLowerCase().includes(q) ||
                    qr.type.toLowerCase().includes(q)
            );
        }

        // Type filter
        if (filterType !== "all") {
            list = list.filter((qr) => qr.type === filterType);
        }

        // Status filter
        if (filterStatus === "active") list = list.filter((qr) => qr.isActive);
        if (filterStatus === "inactive") list = list.filter((qr) => !qr.isActive);

        // Sort
        list.sort((a, b) => {
            if (sortBy === "date") return b.createdAt - a.createdAt;
            if (sortBy === "scans") return b.totalScans - a.totalScans;
            if (sortBy === "title") return a.title.localeCompare(b.title);
            if (sortBy === "type") return a.type.localeCompare(b.type);
            return 0;
        });

        return list;
    }, [qrCodes, search, filterType, filterStatus, sortBy]);

    function toggleSelect(id: string) {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    function toggleSelectAll() {
        if (selectedIds.size === filtered.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filtered.map((qr) => qr._id as string)));
        }
    }

    async function handleBulkDelete() {
        setIsBulkDeleting(true);
        try {
            await Promise.all(
                Array.from(selectedIds).map((id) =>
                    deleteQR({ id: id as Id<"qr_codes"> })
                )
            );
            setSelectedIds(new Set());
            setShowBulkConfirm(false);
        } finally {
            setIsBulkDeleting(false);
        }
    }

    async function handleBulkToggle(activate: boolean) {
        const toChange = filtered.filter(
            (qr) => selectedIds.has(qr._id as string) && qr.isActive !== activate
        );
        await Promise.all(toChange.map((qr) => toggleActive({ id: qr._id })));
        setSelectedIds(new Set());
    }

    return (
        <div id="main-content" className="dashboard-main" style={{ padding: "clamp(1rem, 4vw, 2rem) clamp(1rem, 4vw, 2.5rem)" }}>

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
                style={{ display: "grid", gap: "1rem", marginBottom: "2rem" }}
            >
                {STATS.map(({ label, value, Icon, color, bg, border }) => (
                    <div key={label} className="card" style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                            <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>{label}</div>
                            <div style={{ fontSize: "2rem", fontWeight: 800, color }}>{value}</div>
                        </div>
                        <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-md)", background: bg, border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
                            <Icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Search + Filter + Sort bar */}
            <div className="dashboard-filter-bar">
                {/* Search */}
                <div className="dashboard-filter-search">
                    <svg
                        width="15" height="15"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        strokeLinecap="round" strokeLinejoin="round"
                        style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-text-faint)", pointerEvents: "none" }}
                    >
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                    <input
                        className="input"
                        placeholder="Zoeken..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ paddingLeft: "2.25rem", fontSize: "0.875rem", width: "100%" }}
                    />
                </div>

                {/* Selects grid — 2 columns on mobile, inline on sm+ */}
                <div className="dashboard-filter-selects">
                    <select
                        className="input dashboard-filter-select"
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="all">Alle types</option>
                        {QR_TYPES.map((t) => (
                            <option key={t} value={t}>{t.toUpperCase()}</option>
                        ))}
                    </select>

                    <select
                        className="input dashboard-filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value as "all" | "active" | "inactive")}
                    >
                        <option value="all">Alle status</option>
                        <option value="active">Actief</option>
                        <option value="inactive">Inactief</option>
                    </select>

                    <select
                        className="input dashboard-filter-select"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortKey)}
                    >
                        <option value="date">Nieuwste eerst</option>
                        <option value="scans">Meeste scans</option>
                        <option value="title">Op naam</option>
                        <option value="type">Op type</option>
                    </select>
                </div>

                {/* New QR button */}
                <Link
                    href="/dashboard/create"
                    className="btn btn-primary btn-sm dashboard-filter-cta"
                    style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                >
                    <PlusIcon size={15} />
                    Nieuwe QR code
                </Link>
            </div>

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
                <div style={{
                    marginBottom: "1rem",
                    padding: "0.75rem 1rem",
                    background: "var(--color-accent-bg)",
                    border: "1px solid var(--color-accent-border)",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                }}>
                    <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--color-accent)" }}>
                        {selectedIds.size} geselecteerd
                    </span>
                    <div style={{ display: "flex", gap: "0.5rem", flex: 1, flexWrap: "wrap" }}>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleBulkToggle(true)}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                        >
                            <CheckIcon size={13} />
                            Activeren
                        </button>
                        <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleBulkToggle(false)}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                        >
                            <BanIcon size={13} />
                            Deactiveren
                        </button>
                        {!showBulkConfirm ? (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={() => setShowBulkConfirm(true)}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                            >
                                <TrashIcon size={13} />
                                Verwijderen
                            </button>
                        ) : (
                            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>Weet je het zeker?</span>
                                <button className="btn btn-danger btn-sm" onClick={handleBulkDelete} disabled={isBulkDeleting}>
                                    {isBulkDeleting ? "Verwijderen..." : `Ja, verwijder ${selectedIds.size}`}
                                </button>
                                <button className="btn btn-ghost btn-sm" onClick={() => setShowBulkConfirm(false)}>Annuleren</button>
                            </div>
                        )}
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setSelectedIds(new Set())}>
                        Deselecteer
                    </button>
                </div>
            )}

            {/* Grid header + select all */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <h2 style={{ fontSize: "1.125rem", fontWeight: 700 }}>Jouw QR codes</h2>
                    {filtered.length > 0 && (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-text-faint)" }}>
                            {filtered.length} {filtered.length !== qrCodes?.length ? `van ${qrCodes?.length}` : ""}
                        </span>
                    )}
                </div>
                {filtered.length > 0 && (
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={toggleSelectAll}
                        style={{ fontSize: "0.75rem" }}
                    >
                        {selectedIds.size === filtered.length ? "Deselecteer alle" : "Selecteer alle"}
                    </button>
                )}
            </div>

            {/* Loading state */}
            {qrCodes === undefined && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ height: "240px", borderRadius: "var(--radius-lg)" }} />
                    ))}
                </div>
            )}

            {/* Empty state */}
            {qrCodes?.length === 0 && (
                <div className="card" style={{ padding: "4rem 2rem", textAlign: "center" }}>
                    <div style={{ width: "56px", height: "56px", borderRadius: "var(--radius-lg)", background: "var(--color-accent-bg)", border: "1px solid var(--color-accent-border)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem", color: "var(--color-accent)" }}>
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

            {/* No results after filter */}
            {qrCodes && qrCodes.length > 0 && filtered.length === 0 && (
                <div className="card" style={{ padding: "3rem 2rem", textAlign: "center" }}>
                    <p style={{ color: "var(--color-text-muted)", marginBottom: "0.75rem" }}>Geen QR codes gevonden voor jouw zoekopdracht.</p>
                    <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(""); setFilterType("all"); setFilterStatus("all"); }}>
                        Filter wissen
                    </button>
                </div>
            )}

            {/* QR codes grid */}
            {filtered.length > 0 && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
                    {filtered.map((qr) => (
                        <QRCodeCard
                            key={qr._id as string}
                            qr={qr}
                            selected={selectedIds.has(qr._id as string)}
                            onSelect={() => toggleSelect(qr._id as string)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function QRCodeCard({
    qr,
    selected,
    onSelect,
}: {
    qr: QRCode;
    selected: boolean;
    onSelect: () => void;
}) {
    const siteUrl = typeof window !== "undefined" ? window.location.origin : "";
    const redirectUrl = `${siteUrl}/r/${qr.slug}`;

    return (
        <div
            className="card"
            style={{
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                position: "relative",
                cursor: "pointer",
                border: selected ? "1px solid var(--color-accent-border-active)" : undefined,
                background: selected ? "var(--color-accent-bg)" : undefined,
                transition: "border-color 0.15s ease, background 0.15s ease",
            }}
        >
            {/* Select checkbox */}
            <button
                onClick={(e) => { e.preventDefault(); onSelect(); }}
                style={{
                    position: "absolute",
                    top: "0.75rem",
                    right: "0.75rem",
                    width: "20px",
                    height: "20px",
                    borderRadius: "4px",
                    border: `2px solid ${selected ? "var(--color-accent)" : "var(--color-border)"}`,
                    background: selected ? "var(--color-accent)" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 1,
                    transition: "var(--transition)",
                }}
                aria-label={selected ? "Deselecteer" : "Selecteer"}
            >
                {selected && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                )}
            </button>

            {/* Top row: type badge + status */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", paddingRight: "1.5rem" }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--color-accent)", background: "var(--color-accent-bg)", padding: "0.2rem 0.5rem", borderRadius: "100px", border: "1px solid var(--color-accent-border)" }}>
                    {qr.type.toUpperCase()}
                </div>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.2rem 0.5rem", borderRadius: "100px", fontSize: "0.72rem", fontWeight: 600, background: qr.isActive ? "var(--color-success-bg)" : "var(--color-muted-bg)", color: qr.isActive ? "var(--color-success)" : "var(--color-text-muted)", border: `1px solid ${qr.isActive ? "var(--color-success-border)" : "var(--color-muted-border)"}` }}>
                    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "currentColor", display: "inline-block" }} />
                    {qr.isActive ? "Actief" : "Inactief"}
                </span>
            </div>

            {/* QR Preview thumbnail */}
            <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
                <div style={{ flexShrink: 0, borderRadius: "var(--radius-sm)", overflow: "hidden", lineHeight: 0 }}>
                    <QRPreview
                        value={redirectUrl || "https://qrcodemaster.app"}
                        size={72}
                        fgColor={qr.customization?.fgColor ?? "#000000"}
                        bgColor={qr.customization?.bgColor ?? "#ffffff"}
                        dotStyle={qr.customization?.dotStyle ?? "square"}
                        errorCorrectionLevel={(qr.customization?.errorCorrectionLevel ?? "M") as "L" | "M" | "Q" | "H"}
                        logoUrl={qr.customization?.logoUrl || undefined}
                        cornerColor={qr.customization?.cornerColor || undefined}
                        cornerSquareType={(qr.customization?.cornerSquareType || undefined) as "square" | "dot" | "extra-rounded" | undefined}
                        cornerDotType={(qr.customization?.cornerDotType || undefined) as "square" | "dot" | undefined}
                        qrShape={(qr.customization?.qrShape ?? "square") as "square" | "circle"}
                        backgroundRound={qr.customization?.backgroundRound ?? 0}
                        logoSize={qr.customization?.logoSize ?? 0.35}
                        logoMargin={qr.customization?.logoMargin ?? 4}
                        logoHideDots={qr.customization?.logoHideDots ?? true}
                    />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: "0.25rem", fontSize: "0.9375rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {qr.title}
                    </h3>
                    <p style={{ fontSize: "0.75rem", color: "var(--color-text-faint)", fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        /r/{qr.slug}
                    </p>
                </div>
            </div>

            {/* Footer: scans + date + open */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                    <BarChartIcon size={13} />
                    <span>{qr.totalScans} scans</span>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-text-faint)" }}>
                        {new Date(qr.createdAt).toLocaleDateString("nl-NL")}
                    </span>
                    <Link
                        href={`/dashboard/qr/${qr._id}`}
                        className="btn btn-secondary btn-sm"
                        style={{ fontSize: "0.72rem", padding: "0.25rem 0.625rem" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        Openen →
                    </Link>
                </div>
            </div>
        </div>
    );
}
