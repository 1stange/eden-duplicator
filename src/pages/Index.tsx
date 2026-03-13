import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAds, useFavorites, useToggleFavorite } from "@/hooks/useSupabaseData";
import { CATEGORIES } from "@/types";
import { Heart, Eye, MapPin, Star, ChevronRight, PlusCircle, TrendingUp, Search } from "lucide-react";
import { motion } from "framer-motion";
import heroBg from "@/assets/hero-brazzaville.jpg";

function formatPrice(price: number, currency: string) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: allAds = [] } = useAds();
  const { data: favs = [] } = useFavorites();
  const toggleFavMut = useToggleFavorite();
  const premiumAds = allAds.filter((a: any) => a.is_premium);
  const recentAds = allAds.slice(0, 12);

  const toggleFav = (adId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavMut.mutate(adId);
  };

  const categoriesWithCount = CATEGORIES.map((c) => ({
    ...c,
    count: allAds.filter((a: any) => a.category === c.id).length,
  }));

  return (
    <div className="pb-8">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/60 to-background" />
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="relative px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-3xl md:text-5xl font-display font-bold text-primary-foreground mb-3 drop-shadow-lg">
              Bienvenue sur Eden 🌸
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-primary-foreground/90 text-sm md:text-lg mb-8 drop-shadow">
              La plateforme de petites annonces du Congo-Brazzaville
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button onClick={() => navigate("/search")} className="eden-btn-gold flex items-center gap-2 text-base px-6 py-3">
                <Search className="h-5 w-5" /> Explorer les annonces
              </button>
              <button onClick={() => navigate("/publish")} className="bg-primary-foreground/20 backdrop-blur-sm text-primary-foreground px-6 py-3 rounded-lg text-sm font-semibold hover:bg-primary-foreground/30 transition-colors inline-flex items-center gap-2">
                <PlusCircle className="h-4 w-4" /> Publier
              </button>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="grid grid-cols-3 gap-3 -mt-6 mb-8 relative z-10">
          {[
            { label: "Annonces", value: allAds.length, icon: TrendingUp },
            { label: "Villes", value: "15+", icon: MapPin },
            { label: "Catégories", value: CATEGORIES.length, icon: Star },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="eden-card p-3 md:p-4 text-center">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <p className="text-lg md:text-2xl font-bold font-display text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="eden-section-title">Catégories</h2>
            <button onClick={() => navigate("/search")} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-3">
            {categoriesWithCount.map((cat, i) => (
              <motion.button key={cat.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/search?category=${cat.id}`)}
                className="eden-card p-3 text-center hover:border-primary/30 transition-all">
                <span className="text-2xl block mb-1">{cat.icon}</span>
                <p className="text-[11px] font-medium text-foreground truncate">{cat.name}</p>
                <p className="text-[10px] text-muted-foreground">{cat.count}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {premiumAds.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-accent" />
              <h2 className="eden-section-title">Annonces Premium</h2>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
              {premiumAds.map((ad: any, i: number) => (
                <motion.div key={ad.id} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }} onClick={() => navigate(`/ad/${ad.id}`)}
                  className="eden-card min-w-[220px] sm:min-w-[260px] max-w-[280px] cursor-pointer overflow-hidden group flex-shrink-0 border-accent/30">
                  <div className="relative h-36 sm:h-40 overflow-hidden">
                    <img src={ad.images?.[0] || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-2 left-2 eden-badge-premium text-[10px]">⭐ Premium</span>
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
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="eden-section-title">Annonces récentes</h2>
            <button onClick={() => navigate("/search")} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {recentAds.map((ad: any, i: number) => (
              <motion.div key={ad.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3 }} onClick={() => navigate(`/ad/${ad.id}`)} className="eden-card cursor-pointer overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={ad.images?.[0] || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {ad.is_urgent && <span className="absolute top-2 left-2 eden-badge bg-destructive text-destructive-foreground text-[10px]">🔥 Urgent</span>}
                  <button onClick={(e) => toggleFav(ad.id, e)} className="absolute top-2 right-2 p-1.5 rounded-full bg-card/80 backdrop-blur-sm">
                    <Heart className={`h-4 w-4 ${favs.includes(ad.id) ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
                  </button>
                </div>
                <div className="p-2.5 sm:p-3">
                  <h3 className="font-medium text-xs sm:text-sm text-foreground line-clamp-2">{ad.title}</h3>
                  <p className="text-primary font-bold text-xs sm:text-sm mt-1">{formatPrice(ad.price, ad.currency)}</p>
                  <div className="flex items-center justify-between mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{ad.city}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {allAds.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Aucune annonce pour le moment. Soyez le premier à publier !</p>
              <button onClick={() => navigate("/publish")} className="eden-btn-primary mt-4">Publier une annonce</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
