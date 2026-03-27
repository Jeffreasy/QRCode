import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import { isValidUrl } from "@/lib/qr-types";
import { QRCustomization } from "./useQRCustomization";

export function useLogoUpload(setCustomization: React.Dispatch<React.SetStateAction<QRCustomization>>) {
    const [logoInput, setLogoInput] = useState("");
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const [logoStorageId, setLogoStorageId] = useState<string | undefined>();
    const [errorMsg, setErrorMsg] = useState("");

    const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
    const getStorageUrl = useMutation(api.storage.getStorageUrl);
    const deleteStorageFile = useMutation(api.storage.deleteStorageFile);

    const handleLogoApply = () => {
        const url = logoInput.trim();
        if (url && isValidUrl(url)) {
            setCustomization((prev) => ({ ...prev, logoUrl: url, errorCorrectionLevel: "H" }));
        }
    };

    const handleLogoFile = async (file: File) => {
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setErrorMsg("Alleen afbeeldingen zijn toegestaan (PNG, JPG, SVG, WEBP).");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setErrorMsg("Afbeelding mag maximaal 2MB zijn.");
            return;
        }
        setIsUploadingLogo(true);
        setErrorMsg("");
        try {
            if (logoStorageId) {
                await deleteStorageFile({ storageId: logoStorageId as Id<"_storage"> }).catch(() => { });
            }
            const uploadUrl = await generateUploadUrl();
            const putRes = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!putRes.ok) throw new Error("Upload mislukt.");
            const { storageId } = await putRes.json();
            const publicUrl = await getStorageUrl({ storageId: storageId as Id<"_storage"> });
            if (!publicUrl) throw new Error("Kon geen publieke URL ophalen.");
            setLogoStorageId(storageId);
            setCustomization((prev) => ({ ...prev, logoUrl: publicUrl, errorCorrectionLevel: "H" }));
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Logo upload mislukt.");
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const handleLogoClear = () => {
        setLogoInput("");
        if (logoStorageId) {
            deleteStorageFile({ storageId: logoStorageId as Id<"_storage"> }).catch(() => { });
            setLogoStorageId(undefined);
        }
        setCustomization((prev) => ({ ...prev, logoUrl: undefined }));
    };

    return {
        logoInput,
        setLogoInput,
        isUploadingLogo,
        errorMsg,
        setErrorMsg,
        handleLogoApply,
        handleLogoFile,
        handleLogoClear,
    };
}
