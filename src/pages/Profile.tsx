import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CONGO_CITIES } from "@/types";
import { motion } from "framer-motion";
import { User, Camera, Save, Mail, Phone, MapPin, Briefcase, UserCircle } from "lucide-react";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [pseudo, setPseudo] = useState(user?.pseudo || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [city, setCity] = useState(user?.city || "Brazzaville");
  const [gender, setGender] = useState(user?.gender || "homme");
  const [avatar, setAvatar] = useState(user?.avatar || "");
  const [saved, setSaved] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateUser({
      firstName, lastName, pseudo, email, phone, city, gender: gender as 'homme' | 'femme' | 'autre',
      avatar, name: `${firstName} ${lastName}`.trim() || user?.name || "",
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="eden-section-title mb-6 flex items-center gap-2">
        <User className="h-6 w-6 text-primary" /> Mon Profil
      </h1>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="eden-card p-6 mb-6">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
            <img
              src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
              alt="Avatar"
              className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
            />
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-6 w-6 text-white" />
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <p className="mt-2 text-lg font-display font-bold text-foreground">{pseudo || `${firstName} ${lastName}` || user?.name}</p>
          {user?.role && (
            <span className="eden-badge-category mt-1 flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {user.role === "entreprise" ? user.companyName || "Entreprise" : "Particulier"}
            </span>
          )}
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Prénom</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="eden-input" placeholder="Votre prénom" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Nom</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="eden-input" placeholder="Votre nom" />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <UserCircle className="h-3 w-3" /> Pseudo (affiché publiquement)
            </label>
            <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="eden-input" placeholder="Pseudo anonyme" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="eden-input" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <Phone className="h-3 w-3" /> Téléphone
            </label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="eden-input" />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" /> Ville
            </label>
            <select value={city} onChange={(e) => setCity(e.target.value)} className="eden-input">
              {CONGO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Genre</label>
            <select value={gender} onChange={(e) => setGender(e.target.value as 'homme' | 'femme' | 'autre')} className="eden-input">
              <option value="homme">Homme</option>
              <option value="femme">Femme</option>
              <option value="autre">Autre</option>
            </select>
          </div>
        </div>

        <button onClick={handleSave} className="eden-btn-primary mt-6 w-full">
          <Save className="h-4 w-4 mr-2" /> Enregistrer le profil
        </button>
        {saved && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-center mt-3 text-primary font-medium">
            ✓ Profil mis à jour avec succès !
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
