import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Search, MessageSquare, ShieldCheck, ArrowRight, X } from "lucide-react";

const KEY = "eden_onboarding_done";

const STEPS = [
  { icon: Sparkles, title: "Bienvenue sur Eden 🌸", text: "La plateforme de petites annonces du Congo-Brazzaville. Explorez, publiez, échangez en toute simplicité." },
  { icon: Search,   title: "Trouvez en un clin d'œil", text: "Recherche avancée par catégorie, ville, prix. La carte interactive vous montre les annonces près de chez vous." },
  { icon: MessageSquare, title: "Discutez en privé", text: "Une messagerie sécurisée style WhatsApp pour échanger avec annonceurs et clients." },
  { icon: ShieldCheck, title: "Sécurité et confiance", text: "Badge vert pour les comptes certifiés, signalement en un clic, modération active." },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => { if (!localStorage.getItem(KEY)) setOpen(true); }, []);

  const close = () => { localStorage.setItem(KEY, "1"); setOpen(false); };
  const next = () => (step < STEPS.length - 1 ? setStep(step + 1) : close());

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-3xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="relative eden-gradient p-6 text-primary-foreground">
              <button onClick={close} className="absolute top-3 right-3 p-1.5 rounded-full bg-white/15 hover:bg-white/25 transition">
                <X className="h-4 w-4" />
              </button>
              <div className="flex justify-center mb-3">
                {(() => { const Icon = STEPS[step].icon; return <Icon className="h-12 w-12 drop-shadow" />; })()}
              </div>
              <h2 className="text-xl font-display font-bold text-center">{STEPS[step].title}</h2>
            </div>
            <div className="p-6">
              <p className="text-sm text-muted-foreground text-center leading-relaxed">{STEPS[step].text}</p>
              <div className="flex justify-center gap-1.5 mt-5">
                {STEPS.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"}`} />
                ))}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={close} className="flex-1 py-2.5 rounded-lg border border-input text-sm font-medium hover:bg-muted">Passer</button>
                <button onClick={next} className="flex-1 eden-btn-primary inline-flex items-center justify-center gap-1.5">
                  {step < STEPS.length - 1 ? "Suivant" : "Commencer"} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
