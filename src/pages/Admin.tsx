import { useAuth } from "@/contexts/AuthContext";
import { useReports, useUpdateReport, useAllAds, useUpdateAdStatus } from "@/hooks/useSupabaseData";
import { Shield, AlertTriangle, Check, X, Eye, Ban } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  reviewed: "bg-eden-success/20 text-eden-success",
  dismissed: "bg-muted text-muted-foreground",
};

const reasonLabels: Record<string, string> = {
  spam: "Spam", inappropriate: "Contenu inapproprié", fraud: "Arnaque", underage: "Mineurs", other: "Autre",
};

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: reports = [] } = useReports();
  const { data: allAds = [] } = useAllAds();
  const updateReport = useUpdateReport();
  const updateAdStatus = useUpdateAdStatus();

  if (!isAdmin) {
    return (
      <div className="p-4 max-w-2xl mx-auto text-center py-16">
        <Shield className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
        <p className="text-muted-foreground">Accès réservé aux administrateurs</p>
      </div>
    );
  }

  const pendingReports = reports.filter((r: any) => r.status === "pending");
  const suspendedAds = allAds.filter((a: any) => a.status === "suspended");

  const handleApproveReport = (reportId: string) => {
    updateReport.mutate({ reportId, status: "reviewed", adStatus: "suspended" });
  };

  const handleDismissReport = (reportId: string) => {
    updateReport.mutate({ reportId, status: "dismissed" });
  };

  const handleRestoreAd = (adId: string) => {
    updateAdStatus.mutate({ adId, status: "active" });
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="eden-section-title mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" /> Administration & Modération
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="eden-card p-4 text-center">
          <AlertTriangle className="h-5 w-5 text-accent mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{pendingReports.length}</p>
          <p className="text-xs text-muted-foreground">Signalements en attente</p>
        </div>
        <div className="eden-card p-4 text-center">
          <Ban className="h-5 w-5 text-destructive mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{suspendedAds.length}</p>
          <p className="text-xs text-muted-foreground">Annonces suspendues</p>
        </div>
        <div className="eden-card p-4 text-center">
          <Eye className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-foreground">{allAds.length}</p>
          <p className="text-xs text-muted-foreground">Total annonces</p>
        </div>
      </div>

      {/* Pending Reports */}
      <div className="mb-8">
        <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-accent" /> Signalements ({pendingReports.length})
        </h2>
        {pendingReports.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucun signalement en attente 🎉</p>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report: any) => (
              <div key={report.id} className="eden-card p-4">
                <div className="flex items-start gap-3">
                  <img src={report.ads?.images?.[0] || "/placeholder.svg"} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-foreground truncate">{report.ads?.title || "Annonce"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[report.status]}`}>{report.status}</span>
                      <span className="text-xs text-muted-foreground">{reasonLabels[report.reason] || report.reason}</span>
                    </div>
                    {report.details && <p className="text-xs text-muted-foreground mt-1">{report.details}</p>}
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(report.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <button onClick={() => navigate(`/ad/${report.ad_id}`)} className="p-2 rounded-lg hover:bg-muted transition-colors" title="Voir l'annonce">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button onClick={() => handleApproveReport(report.id)} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive" title="Suspendre l'annonce">
                      <Ban className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDismissReport(report.id)} className="p-2 rounded-lg hover:bg-eden-success/10 transition-colors text-eden-success" title="Rejeter le signalement">
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suspended Ads */}
      {suspendedAds.length > 0 && (
        <div>
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Ban className="h-4 w-4 text-destructive" /> Annonces suspendues ({suspendedAds.length})
          </h2>
          <div className="space-y-3">
            {suspendedAds.map((ad: any) => (
              <div key={ad.id} className="eden-card p-4 flex items-center gap-3">
                <img src={ad.images?.[0] || "/placeholder.svg"} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                  <p className="text-xs text-muted-foreground">{ad.city} • {ad.user_name}</p>
                </div>
                <button onClick={() => handleRestoreAd(ad.id)} className="text-xs text-primary hover:underline flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> Restaurer
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Reports History */}
      {reports.filter((r: any) => r.status !== "pending").length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-foreground mb-4">Historique des signalements</h2>
          <div className="space-y-2">
            {reports.filter((r: any) => r.status !== "pending").map((report: any) => (
              <div key={report.id} className="eden-card p-3 flex items-center gap-3 opacity-70">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{report.ads?.title || "Annonce"}</p>
                  <p className="text-xs text-muted-foreground">{reasonLabels[report.reason]} • {new Date(report.created_at).toLocaleDateString("fr-FR")}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[report.status]}`}>
                  {report.status === "reviewed" ? "Approuvé" : "Rejeté"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
