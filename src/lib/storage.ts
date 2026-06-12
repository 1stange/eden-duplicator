// LocalStorage build: files are converted to base64 data URLs (no cloud upload).
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

export async function uploadAdMedia(_userId: string, file: File, _type: "image" | "video"): Promise<string | null> {
  try { return await fileToDataUrl(file); } catch { return null; }
}

export async function uploadAvatar(_userId: string, file: File): Promise<string | null> {
  try { return await fileToDataUrl(file); } catch { return null; }
}
