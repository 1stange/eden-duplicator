import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CONGO_CITIES } from "@/types";
import { Leaf, Eye, EyeOff } from "lucide-react";

type AuthMode = "login" | "signup" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("Brazzaville");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login, signup } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const user = login(email, password);
    if (!user) setError("Email ou mot de passe incorrect. Astuce: utilisez un email d'un utilisateur existant.");
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name || !email || !phone) { setError("Veuillez remplir tous les champs."); return; }
    signup({ name, email, phone, city });
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("Un lien de réinitialisation a été envoyé (simulation locale).");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl eden-gradient flex items-center justify-center mb-4 shadow-lg">
            <Leaf className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">Eden</h1>
          <p className="text-muted-foreground mt-1">Petites annonces du Congo</p>
        </div>

        <div className="eden-card p-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {m === "login" ? "Connexion" : "Inscription"}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          {success && <div className="mb-4 p-3 rounded-lg bg-eden-success/10 text-eden-success text-sm">{success}</div>}

          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.cg" className="eden-input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="eden-input pr-10" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button type="submit" className="eden-btn-primary w-full">Se connecter</button>
              <button type="button" onClick={() => setMode("forgot")} className="w-full text-sm text-primary hover:underline">Mot de passe oublié ?</button>
              <div className="mt-4 p-3 rounded-lg bg-muted text-xs text-muted-foreground">
                <p className="font-medium mb-1">Comptes de test :</p>
                <p>jc.mboko@eden.cg</p>
                <p>marie.l@eden.cg</p>
                <p className="mt-1 italic">N'importe quel mot de passe</p>
              </div>
            </form>
          )}

          {mode === "signup" && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Nom complet</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jean Dupont" className="eden-input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.cg" className="eden-input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Téléphone</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+242 06 000 0000" className="eden-input" required />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Ville</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="eden-input">
                  {CONGO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="eden-input" required />
              </div>
              <button type="submit" className="eden-btn-primary w-full">Créer un compte</button>
            </form>
          )}

          {mode === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4">
              <p className="text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.cg" className="eden-input" required />
              </div>
              <button type="submit" className="eden-btn-primary w-full">Envoyer le lien</button>
              <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-primary hover:underline">Retour à la connexion</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
