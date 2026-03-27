"use client";

import { useState } from "react";
import Link from "next/link";
import { USE_CASES } from "../_data/usecases";

export function UseCasesSection() {
    const [activeId, setActiveId] = useState(USE_CASES[0].id);
    const active = USE_CASES.find((uc) => uc.id === activeId) ?? USE_CASES[0];

    return (
        <section
            id="use-cases"
            className="use-cases-section"
            style={{ maxWidth: "1100px", margin: "0 auto" }}
        >
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <p
                    style={{
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--color-text-faint)",
                        marginBottom: "1rem",
                    }}
                >
                    Use cases
                </p>
                <h2
                    style={{
                        fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)",
                        fontWeight: 800,
                        letterSpacing: "-0.02em",
                        marginBottom: "0.75rem",
                    }}
                >
                    Eén platform,{" "}
                    <span className="gradient-text">elke branche</span>
                </h2>
                <p
                    style={{
                        color: "var(--color-text-muted)",
                        fontSize: "0.9375rem",
                        lineHeight: 1.7,
                        maxWidth: "520px",
                        margin: "0 auto",
                    }}
                >
                    Van restaurant-menu&apos;s tot patiëntformulieren — ontdek hoe
                    bedrijven in jouw sector dynamische QR codes inzetten.
                </p>
            </div>

            {/* Tabs */}
            <div className="use-case-tabs" role="tablist" aria-label="Use cases per branche">
                {USE_CASES.map((uc) => {
                    const isActive = activeId === uc.id;
                    return (
                        <button
                            key={uc.id}
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`uc-panel-${uc.id}`}
                            id={`uc-tab-${uc.id}`}
                            onClick={() => setActiveId(uc.id)}
                            className={`use-case-tab${isActive ? " active" : ""}`}
                        >
                            <uc.Icon size={16} />
                            <span>{uc.industry}</span>
                        </button>
                    );
                })}
            </div>

            {/* Content panel */}
            <div
                key={active.id}
                role="tabpanel"
                id={`uc-panel-${active.id}`}
                aria-labelledby={`uc-tab-${active.id}`}
                className="use-case-panel card animate-fade-in-up"
            >
                <div className="use-case-panel-inner">
                    {/* Left: text */}
                    <div className="use-case-text">
                        <h3
                            style={{
                                fontSize: "1.25rem",
                                fontWeight: 700,
                                marginBottom: "1.5rem",
                                lineHeight: 1.3,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.625rem",
                            }}
                        >
                            <span
                                style={{
                                    flexShrink: 0,
                                    width: "36px",
                                    height: "36px",
                                    borderRadius: "var(--radius-sm)",
                                    background: "var(--color-accent-bg)",
                                    border: "1px solid var(--color-accent-border)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "var(--color-accent)",
                                }}
                            >
                                <active.Icon size={18} />
                            </span>
                            {active.title}
                        </h3>

                        <div className="use-case-step">
                            <span className="use-case-step-label" style={{ color: "var(--color-danger)" }}>Probleem</span>
                            <p>{active.problem}</p>
                        </div>
                        <div className="use-case-step">
                            <span className="use-case-step-label" style={{ color: "var(--color-accent)" }}>Oplossing</span>
                            <p>{active.solution}</p>
                        </div>
                        <div className="use-case-step">
                            <span className="use-case-step-label" style={{ color: "var(--color-success)" }}>Resultaat</span>
                            <p>{active.outcome}</p>
                        </div>
                    </div>

                    {/* Right: QR types + CTA */}
                    <div className="use-case-sidebar">
                        <div className="use-case-qr-types-box">
                            <p
                                style={{
                                    fontSize: "0.72rem",
                                    fontWeight: 600,
                                    color: "var(--color-text-faint)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    marginBottom: "0.625rem",
                                }}
                            >
                                Gebruikte QR-types
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                                {active.qrTypes.map((type) => (
                                    <span key={type} className="badge badge-type">{type}</span>
                                ))}
                            </div>
                        </div>

                        <Link
                            href="/sign-up"
                            className="btn btn-primary"
                            style={{ width: "100%", marginTop: "1rem", textAlign: "center" }}
                        >
                            Start gratis →
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
