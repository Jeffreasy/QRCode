import { useState } from "react";
import { useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";

type RecentScan = {
    _id: unknown;
    scannedAt: number;
    country?: string;
    city?: string;
    device?: string;
    browser?: string;
    os?: string;
};

type QRCodeSlug = { slug: string };

export function useQRDetailActions(qrId: Id<"qr_codes">, recentScans: RecentScan[] | undefined, qrCode: QRCodeSlug | null) {
    const router = useRouter();

    const [editingDest, setEditingDest] = useState(false);
    const [newDest, setNewDest] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [copied, setCopied] = useState(false);
    const [editingTitle, setEditingTitle] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [isSavingTitle, setIsSavingTitle] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const updateDest = useMutation(api.qrCodes.updateDestination);
    const toggleActive = useMutation(api.qrCodes.toggleActive);
    const deleteQR = useMutation(api.qrCodes.deleteQRCode);
    const updateTitle = useMutation(api.qrCodes.updateTitle);
    const duplicateQR = useMutation(api.qrCodes.duplicateQRCode);

    async function handleSaveDest() {
        if (!newDest.trim()) return;
        setIsSaving(true);
        try {
            await updateDest({ id: qrId, destination: newDest.trim() });
            setEditingDest(false);
        } finally {
            setIsSaving(false);
        }
    }

    async function handleToggle() {
        await toggleActive({ id: qrId });
    }

    async function handleDelete() {
        setIsDeleting(true);
        try {
            await deleteQR({ id: qrId });
            router.push("/dashboard");
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    }

    function handleCopyUrl(redirectUrl: string) {
        navigator.clipboard.writeText(redirectUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    async function handleSaveTitle() {
        if (!newTitle.trim()) return;
        setIsSavingTitle(true);
        try {
            await updateTitle({ id: qrId, title: newTitle.trim() });
            setEditingTitle(false);
        } finally {
            setIsSavingTitle(false);
        }
    }

    async function handleDuplicate() {
        setIsDuplicating(true);
        try {
            const result = await duplicateQR({ id: qrId });
            router.push(`/dashboard/qr/${result.id}`);
        } finally {
            setIsDuplicating(false);
        }
    }

    function handleExportCSV() {
        if (!recentScans || recentScans.length === 0 || !qrCode) return;
        const header = "Tijdstip,Land,Stad,Apparaat,Browser,OS";
        const rows = recentScans.map((s) => [
            new Date(s.scannedAt).toISOString(),
            s.country ?? "",
            s.city ?? "",
            s.device ?? "",
            s.browser ?? "",
            s.os ?? "",
        ].map(v => `"${v}"`).join(","));
        const csv = [header, ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `scans_${qrCode.slug}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    return {
        editingDest, setEditingDest, newDest, setNewDest, isSaving,
        copied,
        editingTitle, setEditingTitle, newTitle, setNewTitle, isSavingTitle,
        isDuplicating,
        showDeleteConfirm, setShowDeleteConfirm,
        isDeleting,
        handleSaveDest, handleToggle, handleDelete,
        handleCopyUrl, handleSaveTitle, handleDuplicate, handleExportCSV,
    };
}
