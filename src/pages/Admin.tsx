import { useAuth } from "@/contexts/AuthContext";
import { useReports, useUpdateReport, useDeleteReport, useAllAds, useUpdateAdStatus, useAllProfiles, useCertifyUser } from "@/hooks/useLocalData";
import { Shield, AlertTriangle, Check, Eye, Ban, BadgeCheck, Users, Trash2, Clock, Loader2, MessageSquareText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const statusColors: Record<string, string> = {
  pending: "bg-accent/20 text-accent",
  in_progress: "bg-eden-info/20 text-eden-info",
  reviewed: "bg-eden-success/20 text-eden-success",
  dismissed: "bg-muted text-muted-foreground",
};
const statusLabels: Record<string, string> = {
  pending: "En attente",
  in_progress: "À traiter",
  reviewed: "Traité",
  dismissed: "Rejeté",
};


const reasonLabels: Record<string, string> = {
  scam: "🚨 Arnaque",
  illegal: "⛔ Contenu illégal",
  fake: "🎭 Faux profil",
  underage: "👶 Mineurs",
  spam: "Spam",
  inappropriate: "Contenu inapproprié",
  fraud: "Arnaque (legacy)",
  other: "Autre",
};

const reasonColors: Record<string, string> = {
  scam: "bg-destructive/20 text-destructive",
  illegal: "bg-destructive/20 text-destructive",
  fake: "bg-accent/20 text-accent",
  underage: "bg-destructive/20 text-destructive",
};

export default function Admin() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { data: reports = [] } = useReports();
  const { data: allAds = [] } = useAllAds();
  const { data: allProfiles = [] } = useAllProfiles();
  const updateReport = useUpdateReport();
  const deleteReport = useDeleteReport();
  const updateAdStatus = useUpdateAdStatus();
  const certifyUser = useCertifyUser();
  const [activeTab, setActiveTab] = useState<"reports" | "users">("reports");
  const [reportFilter, setReportFilter] = useState<"pending" | "in_progress" | "reviewed" | "dismissed" | "all">("pending");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});


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

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="eden-section-title mb-6 flex items-center gap-2">
        <Shield className="h-6 w-6 text-primary" /> Administration
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { icon: AlertTriangle, value: pendingReports.length, label: "Signalements", color: "text-accent" },
          { icon: Ban, value: suspendedAds.length, label: "Suspendues", color: "text-destructive" },
          { icon: Eye, value: allAds.length, label: "Annonces", color: "text-primary" },
          { icon: Users, value: allProfiles.length, label: "Utilisateurs", color: "text-primary" },
        ].map((s) => (
          <div key={s.label} className="eden-card p-3 text-center">
            <s.icon className={`h-5 w-5 ${s.color} mx-auto mb-1`} />
            <p className="text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab("reports")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "reports" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
          Signalements
        </button>
        <button onClick={() => setActiveTab("users")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "users" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
          <BadgeCheck className="h-4 w-4 inline mr-1" /> Certifications
        </button>
      </div>

      {activeTab === "reports" && (
        <>
          <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
            {(["pending", "in_progress", "reviewed", "dismissed", "all"] as const).map((f) => {
              const count = f === "all" ? reports.length : reports.filter((r: any) => r.status === f).length;
              return (
                <button key={f} onClick={() => setReportFilter(f)} className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${reportFilter === f ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                  {f === "all" ? "Tous" : statusLabels[f]} ({count})
                </button>
              );
            })}
          </div>

          {(() => {
            const filtered = reportFilter === "all" ? reports : reports.filter((r: any) => r.status === reportFilter);
            if (filtered.length === 0) return <p className="text-sm text-muted-foreground text-center py-6">Aucun signalement 🎉</p>;
            return (
              <div className="space-y-3">
                {filtered.map((report: any) => {
                  const isOpen = expandedReport === report.id;
                  const draft = noteDrafts[report.id] ?? report.admin_notes ?? "";
                  return (
                    <div key={report.id} className="eden-card p-4">
                      <div className="flex items-start gap-3">
                        <img src={report.ads?.images?.[0] || "/placeholder.svg"} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{report.ads?.title || "Annonce supprimée"}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[report.status]}`}>{statusLabels[report.status] || report.status}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${reasonColors[report.reason] || "bg-muted text-muted-foreground"}`}>{reasonLabels[report.reason] || report.reason}</span>
                            <span className="text-[10px] text-muted-foreground">{new Date(report.created_at).toLocaleDateString("fr-FR")}</span>
                          </div>
                          {report.details && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{report.details}</p>}
                          {report.admin_notes && !isOpen && (
                            <p className="text-[11px] text-eden-info mt-1 flex items-center gap-1"><MessageSquareText className="h-3 w-3" /> Note interne : {report.admin_notes}</p>
                          )}
                        </div>
                        <button onClick={() => setExpandedReport(isOpen ? null : report.id)} className="p-2 rounded-lg hover:bg-muted transition-colors text-xs text-primary shrink-0">
                          {isOpen ? "Fermer" : "Traiter"}
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-3 pt-3 border-t border-border space-y-3 animate-fade-in">
                          <div>
                            <label className="text-[11px] font-medium text-muted-foreground mb-1 block flex items-center gap-1">
                              <MessageSquareText className="h-3 w-3" /> Note interne (modérateurs)
                            </label>
                            <textarea
                              value={draft}
                              onChange={(e) => setNoteDrafts((d) => ({ ...d, [report.id]: e.target.value }))}
                              placeholder="Contexte, décision, communication avec l'utilisateur…"
                              rows={2}
                              className="eden-input text-xs w-full resize-none"
                            />
                            <button
                              onClick={() => updateReport.mutate({ reportId: report.id, adminNotes: draft })}
                              className="mt-1 text-[11px] text-primary hover:underline"
                            >
                              Enregistrer la note
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => navigate(`/ad/${report.ad_id}`)} className="px-2.5 py-1.5 rounded-lg bg-muted text-xs text-foreground hover:bg-muted/70 flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" /> Voir l'annonce
                            </button>
                            <button onClick={() => updateReport.mutate({ reportId: report.id, status: "in_progress", adminNotes: draft })} className="px-2.5 py-1.5 rounded-lg bg-eden-info/10 text-eden-info text-xs hover:bg-eden-info/20 flex items-center gap-1">
                              <Loader2 className="h-3.5 w-3.5" /> Marquer à traiter
                            </button>
                            <button onClick={() => updateReport.mutate({ reportId: report.id, status: "reviewed", adStatus: "suspended", adminNotes: draft })} className="px-2.5 py-1.5 rounded-lg bg-accent/10 text-accent text-xs hover:bg-accent/20 flex items-center gap-1">
                              <Ban className="h-3.5 w-3.5" /> Masquer l'annonce
                            </button>
                            <button
                              onClick={() => { if (confirm("Supprimer définitivement l'annonce ?")) updateReport.mutate({ reportId: report.id, status: "reviewed", deleteAd: true, adminNotes: draft }); }}
                              className="px-2.5 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs hover:bg-destructive/20 flex items-center gap-1">
                              <Trash2 className="h-3.5 w-3.5" /> Supprimer l'annonce
                            </button>
                            <button onClick={() => updateReport.mutate({ reportId: report.id, status: "dismissed", adminNotes: draft })} className="px-2.5 py-1.5 rounded-lg bg-eden-success/10 text-eden-success text-xs hover:bg-eden-success/20 flex items-center gap-1">
                              <Check className="h-3.5 w-3.5" /> Rejeter le signalement
                            </button>
                            <button onClick={() => { if (confirm("Supprimer ce signalement ?")) deleteReport.mutate(report.id); }} className="px-2.5 py-1.5 rounded-lg text-xs text-muted-foreground hover:bg-muted flex items-center gap-1 ml-auto">
                              <Trash2 className="h-3.5 w-3.5" /> Retirer
                            </button>
                          </div>

                          {report.reviewed_at && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> Traité le {new Date(report.reviewed_at).toLocaleString("fr-FR")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}


          {suspendedAds.length > 0 && (
            <div className="mt-8">
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2"><Ban className="h-4 w-4 text-destructive" /> Suspendues ({suspendedAds.length})</h2>
              <div className="space-y-3">
                {suspendedAds.map((ad: any) => (
                  <div key={ad.id} className="eden-card p-4 flex items-center gap-3">
                    <img src={ad.images?.[0] || "/placeholder.svg"} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{ad.title}</p>
                      <p className="text-xs text-muted-foreground">{ad.city} • {ad.user_name}</p>
                    </div>
                    <button onClick={() => updateAdStatus.mutate({ adId: ad.id, status: "active" })} className="text-xs text-primary hover:underline flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" /> Restaurer
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "users" && (
        <div>
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" /> Gestion des certifications
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Certifiez les comptes qui ont payé la certification.</p>
          <div className="space-y-2">
            {allProfiles.map((profile: any) => (
              <div key={profile.id} className="eden-card p-4 flex items-center gap-3">
                <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate flex items-center gap-1.5">
                    {profile.pseudo || profile.name}
                    {profile.is_certified && <BadgeCheck className="h-4 w-4 text-primary" />}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{profile.email} • {profile.city}</p>
                </div>
                <button
                  onClick={() => certifyUser.mutate({ userId: profile.id, certified: !profile.is_certified })}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                    profile.is_certified
                      ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  {profile.is_certified ? "Retirer" : "Certifier"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
