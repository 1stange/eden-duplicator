import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LottieUrl } from "@/components/LottieUrl";
import {
  Flame, ShieldCheck, MessageCircleHeart, Sparkles, Compass, BadgeCheck,
  ArrowRight, ChevronDown, Star, Lock, Zap, Globe2, Users, TrendingUp, Rocket,
} from "lucide-react";

// Public JSON Lottie animations (assetsN.lottiefiles.com — 200 OK)
const LOTTIES = {
  hero: "https://assets2.lottiefiles.com/packages/lf20_iv4dsx3q.json", // hearts / love
  chat: "https://assets9.lottiefiles.com/packages/lf20_yr6zz3wv.json", // chat bubbles
  secure: "https://assets1.lottiefiles.com/packages/lf20_gjmecwii.json", // shield
  rocket: "https://assets9.lottiefiles.com/packages/lf20_touohxv0.json", // rocket
  world: "https://assets9.lottiefiles.com/packages/lf20_qp1q7mct.json", // globe
  celebrate: "https://assets9.lottiefiles.com/packages/lf20_puciaact.json", // celebrate
  wave: "https://assets9.lottiefiles.com/packages/lf20_khzniaya.json", // wave
  stars: "https://assets9.lottiefiles.com/packages/lf20_zw0djhar.json", // stars
};

const FEATURES = [
  { icon: Flame, title: "Rencontres discrètes", desc: "Trouvez des profils vérifiés près de vous, en toute confidentialité.", color: "from-primary/20 to-primary/5" },
  { icon: Compass, title: "Toutes les villes du Congo", desc: "Brazzaville, Pointe-Noire, Dolisie… la plateforme couvre tout le territoire.", color: "from-accent/20 to-accent/5" },
  { icon: BadgeCheck, title: "Comptes certifiés", desc: "Un badge officiel pour les profils vérifiés. Fini les faux profils.", color: "from-eden-success/20 to-eden-success/5" },
  { icon: MessageCircleHeart, title: "Chat sécurisé", desc: "Messagerie style WhatsApp, chiffrée côté client. Bloquez qui vous voulez.", color: "from-eden-info/20 to-eden-info/5" },
  { icon: ShieldCheck, title: "Modération 24/7", desc: "Signalements traités rapidement. Contenus illégaux immédiatement retirés.", color: "from-destructive/20 to-destructive/5" },
  { icon: Rocket, title: "Boost premium", desc: "Mettez en avant vos annonces pour toucher plus de monde.", color: "from-primary/20 to-accent/10" },
];

const STATS = [
  { icon: Users, value: "10k+", label: "Membres actifs" },
  { icon: Globe2, value: "15", label: "Villes couvertes" },
  { icon: Zap, value: "24/7", label: "Modération" },
  { icon: Lock, value: "100%", label: "Discret" },
];

const TESTIMONIALS = [
  { name: "Aïcha, 27", city: "Brazzaville", text: "J'ai rencontré des gens sérieux en quelques jours. L'app est vraiment discrète.", rating: 5 },
  { name: "Éric, 34", city: "Pointe-Noire", text: "Le badge certifié m'a rassuré. On sait à qui on parle.", rating: 5 },
  { name: "Nadège, 29", city: "Dolisie", text: "La messagerie est top et je peux bloquer qui je veux. Parfait.", rating: 4 },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 },
};

