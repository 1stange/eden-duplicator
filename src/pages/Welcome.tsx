import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setWelcomeSeen } from "@/lib/localStorage";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, Heart, Shield, MessageSquare, Sparkles } from "lucide-react";

const slides = [
  {
    icon: Sparkles,
    title: "Bienvenue sur Eden 🌸",
    description: "La plateforme de rencontres et services pour adultes au Congo-Brazzaville. Discrétion et sécurité garanties.",
    color: "from-primary to-primary/80",
  },
  {
    icon: Heart,
    title: "Rencontres & Services",
    description: "Trouvez des rencontres, des services de massage et des produits pour adultes dans toutes les villes du Congo.",
    color: "from-accent to-accent/80",
  },
  {
    icon: Shield,
    title: "Sécurité & Discrétion",
    description: "Vos données sont protégées. Utilisez un pseudo pour rester anonyme. Vérification d'âge obligatoire.",
    color: "from-primary to-accent",
  },
  {
    icon: MessageSquare,
    title: "Communiquez facilement",
    description: "Envoyez des messages en toute confidentialité. Chat intégré de style WhatsApp pour vos échanges.",
    color: "from-accent to-primary",
  },
];

export default function Welcome() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  const next = () => {
    if (current === slides.length - 1) {
      setWelcomeSeen();
      navigate("/");
    } else {
      setCurrent(current + 1);
    }
  };

  const prev = () => { if (current > 0) setCurrent(current - 1); };

  const skip = () => {
    setWelcomeSeen();
    navigate("/");
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Skip */}
        <div className="flex justify-end mb-8">
          <button onClick={skip} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Passer →
          </button>
        </div>

        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${slide.color} flex items-center justify-center mx-auto mb-8 shadow-lg`}>
              <slide.icon className="h-12 w-12 text-primary-foreground" />
            </div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              {slide.title}
            </h1>
            <p className="text-muted-foreground text-sm md:text-base leading-relaxed max-w-sm mx-auto">
              {slide.description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex items-center justify-center gap-2 mt-10 mb-8">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"}`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {current > 0 && (
            <button onClick={prev} className="flex-1 py-3 rounded-xl border border-input text-sm font-medium hover:bg-muted transition-colors flex items-center justify-center gap-2">
              <ChevronLeft className="h-4 w-4" /> Précédent
            </button>
          )}
          <button onClick={next} className="flex-1 eden-btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
            {current === slides.length - 1 ? "Commencer" : "Suivant"} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
