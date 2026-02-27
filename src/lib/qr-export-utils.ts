/**
 * Enterprise QR export utilities
 * Handles: DPI metadata injection, SVG cleanup, WEBP conversion, download triggering.
 */

// ─────────────────────────────────────────────────────────────────────────────
// PNG DPI injection — adds a pHYs chunk (ISO 15948)
// ─────────────────────────────────────────────────────────────────────────────

/** Minimal CRC32 for PNG chunk validation (poly = 0xEDB88320). */
function crc32(data: Uint8Array): number {
    let crc = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
        crc ^= data[i];
        for (let j = 0; j < 8; j++) {
            crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
        }
    }
    return (crc ^ 0xffffffff) >>> 0;
}

function writeUint32BE(buf: Uint8Array, offset: number, value: number) {
    buf[offset] = (value >>> 24) & 0xff;
    buf[offset + 1] = (value >>> 16) & 0xff;
    buf[offset + 2] = (value >>> 8) & 0xff;
    buf[offset + 3] = value & 0xff;
}

/**
 * Inject a `pHYs` chunk into a PNG blob.
 * This embeds DPI metadata so that Photoshop, Illustrator, InDesign, etc.
 * open the file at the correct physical print size without manual intervention.
 *
 * @param blob  Raw PNG blob from qr-code-styling
 * @param dpi   Target dots-per-inch (e.g. 300)
 * @returns     New Blob with pHYs chunk inserted after IHDR
 */
export async function pngInjectDPI(blob: Blob, dpi: number): Promise<Blob> {
    const pxPerMeter = Math.round(dpi / 0.0254); // 300 dpi → 11811 px/m

    // Build 9-byte pHYs data: X density (4), Y density (4), unit=1 (metre)
    const physData = new Uint8Array(9);
    writeUint32BE(physData, 0, pxPerMeter);
    writeUint32BE(physData, 4, pxPerMeter);
    physData[8] = 1; // unit: metre

    // Chunk type 'pHYs' = [0x70, 0x48, 0x59, 0x73]
    const typeBytes = new Uint8Array([0x70, 0x48, 0x59, 0x73]);

    // CRC covers type + data
    const crcInput = new Uint8Array(4 + 9);
    crcInput.set(typeBytes, 0);
    crcInput.set(physData, 4);
    const checksum = crc32(crcInput);

    // Full pHYs chunk: length(4) + type(4) + data(9) + crc(4) = 21 bytes
    const chunk = new Uint8Array(21);
    writeUint32BE(chunk, 0, 9);           // data length
    chunk.set(typeBytes, 4);              // chunk type
    chunk.set(physData, 8);              // data
    writeUint32BE(chunk, 17, checksum);   // CRC

    // PNG layout:
    //   [0..7]   — 8-byte PNG signature
    //   [8..32]  — IHDR chunk (4 len + 4 type + 13 data + 4 crc = 25 bytes)
    //   [33+]    — remaining chunks (insert pHYs here, before IDAT)
    const src = new Uint8Array(await blob.arrayBuffer());
    const insertAt = 33;
    const result = new Uint8Array(src.length + chunk.length);
    result.set(src.subarray(0, insertAt), 0);
    result.set(chunk, insertAt);
    result.set(src.subarray(insertAt), insertAt + chunk.length);

    return new Blob([result], { type: "image/png" });
}

// ─────────────────────────────────────────────────────────────────────────────
// SVG post-processing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Clean and enhance the raw SVG string produced by qr-code-styling:
 * - Ensures `viewBox="0 0 {size} {size}"` for infinite scalability in Illustrator/Figma
 * - Ensures `xmlns="http://www.w3.org/2000/svg"` for standalone SVG use
 * - Adds `shape-rendering="crispEdges"` for pixel-perfect dots at any zoom level
 * - Removes empty `<defs/>` blocks
 * - Collapses inter-tag whitespace (~30% smaller file)
 */
export function cleanSVG(svgText: string, size: number): string {
    // 1. Patch the <svg> opening tag
    let svg = svgText.replace(/<svg([^>]*)>/, (_match, attrs: string) => {
        let a = attrs;
        if (!a.includes("viewBox")) a += ` viewBox="0 0 ${size} ${size}"`;
        if (!a.includes("xmlns=")) a += ` xmlns="http://www.w3.org/2000/svg"`;
        if (!a.includes("shape-rendering")) a += ` shape-rendering="crispEdges"`;
        return `<svg${a}>`;
    });

    // 2. Remove empty <defs/> or <defs></defs>
    svg = svg.replace(/<defs\s*\/>/g, "");
    svg = svg.replace(/<defs>\s*<\/defs>/g, "");

    // 3. Collapse whitespace between tags (keeps file compact)
    svg = svg.replace(/>\s+</g, "><");

    return svg.trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBP conversion
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert a PNG blob to WEBP via an in-memory canvas.
 * qr-code-styling renders at `size × size`; we preserve that resolution exactly.
 * WEBP at quality=0.92 is ~30% smaller than PNG with near-identical visual fidelity.
 */
export function pngToWebp(pngBlob: Blob, quality = 0.92): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(pngBlob);
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) { reject(new Error("Canvas 2D context unavailable")); return; }
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            canvas.toBlob(
                (blob) => blob ? resolve(blob) : reject(new Error("WEBP conversion failed")),
                "image/webp",
                quality,
            );
        };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
        img.src = url;
    });
}

// ─────────────────────────────────────────────────────────────────────────────
// Download trigger
// ─────────────────────────────────────────────────────────────────────────────

/** Programmatically trigger a file download from a Blob. */
export function triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    // Cleanup after browser has processed the click
    setTimeout(() => { URL.revokeObjectURL(url); document.body.removeChild(a); }, 100);
}

// ─────────────────────────────────────────────────────────────────────────────
// Size presets
// ─────────────────────────────────────────────────────────────────────────────

export const QR_SIZE_PRESETS = {
    screen: { px: 1024, label: "Screen", sub: "1024 px", dpi: 96 },
    print: { px: 2400, label: "Print", sub: "2400 px · 300 DPI", dpi: 300 },
    poster: { px: 4800, label: "Poster", sub: "4800 px · 300 DPI", dpi: 300 },
} as const;

export type SizePreset = keyof typeof QR_SIZE_PRESETS;
