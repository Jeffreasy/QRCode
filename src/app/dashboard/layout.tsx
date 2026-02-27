"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";

const navItems = [
    { href: "/dashboard", icon: "⬡", label: "Dashboard" },
    { href: "/dashboard/create", icon: "+", label: "QR Aanmaken" },
];

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            {/* Sidebar */}
            <aside
                className="glass"
                style={{
                    width: "240px",
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
            >
                {/* Logo */}
                <Link
                    href="/dashboard"
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        textDecoration: "none",
                        marginBottom: "2rem",
                        padding: "0.25rem",
                    }}
                >
                    <span style={{ fontSize: "1.5rem" }}>⬡</span>
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
                <nav style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
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

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`sidebar-link ${isActive ? "active" : ""}`}
                            >
                                <span
                                    style={{
                                        width: "20px",
                                        textAlign: "center",
                                        fontSize: item.icon === "+" ? "1.25rem" : "1rem",
                                        fontWeight: item.icon === "+" ? 300 : "normal",
                                    }}
                                >
                                    {item.icon}
                                </span>
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
                    <UserButton afterSignOutUrl="/" />
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        Account
                    </span>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, overflow: "auto" }}>
                {children}
            </main>
        </div>
    );
}
