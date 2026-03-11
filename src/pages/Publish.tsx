import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ads as adsStorage } from "@/lib/localStorage";
import { CATEGORIES, CONGO_CITIES } from "@/types";
import { ArrowLeft, ImagePlus, Send, X, Camera } from "lucide-react";

export default function Publish() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [city, setCity] = useState(user?.city || "Brazzaville");
  const [isPremium, setIsPremium] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (images.length >= 5) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => prev.length < 5 ? [...prev, ev.target!.result as string] : prev);
        }
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !description || !category) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    const adImages = images.length > 0 ? images : ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"];
    adsStorage.create({
      title,
      description,
      price: Number(price) || 0,
      currency: "FCFA",
      category,
      city,
      images: adImages,
      userId: user.id,
      userName: user.name,
      userPhone: user.phone,
      isPremium,
      isUrgent,
    });
    navigate("/");
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <h1 className="eden-section-title mb-6">Publier une annonce</h1>

      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Images upload */}
        <div className="eden-card p-4">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Camera className="h-4 w-4 text-primary" /> Photos ({images.length}/5)
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border-2 border-dashed border-input hover:border-primary/50 flex flex-col items-center justify-center gap-1 transition-colors"
              >
                <ImagePlus className="h-5 w-5 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Ajouter</span>
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
        </div>

        <div className="eden-card p-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Titre *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: iPhone 14 Pro Max" className="eden-input" required />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Description *</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Décrivez votre annonce en détail..." className="eden-input min-h-[100px] resize-y" required />
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
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2"><ImagePlus className="h-4 w-4 text-primary" /> Options</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="w-4 h-4 rounded border-input accent-accent" />
              <div>
                <p className="text-sm font-medium text-foreground">⭐ Annonce Premium</p>
                <p className="text-xs text-muted-foreground">Mise en avant dans la page d'accueil</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)} className="w-4 h-4 rounded border-input accent-destructive" />
              <div>
                <p className="text-sm font-medium text-foreground">🔥 Urgent</p>
                <p className="text-xs text-muted-foreground">Signaler comme urgent</p>
              </div>
            </label>
          </div>
        </div>

        <button type="submit" className="eden-btn-primary w-full">
          <Send className="h-4 w-4 mr-2" /> Publier l'annonce
        </button>
      </form>
    </div>
  );
}
