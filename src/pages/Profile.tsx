import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadAvatar } from "@/lib/storage";
import { CONGO_CITIES } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Save, Mail, Phone, MapPin, Briefcase, UserCircle, BadgeCheck, Shield, CalendarDays, Pencil } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [pseudo, setPseudo] = useState(user?.pseudo || "");
  const [email] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "Brazzaville");
  const [gender, setGender] = useState(user?.gender || "homme");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);

  const isCertified = (user as any)?.is_certified === true;
  const initials = `${(firstName || user?.name || "U")[0]}${(lastName || "")[0] || ""}`.toUpperCase();
  const displayName = pseudo || `${firstName} ${lastName}`.trim() || user?.name || "Utilisateur";

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const url = await uploadAvatar(user.id, file);
    if (url) setAvatar(url);
    setUploading(false);
  };

  const handleSave = async () => {
    await updateProfile({
      first_name: firstName, last_name: lastName, pseudo, phone, city, gender,
      avatar, name: `${firstName} ${lastName}`.trim() || user?.name || "",
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 2500);
  };

  const roleLabel = user?.role === "entreprise" ? user.company_name || "Entreprise" : "Particulier";

  return (
    <div className="min-h-screen pb-20">
      {/* Header gradient */}
      <div className="relative h-36 eden-gradient overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_60%)]" />
        <motion.div
          className="absolute -bottom-2 -right-6 w-32 h-32 rounded-full bg-primary-foreground/10 blur-2xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
      </div>

      <div className="px-4 max-w-2xl mx-auto -mt-16 relative z-10">
        {/* Avatar section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <div className="relative group" onClick={() => fileRef.current?.click()}>
            <Avatar className="h-28 w-28 border-4 border-background shadow-xl cursor-pointer">
              <AvatarImage src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt="Avatar" className="object-cover" />
              <AvatarFallback className="text-2xl font-bold bg-secondary text-secondary-foreground">{initials}</AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 rounded-full bg-foreground/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="h-6 w-6 text-primary-foreground" />
            </div>
            {uploading && (
              <div className="absolute inset-0 rounded-full bg-foreground/60 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1.5 shadow-md">
              <Camera className="h-3.5 w-3.5" />
            </div>
          </div>

          <h1 className="mt-3 text-xl font-display font-bold text-foreground flex items-center gap-1.5">
            {displayName}
            {isCertified && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <BadgeCheck className="h-5 w-5 text-eden-success fill-eden-success/20" />
              </motion.span>
            )}
          </h1>

          {user?.role && (
            <span className="mt-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
              <Briefcase className="h-3 w-3" /> {roleLabel}
            </span>
          )}

          {isCertified && (
            <span className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-eden-success/15 text-eden-success text-xs font-semibold border border-eden-success/30">
              <Shield className="h-3 w-3" /> Compte certifié
            </span>
          )}

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-5 w-full max-w-xs">
            <div className="eden-card p-2.5 text-center">
              <p className="text-base font-bold text-primary">{user?.role === "entreprise" ? "—" : "0"}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Annonces</p>
            </div>
            <div className="eden-card p-2.5 text-center">
              <p className="text-base font-bold text-accent">0</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Favoris</p>
            </div>
            <div className="eden-card p-2.5 text-center">
              <p className="text-base font-bold text-eden-success">0</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avis</p>
            </div>
          </div>
        </motion.div>

        {/* Info cards (read mode) */}
        <AnimatePresence mode="wait">
          {!editing ? (
            <motion.div
              key="view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6 space-y-3"
            >
              <div className="eden-card p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground">Informations personnelles</h2>
                  <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
                    <Pencil className="h-3.5 w-3.5" /> Modifier
                  </button>
                </div>
                <Separator />
                <InfoRow icon={<UserCircle className="h-4 w-4 text-muted-foreground" />} label="Pseudo" value={pseudo || "—"} />
                <InfoRow icon={<Mail className="h-4 w-4 text-muted-foreground" />} label="Email" value={email} />
                <InfoRow icon={<Phone className="h-4 w-4 text-muted-foreground" />} label="Téléphone" value={phone || "—"} />
                <InfoRow icon={<MapPin className="h-4 w-4 text-muted-foreground" />} label="Ville" value={city} />
                <InfoRow icon={<CalendarDays className="h-4 w-4 text-muted-foreground" />} label="Genre" value={gender === "homme" ? "Homme" : gender === "femme" ? "Femme" : "Autre"} />
              </div>

              <div className="eden-card p-4">
                <p className="text-xs text-muted-foreground text-center">
                  Membre depuis {user?.created_at ? new Date(user.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "—"}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="edit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
            >
              <div className="eden-card p-5 space-y-4">
                <h2 className="text-sm font-semibold text-foreground">Modifier le profil</h2>
                <Separator />

                <div className="grid grid-cols-2 gap-3">
                  <FieldInput label="Prénom" value={firstName} onChange={setFirstName} />
                  <FieldInput label="Nom" value={lastName} onChange={setLastName} />
                </div>
                <FieldInput label="Pseudo" value={pseudo} onChange={setPseudo} icon={<UserCircle className="h-3.5 w-3.5" />} />
                <FieldInput label="Email" value={email} disabled icon={<Mail className="h-3.5 w-3.5" />} />
                <FieldInput label="Téléphone" value={phone} onChange={setPhone} type="tel" icon={<Phone className="h-3.5 w-3.5" />} />

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> Ville
                  </label>
                  <select value={city} onChange={(e) => setCity(e.target.value)} className="eden-input">
                    {CONGO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Genre</label>
                  <div className="flex gap-2">
                    {[{ v: "homme", l: "Homme" }, { v: "femme", l: "Femme" }, { v: "autre", l: "Autre" }].map(({ v, l }) => (
                      <button
                        key={v}
                        onClick={() => setGender(v)}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                          gender === v
                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                            : "bg-background text-muted-foreground border-input hover:border-primary/40"
                        }`}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={() => setEditing(false)} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-input bg-background text-foreground hover:bg-muted transition-colors">
                    Annuler
                  </button>
                  <button onClick={handleSave} className="flex-1 eden-btn-primary">
                    <Save className="h-4 w-4 mr-1.5" /> Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save confirmation */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-5 py-2.5 rounded-full shadow-lg text-sm font-medium flex items-center gap-2 z-50"
            >
              <BadgeCheck className="h-4 w-4" /> Profil mis à jour !
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function FieldInput({ label, value, onChange, disabled, type = "text", icon }: {
  label: string; value: string; onChange?: (v: string) => void; disabled?: boolean; type?: string; icon?: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
        {icon} {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        disabled={disabled}
        className={`eden-input ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
