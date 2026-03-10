import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ads as adsStorage, favorites as favStorage } from "@/lib/localStorage";
import { CATEGORIES, CONGO_CITIES } from "@/types";
import { Search as SearchIcon, SlidersHorizontal, X, Heart, Eye, MapPin } from "lucide-react";

function formatPrice(price: number, currency: string) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc">("recent");
  const [favs, setFavs] = useState<string[]>(favStorage.getAll());

  const results = useMemo(() => {
    let res = adsStorage.search(query, {
      category: category || undefined,
      city: city || undefined,
    });
    if (sortBy === "price-asc") res.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") res.sort((a, b) => b.price - a.price);
    return res;
  }, [query, category, city, sortBy]);

  const toggleFav = (adId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    favStorage.toggle(adId);
    setFavs(favStorage.getAll());
  };

  const activeFilters = [category, city].filter(Boolean).length;

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Search Bar */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une annonce..."
            className="eden-input pl-10"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-3 rounded-lg border transition-colors flex items-center gap-1.5 text-sm ${showFilters ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilters > 0 && <span className="eden-badge-premium text-[10px] px-1">{activeFilters}</span>}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="eden-card p-4 mb-4 animate-fade-in space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catégorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="eden-input text-sm">
                <option value="">Toutes les catégories</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ville</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="eden-input text-sm">
                <option value="">Toutes les villes</option>
                {CONGO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tri</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="eden-input text-sm">
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
          {activeFilters > 0 && (
            <button onClick={() => { setCategory(""); setCity(""); }} className="text-xs text-primary hover:underline">
              Effacer les filtres
            </button>
          )}
        </div>
      )}

      {/* Category pills (quick) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
        <button
          onClick={() => setCategory("")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          Tout
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
          >
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <p className="text-sm text-muted-foreground mb-3">{results.length} résultat{results.length > 1 ? "s" : ""}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {results.map((ad) => (
          <div key={ad.id} onClick={() => navigate(`/ad/${ad.id}`)} className="eden-card cursor-pointer overflow-hidden group">
            <div className="relative aspect-[4/3] overflow-hidden">
              <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              {ad.isPremium && <span className="absolute top-2 left-2 eden-badge-premium text-[10px]">⭐ Premium</span>}
              {ad.isUrgent && <span className="absolute top-2 left-2 eden-badge bg-destructive text-destructive-foreground text-[10px]">🔥 Urgent</span>}
              <button onClick={(e) => toggleFav(ad.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm">
                <Heart className={`h-3.5 w-3.5 ${favs.includes(ad.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
            </div>
            <div className="p-3">
              <h3 className="font-medium text-sm text-foreground line-clamp-2">{ad.title}</h3>
              <p className="text-primary font-bold text-sm mt-1">{formatPrice(ad.price, ad.currency)}</p>
              <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ad.city}</span>
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune annonce trouvée</p>
        </div>
      )}
    </div>
  );
}
