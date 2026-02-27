import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

type DesignDraft = {
    fgColor: string;
    bgColor: string;
    dotStyle: string;
    cornerColor: string;
    cornerSquareType: string;
    cornerDotType: string;
    qrShape: "square" | "circle";
    backgroundRound: number;
    errorCorrectionLevel: string;
    logoUrl: string;
    borderEnabled: boolean;
    borderColor: string;
    borderWidth: number;
    borderRadius: number;
    logoSize: number;
    logoMargin: number;
    logoHideDots: boolean;
};

type QRCodeData = {
    customization?: Partial<DesignDraft>;
};

export function useDesignDraft(qrId: Id<"qr_codes">) {
    const [editingDesign, setEditingDesign] = useState(false);
    const [isSavingDesign, setIsSavingDesign] = useState(false);
    const [designDraft, setDesignDraft] = useState<DesignDraft | null>(null);

    const updateCustomization = useMutation(api.qrCodes.updateCustomization);
    const router = useRouter();

    function openDesignEdit(qrCode: QRCodeData) {
        setDesignDraft({
            fgColor: qrCode.customization?.fgColor ?? "#000000",
            bgColor: qrCode.customization?.bgColor ?? "#ffffff",
            dotStyle: qrCode.customization?.dotStyle ?? "square",
            cornerColor: qrCode.customization?.cornerColor ?? "",
            cornerSquareType: qrCode.customization?.cornerSquareType ?? "",
            cornerDotType: qrCode.customization?.cornerDotType ?? "",
            qrShape: (qrCode.customization?.qrShape as "square" | "circle") ?? "square",
            backgroundRound: qrCode.customization?.backgroundRound ?? 0,
            errorCorrectionLevel: qrCode.customization?.errorCorrectionLevel ?? "M",
            logoUrl: qrCode.customization?.logoUrl ?? "",
            borderEnabled: qrCode.customization?.borderEnabled ?? false,
            borderColor: qrCode.customization?.borderColor ?? "#38bdf8",
            borderWidth: qrCode.customization?.borderWidth ?? 4,
            borderRadius: qrCode.customization?.borderRadius ?? 16,
            logoSize: qrCode.customization?.logoSize ?? 0.35,
            logoMargin: qrCode.customization?.logoMargin ?? 4,
            logoHideDots: qrCode.customization?.logoHideDots ?? true,
        });
        setEditingDesign(true);
    }

    async function handleSaveDesign() {
        if (!designDraft) return;
        setIsSavingDesign(true);
        try {
            await updateCustomization({
                id: qrId,
                customization: {
                    fgColor: designDraft.fgColor,
                    bgColor: designDraft.bgColor,
                    dotStyle: designDraft.dotStyle as "square" | "rounded" | "dots" | "classy" | "classy-rounded" | "extra-rounded",
                    cornerColor: designDraft.cornerColor || undefined,
                    cornerSquareType: (designDraft.cornerSquareType || undefined) as "square" | "dot" | "extra-rounded" | undefined,
                    cornerDotType: (designDraft.cornerDotType || undefined) as "square" | "dot" | undefined,
                    qrShape: designDraft.qrShape,
                    backgroundRound: designDraft.backgroundRound,
                    errorCorrectionLevel: designDraft.errorCorrectionLevel,
                    logoUrl: designDraft.logoUrl || undefined,
                    borderEnabled: designDraft.borderEnabled,
                    borderColor: designDraft.borderColor,
                    borderWidth: designDraft.borderWidth,
                    borderRadius: designDraft.borderRadius,
                    logoSize: designDraft.logoSize,
                    logoMargin: designDraft.logoMargin,
                    logoHideDots: designDraft.logoHideDots,
                },
            });
            setEditingDesign(false);
        } finally {
            setIsSavingDesign(false);
        }
    }

    // Suppress unused router warning — kept for potential future navigation
    void router;

    return {
        editingDesign,
        setEditingDesign,
        isSavingDesign,
        designDraft,
        setDesignDraft,
        openDesignEdit,
        handleSaveDesign,
    };
}

export type { DesignDraft };
