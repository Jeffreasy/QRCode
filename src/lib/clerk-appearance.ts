import type { Appearance } from "@clerk/types";

/**
 * Unified Clerk appearance config — matches the QRCodeMaster dark design system.
 * Applied globally via ClerkProvider and individually on SignIn/SignUp.
 */
export const clerkAppearance: Appearance = {
    variables: {
        colorPrimary: "#38bdf8",
        colorPrimaryForeground: "#0a0f1e",
        colorBackground: "#0d1424",
        colorInputBackground: "#0f172a",
        colorText: "#e2e8f0",
        colorTextSecondary: "#94a3b8",
        colorTextOnPrimaryBackground: "#0a0f1e",
        colorDanger: "#f87171",
        colorSuccess: "#34d399",
        colorWarning: "#fbbf24",
        colorInputText: "#e2e8f0",
        colorShimmer: "rgba(56,189,248,0.08)",
        borderRadius: "10px",
        fontFamily: "'Inter', 'Geist', system-ui, sans-serif",
        fontSize: "0.9rem",
        fontWeight: { normal: 400, medium: 500, bold: 700 },
    },
    elements: {
        // Card
        card: {
            background: "rgba(17,24,39,0.95)",
            border: "1px solid rgba(56,189,248,0.12)",
            boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.08)",
            borderRadius: "16px",
            backdropFilter: "blur(20px)",
        },
        // Header
        headerTitle: {
            color: "#f1f5f9",
            fontWeight: 800,
            fontSize: "1.375rem",
        },
        headerSubtitle: {
            color: "#64748b",
            fontSize: "0.875rem",
        },
        // Social buttons
        socialButtonsBlockButton: {
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#e2e8f0",
            borderRadius: "8px",
            transition: "all 0.15s ease",
        },
        socialButtonsBlockButtonText: {
            fontWeight: 500,
            color: "#e2e8f0",
        },
        // Divider
        dividerLine: { background: "rgba(255,255,255,0.06)" },
        dividerText: { color: "#475569", fontSize: "0.75rem" },
        // Form fields
        formFieldLabel: {
            color: "#94a3b8",
            fontSize: "0.8125rem",
            fontWeight: 500,
        },
        formFieldInput: {
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px",
            color: "#e2e8f0",
            fontSize: "0.9rem",
        },
        formFieldInputShowPasswordButton: { color: "#64748b" },
        formFieldErrorText: { color: "#f87171", fontSize: "0.75rem" },
        formFieldSuccessText: { color: "#34d399" },
        // Primary CTA button
        formButtonPrimary: {
            background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
            color: "#0a0f1e",
            fontWeight: 700,
            borderRadius: "8px",
            border: "none",
        },
        // Footer links
        footerActionText: { color: "#64748b", fontSize: "0.8125rem" },
        footerActionLink: { color: "#38bdf8", fontWeight: 600 },
        // Identity preview
        identityPreviewText: { color: "#94a3b8" },
        identityPreviewEditButton: { color: "#38bdf8" },
        // OTP inputs
        otpCodeFieldInput: {
            background: "#0f172a",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#f1f5f9",
            borderRadius: "8px",
        },
        // Alert
        alert: {
            borderRadius: "8px",
            border: "1px solid rgba(248,113,113,0.2)",
            background: "rgba(248,113,113,0.08)",
        },
        alertText: { color: "#fca5a5", fontSize: "0.8125rem" },
        // UserButton popover
        userButtonPopoverCard: {
            background: "rgba(17,24,39,0.97)",
            border: "1px solid rgba(56,189,248,0.12)",
            boxShadow: "0 16px 32px rgba(0,0,0,0.5)",
            borderRadius: "12px",
        },
        userButtonPopoverActionButton: {
            color: "#e2e8f0",
            borderRadius: "8px",
        },
        userButtonPopoverActionButtonText: { color: "#e2e8f0" },
        userButtonPopoverFooter: { display: "none" },
        // Avatar
        avatarBox: { border: "2px solid rgba(56,189,248,0.3)" },
    },
};
