import { useNavigate } from "react-router-dom";
import { useFavoriteAds, useToggleFavorite } from "@/hooks/useSupabaseData";
import { Heart, MapPin, Eye, Trash2 } from "lucide-react";

function formatPrice(price: number, currency: string) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}

export default function Favorites() {
  const navigate = useNavigate();
  const { data: favAds = [] } = useFavoriteAds();
  const toggleFav = useToggleFavorite();

  const removeFav = (adId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFav.mutate(adId);
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="eden-section-title mb-1">Mes Favoris</h1>
      <p className="text-sm text-muted-foreground mb-6">{favAds.length} annonce{favAds.length > 1 ? "s" : ""} sauvegardée{favAds.length > 1 ? "s" : ""}</p>

      {favAds.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">Aucun favori pour le moment</p>
          <button onClick={() => navigate("/search")} className="eden-btn-primary mt-2">Explorer les annonces</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {favAds.map((ad: any) => (
            <div key={ad.id} onClick={() => navigate(`/ad/${ad.id}`)} className="eden-card cursor-pointer overflow-hidden group">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={ad.images?.[0] || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <button onClick={(e) => removeFav(ad.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm">
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
      )}
    </div>
  );
}
