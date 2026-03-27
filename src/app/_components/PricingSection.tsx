"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { CheckIcon, XIcon } from "@/components/ui/icons";

export function PricingSection() {
    // Plans komen uitsluitend uit Convex — geen statische fallback
    const tiers = useQuery(api.plans.listPlans);

    if (!tiers) {
        return (
            <section id="pricing" className="pricing-section" style={{ maxWidth: "1100px", margin: "0 auto" }}>
                <div style={{ textAlign: "center", padding: "4rem 0", color: "var(--color-text-muted)" }}>
                    Prijzen laden…
                </div>
            </section>
        );
    }

    return (
        <section
            id="pricing"
            className="pricing-section"
            style={{ maxWidth: "1100px", margin: "0 auto" }}
        >
            {/* Section header */}
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <h2
                    style={{
                        fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                        fontWeight: 900,
                        letterSpacing: "-0.02em",
                        marginBottom: "0.75rem",
                    }}
                >
                    Transparante prijzen.{" "}
                    <span className="gradient-text">Geen verrassingen.</span>
                </h2>
                <p
                    style={{
                        fontSize: "1rem",
                        color: "var(--color-text-muted)",
                        maxWidth: "520px",
                        margin: "0 auto",
                        lineHeight: 1.7,
                    }}
                >
                    Altijd zichtbaar. Altijd eerlijk. Geen codes die plotseling
                    uitvallen na een proefperiode.
                </p>
            </div>

            {/* Pricing cards grid */}
            <div className="pricing-cards-grid">
                {tiers.map((tier) => {
                    const key = tier.planId;
                    const ctaLabel = tier.ctaText;
                    const ctaLink = tier.ctaHref;
                    return (
                        <div
                            key={key}
                            className={`pricing-card${tier.highlighted ? " pricing-card-featured" : ""}`}
                            style={{ position: "relative" }}
                        >
                            {/* "Meest Populair" badge */}
                            {tier.badge && (
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "-14px",
                                        left: "50%",
                                        transform: "translateX(-50%)",
                                        background: "var(--color-warning)",
                                        color: "#000",
                                        fontSize: "0.6875rem",
                                        fontWeight: 800,
                                        letterSpacing: "0.06em",
                                        textTransform: "uppercase",
                                        padding: "0.25rem 0.875rem",
                                        borderRadius: "100px",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {tier.badge}
                                </div>
                            )}

                            {/* Tier header */}
                            <div style={{ marginBottom: "1.25rem" }}>
                                <p
                                    style={{
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                        color: tier.highlighted
                                            ? "var(--color-warning)"
                                            : "var(--color-text-muted)",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    {tier.name}
                                </p>
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        gap: "0.25rem",
                                        marginBottom: "0.5rem",
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: "clamp(2rem, 5vw, 2.75rem)",
                                            fontWeight: 900,
                                            letterSpacing: "-0.03em",
                                            lineHeight: 1,
                                        }}
                                    >
                                        €{tier.price.toFixed(2).replace(".", ",")}
                                    </span>
                                    <span
                                        style={{
                                            fontSize: "0.8125rem",
                                            color: "var(--color-text-muted)",
                                        }}
                                    >
                                        {tier.period}
                                    </span>
                                </div>
                                <p
                                    style={{
                                        fontSize: "0.875rem",
                                        color: "var(--color-text-muted)",
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {tier.description}
                                </p>
                            </div>

                            {/* CTA Button */}
                            <Link
                                href={ctaLink}
                                className={`btn btn-lg${tier.highlighted ? " btn-primary" : " btn-secondary"}`}
                                style={{ width: "100%", marginBottom: "1.5rem" }}
                            >
                                {ctaLabel}
                            </Link>

                            {/* Divider */}
                            <div className="divider" style={{ margin: "0 0 1.25rem" }} />

                            {/* Features list */}
                            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                                {tier.features.map((feature) => (
                                    <li
                                        key={feature.text}
                                        style={{
                                            display: "flex",
                                            alignItems: "flex-start",
                                            gap: "0.5rem",
                                            fontSize: "0.875rem",
                                            color: feature.included
                                                ? "var(--color-text)"
                                                : "var(--color-text-faint)",
                                        }}
                                    >
                                        <span
                                            style={{
                                                flexShrink: 0,
                                                marginTop: "2px",
                                                color: feature.included
                                                    ? "var(--color-success)"
                                                    : "var(--color-text-faint)",
                                            }}
                                        >
                                            {feature.included ? (
                                                <CheckIcon size={14} />
                                            ) : (
                                                <XIcon size={14} />
                                            )}
                                        </span>
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    );
                })}
            </div>

            {/* Trust micro-text */}
            <p
                style={{
                    textAlign: "center",
                    marginTop: "2rem",
                    fontSize: "0.8125rem",
                    color: "var(--color-text-faint)",
                    lineHeight: 1.6,
                }}
            >
                Geen creditcard nodig voor Starter. Annuleer elke maand, geen
                contracten.{" "}
                <span style={{ color: "var(--color-success)" }}>
                    Codes blijven altijd actief.
                </span>
            </p>
        </section>
    );
}
