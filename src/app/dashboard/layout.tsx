"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import {
    LayoutDashboardIcon,
    PlusIcon,
    QrCodeIcon,
    MenuIcon,
    XIcon,
} from "@/components/ui/icons";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
    { href: "/dashboard/create", icon: PlusIcon, label: "QR Aanmaken" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
                onClick={closeSidebar}
                aria-hidden="true"
            />

            {/* Sidebar */}
            <aside
                className={`glass dashboard-sidebar ${sidebarOpen ? "open" : ""}`}
                style={{
                    width: "var(--sidebar-width)",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                    padding: "1.5rem 1rem",
                    borderRight: "1px solid var(--color-border)",
                    position: "sticky",
                    top: 0,
                    height: "100vh",
                    flexShrink: 0,
                }}
                aria-label="Zijbalknavigatie"
            >
                {/* Logo */}
                <Link
                    href="/dashboard"
                    onClick={closeSidebar}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        textDecoration: "none",
                        marginBottom: "2rem",
                        padding: "0.25rem",
                    }}
                >
                    <span
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "8px",
                            background: "var(--gradient-brand)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        <QrCodeIcon size={18} style={{ color: "#fff" }} />
                    </span>
                    <span
                        style={{
                            fontWeight: 800,
                            fontSize: "1rem",
                            background: "var(--gradient-brand)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        QRCodeMaster
                    </span>
                </Link>

                {/* Nav items */}
                <nav
                    style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1, overflowY: "auto" }}
                    aria-label="Hoofd navigatie"
                >
                    <div
                        style={{
                            fontSize: "0.7rem",
                            fontWeight: 600,
                            color: "var(--color-text-faint)",
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            padding: "0 0.875rem",
                            marginBottom: "0.5rem",
                        }}
                    >
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
                <div
                    style={{
                        borderTop: "1px solid var(--color-border)",
                        paddingTop: "1rem",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                    }}
                >
                    <UserButton />
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        Account
                    </span>
                </div>
            </aside>

            {/* Main content */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                {/* Mobile header — shown only on sm screens */}
                <header className="mobile-header">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        style={{
                            background: "transparent",
                            border: "1px solid var(--color-border)",
                            borderRadius: "var(--radius-md)",
                            padding: "0.375rem",
                            cursor: "pointer",
                            color: "var(--color-text-muted)",
                            display: "flex",
                            alignItems: "center",
                        }}
                        aria-label="Menu openen"
                    >
                        <MenuIcon size={18} />
                    </button>
                    <span
                        style={{
                            fontWeight: 700,
                            fontSize: "0.9rem",
                            background: "var(--gradient-brand)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        QRCodeMaster
                    </span>
                </header>

                <main style={{ flex: 1, overflow: "auto" }} id="main-content">
                    {children}
                </main>
            </div>
        </div>
    );
}
