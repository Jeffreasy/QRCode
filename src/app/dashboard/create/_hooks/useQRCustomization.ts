import { useState, useCallback } from "react";

export type QRCustomization = {
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    errorCorrectionLevel: string;
    logoUrl: string | undefined;
    cornerColor: string | undefined;
    cornerSquareType: "square" | "dot" | "extra-rounded" | undefined;
    cornerDotType: "square" | "dot" | undefined;
    qrShape: "square" | "circle";
    backgroundRound: number;
    borderEnabled: boolean;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    logoSize: number;
    logoMargin: number;
    logoHideDots: boolean;
};

const CUSTOMIZATION_DEFAULTS: QRCustomization = {
    fgColor: "#000000",
    bgColor: "#ffffff",
    dotStyle: "square",
    errorCorrectionLevel: "M",
    logoUrl: undefined,
    cornerColor: undefined,
    cornerSquareType: undefined,
    cornerDotType: undefined,
    qrShape: "square",
    backgroundRound: 0,
    borderEnabled: false,
    borderColor: "#38bdf8",
    borderWidth: 4,
    borderRadius: 16,
    logoSize: 0.35,
    logoMargin: 4,
    logoHideDots: true,
};

export function useQRCustomization() {
    const [customization, setCustomization] = useState<QRCustomization>(CUSTOMIZATION_DEFAULTS);

    const setCustomField = useCallback(
        (key: keyof QRCustomization, value: string | boolean | number | undefined) =>
            setCustomization((prev) => ({ ...prev, [key]: value })),
        []
    );

    return { customization, setCustomization, setCustomField };
}
