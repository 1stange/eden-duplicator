import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CONGO_CITIES } from "@/types";
import { Leaf, Eye, EyeOff, ArrowRight, ArrowLeft, Check, Building2, User as UserIcon, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type AuthMode = "login" | "signup" | "forgot";
type SignupStep = "age" | "role" | "company" | "info";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  // Multi-step signup state
  const [step, setStep] = useState<SignupStep>("age");
  const [birthDate, setBirthDate] = useState("");
  const [role, setRole] = useState<"entreprise" | "particulier" | "">("");
  const [companyName, setCompanyName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [city, setCity] = useState("Brazzaville");
  const [gender, setGender] = useState<"homme" | "femme" | "autre" | "">("");
  const [phone, setPhone] = useState("");

  const isAdult = (): boolean => {
    if (!birthDate) return false;
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 18;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess("Un lien de réinitialisation a été envoyé à votre email.");
  };

  const resetSignup = () => {
    setStep("age"); setBirthDate(""); setRole(""); setCompanyName("");
    setFirstName(""); setLastName(""); setPseudo(""); setCity("Brazzaville");
    setGender(""); setPhone(""); setPassword(""); setEmail(""); setError("");
  };

  const nextStep = () => {
    setError("");
    if (step === "age") {
      if (!birthDate) { setError("Veuillez entrer votre date de naissance."); return; }
      if (!isAdult()) { setError("Vous devez avoir au moins 18 ans pour vous inscrire."); return; }
      setStep("role");
    } else if (step === "role") {
      if (!role) { setError("Veuillez choisir votre profil."); return; }
      if (role === "entreprise") setStep("company"); else setStep("info");
    } else if (step === "company") {
      if (!companyName.trim()) { setError("Veuillez entrer le nom de votre entreprise."); return; }
      setStep("info");
    }
  };

  const prevStep = () => {
    setError("");
    if (step === "role") setStep("age");
    else if (step === "company") setStep("role");
    else if (step === "info") setStep(role === "entreprise" ? "company" : "role");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!lastName || !firstName || !email || !phone || !password || !gender) {
      setError("Veuillez remplir tous les champs obligatoires."); return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères."); return;
    }
    setLoading(true);
    const result = await signup({
      email, password, name: `${firstName} ${lastName}`,
      phone, city, role: role as string,
      companyName: role === "entreprise" ? companyName : undefined,
      pseudo: pseudo || undefined, gender: gender as string,
      firstName, lastName, birthDate,
    });
    if (result.error) setError(result.error);
    setLoading(false);
  };

  const stepIndicator = () => {
    const steps: SignupStep[] = role === "entreprise" ? ["age", "role", "company", "info"] : ["age", "role", "info"];
    const currentIdx = steps.indexOf(step);
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= currentIdx ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              {i < currentIdx ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`w-8 h-0.5 ${i < currentIdx ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>
    );
  };

  const slideVariants = { enter: { x: 40, opacity: 0 }, center: { x: 0, opacity: 1 }, exit: { x: -40, opacity: 0 } };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl eden-gradient flex items-center justify-center mb-4 shadow-lg">
              <Leaf className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Eden</h1>
            <p className="text-muted-foreground mt-1">Plateforme pour adultes - Congo 🇨🇬</p>
          </div>

          <div className="eden-card p-6">
            <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1">
              {(["login", "signup"] as const).map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(""); setSuccess(""); if (m === "signup") resetSignup(); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
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
                <button type="submit" disabled={loading} className="eden-btn-primary w-full disabled:opacity-50">
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
                <button type="button" onClick={() => setMode("forgot")} className="w-full text-sm text-primary hover:underline">Mot de passe oublié ?</button>

                {/* Demo accounts */}
                <div className="pt-4 border-t border-border">
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 text-center">🔑 Comptes de démonstration</p>
                  <div className="space-y-1.5">
                    {[
                      { label: "Admin", email: "lxrd@fallens.com", password: "Lord@admin@123", color: "bg-destructive/10 text-destructive border-destructive/30" },
                      { label: "Entreprise", email: "spa.eden@eden.cg", password: "demo1234", color: "bg-accent/10 text-accent-foreground border-accent/30" },
                      { label: "Particulier", email: "jean.mboko@eden.cg", password: "demo1234", color: "bg-primary/10 text-primary border-primary/30" },
                    ].map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => { setEmail(acc.email); setPassword(acc.password); }}
                        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${acc.color}`}>{acc.label}</span>
                          <span className="text-xs text-foreground truncate">{acc.email}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0">Cliquer</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">Cliquez sur un compte pour pré-remplir les identifiants</p>
                </div>
              </form>
            )}

            {mode === "signup" && (
              <div>
                {stepIndicator()}
                <AnimatePresence mode="wait">
                  {step === "age" && (
                    <motion.div key="age" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                      <div className="text-center">
                        <Calendar className="h-12 w-12 text-primary mx-auto mb-3" />
                        <h3 className="text-lg font-display font-semibold text-foreground mb-1">Vérification d'âge</h3>
                        <p className="text-sm text-muted-foreground">Vous devez avoir au moins 18 ans</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Date de naissance *</label>
                        <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} max={new Date().toISOString().split("T")[0]} className="eden-input" required />
                      </div>
                      {birthDate && (
                        <div className={`p-3 rounded-lg text-sm ${isAdult() ? "bg-eden-success/10 text-eden-success" : "bg-destructive/10 text-destructive"}`}>
                          {isAdult() ? "✅ Vous êtes majeur(e). Vous pouvez continuer." : "❌ Vous devez avoir au moins 18 ans."}
                        </div>
                      )}
                      <button type="button" onClick={nextStep} className="eden-btn-primary w-full flex items-center justify-center gap-2">
                        Continuer <ArrowRight className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}

                  {step === "role" && (
                    <motion.div key="role" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                      <div className="text-center mb-2">
                        <h3 className="text-lg font-display font-semibold text-foreground">Quel est votre profil ?</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setRole("entreprise")}
                          className={`p-5 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2 ${role === "entreprise" ? "border-primary bg-primary/10" : "border-input hover:border-primary/50"}`}>
                          <Building2 className={`h-8 w-8 ${role === "entreprise" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-medium text-sm">Entreprise</span>
                        </button>
                        <button type="button" onClick={() => setRole("particulier")}
                          className={`p-5 rounded-xl border-2 text-center transition-all flex flex-col items-center gap-2 ${role === "particulier" ? "border-primary bg-primary/10" : "border-input hover:border-primary/50"}`}>
                          <UserIcon className={`h-8 w-8 ${role === "particulier" ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-medium text-sm">Particulier</span>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1">
                          <ArrowLeft className="h-4 w-4" /> Retour
                        </button>
                        <button type="button" onClick={nextStep} className="flex-1 eden-btn-primary flex items-center justify-center gap-1">
                          Continuer <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === "company" && (
                    <motion.div key="company" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                      <div className="text-center mb-2">
                        <Building2 className="h-10 w-10 text-primary mx-auto mb-2" />
                        <h3 className="text-lg font-display font-semibold text-foreground">Votre entreprise</h3>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Nom de l'entreprise *</label>
                        <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Ex: Spa Beauté Congo" className="eden-input" />
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1">
                          <ArrowLeft className="h-4 w-4" /> Retour
                        </button>
                        <button type="button" onClick={nextStep} className="flex-1 eden-btn-primary flex items-center justify-center gap-1">
                          Continuer <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === "info" && (
                    <motion.div key="info" variants={slideVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }}>
                      <form onSubmit={handleSignup} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Nom *</label>
                            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Mbongo" className="eden-input" required />
                          </div>
                          <div>
                            <label className="text-sm font-medium text-foreground mb-1 block">Prénom *</label>
                            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jean" className="eden-input" required />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Pseudo (optionnel)</label>
                          <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} placeholder="Pour rester anonyme" className="eden-input" />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Email *</label>
                          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.cg" className="eden-input" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Téléphone *</label>
                          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+242 06 000 0000" className="eden-input" required />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Genre *</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(["homme", "femme", "autre"] as const).map((g) => (
                              <button key={g} type="button" onClick={() => setGender(g)}
                                className={`py-2 rounded-lg border text-sm font-medium capitalize transition-all ${gender === g ? "border-primary bg-primary/10 text-primary" : "border-input hover:border-primary/50"}`}>
                                {g === "homme" ? "👨 Homme" : g === "femme" ? "👩 Femme" : "🧑 Autre"}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Ville</label>
                          <select value={city} onChange={(e) => setCity(e.target.value)} className="eden-input">
                            {CONGO_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1 block">Mot de passe *</label>
                          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="eden-input" required />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <button type="button" onClick={prevStep} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-1">
                            <ArrowLeft className="h-4 w-4" /> Retour
                          </button>
                          <button type="submit" disabled={loading} className="flex-1 eden-btn-primary disabled:opacity-50">
                            {loading ? "Création..." : "Créer mon compte"}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {mode === "forgot" && (
              <form onSubmit={handleForgot} className="space-y-4">
                <p className="text-sm text-muted-foreground">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.cg" className="eden-input" required />
                </div>
                <button type="submit" className="eden-btn-primary w-full">Envoyer</button>
                <button type="button" onClick={() => setMode("login")} className="w-full text-sm text-primary hover:underline">Retour à la connexion</button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