export default function Welcome() {
  const navigate = useNavigate();
  const go = () => navigate("/auth");

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky nav */}
      <header className="sticky top-0 z-40 backdrop-blur-lg bg-background/70 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl eden-gradient flex items-center justify-center">
              <Flame className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-lg text-foreground">Eden</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
            <a href="#stats" className="hover:text-foreground transition-colors">Chiffres</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>
          <button onClick={go} className="eden-btn-primary px-4 py-1.5 rounded-full text-sm">Connexion</button>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl" />
          <div className="absolute top-40 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-14 pb-20 grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Lock className="h-3 w-3" /> Réservé aux 18+ · 100% discret
            </span>
            <h1 className="mt-4 text-4xl md:text-6xl font-display font-black leading-[1.05] text-foreground">
              Rencontres & services{" "}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                pour adultes
              </span>{" "}
              au Congo.
            </h1>
            <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-lg">
              Eden réunit les particuliers et les professionnels du plaisir adulte dans une expérience sécurisée,
              anonyme et pensée pour le mobile.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={go} className="eden-btn-primary px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg shadow-primary/30 hover:scale-[1.02] transition-transform">
                Créer mon compte <ArrowRight className="h-4 w-4" />
              </button>
              <a href="#features" className="px-6 py-3 rounded-full text-sm font-semibold border border-input hover:bg-muted transition-colors">
                Découvrir
              </a>
            </div>
            <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1,2,3,4].map((i) => (
                  <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=eden${i}`} alt="" className="w-8 h-8 rounded-full border-2 border-background bg-muted" />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-0.5 text-accent">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
                </div>
                <span>+10 000 membres actifs</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-background border border-border shadow-2xl aspect-square max-w-md mx-auto">
              <LottieUrl src={LOTTIES.hero} className="w-full h-full" />
              <div className="absolute top-4 right-4 w-20 h-20 pointer-events-none">
                <LottieUrl src={LOTTIES.stars} className="w-full h-full" />
              </div>
              <div className="absolute bottom-4 left-4 right-4 bg-card/90 backdrop-blur-md rounded-2xl p-3 border border-border shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full eden-gradient flex items-center justify-center">
                    <MessageCircleHeart className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">Nouveau match 💕</p>
                    <p className="text-[11px] text-muted-foreground truncate">Salut, ton profil m'a plu !</p>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-eden-success animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-center pb-6 animate-bounce text-muted-foreground">
          <ChevronDown className="h-5 w-5" />
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.08 }}
              className="eden-card p-5 text-center bg-gradient-to-br from-primary/5 to-transparent">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
              <p className="text-3xl md:text-4xl font-display font-black bg-gradient-to-b from-primary to-accent bg-clip-text text-transparent">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <motion.div {...fadeUp} className="text-center mb-10">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Ce qui rend Eden différent</span>
          <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mt-2">
            Une plateforme pensée pour vous.
          </h2>
          <div className="w-40 h-40 mx-auto mt-4">
            <LottieUrl src={LOTTIES.wave} className="w-full h-full" />
          </div>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div key={f.title} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.06 }}
              className={`eden-card p-6 bg-gradient-to-br ${f.color} border-border hover:scale-[1.02] transition-transform`}>
              <div className="w-11 h-11 rounded-xl bg-card border border-border flex items-center justify-center mb-3">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display font-bold text-foreground mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SPLIT WITH LOTTIE — CHAT */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <motion.div {...fadeUp} className="order-2 md:order-1">
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-accent/10 to-primary/5 border border-border aspect-square max-w-sm mx-auto p-4">
            <LottieUrl src={LOTTIES.chat} className="w-full h-full" />
          </div>
        </motion.div>
        <motion.div {...fadeUp} className="order-1 md:order-2">
          <h2 className="text-3xl md:text-4xl font-display font-black text-foreground">
            Discutez en <span className="text-primary">temps réel</span>, sans crainte.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Indicateur "en train d'écrire", accusés de lecture, partage d'images et de vocaux,
            et blocage utilisateur en un clic.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {[
              { icon: Lock, txt: "Chiffrement local" },
              { icon: Zap, txt: "Vocaux 5 s" },
              { icon: ShieldCheck, txt: "Blocage bidirectionnel" },
              { icon: BadgeCheck, txt: "Bannière si utilisateur bloqué" },
            ].map((x) => (
              <li key={x.txt} className="flex items-center gap-2">
                <x.icon className="h-4 w-4 text-primary" /> {x.txt}
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* SPLIT WITH LOTTIE — SECURE */}
      <section className="max-w-6xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-10 items-center">
        <motion.div {...fadeUp}>
          <h2 className="text-3xl md:text-4xl font-display font-black text-foreground">
            Votre <span className="text-primary">sécurité</span>, notre priorité.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Modération humaine, badge certifié attribué manuellement par un admin, signalements en un clic.
            Vos données restent sur votre appareil.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: "Modéré" },
              { icon: BadgeCheck, label: "Certifié" },
              { icon: TrendingUp, label: "Sécurisé" },
            ].map((b) => (
              <div key={b.label} className="eden-card p-3 flex flex-col items-center gap-1">
                <b.icon className="h-5 w-5 text-primary" />
                <span className="text-[11px] text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div {...fadeUp}>
          <div className="rounded-3xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/5 border border-border aspect-square max-w-sm mx-auto p-4">
            <LottieUrl src={LOTTIES.secure} className="w-full h-full" />
          </div>
        </motion.div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-display font-black text-foreground text-center mb-10">
          Ils utilisent Eden.
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div key={t.name} {...fadeUp} transition={{ duration: 0.4, delay: i * 0.1 }}
              className="eden-card p-6">
              <div className="flex items-center gap-1 text-accent mb-3">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <p className="text-sm text-foreground italic mb-4">"{t.text}"</p>
              <div className="flex items-center gap-2">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${t.name}`} alt="" className="w-9 h-9 rounded-full bg-muted" />
                <div>
                  <p className="text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 py-16">
        <motion.h2 {...fadeUp} className="text-3xl md:text-4xl font-display font-black text-foreground text-center mb-8">
          Questions fréquentes.
        </motion.h2>
        <div className="space-y-3">
          {[
            { q: "L'application est-elle vraiment discrète ?", a: "Oui. Aucune trace n'apparaît sur vos réseaux et vous pouvez utiliser un pseudo. Les données restent sur votre appareil." },
            { q: "Comment se faire certifier ?", a: "Payez la certification puis un admin vérifie votre identité manuellement. Le badge apparaît sur votre profil et vos annonces." },
            { q: "Puis-je bloquer un utilisateur ?", a: "Oui, en un clic depuis la conversation. La personne ne pourra plus vous envoyer de messages et son historique disparaît de votre onglet principal." },
            { q: "Eden est-il gratuit ?", a: "Oui, la base est 100% gratuite. Seuls la certification et le boost d'annonces sont payants." },
          ].map((f, i) => (
            <motion.details key={i} {...fadeUp} transition={{ duration: 0.3, delay: i * 0.05 }}
              className="eden-card p-4 group">
              <summary className="flex items-center justify-between cursor-pointer font-medium text-foreground text-sm list-none">
                {f.q}
                <ChevronDown className="h-4 w-4 text-muted-foreground group-open:rotate-180 transition-transform" />
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </motion.details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-3xl eden-gradient p-10 md:p-14 text-center shadow-2xl">
          <div className="absolute inset-0 opacity-30 pointer-events-none">
            <LottieUrl src={LOTTIES.celebrate} className="w-full h-full" />
          </div>
          <div className="absolute -top-4 -right-4 w-32 h-32 opacity-70 pointer-events-none">
            <LottieUrl src={LOTTIES.rocket} className="w-full h-full" />
          </div>
          <div className="relative">
            <Sparkles className="h-8 w-8 text-primary-foreground mx-auto mb-2" />
            <h2 className="text-3xl md:text-4xl font-display font-black text-primary-foreground">
              Prêt à rejoindre Eden ?
            </h2>
            <p className="mt-3 text-primary-foreground/90 max-w-xl mx-auto">
              Création de compte en 30 secondes. Aucune carte requise.
            </p>
            <button onClick={go} className="mt-6 px-8 py-3 rounded-full bg-background text-foreground font-semibold text-sm inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-xl">
              Commencer maintenant <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        <div className="w-16 h-16 mx-auto mb-2">
          <LottieUrl src={LOTTIES.world} className="w-full h-full" />
        </div>
        <p>© {new Date().getFullYear()} Eden Congo · Réservé aux adultes 18+</p>
        <p className="mt-1 flex items-center justify-center gap-1">Fait avec <Flame className="h-3 w-3 text-primary inline" /> à Brazzaville.</p>
      </footer>
    </div>
  );
}
