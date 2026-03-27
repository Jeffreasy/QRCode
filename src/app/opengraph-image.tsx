import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "QRCodeMaster — Professionele Dynamische QR Codes";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0a0e1a 100%)",
                    fontFamily: "system-ui, sans-serif",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Accent glow */}
                <div
                    style={{
                        position: "absolute",
                        top: "-100px",
                        right: "-100px",
                        width: "500px",
                        height: "500px",
                        background: "radial-gradient(circle, rgba(56,189,248,0.15) 0%, transparent 70%)",
                        borderRadius: "50%",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-80px",
                        left: "-80px",
                        width: "400px",
                        height: "400px",
                        background: "radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)",
                        borderRadius: "50%",
                    }}
                />

                {/* QR icon */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "80px",
                        height: "80px",
                        borderRadius: "16px",
                        background: "rgba(56,189,248,0.1)",
                        border: "2px solid rgba(56,189,248,0.3)",
                        marginBottom: "24px",
                    }}
                >
                    <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="2" y="2" width="8" height="8" rx="1" />
                        <rect x="14" y="2" width="8" height="8" rx="1" />
                        <rect x="2" y="14" width="8" height="8" rx="1" />
                        <rect x="14" y="14" width="4" height="4" rx="0.5" />
                        <rect x="20" y="14" width="2" height="2" />
                        <rect x="14" y="20" width="2" height="2" />
                        <rect x="20" y="20" width="2" height="2" />
                    </svg>
                </div>

                {/* Title */}
                <div
                    style={{
                        fontSize: "56px",
                        fontWeight: 900,
                        color: "#ffffff",
                        letterSpacing: "-0.03em",
                        textAlign: "center",
                        lineHeight: 1.1,
                        marginBottom: "12px",
                    }}
                >
                    QRCodeMaster
                </div>

                {/* Subtitle */}
                <div
                    style={{
                        fontSize: "24px",
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.6)",
                        textAlign: "center",
                        maxWidth: "600px",
                        lineHeight: 1.5,
                    }}
                >
                    Professionele Dynamische QR Codes
                </div>

                {/* Features row */}
                <div
                    style={{
                        display: "flex",
                        gap: "32px",
                        marginTop: "40px",
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "16px",
                    }}
                >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#34d399", fontWeight: 600 }}>✓</span> Altijd aanpasbaar
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#34d399", fontWeight: 600 }}>✓</span> Realtime analytics
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ color: "#34d399", fontWeight: 600 }}>✓</span> Gratis starten
                    </span>
                </div>

                {/* Domain */}
                <div
                    style={{
                        position: "absolute",
                        bottom: "32px",
                        fontSize: "16px",
                        color: "rgba(56,189,248,0.7)",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                    }}
                >
                    www.jeffdash.com
                </div>
            </div>
        ),
        { ...size }
    );
}
