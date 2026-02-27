"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import {
    LayoutDashboardIcon,
    PlusIcon,
    QrCodeIcon,
    MenuIcon,
    BarChartIcon,
    XIcon,
} from "@/components/ui/icons";


const navItems = [
    { href: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
    { href: "/dashboard/create", icon: PlusIcon, label: "QR Aanmaken" },
    { href: "/dashboard/analytics", icon: BarChartIcon, label: "Analytics" },
];


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    // Close sidebar on route change
    useEffect(() => {
        closeSidebar();
    }, [pathname]);

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [sidebarOpen]);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>

            {/* ── BACKDROP ── dark overlay behind sidebar on mobile */}
            {sidebarOpen && (
                <div
                    onClick={closeSidebar}
                    aria-hidden="true"
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.65)",
                        backdropFilter: "blur(2px)",
                        zIndex: 39,
                        animation: "fadeIn 0.2s ease",
                    }}
                />
            )}

            {/* ── SIDEBAR ── */}
            <aside
                className={`dashboard-sidebar ${sidebarOpen ? "open" : ""}`}
                aria-label="Zijbalknavigatie"
            >
                {/* Sidebar Header: logo + close button */}
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "2rem",
                }}>
                    <Link
                        href="/dashboard"
                        onClick={closeSidebar}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.625rem",
                            textDecoration: "none",
                            padding: "0.25rem",
                        }}
                    >
                        <span style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "var(--gradient-brand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <QrCodeIcon size={18} style={{ color: "#fff" }} />
                        </span>
                        <span style={{
                            fontWeight: 800,
                            fontSize: "1rem",
                            background: "var(--gradient-brand)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}>
                            QRCodeMaster
                        </span>
                    </Link>

                    {/* Close button — only visible on mobile via CSS */}
                    <button
                        onClick={closeSidebar}
                        className="sidebar-close-btn"
                        aria-label="Sluit navigatie"
                        style={{
                            background: "transparent",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            padding: "0.375rem",
                            cursor: "pointer",
                            color: "var(--color-text-muted)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "36px",
                            height: "36px",
                            transition: "var(--transition)",
                            flexShrink: 0,
                        }}
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                {/* Nav items */}
                <nav
                    style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1, overflowY: "auto" }}
                    aria-label="Hoofd navigatie"
                >
                    <div style={{
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        color: "var(--color-text-faint)",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "0 0.875rem",
                        marginBottom: "0.5rem",
                    }}>
                        Navigatie
                    </div>

                    {navItems.map((item) => {
                        const isActive =
                            item.href === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={closeSidebar}
                                className={`sidebar-link ${isActive ? "active" : ""}`}
                            >
                                <Icon size={18} style={{ flexShrink: 0 }} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: user button */}
                <div style={{
                    borderTop: "1px solid var(--color-border)",
                    paddingTop: "1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                }}>
                    <UserButton />
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        Account
                    </span>
                </div>
            </aside>

            {/* ── MAIN AREA ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

                {/* Mobile topbar */}
                <header className="mobile-header">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="mobile-menu-btn"
                        aria-label="Menu openen"
                        aria-expanded={sidebarOpen}
                    >
                        <MenuIcon size={20} />
                    </button>

                    <span style={{
                        fontWeight: 700,
                        fontSize: "0.9rem",
                        background: "var(--gradient-brand)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                    }}>
                        QRCodeMaster
                    </span>

                    {/* Spacer to center logo */}
                    <div style={{ width: "44px" }} aria-hidden="true" />
                </header>

                <main style={{ flex: 1, overflow: "auto" }} id="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
