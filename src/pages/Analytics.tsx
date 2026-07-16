import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAds, useUserAds, useFavorites, useConversations } from "@/hooks/useLocalData";
import { CATEGORIES } from "@/types";
import { BarChart3, Eye, Heart, MessageSquare, TrendingUp, Users, ChevronRight, PlusCircle, Package, Loader2 } from "lucide-react";

const PAGE_SIZE = 10;

export default function Analytics() {
  const { user, isAdmin } = useAuth();
  const { data: allAds = [] } = useAds();
  const { data: userAds = [] } = useUserAds();
  const { data: favs = [] } = useFavorites();
  const { data: conversations = [] } = useConversations();

  const isSeller = !isAdmin;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const sortedUserAds = useMemo(
    () => [...userAds].sort((a: any, b: any) => (b.created_at || 0) - (a.created_at || 0) || (b.views || 0) - (a.views || 0)),
    [userAds]
  );
  const visibleAds = sortedUserAds.slice(0, visibleCount);
  const hasMore = visibleCount < sortedUserAds.length;

  const stats = useMemo(() => {
    const totalViews = userAds.reduce((sum: number, a: any) => sum + (a.views || 0), 0);
    const categoryStats = CATEGORIES.map((c) => ({
      ...c, count: allAds.filter((a: any) => a.category === c.id).length,
    })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
    const topAds = [...userAds].sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
    return { totalViews, categoryStats, topAds };
  }, [allAds, userAds]);

  return (
    <div className="p-4 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <h1 className="eden-section-title">{isSeller ? "Mes annonces" : "Analytiques"}</h1>
        {isSeller && (
          <Link to="/publish" className="eden-btn-primary px-3 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5">
            <PlusCircle className="h-4 w-4" /> Publier
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Mes annonces", value: userAds.length, icon: TrendingUp, color: "text-primary" },
          { label: "Total vues", value: stats.totalViews, icon: Eye, color: "text-eden-info" },
          { label: "Favoris", value: favs.length, icon: Heart, color: "text-destructive" },
          { label: "Conversations", value: conversations.length, icon: MessageSquare, color: "text-accent" },
        ].map((s) => (
          <div key={s.label} className="eden-card p-4">
            <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
            <p className="text-2xl font-bold font-display text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {isSeller && (
        <div className="eden-card p-4 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-primary" /> Consulter mes annonces
          </h2>
          {userAds.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-3">Vous n'avez pas encore d'annonces.</p>
              <Link to="/publish" className="eden-btn-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold">
                <PlusCircle className="h-4 w-4" /> Publier ma première annonce
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {userAds.map((ad: any) => (
                <Link
                  key={ad.id}
                  to={`/ad/${ad.id}`}
                  className="flex items-center gap-3 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
                >
                  <img
                    src={ad.images?.[0] || "/placeholder.svg"}
                    alt={ad.title}
                    className="w-14 h-14 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {ad.city} · {ad.price?.toLocaleString()} {ad.currency || "FCFA"}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views || 0}</span>
                      {ad.isPremium && <span className="text-primary font-semibold">★ Premium</span>}
                      {ad.isUrgent && <span className="text-destructive font-semibold">Urgent</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="eden-card p-4 mb-6">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" /> Par catégorie</h2>
        <div className="space-y-3">
          {stats.categoryStats.map((cat) => {
            const pct = allAds.length > 0 ? Math.round((cat.count / allAds.length) * 100) : 0;
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-foreground">{cat.icon} {cat.name}</span>
                  <span className="text-muted-foreground">{cat.count} ({pct}%)</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full eden-gradient rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {isSeller && stats.topAds.length > 0 && (
        <div className="eden-card p-4">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Top vues (mes annonces)</h2>
          <div className="space-y-3">
            {stats.topAds.slice(0, 5).map((ad: any, i: number) => (
              <Link key={ad.id} to={`/ad/${ad.id}`} className="flex items-center gap-3 hover:bg-muted/40 -mx-2 px-2 py-1 rounded-lg transition-colors">
                <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
                <img src={ad.images?.[0] || "/placeholder.svg"} alt={ad.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">{ad.city}</p>
                </div>
                <span className="text-sm text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views || 0}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
