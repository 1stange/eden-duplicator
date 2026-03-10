import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ads as adsStorage, favorites as favStorage } from "@/lib/localStorage";
import { useAuth } from "@/contexts/AuthContext";
import { CATEGORIES } from "@/types";
import { Heart, Eye, MapPin, Star, ChevronRight, PlusCircle, TrendingUp } from "lucide-react";

function formatPrice(price: number, currency: string) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const allAds = adsStorage.getAll();
  const premiumAds = allAds.filter((a) => a.isPremium);
  const recentAds = allAds.slice(0, 12);
  const [favs, setFavs] = useState<string[]>(favStorage.getAll());

  const toggleFav = (adId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    favStorage.toggle(adId);
    setFavs(favStorage.getAll());
  };

  const categoriesWithCount = CATEGORIES.map((c) => ({
    ...c,
    count: allAds.filter((a) => a.category === c.id).length,
  }));

  return (
    <div className="pb-8">
      {/* Hero */}
      <div className="eden-gradient px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground mb-2">
            Bienvenue sur Eden 🌿
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-base mb-6">
            La plateforme de petites annonces du Congo-Brazzaville
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate("/search")} className="eden-btn-gold">
              Explorer les annonces
            </button>
            <button onClick={() => navigate("/publish")} className="bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-foreground/30 transition-colors inline-flex items-center gap-2">
              <PlusCircle className="h-4 w-4" /> Publier
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 -mt-6 mb-8">
          {[
            { label: "Annonces", value: allAds.length, icon: TrendingUp },
            { label: "Villes", value: "15+", icon: MapPin },
            { label: "Catégories", value: CATEGORIES.length, icon: Star },
          ].map((s) => (
            <div key={s.label} className="eden-card p-3 md:p-4 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg md:text-2xl font-bold font-display text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="eden-section-title">Catégories</h2>
            <button onClick={() => navigate("/search")} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {categoriesWithCount.map((cat) => (
              <button
                key={cat.id}
                onClick={() => navigate(`/search?category=${cat.id}`)}
                className="eden-card p-3 text-center hover:border-primary/30 transition-all group"
              >
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <p className="text-xs font-medium text-foreground truncate">{cat.name}</p>
                <p className="text-[10px] text-muted-foreground">{cat.count} annonces</p>
              </button>
            ))}
          </div>
        </div>

        {/* Premium Ads */}
        {premiumAds.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-accent" />
              <h2 className="eden-section-title">Annonces Premium</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {premiumAds.map((ad) => (
                <div
                  key={ad.id}
                  onClick={() => navigate(`/ad/${ad.id}`)}
                  className="eden-card min-w-[260px] max-w-[280px] cursor-pointer overflow-hidden group flex-shrink-0 border-accent/30 animate-pulse-gold"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 eden-badge-premium">⭐ Premium</span>
                    <button onClick={(e) => toggleFav(ad.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm">
                      <Heart className={`h-4 w-4 ${favs.includes(ad.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                    </button>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-foreground truncate">{ad.title}</h3>
                    <p className="text-primary font-bold text-sm mt-1">{formatPrice(ad.price, ad.currency)}</p>
                    <div className="flex items-center justify-between mt-2 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ad.city}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Ads */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="eden-section-title">Annonces récentes</h2>
            <button onClick={() => navigate("/search")} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {recentAds.map((ad, i) => (
              <div
                key={ad.id}
                onClick={() => navigate(`/ad/${ad.id}`)}
                className="eden-card cursor-pointer overflow-hidden group animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {ad.isUrgent && <span className="absolute top-2 left-2 eden-badge bg-destructive text-destructive-foreground">🔥 Urgent</span>}
                  <button onClick={(e) => toggleFav(ad.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm">
                    <Heart className={`h-4 w-4 ${favs.includes(ad.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
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
        </div>
      </div>
    </div>
  );
}
