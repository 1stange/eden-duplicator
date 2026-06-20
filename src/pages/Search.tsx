import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAds, useFavorites, useToggleFavorite, useAllProfiles } from "@/hooks/useLocalData";
import { useGeolocation } from "@/hooks/useGeolocation";
import { distanceFromUserToAd } from "@/lib/geo";
import { CATEGORIES, CONGO_CITIES, CITY_COORDS } from "@/types";
import { Search as SearchIcon, SlidersHorizontal, X, Heart, Eye, MapPin, Map as MapIcon, List, BadgeCheck, Navigation } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

function formatPrice(price: number, currency: string) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "";
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const [city, setCity] = useState("");
  const [priceMin, setPriceMin] = useState<string>("");
  const [priceMax, setPriceMax] = useState<string>("");
  const [maxDistance, setMaxDistance] = useState<number>(0); // 0 = no limit
  const [certifiedOnly, setCertifiedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "price-asc" | "price-desc" | "distance">("recent");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  const { pos, error: geoError, loading: geoLoading, request: requestGeo } = useGeolocation();
  const { data: allAds = [] } = useAds({ category: category || undefined, city: city || undefined, query: query || undefined });
  const { data: favs = [] } = useFavorites();
  const { data: profiles = [] } = useAllProfiles();
  const toggleFavMut = useToggleFavorite();

  const certifiedSet = useMemo(() => new Set(profiles.filter((p: any) => p.is_certified).map((p: any) => p.id)), [profiles]);

  const results = useMemo(() => {
    let res = allAds.map((a: any) => ({ ...a, _distance: distanceFromUserToAd(pos, a) }));
    const min = priceMin === "" ? null : Number(priceMin);
    const max = priceMax === "" ? null : Number(priceMax);
    if (min !== null && !isNaN(min)) res = res.filter((a: any) => (a.price || 0) >= min);
    if (max !== null && !isNaN(max)) res = res.filter((a: any) => (a.price || 0) <= max);
    if (certifiedOnly) res = res.filter((a: any) => certifiedSet.has(a.user_id));
    if (maxDistance > 0 && pos) res = res.filter((a: any) => a._distance != null && a._distance <= maxDistance);
    if (sortBy === "price-asc") res.sort((a: any, b: any) => a.price - b.price);
    else if (sortBy === "price-desc") res.sort((a: any, b: any) => b.price - a.price);
    else if (sortBy === "distance" && pos) res.sort((a: any, b: any) => (a._distance ?? 9999) - (b._distance ?? 9999));
    return res;
  }, [allAds, sortBy, pos, priceMin, priceMax, certifiedOnly, maxDistance, certifiedSet]);

  const toggleFav = (adId: string, e: React.MouseEvent) => { e.stopPropagation(); toggleFavMut.mutate(adId); };
  const activeFilters = [category, city, certifiedOnly ? "cert" : "", priceMin || priceMax ? "price" : "", maxDistance > 0 ? "dist" : ""].filter(Boolean).length;

  const adsByCity = useMemo(() => {
    const map: Record<string, any[]> = {};
    results.forEach((ad: any) => { if (!map[ad.city]) map[ad.city] = []; map[ad.city].push(ad); });
    return map;
  }, [results]);

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une annonce..." className="eden-input pl-10" />
          {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="h-4 w-4 text-muted-foreground" /></button>}
        </div>
        <button onClick={() => setViewMode(viewMode === "list" ? "map" : "list")} className="px-3 rounded-lg border border-input hover:bg-muted transition-colors flex items-center gap-1.5 text-sm">
          {viewMode === "list" ? <MapIcon className="h-4 w-4" /> : <List className="h-4 w-4" />}
        </button>
        <button onClick={() => setShowFilters(!showFilters)} className={`px-3 rounded-lg border transition-colors flex items-center gap-1.5 text-sm ${showFilters ? "bg-primary text-primary-foreground border-primary" : "border-input hover:bg-muted"}`}>
          <SlidersHorizontal className="h-4 w-4" />
          {activeFilters > 0 && <span className="eden-badge-premium text-[10px] px-1">{activeFilters}</span>}
        </button>
      </div>

      {showFilters && (
        <div className="eden-card p-4 mb-4 animate-fade-in space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Catégorie</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="eden-input text-sm">
                <option value="">Toutes</option>
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Ville</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="eden-input text-sm">
                <option value="">Toutes</option>
                {CONGO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Tri</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="eden-input text-sm">
                <option value="recent">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>
          {activeFilters > 0 && <button onClick={() => { setCategory(""); setCity(""); }} className="text-xs text-primary hover:underline">Effacer les filtres</button>}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-4 pb-1">
        <button onClick={() => setCategory("")} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${!category ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>Tout</button>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setCategory(c.id)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${category === c.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
            {c.icon} {c.name}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-3">{results.length} résultat{results.length > 1 ? "s" : ""}</p>

      {viewMode === "map" && (
        <div className="eden-card overflow-hidden mb-4 rounded-xl" style={{ height: "400px" }}>
          <MapContainer {...{ center: [-2.5, 15.0] as [number, number], zoom: 5, style: { height: "100%", width: "100%" }, scrollWheelZoom: true } as any}>
            <TileLayer {...{ attribution: '&copy; OpenStreetMap', url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" } as any} />
            {Object.entries(adsByCity).map(([cityName, cityAds]) => {
              const coords = CITY_COORDS[cityName];
              if (!coords) return null;
              return (
                <Marker key={cityName} position={coords}>
                  <Popup>
                    <div className="min-w-[180px]">
                      <p className="font-bold text-sm mb-1">{cityName}</p>
                      <p className="text-xs mb-2">{cityAds.length} annonce{cityAds.length > 1 ? "s" : ""}</p>
                      {cityAds.slice(0, 3).map((ad: any) => (
                        <div key={ad.id} onClick={() => navigate(`/ad/${ad.id}`)} className="cursor-pointer hover:bg-muted p-1 rounded text-xs mb-1">
                          <span className="font-medium">{ad.title}</span>
                          <span className="block text-primary font-bold">{formatPrice(ad.price, ad.currency)}</span>
                        </div>
                      ))}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {viewMode === "list" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {results.map((ad: any) => (
            <div key={ad.id} onClick={() => navigate(`/ad/${ad.id}`)} className="eden-card cursor-pointer overflow-hidden group">
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img src={ad.images?.[0] || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                {ad.is_premium && <span className="absolute top-2 left-2 eden-badge-premium text-[10px]">⭐ Premium</span>}
                {ad.is_urgent && <span className="absolute top-2 left-2 eden-badge bg-destructive text-destructive-foreground text-[10px]">🔥 Urgent</span>}
                <button onClick={(e) => toggleFav(ad.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm">
                  <Heart className={`h-3.5 w-3.5 ${favs.includes(ad.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                </button>
              </div>
              <div className="p-2.5 sm:p-3">
                <h3 className="font-medium text-xs sm:text-sm text-foreground line-clamp-2">{ad.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{ad.description}</p>
                <p className="text-primary font-bold text-xs sm:text-sm mt-1">{formatPrice(ad.price, ad.currency)}</p>
                <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ad.city}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">Aucune annonce trouvée</p>
        </div>
      )}
    </div>
  );
}
