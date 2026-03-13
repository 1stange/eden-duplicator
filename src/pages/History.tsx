import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useHistory, useClearHistory } from "@/hooks/useSupabaseData";
import { Clock, Eye, Heart, Phone, PlusCircle, Trash2 } from "lucide-react";

const actionIcons: Record<string, React.ReactNode> = {
  view: <Eye className="h-3.5 w-3.5 text-eden-info" />,
  favorite: <Heart className="h-3.5 w-3.5 text-destructive" />,
  contact: <Phone className="h-3.5 w-3.5 text-eden-success" />,
  publish: <PlusCircle className="h-3.5 w-3.5 text-primary" />,
};
const actionLabels: Record<string, string> = { view: "Consulté", favorite: "Ajouté aux favoris", contact: "Contacté", publish: "Publié" };

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: entries = [] } = useHistory();
  const clearHistory = useClearHistory();

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="eden-section-title">Historique</h1>
          <p className="text-sm text-muted-foreground">{entries.length} activité{entries.length > 1 ? "s" : ""}</p>
        </div>
        {entries.length > 0 && (
          <button onClick={() => clearHistory.mutate()} className="text-sm text-destructive hover:underline flex items-center gap-1">
            <Trash2 className="h-4 w-4" /> Effacer
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry: any) => (
            <button key={entry.id} onClick={() => navigate(`/ad/${entry.ad_id}`)}
              className="w-full text-left eden-card p-3 flex items-center gap-3 transition-all hover:border-primary/20">
              <img src={entry.ad_image || "/placeholder.svg"} alt={entry.ad_title} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{entry.ad_title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {actionIcons[entry.action]}
                  <span className="text-xs text-muted-foreground">{actionLabels[entry.action]}</span>
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground shrink-0">{new Date(entry.created_at).toLocaleDateString("fr-FR")}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
