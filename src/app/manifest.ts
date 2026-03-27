import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "QRCodeMaster",
        short_name: "QRCodeMaster",
        description:
            "Maak, beheer en analyseer professionele dynamische QR codes.",
        start_url: "/dashboard",
        display: "standalone",
        background_color: "#0a0e1a",
        theme_color: "#38bdf8",
        icons: [
            {
                src: "/favicon.ico",
                sizes: "any",
                type: "image/x-icon",
            },
        ],
    };
}
