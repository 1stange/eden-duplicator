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
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[report.status]}`}>{report.status}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${reasonColors[report.reason] || "bg-muted text-muted-foreground"}`}>{reasonLabels[report.reason] || report.reason}</span>
                      </div>
                      {report.details && <p className="text-xs text-muted-foreground mt-1">{report.details}</p>}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <button onClick={() => navigate(`/ad/${report.ad_id}`)} className="p-2 rounded-lg hover:bg-muted transition-colors"><Eye className="h-4 w-4 text-muted-foreground" /></button>
                      <button onClick={() => updateReport.mutate({ reportId: report.id, status: "reviewed", adStatus: "suspended" })} className="p-2 rounded-lg hover:bg-destructive/10 transition-colors text-destructive"><Ban className="h-4 w-4" /></button>
                      <button onClick={() => updateReport.mutate({ reportId: report.id, status: "dismissed" })} className="p-2 rounded-lg hover:bg-eden-success/10 transition-colors text-eden-success"><Check className="h-4 w-4" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

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
