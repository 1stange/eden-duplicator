import { useState, useEffect } from "react";
import { useTheme, ACCENT_COLORS } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LANGUAGES } from "@/lib/i18n";
import {
  Settings as SettingsIcon, Moon, Sun, Bell, Globe, Lock, Shield, Eye, EyeOff,
  Trash2, LogOut, ChevronRight, BadgeCheck, Smartphone, Mail, HelpCircle, FileText,
  Languages, MapPin, Database, AlertTriangle, Download, Palette, KeyRound,
} from "lucide-react";
import { motion } from "framer-motion";

type SettingsKey =
  | "notif_messages" | "notif_marketing" | "notif_views"
  | "privacy_phone" | "privacy_email" | "privacy_online"
  | "language";

const PREF_STORE = "eden_settings";

function loadPrefs(): Record<string, any> {
  try { return JSON.parse(localStorage.getItem(PREF_STORE) || "{}"); } catch { return {}; }
}
function savePrefs(prefs: Record<string, any>) {
  localStorage.setItem(PREF_STORE, JSON.stringify(prefs));
}

export default function Settings() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const { user, logout, updateProfile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isSeller = user?.role === "entreprise" || isAdmin;
  const [prefs, setPrefs] = useState<Record<string, any>>(loadPrefs());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newEmail, setNewEmail] = useState(user?.email || "");
  const [emailSaved, setEmailSaved] = useState(false);

  useEffect(() => { savePrefs(prefs); }, [prefs]);

  const toggle = (k: SettingsKey) => setPrefs((p) => ({ ...p, [k]: !p[k] }));
  const set = (k: SettingsKey, v: any) => setPrefs((p) => ({ ...p, [k]: v }));
  const changeLanguage = (lang: string) => {
    set("language", lang);
    i18n.changeLanguage(lang);
  };

  const handleClearCache = () => {
    if (!confirm("Vider le cache local (favoris, historique, brouillons) ? Cette action est irréversible.")) return;
    ["eden_history", "eden_favorites_cache", "eden_drafts"].forEach((k) => localStorage.removeItem(k));
    alert("Cache vidé ✅");
  };

  const handleExportData = () => {
    if (!user) return;
    const dump: Record<string, any> = { exportedAt: new Date().toISOString(), userId: user.id };
    Object.keys(localStorage).filter((k) => k.startsWith("eden_")).forEach((k) => {
      try { dump[k] = JSON.parse(localStorage.getItem(k) || "null"); } catch { dump[k] = localStorage.getItem(k); }
    });
    const blob = new Blob([JSON.stringify(dump, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `eden-export-${user.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) return alert("Email invalide");
    await updateProfile({ email: newEmail } as any);
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 2500);
  };

  const handleDeleteAccount = () => {
    if (!user) return;
    localStorage.removeItem(PREF_STORE);
    logout();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="relative h-24 eden-gradient overflow-hidden flex items-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <h1 className="text-2xl font-display font-bold text-primary-foreground flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" /> Paramètres
          </h1>
          <p className="text-xs text-primary-foreground/80 mt-0.5">Gérez votre compte et vos préférences</p>
        </div>
      </div>

      <div className="px-4 max-w-2xl mx-auto -mt-6 relative z-10 space-y-4">
        {/* Account summary */}
        {user && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="eden-card p-4 flex items-center gap-3">
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="h-12 w-12 rounded-full object-cover ring-2 ring-card" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate flex items-center gap-1.5">
                {user.pseudo || user.name}
                {(user as any)?.is_certified && <BadgeCheck className="h-4 w-4 text-eden-success" />}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
            <button onClick={() => navigate("/profile")} className="text-xs text-primary font-medium hover:underline shrink-0">Profil</button>
          </motion.div>
        )}

        {/* Apparence */}
        <Section title="Apparence" icon={<Sun className="h-4 w-4" />}>
          <Row
            icon={theme === "dark" ? <Moon className="h-4 w-4 text-primary" /> : <Sun className="h-4 w-4 text-accent" />}
            title="Mode sombre"
            subtitle={theme === "dark" ? "Activé" : "Désactivé"}
            action={<Switch on={theme === "dark"} onClick={toggleTheme} />}
          />
          <Row
            icon={<Languages className="h-4 w-4 text-primary" />}
            title={t("language")}
            subtitle={LANGUAGES.find((l) => l.code === i18n.language)?.label || "Français"}
            action={
              <select value={i18n.language} onChange={(e) => changeLanguage(e.target.value)} className="text-xs bg-muted border border-input rounded-md px-2 py-1">
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.flag} {l.label}</option>
                ))}
              </select>
            }
          />
          <Row
            icon={<Palette className="h-4 w-4 text-primary" />}
            title="Couleur d'accent"
            subtitle={ACCENT_COLORS[accent]?.label || "Rose Eden"}
            action={
              <div className="flex items-center gap-1.5">
                {Object.entries(ACCENT_COLORS).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setAccent(k as any)}
                    className={`w-5 h-5 rounded-full border-2 transition-all ${accent === k ? "border-foreground scale-110" : "border-transparent"}`}
                    style={{ background: `hsl(${v.hsl})` }} aria-label={v.label} />
                ))}
              </div>
            }
          />
        </Section>

        {/* Compte – email */}
        <Section title="Email du compte" icon={<Mail className="h-4 w-4" />}>
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs text-muted-foreground">Modifier l'adresse email associée à votre compte.</p>
            <div className="flex gap-2">
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                className="flex-1 text-sm bg-muted border border-input rounded-md px-3 py-2" />
              <button onClick={handleChangeEmail} className="px-3 py-2 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:opacity-90">
                Enregistrer
              </button>
            </div>
            {emailSaved && <p className="text-xs text-eden-success">✅ Email mis à jour</p>}
          </div>
        </Section>

        {/* Notifications */}
        <Section title="Notifications" icon={<Bell className="h-4 w-4" />}>
          <Row icon={<Mail className="h-4 w-4 text-primary" />} title="Nouveaux messages" subtitle="Notification quand vous recevez un message"
            action={<Switch on={prefs.notif_messages !== false} onClick={() => toggle("notif_messages")} />} />
          {isSeller && (
            <Row icon={<Eye className="h-4 w-4 text-primary" />} title="Vues sur vos annonces" subtitle="Recevoir un récap des vues"
              action={<Switch on={!!prefs.notif_views} onClick={() => toggle("notif_views")} />} />
          )}
          <Row icon={<Smartphone className="h-4 w-4 text-primary" />} title="Marketing et promotions" subtitle="Offres et nouveautés Eden"
            action={<Switch on={!!prefs.notif_marketing} onClick={() => toggle("notif_marketing")} />} />
        </Section>

        {/* Privacy */}
        <Section title="Confidentialité" icon={<Lock className="h-4 w-4" />}>
          {isSeller && (
            <>
              <Row icon={<Eye className="h-4 w-4 text-primary" />} title="Afficher mon téléphone" subtitle="Visible sur les annonces"
                action={<Switch on={prefs.privacy_phone !== false} onClick={() => toggle("privacy_phone")} />} />
              <Row icon={<Mail className="h-4 w-4 text-primary" />} title="Afficher mon email" subtitle="Visible publiquement"
                action={<Switch on={!!prefs.privacy_email} onClick={() => toggle("privacy_email")} />} />
            </>
          )}
          <Row icon={<MapPin className="h-4 w-4 text-primary" />} title="Statut en ligne" subtitle="Afficher quand vous êtes connecté"
            action={<Switch on={prefs.privacy_online !== false} onClick={() => toggle("privacy_online")} />} />
        </Section>

        {/* Sécurité */}
        <Section title="Sécurité" icon={<Shield className="h-4 w-4" />}>
          <Row icon={<Lock className="h-4 w-4 text-primary" />} title="Changer le mot de passe" subtitle="Mise à jour de votre mot de passe"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={() => alert("Fonctionnalité bientôt disponible")} />
          <Row icon={<EyeOff className="h-4 w-4 text-primary" />} title="Authentification à 2 facteurs" subtitle="Sécurité renforcée"
            action={<span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Bientôt</span>} />
          {isSeller && !((user as any)?.is_certified) && (
            <Row icon={<BadgeCheck className="h-4 w-4 text-eden-success" />} title="Demander la certification" subtitle="Obtenez le badge vert vérifié"
              action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={() => alert("Demande de certification envoyée à l'équipe Eden.")} />
          )}
        </Section>

        {/* Données */}
        <Section title="Données & stockage (RGPD)" icon={<Database className="h-4 w-4" />}>
          <Row icon={<Download className="h-4 w-4 text-primary" />} title="Exporter mes données" subtitle="Télécharger un fichier JSON avec toutes vos données locales"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={handleExportData} />
          <Row icon={<Database className="h-4 w-4 text-primary" />} title="Vider le cache local" subtitle="Libère de l'espace dans le navigateur"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={handleClearCache} />
        </Section>

        {/* Aide */}
        <Section title="Aide & support" icon={<HelpCircle className="h-4 w-4" />}>
          <Row icon={<HelpCircle className="h-4 w-4 text-primary" />} title="Centre d'aide" subtitle="Questions fréquentes"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={() => alert("Centre d'aide en construction")} />
          <Row icon={<FileText className="h-4 w-4 text-primary" />} title="Conditions d'utilisation" subtitle="Lire les CGU"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={() => alert("CGU à venir")} />
          <Row icon={<Globe className="h-4 w-4 text-primary" />} title="Politique de confidentialité"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={() => alert("Politique à venir")} />
        </Section>

        {/* Compte */}
        <Section title="Compte" icon={<Shield className="h-4 w-4" />}>
          <Row icon={<LogOut className="h-4 w-4 text-foreground" />} title="Se déconnecter" subtitle="Quitter la session courante"
            action={<ChevronRight className="h-4 w-4 text-muted-foreground" />} onClick={() => logout()} />
          <Row icon={<Trash2 className="h-4 w-4 text-destructive" />} title="Supprimer mon compte" subtitle="Action définitive"
            danger
            action={<ChevronRight className="h-4 w-4 text-destructive" />}
            onClick={() => setShowDeleteConfirm(true)} />
        </Section>

        {/* Delete confirm modal */}
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-card rounded-2xl p-6 max-w-sm w-full">
              <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
              <h3 className="text-lg font-display font-bold text-center text-foreground">Supprimer le compte ?</h3>
              <p className="text-sm text-muted-foreground text-center mt-2">Cette action est irréversible. Toutes vos données seront supprimées.</p>
              <div className="flex gap-2 mt-5">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors">Annuler</button>
                <button onClick={handleDeleteAccount} className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-opacity">Supprimer</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        <p className="text-center text-[10px] text-muted-foreground py-4">Eden v1.0 · Congo-Brazzaville 🇨🇬</p>
      </div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="eden-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/30 border-b border-border">
        {icon}
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-foreground">{title}</h2>
      </div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}

function Row({ icon, title, subtitle, action, onClick, danger }: {
  icon: React.ReactNode; title: string; subtitle?: string; action?: React.ReactNode; onClick?: () => void; danger?: boolean;
}) {
  const Comp: any = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${onClick ? "hover:bg-muted/40" : ""}`}>
      <div className={`shrink-0 ${danger ? "" : ""}`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${danger ? "text-destructive" : "text-foreground"}`}>{title}</p>
        {subtitle && <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>}
      </div>
      <div className="shrink-0">{action}</div>
    </Comp>
  );
}

function Switch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`w-10 h-5.5 rounded-full transition-colors relative ${on ? "bg-primary" : "bg-muted"}`} style={{ height: 22, width: 40 }}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-card shadow-md transition-transform ${on ? "left-[21px]" : "left-0.5"}`} />
    </button>
  );
}
