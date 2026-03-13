import { useMemo } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAds, useUserAds, useFavorites, useConversations, useHistory } from "@/hooks/useSupabaseData";
import { CATEGORIES } from "@/types";
import { BarChart3, Eye, Heart, MessageSquare, TrendingUp, Users } from "lucide-react";

export default function Analytics() {
  const { user } = useAuth();
  const { data: allAds = [] } = useAds();
  const { data: userAds = [] } = useUserAds();
  const { data: favs = [] } = useFavorites();
  const { data: conversations = [] } = useConversations();
  const { data: history = [] } = useHistory();

  const stats = useMemo(() => {
    const totalViews = userAds.reduce((sum: number, a: any) => sum + (a.views || 0), 0);
    const categoryStats = CATEGORIES.map((c) => ({
      ...c, count: allAds.filter((a: any) => a.category === c.id).length,
    })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);
    const topAds = [...allAds].sort((a: any, b: any) => (b.views || 0) - (a.views || 0)).slice(0, 5);
    return { totalViews, categoryStats, topAds };
  }, [allAds, userAds]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="eden-section-title mb-6">Analytiques</h1>
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

      <div className="eden-card p-4">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Plus vues</h2>
        <div className="space-y-3">
          {stats.topAds.map((ad: any, i: number) => (
            <div key={ad.id} className="flex items-center gap-3">
              <span className="text-sm font-bold text-muted-foreground w-6">#{i + 1}</span>
              <img src={ad.images?.[0] || "/placeholder.svg"} alt={ad.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                <p className="text-xs text-muted-foreground">{ad.city}</p>
              </div>
              <span className="text-sm text-muted-foreground flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
