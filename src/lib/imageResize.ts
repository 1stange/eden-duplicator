// Image resize utility — fit-into a target aspect ratio with letterboxing.
// Used to normalize uploaded images for avatars (1:1) and ad media (16:9 or 1:1).

export type AspectRatio = "1:1" | "16:9";

const RATIOS: Record<AspectRatio, number> = {
  "1:1": 1,
  "16:9": 16 / 9,
};

interface ResizeOptions {
  aspect: AspectRatio;
  maxWidth?: number;       // max output width (px)
  background?: string;     // letterbox bg
  quality?: number;        // jpeg quality
  mode?: "contain" | "cover"; // contain = no crop (letterbox); cover = crop to fill
}

function loadImage(file: File | Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { resolve(img); URL.revokeObjectURL(url); };
    img.onerror = (e) => { reject(e); URL.revokeObjectURL(url); };
    img.src = url;
  });
}

export async function resizeImage(file: File, opts: ResizeOptions): Promise<Blob> {
  const { aspect, maxWidth = 1280, background = "#000", quality = 0.9, mode = "contain" } = opts;
  const ratio = RATIOS[aspect];
  const img = await loadImage(file);

  const outW = Math.min(maxWidth, Math.max(img.width, 512));
  const outH = Math.round(outW / ratio);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, outW, outH);

  const srcRatio = img.width / img.height;
  let dx = 0, dy = 0, dw = outW, dh = outH, sx = 0, sy = 0, sw = img.width, sh = img.height;

  if (mode === "contain") {
    if (srcRatio > ratio) { dw = outW; dh = Math.round(outW / srcRatio); dy = Math.round((outH - dh) / 2); }
    else { dh = outH; dw = Math.round(outH * srcRatio); dx = Math.round((outW - dw) / 2); }
  } else {
    // cover: crop source to match target ratio
    if (srcRatio > ratio) { sw = Math.round(img.height * ratio); sx = Math.round((img.width - sw) / 2); }
    else { sh = Math.round(img.width / ratio); sy = Math.round((img.height - sh) / 2); }
  }

  ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/jpeg", quality)
  );
}

export async function resizeToDataUrl(file: File, opts: ResizeOptions): Promise<string> {
  const blob = await resizeImage(file, opts);
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

/** Pick aspect by source orientation: landscape -> 16:9, square/portrait -> 1:1 */
export async function autoAspectFromFile(file: File): Promise<AspectRatio> {
  try {
    const img = await loadImage(file);
    return img.width / img.height >= 1.25 ? "16:9" : "1:1";
  } catch { return "1:1"; }
}
