import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreateAd } from "@/hooks/useSupabaseData";
import { uploadAdMedia } from "@/lib/storage";
import { CATEGORIES, CONGO_CITIES } from "@/types";
import { ArrowLeft, ImagePlus, Send, X, Camera, Video } from "lucide-react";

export default function Publish() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createAd = useCreateAd();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState(user?.city || "Brazzaville");
  const [isPremium, setIsPremium] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [error, setError] = useState("");
  const [imageAspect, setImageAspect] = useState<"16:9" | "1:1">("16:9");
  const [imageFiles, setImageFiles] = useState<{ file: File; preview: string }[]>([]);
  const [videoFile, setVideoFile] = useState<{ file: File; preview: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (imageFiles.length >= 3) return;
      const preview = URL.createObjectURL(file);
      setImageFiles((prev) => prev.length < 3 ? [...prev, { file, preview }] : prev);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { setError("La vidéo ne doit pas dépasser 50 Mo."); return; }
    setVideoFile({ file, preview: URL.createObjectURL(file) });
    if (videoInputRef.current) videoInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !description || !category) { setError("Veuillez remplir tous les champs obligatoires."); return; }

    setUploading(true);
    try {
      // Upload images to storage
      const imageUrls: string[] = [];
      for (const img of imageFiles) {
        const url = await uploadAdMedia(user.id, img.file, "image", imageAspect);
        if (url) imageUrls.push(url);
      }

      // Upload video if present
      let videoUrl: string | null = null;
      if (videoFile) {
        videoUrl = await uploadAdMedia(user.id, videoFile.file, "video");
      }

      const adImages = imageUrls.length > 0 ? imageUrls : ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"];

      await createAd.mutateAsync({
        title, description, price: Number(price) || 0, currency: "FCFA", category, city,
        images: adImages, video: videoUrl, user_id: user.id, user_name: user.pseudo || user.name, user_phone: user.phone,
        is_premium: isPremium, is_urgent: isUrgent,
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Erreur lors de la publication.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>
      <h1 className="eden-section-title mb-6">Publier une annonce</h1>
      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photos */}
        <div className="eden-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground flex items-center gap-2"><Camera className="h-4 w-4 text-primary" /> Photos ({imageFiles.length}/3)</h3>
            <div className="flex gap-1 bg-muted rounded-lg p-0.5">
              {(["16:9", "1:1"] as const).map((r) => (
                <button key={r} type="button" onClick={() => setImageAspect(r)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all ${imageAspect === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">Les photos seront redimensionnées au format <strong>{imageAspect}</strong> pour s'afficher correctement.</p>
          <div className={`grid gap-2 ${imageAspect === "16:9" ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-3"}`}>
            {imageFiles.map((img, i) => (
              <div key={i} className={`relative ${imageAspect === "16:9" ? "aspect-video" : "aspect-square"} rounded-lg overflow-hidden border bg-muted`}>
                <img src={img.preview} alt={`Photo ${i + 1}`} className="w-full h-full object-contain" />
                <button type="button" onClick={() => setImageFiles((prev) => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {imageFiles.length < 3 && (
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`${imageAspect === "16:9" ? "aspect-video" : "aspect-square"} rounded-lg border-2 border-dashed border-input hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors`}>
                <ImagePlus className="h-5 w-5 text-muted-foreground" /><span className="text-[10px] text-muted-foreground">Ajouter</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </div>

        {/* Video */}
        <div className="eden-card p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Video className="h-4 w-4 text-primary" /> Vidéo ({videoFile ? "1" : "0"}/1)</h3>
          {videoFile ? (
            <div className="relative rounded-lg overflow-hidden border aspect-video">
              <video src={videoFile.preview} controls className="w-full h-full object-cover" />
              <button type="button" onClick={() => setVideoFile(null)} className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground">
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => videoInputRef.current?.click()} className="w-full aspect-video rounded-lg border-2 border-dashed border-input hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors">
              <Video className="h-8 w-8 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Ajouter une vidéo (max 50 Mo)</span>
            </button>
          )}
          <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
        </div>

        <div className="eden-card p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Massage relaxant..." className="eden-input" required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre annonce..." className="eden-input min-h-[100px] resize-y" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Prix (FCFA)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0 = Gratuit" className="eden-input" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Catégorie *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="eden-input" required>
                <option value="">Choisir...</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Ville</label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="eden-input">
              {CONGO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="eden-card p-4">
          <h3 className="font-semibold text-foreground mb-3">Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-4 h-4 rounded border-input accent-accent" />
              <div><p className="text-sm font-medium text-foreground">⭐ Premium</p><p className="text-xs text-muted-foreground">Mise en avant</p></div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 rounded border-input accent-destructive" />
              <div><p className="text-sm font-medium text-foreground">🔥 Urgent</p><p className="text-xs text-muted-foreground">Signaler comme urgent</p></div>
            </label>
          </div>
        </div>

        <button type="submit" disabled={uploading || createAd.isPending} className="eden-btn-primary w-full disabled:opacity-50">
          <Send className="h-4 w-4 mr-2" /> {uploading ? "Upload en cours..." : createAd.isPending ? "Publication..." : "Publier l'annonce"}
        </button>
      </form>
    </div>
  );
}
