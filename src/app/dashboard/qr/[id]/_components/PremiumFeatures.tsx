"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { Id } from "@/../convex/_generated/dataModel";
import {
    ClockIcon, LockIcon, TagIcon, ZapIcon, GlobeIcon,
    PlusIcon, TrashIcon, CheckIcon, XIcon, EditIcon,
} from "@/components/ui/icons";

type QRCode = {
    _id: Id<"qr_codes">;
    scheduledStart?: number;
    scheduledEnd?: number;
    password?: string;
    tags?: string[];
    abDestinations?: { url: string; weight: number; label: string }[];
    geoRules?: { country: string; destination: string }[];
};

// ── Schedule Card ────────────────────────────────────────────────────────────

export function ScheduleCard({ qr }: { qr: QRCode }) {
    const updateSchedule = useMutation(api.qrCodes.updateSchedule);
    const [editing, setEditing] = useState(false);
    const [start, setStart] = useState(qr.scheduledStart ? new Date(qr.scheduledStart).toISOString().slice(0, 16) : "");
    const [end, setEnd] = useState(qr.scheduledEnd ? new Date(qr.scheduledEnd).toISOString().slice(0, 16) : "");
    const [saving, setSaving] = useState(false);

    const hasSchedule = qr.scheduledStart || qr.scheduledEnd;

    async function save() {
        setSaving(true);
        try {
            await updateSchedule({
                id: qr._id,
                scheduledStart: start ? new Date(start).getTime() : null,
                scheduledEnd: end ? new Date(end).getTime() : null,
            });
            setEditing(false);
        } finally { setSaving(false); }
    }

    async function clear() {
        setSaving(true);
        try {
            await updateSchedule({ id: qr._id, scheduledStart: null, scheduledEnd: null });
            setStart(""); setEnd(""); setEditing(false);
        } finally { setSaving(false); }
    }

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing || hasSchedule ? "1rem" : 0 }}>
                <h4 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", margin: 0 }}>
                    <ClockIcon size={16} style={{ color: "var(--color-accent)" }} /> Planning
                </h4>
                {!editing && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <EditIcon size={13} /> {hasSchedule ? "Wijzigen" : "Instellen"}
                    </button>
                )}
            </div>

            {!editing && hasSchedule && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", fontSize: "0.8125rem" }}>
                    {qr.scheduledStart && (
                        <div style={{ color: "var(--color-text-muted)" }}>
                            <span style={{ fontWeight: 600 }}>Start:</span>{" "}
                            {new Date(qr.scheduledStart).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                    )}
                    {qr.scheduledEnd && (
                        <div style={{ color: "var(--color-text-muted)" }}>
                            <span style={{ fontWeight: 600 }}>Einde:</span>{" "}
                            {new Date(qr.scheduledEnd).toLocaleString("nl-NL", { dateStyle: "medium", timeStyle: "short" })}
                        </div>
                    )}
                </div>
            )}

            {editing && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <label style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        Start
                        <input type="datetime-local" className="input" value={start} onChange={(e) => setStart(e.target.value)}
                            style={{ marginTop: "0.25rem", width: "100%", fontSize: "0.8125rem" }} />
                    </label>
                    <label style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        Einde
                        <input type="datetime-local" className="input" value={end} onChange={(e) => setEnd(e.target.value)}
                            style={{ marginTop: "0.25rem", width: "100%", fontSize: "0.8125rem" }} />
                    </label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <CheckIcon size={13} /> {saving ? "..." : "Opslaan"}
                        </button>
                        {hasSchedule && (
                            <button className="btn btn-danger btn-sm" onClick={clear} disabled={saving}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <TrashIcon size={13} /> Wissen
                            </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Annuleren</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Password Card ────────────────────────────────────────────────────────────

export function PasswordCard({ qr }: { qr: QRCode }) {
    const updatePassword = useMutation(api.qrCodes.updatePassword);
    const [editing, setEditing] = useState(false);
    const [pw, setPw] = useState("");
    const [saving, setSaving] = useState(false);

    const hasPassword = !!qr.password;

    async function save() {
        if (!pw.trim()) return;
        setSaving(true);
        try {
            await updatePassword({ id: qr._id, password: pw.trim() });
            setPw(""); setEditing(false);
        } finally { setSaving(false); }
    }

    async function remove() {
        setSaving(true);
        try {
            await updatePassword({ id: qr._id, password: null });
            setEditing(false);
        } finally { setSaving(false); }
    }

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing || hasPassword ? "1rem" : 0 }}>
                <h4 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", margin: 0 }}>
                    <LockIcon size={16} style={{ color: "var(--color-accent)" }} /> Wachtwoord
                </h4>
                {!editing && (
                    <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <EditIcon size={13} /> {hasPassword ? "Wijzigen" : "Instellen"}
                    </button>
                )}
            </div>

            {!editing && hasPassword && (
                <div style={{ fontSize: "0.8125rem", color: "var(--color-success)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <LockIcon size={12} /> Beveiligd met wachtwoord
                </div>
            )}

            {editing && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <input className="input" type="password" value={pw} onChange={(e) => setPw(e.target.value)}
                        placeholder={hasPassword ? "Nieuw wachtwoord..." : "Stel een wachtwoord in..."}
                        autoFocus style={{ fontSize: "0.8125rem" }} />
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || !pw.trim()}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <CheckIcon size={13} /> {saving ? "..." : "Opslaan"}
                        </button>
                        {hasPassword && (
                            <button className="btn btn-danger btn-sm" onClick={remove} disabled={saving}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <TrashIcon size={13} /> Verwijderen
                            </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setPw(""); }}>Annuleren</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Tags Card ────────────────────────────────────────────────────────────────

export function TagsCard({ qr }: { qr: QRCode }) {
    const updateTags = useMutation(api.qrCodes.updateTags);
    const [newTag, setNewTag] = useState("");
    const [saving, setSaving] = useState(false);

    const tags = qr.tags ?? [];

    async function addTag() {
        const tag = newTag.trim().toLowerCase();
        if (!tag || tags.includes(tag)) { setNewTag(""); return; }
        setSaving(true);
        try {
            await updateTags({ id: qr._id, tags: [...tags, tag] });
            setNewTag("");
        } finally { setSaving(false); }
    }

    async function removeTag(tag: string) {
        setSaving(true);
        try {
            await updateTags({ id: qr._id, tags: tags.filter((t) => t !== tag) });
        } finally { setSaving(false); }
    }

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <h4 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", margin: 0, marginBottom: "1rem" }}>
                <TagIcon size={16} style={{ color: "var(--color-accent)" }} /> Tags
            </h4>

            {tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", marginBottom: "0.75rem" }}>
                    {tags.map((tag) => (
                        <span key={tag} style={{
                            display: "inline-flex", alignItems: "center", gap: "0.25rem",
                            padding: "0.25rem 0.625rem", borderRadius: "100px", fontSize: "0.75rem", fontWeight: 500,
                            background: "var(--color-accent-bg)", color: "var(--color-accent)",
                            border: "1px solid var(--color-accent-border)",
                        }}>
                            {tag}
                            <button onClick={() => removeTag(tag)} disabled={saving}
                                style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", lineHeight: 0 }}>
                                <XIcon size={10} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); addTag(); }} style={{ display: "flex", gap: "0.5rem" }}>
                <input className="input" value={newTag} onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Nieuwe tag..." style={{ flex: 1, fontSize: "0.8125rem" }} />
                <button type="submit" className="btn btn-secondary btn-sm" disabled={saving || !newTag.trim()}
                    style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                    <PlusIcon size={13} /> Toevoegen
                </button>
            </form>
        </div>
    );
}

// ── A/B Testing Card ─────────────────────────────────────────────────────────

export function ABTestCard({ qr }: { qr: QRCode }) {
    const updateAB = useMutation(api.qrCodes.updateABDestinations);
    const [editing, setEditing] = useState(false);
    const [variants, setVariants] = useState<{ url: string; weight: number; label: string }[]>(
        qr.abDestinations ?? []
    );
    const [saving, setSaving] = useState(false);

    const hasAB = qr.abDestinations && qr.abDestinations.length > 0;
    const totalWeight = variants.reduce((s, v) => s + v.weight, 0);

    function addVariant() {
        setVariants([...variants, { url: "", weight: 0, label: `Variant ${String.fromCharCode(65 + variants.length)}` }]);
    }

    function updateVariant(i: number, field: string, value: string | number) {
        const copy = [...variants];
        copy[i] = { ...copy[i], [field]: value };
        setVariants(copy);
    }

    function removeVariant(i: number) {
        setVariants(variants.filter((_, idx) => idx !== i));
    }

    async function save() {
        if (totalWeight !== 100) return;
        setSaving(true);
        try {
            await updateAB({ id: qr._id, abDestinations: variants.length > 0 ? variants : null });
            setEditing(false);
        } finally { setSaving(false); }
    }

    async function clear() {
        setSaving(true);
        try {
            await updateAB({ id: qr._id, abDestinations: null });
            setVariants([]); setEditing(false);
        } finally { setSaving(false); }
    }

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing || hasAB ? "1rem" : 0 }}>
                <h4 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", margin: 0 }}>
                    <ZapIcon size={16} style={{ color: "var(--color-accent)" }} /> A/B Testing
                </h4>
                {!editing && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(true); if (!hasAB) addVariant(); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <EditIcon size={13} /> {hasAB ? "Wijzigen" : "Instellen"}
                    </button>
                )}
            </div>

            {!editing && hasAB && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {qr.abDestinations!.map((v, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "0.5rem 0.75rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem",
                        }}>
                            <span style={{ fontWeight: 600 }}>{v.label}</span>
                            <span style={{ color: "var(--color-text-muted)", fontFamily: "monospace", fontSize: "0.75rem" }}>
                                {v.weight}% → {v.url.slice(0, 40)}{v.url.length > 40 ? "…" : ""}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {variants.map((v, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input className="input" value={v.label} onChange={(e) => updateVariant(i, "label", e.target.value)}
                                placeholder="Label" style={{ width: "100px", fontSize: "0.8125rem" }} />
                            <input className="input" value={v.url} onChange={(e) => updateVariant(i, "url", e.target.value)}
                                placeholder="https://..." style={{ flex: 1, fontSize: "0.8125rem", fontFamily: "monospace" }} />
                            <input type="number" className="input" value={v.weight} min={0} max={100}
                                onChange={(e) => updateVariant(i, "weight", parseInt(e.target.value) || 0)}
                                style={{ width: "60px", fontSize: "0.8125rem", textAlign: "center" }} />
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-faint)" }}>%</span>
                            <button onClick={() => removeVariant(i)} style={{
                                background: "none", border: "none", cursor: "pointer", color: "var(--color-text-faint)", padding: "2px", lineHeight: 0,
                            }}>
                                <XIcon size={14} />
                            </button>
                        </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={addVariant}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem", alignSelf: "flex-start" }}>
                        <PlusIcon size={13} /> Variant toevoegen
                    </button>
                    {totalWeight !== 100 && variants.length > 0 && (
                        <p style={{ fontSize: "0.75rem", color: "var(--color-error, #ef4444)" }}>
                            Gewichten tellen op tot {totalWeight}% — moet 100% zijn.
                        </p>
                    )}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving || (variants.length > 0 && totalWeight !== 100)}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <CheckIcon size={13} /> {saving ? "..." : "Opslaan"}
                        </button>
                        {hasAB && (
                            <button className="btn btn-danger btn-sm" onClick={clear} disabled={saving}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <TrashIcon size={13} /> Uitschakelen
                            </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setVariants(qr.abDestinations ?? []); }}>Annuleren</button>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Geo Rules Card ───────────────────────────────────────────────────────────

export function GeoRulesCard({ qr }: { qr: QRCode }) {
    const updateGeo = useMutation(api.qrCodes.updateGeoRules);
    const [editing, setEditing] = useState(false);
    const [rules, setRules] = useState<{ country: string; destination: string }[]>(qr.geoRules ?? []);
    const [saving, setSaving] = useState(false);

    const hasRules = qr.geoRules && qr.geoRules.length > 0;

    function addRule() {
        setRules([...rules, { country: "", destination: "" }]);
    }

    function updateRule(i: number, field: string, value: string) {
        const copy = [...rules];
        copy[i] = { ...copy[i], [field]: value };
        setRules(copy);
    }

    function removeRule(i: number) {
        setRules(rules.filter((_, idx) => idx !== i));
    }

    async function save() {
        const valid = rules.filter((r) => r.country.trim() && r.destination.trim());
        setSaving(true);
        try {
            await updateGeo({ id: qr._id, geoRules: valid.length > 0 ? valid : null });
            setRules(valid); setEditing(false);
        } finally { setSaving(false); }
    }

    async function clear() {
        setSaving(true);
        try {
            await updateGeo({ id: qr._id, geoRules: null });
            setRules([]); setEditing(false);
        } finally { setSaving(false); }
    }

    return (
        <div className="card" style={{ padding: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: editing || hasRules ? "1rem" : 0 }}>
                <h4 style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", margin: 0 }}>
                    <GlobeIcon size={16} style={{ color: "var(--color-accent)" }} /> Geo-targeting
                </h4>
                {!editing && (
                    <button className="btn btn-secondary btn-sm" onClick={() => { setEditing(true); if (!hasRules) addRule(); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                        <EditIcon size={13} /> {hasRules ? "Wijzigen" : "Instellen"}
                    </button>
                )}
            </div>

            {!editing && hasRules && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
                    {qr.geoRules!.map((r, i) => (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "0.5rem 0.75rem", background: "var(--color-bg-2)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem",
                        }}>
                            <span style={{ fontWeight: 600 }}>{r.country}</span>
                            <span style={{ color: "var(--color-text-muted)", fontFamily: "monospace", fontSize: "0.75rem" }}>
                                → {r.destination.slice(0, 40)}{r.destination.length > 40 ? "…" : ""}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            {editing && (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {rules.map((r, i) => (
                        <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <input className="input" value={r.country} onChange={(e) => updateRule(i, "country", e.target.value)}
                                placeholder="Land (bv. Netherlands)" style={{ width: "160px", fontSize: "0.8125rem" }} />
                            <span style={{ color: "var(--color-text-faint)", fontSize: "0.8125rem" }}>→</span>
                            <input className="input" value={r.destination} onChange={(e) => updateRule(i, "destination", e.target.value)}
                                placeholder="https://..." style={{ flex: 1, fontSize: "0.8125rem", fontFamily: "monospace" }} />
                            <button onClick={() => removeRule(i)} style={{
                                background: "none", border: "none", cursor: "pointer", color: "var(--color-text-faint)", padding: "2px", lineHeight: 0,
                            }}>
                                <XIcon size={14} />
                            </button>
                        </div>
                    ))}
                    <button className="btn btn-ghost btn-sm" onClick={addRule}
                        style={{ display: "flex", alignItems: "center", gap: "0.375rem", alignSelf: "flex-start" }}>
                        <PlusIcon size={13} /> Regel toevoegen
                    </button>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}
                            style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                            <CheckIcon size={13} /> {saving ? "..." : "Opslaan"}
                        </button>
                        {hasRules && (
                            <button className="btn btn-danger btn-sm" onClick={clear} disabled={saving}
                                style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
                                <TrashIcon size={13} /> Uitschakelen
                            </button>
                        )}
                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditing(false); setRules(qr.geoRules ?? []); }}>Annuleren</button>
                    </div>
                </div>
            )}
        </div>
    );
}
