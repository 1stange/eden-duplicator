import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ads as adsStorage } from "@/lib/localStorage";
import { CATEGORIES, CONGO_CITIES } from "@/types";
import { ArrowLeft, ImagePlus, Send } from "lucide-react";

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

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!title || !description || !category) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    adsStorage.create({
      title,
      description,
      price: Number(price) || 0,
      currency: "FCFA",
      category,
      city,
      images: ["https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600"],
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
