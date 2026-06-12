// LocalStorage build: files are converted to base64 data URLs (no cloud upload).
// Images are normalized via canvas (avatars 1:1, ad media 16:9 by default).
import { resizeToDataUrl, type AspectRatio } from "./imageResize";

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export async function uploadFile(_bucket: string, _path: string, file: File): Promise<string | null> {
  try { return await fileToDataUrl(file); } catch { return null; }
}

export async function uploadAdMedia(
  _userId: string,
  file: File,
  type: "image" | "video",
  aspect: AspectRatio = "16:9",
): Promise<string | null> {
  try {
    if (type === "image") {
      return await resizeToDataUrl(file, { aspect, maxWidth: 1280, mode: "contain", background: "#111" });
    }
    return await fileToDataUrl(file);
  } catch { return null; }
}

export async function uploadAvatar(_userId: string, file: File): Promise<string | null> {
  try {
    return await resizeToDataUrl(file, { aspect: "1:1", maxWidth: 512, mode: "cover" });
  } catch { return null; }
}
