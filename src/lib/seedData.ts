// Mock data — all snake_case to match existing page consumers.

const dicebear = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

export interface MockProfile {
  id: string;
  email: string;
  password: string; // mock only — never do this in production
  name: string;
  phone: string | null;
  city: string;
  avatar: string | null;
  first_name: string | null;
  last_name: string | null;
  pseudo: string | null;
  gender: string | null;
  role: "admin" | "entreprise" | "particulier";
  company_name: string | null;
  birth_date: string | null;
  is_certified: boolean;
  created_at: string;
}

export const sampleProfiles: MockProfile[] = [
  {
    id: "user-admin", email: "lxrd@fallens.com", password: "Lord@admin@123",
    name: "Lord", phone: "+242 06 000 0000", city: "Brazzaville",
    avatar: dicebear("Lord"), first_name: "Lord", last_name: "Fallens", pseudo: "Lord",
    gender: "autre", role: "admin", company_name: null, birth_date: "1990-01-01",
    is_certified: true, created_at: "2024-01-01T00:00:00Z",
  },
  // Entreprises
  {
    id: "user-ent-1", email: "spa.eden@eden.cg", password: "demo1234",
    name: "Spa Eden Brazza", phone: "+242 06 111 2222", city: "Brazzaville",
    avatar: dicebear("SpaEden"), first_name: "Sylvie", last_name: "Massamba", pseudo: "SpaEden",
    gender: "femme", role: "entreprise", company_name: "Spa Eden Brazza", birth_date: "1988-04-12",
    is_certified: true, created_at: "2024-04-20T00:00:00Z",
  },
  {
    id: "user-ent-2", email: "rendezvous.cg@eden.cg", password: "demo1234",
    name: "Rendez-Vous CG", phone: "+242 05 333 4444", city: "Pointe-Noire",
    avatar: dicebear("RendezVous"), first_name: "Marie", last_name: "Louemba", pseudo: "MarieL",
    gender: "femme", role: "entreprise", company_name: "Rendez-Vous CG", birth_date: "1991-09-07",
    is_certified: false, created_at: "2024-05-10T00:00:00Z",
  },
  {
    id: "user-ent-3", email: "boutique.adult@eden.cg", password: "demo1234",
    name: "Boutique Adult Congo", phone: "+242 06 555 6666", city: "Dolisie",
    avatar: dicebear("Boutique"), first_name: "Patrick", last_name: "Ngouabi", pseudo: "AdultShop",
    gender: "homme", role: "entreprise", company_name: "Boutique Adult Congo", birth_date: "1985-03-22",
    is_certified: true, created_at: "2024-06-01T00:00:00Z",
  },
  // Particuliers
  {
    id: "user-p-1", email: "jean.mboko@eden.cg", password: "demo1234",
    name: "Jean-Claude Mboko", phone: "+242 06 500 1234", city: "Brazzaville",
    avatar: dicebear("Jean"), first_name: "Jean-Claude", last_name: "Mboko", pseudo: "JCM",
    gender: "homme", role: "particulier", company_name: null, birth_date: "1989-07-14",
    is_certified: false, created_at: "2024-02-15T00:00:00Z",
  },
  {
    id: "user-p-2", email: "alain.mk@eden.cg", password: "demo1234",
    name: "Alain Moukoko", phone: "+242 06 900 7890", city: "Nkayi",
    avatar: dicebear("Alain"), first_name: "Alain", last_name: "Moukoko", pseudo: "AlainM",
    gender: "homme", role: "particulier", company_name: null, birth_date: "1992-11-30",
    is_certified: false, created_at: "2024-05-12T00:00:00Z",
  },
  {
    id: "user-p-3", email: "celine.b@eden.cg", password: "demo1234",
    name: "Céline Bantou", phone: "+242 05 700 8899", city: "Brazzaville",
    avatar: dicebear("Celine"), first_name: "Céline", last_name: "Bantou", pseudo: "Cici",
    gender: "femme", role: "particulier", company_name: null, birth_date: "1995-02-18",
    is_certified: true, created_at: "2024-07-08T00:00:00Z",
  },
  {
    id: "user-p-4", email: "didier.n@eden.cg", password: "demo1234",
    name: "Didier Nkouka", phone: "+242 06 222 3344", city: "Pointe-Noire",
    avatar: dicebear("Didier"), first_name: "Didier", last_name: "Nkouka", pseudo: "DidN",
    gender: "homme", role: "particulier", company_name: null, birth_date: "1990-06-05",
    is_certified: false, created_at: "2024-08-20T00:00:00Z",
  },
];

export interface MockAd {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  city: string;
  images: string[];
  video?: string | null;
  user_id: string;
  user_name: string;
  user_phone: string;
  is_premium: boolean;
  is_urgent: boolean;
  views: number;
  status: "active" | "suspended" | "pending";
  created_at: string;
  updated_at: string;
}

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=600`;

export const sampleAds: MockAd[] = [
  // Rencontres
  { id: "ad-1", title: "Femme sérieuse cherche relation stable", description: "Femme de 28 ans, sérieuse et cultivée, cherche homme mature pour relation sérieuse à Brazzaville. Discrétion assurée.", price: 0, currency: "FCFA", category: "rencontres", city: "Brazzaville", images: [img("1529626455594-4ff0802cfb7e")], user_id: "user-p-3", user_name: "Céline Bantou", user_phone: "+242 05 700 8899", is_premium: true, is_urgent: false, views: 456, status: "active", created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-01T10:00:00Z" },
  { id: "ad-2", title: "Homme 35 ans cherche compagne", description: "Cadre, 35 ans, bien installé à Pointe-Noire. Cherche femme pour relation durable.", price: 0, currency: "FCFA", category: "rencontres", city: "Pointe-Noire", images: [img("1507003211169-0a1dd7228f2d")], user_id: "user-p-4", user_name: "Didier Nkouka", user_phone: "+242 06 222 3344", is_premium: false, is_urgent: false, views: 234, status: "active", created_at: "2026-05-02T10:00:00Z", updated_at: "2026-05-02T10:00:00Z" },
  { id: "ad-3", title: "Rencontre amicale et plus si affinités", description: "Homme 30 ans sportif, sociable. Brazzaville.", price: 0, currency: "FCFA", category: "rencontres", city: "Brazzaville", images: [img("1506794778202-cad84cf45f1d")], user_id: "user-p-1", user_name: "Jean-Claude Mboko", user_phone: "+242 06 500 1234", is_premium: false, is_urgent: false, views: 189, status: "active", created_at: "2026-05-03T10:00:00Z", updated_at: "2026-05-03T10:00:00Z" },
  { id: "ad-4", title: "Femme douce cherche homme attentionné", description: "25 ans, douce et attentionnée. Dolisie et environs.", price: 0, currency: "FCFA", category: "rencontres", city: "Dolisie", images: [img("1494790108377-be9c29b29330")], user_id: "user-ent-2", user_name: "Marie Louemba", user_phone: "+242 05 333 4444", is_premium: true, is_urgent: false, views: 345, status: "active", created_at: "2026-05-04T10:00:00Z", updated_at: "2026-05-04T10:00:00Z" },
  { id: "ad-5", title: "Cherche partenaire pour sorties", description: "Homme 40 ans, entrepreneur. Discrétion totale.", price: 0, currency: "FCFA", category: "rencontres", city: "Brazzaville", images: [img("1472099645785-5658abf4ff4e")], user_id: "user-p-2", user_name: "Alain Moukoko", user_phone: "+242 06 900 7890", is_premium: false, is_urgent: false, views: 156, status: "active", created_at: "2026-05-05T10:00:00Z", updated_at: "2026-05-05T10:00:00Z" },
  { id: "ad-6", title: "Femme 32 ans - Nkayi", description: "Femme indépendante cherche homme sérieux. Nkayi.", price: 0, currency: "FCFA", category: "rencontres", city: "Nkayi", images: [img("1534528741775-53994a69daeb")], user_id: "user-ent-1", user_name: "Sylvie Massamba", user_phone: "+242 06 111 2222", is_premium: false, is_urgent: false, views: 98, status: "active", created_at: "2026-05-06T10:00:00Z", updated_at: "2026-05-06T10:00:00Z" },
  { id: "ad-7", title: "Homme mature cherche femme", description: "45 ans, divorcé, bien établi. Pointe-Noire.", price: 0, currency: "FCFA", category: "rencontres", city: "Pointe-Noire", images: [img("1500648767791-00dcc994a43e")], user_id: "user-p-4", user_name: "Didier Nkouka", user_phone: "+242 06 222 3344", is_premium: false, is_urgent: false, views: 167, status: "active", created_at: "2026-05-07T10:00:00Z", updated_at: "2026-05-07T10:00:00Z" },
  { id: "ad-8", title: "Rencontre discrète à Brazzaville", description: "Femme 27 ans, belle et discrète.", price: 0, currency: "FCFA", category: "rencontres", city: "Brazzaville", images: [img("1524504388940-b1c1722653e1")], user_id: "user-p-3", user_name: "Céline Bantou", user_phone: "+242 05 700 8899", is_premium: true, is_urgent: false, views: 567, status: "active", created_at: "2026-05-08T10:00:00Z", updated_at: "2026-05-08T10:00:00Z" },

  // Escortes + Massages
  { id: "ad-11", title: "Massage relaxant professionnel", description: "Masseuse certifiée. Massage suédois, californien, thaïlandais. À domicile ou en salon.", price: 15000, currency: "FCFA", category: "escortes-massages", city: "Brazzaville", images: [img("1544161515-4ab6ce6db874")], user_id: "user-ent-1", user_name: "Spa Eden Brazza", user_phone: "+242 06 111 2222", is_premium: true, is_urgent: false, views: 678, status: "active", created_at: "2026-04-25T10:00:00Z", updated_at: "2026-04-25T10:00:00Z" },
  { id: "ad-12", title: "Escorte VIP - Soirées", description: "Accompagnatrice élégante pour vos soirées et dîners.", price: 50000, currency: "FCFA", category: "escortes-massages", city: "Brazzaville", images: [img("1488426862026-3ee34a7d66df")], user_id: "user-ent-2", user_name: "Rendez-Vous CG", user_phone: "+242 05 333 4444", is_premium: true, is_urgent: false, views: 890, status: "active", created_at: "2026-04-20T10:00:00Z", updated_at: "2026-04-20T10:00:00Z" },
  { id: "ad-13", title: "Spa & Massage détente", description: "Massages aux huiles essentielles, gommage, sauna.", price: 20000, currency: "FCFA", category: "escortes-massages", city: "Pointe-Noire", images: [img("1600334089648-b0d9d3028eb2")], user_id: "user-ent-2", user_name: "Rendez-Vous CG", user_phone: "+242 05 333 4444", is_premium: false, is_urgent: false, views: 345, status: "active", created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-01T10:00:00Z" },
  { id: "ad-14", title: "Massage à domicile", description: "Masseuse expérimentée se déplace à domicile.", price: 10000, currency: "FCFA", category: "escortes-massages", city: "Brazzaville", images: [img("1519823551278-64ac92734fb1")], user_id: "user-ent-1", user_name: "Spa Eden Brazza", user_phone: "+242 06 111 2222", is_premium: false, is_urgent: false, views: 234, status: "active", created_at: "2026-05-02T10:00:00Z", updated_at: "2026-05-02T10:00:00Z" },
  { id: "ad-15", title: "Escorte voyages d'affaires", description: "Accompagnatrice bilingue français/anglais.", price: 75000, currency: "FCFA", category: "escortes-massages", city: "Pointe-Noire", images: [img("1515886657613-9f3515b0c78f")], user_id: "user-ent-2", user_name: "Rendez-Vous CG", user_phone: "+242 05 333 4444", is_premium: true, is_urgent: false, views: 456, status: "active", created_at: "2026-04-22T10:00:00Z", updated_at: "2026-04-22T10:00:00Z" },
  { id: "ad-18", title: "Massage tantrique", description: "Cadre luxueux et apaisant. Réservation obligatoire.", price: 25000, currency: "FCFA", category: "escortes-massages", city: "Pointe-Noire", images: [img("1515377905703-c4788e51af15")], user_id: "user-ent-2", user_name: "Rendez-Vous CG", user_phone: "+242 05 333 4444", is_premium: false, is_urgent: true, views: 567, status: "active", created_at: "2026-05-05T10:00:00Z", updated_at: "2026-05-05T10:00:00Z" },
  { id: "ad-19", title: "Massage duo - Couples", description: "Moment de détente à deux dans un espace privatif.", price: 35000, currency: "FCFA", category: "escortes-massages", city: "Brazzaville", images: [img("1591343395082-e120087004b4")], user_id: "user-ent-1", user_name: "Spa Eden Brazza", user_phone: "+242 06 111 2222", is_premium: false, is_urgent: false, views: 178, status: "active", created_at: "2026-05-06T10:00:00Z", updated_at: "2026-05-06T10:00:00Z" },

  // Produits adultes
  { id: "ad-21", title: "Lingerie fine importée", description: "Lot de lingerie fine importée d'Europe. Tailles S à XL.", price: 25000, currency: "FCFA", category: "produits-adultes", city: "Brazzaville", images: [img("1617331721458-bd3bd3f9c7f8")], user_id: "user-ent-3", user_name: "Boutique Adult Congo", user_phone: "+242 06 555 6666", is_premium: true, is_urgent: false, views: 345, status: "active", created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-01T10:00:00Z" },
  { id: "ad-22", title: "Huiles de massage parfumées", description: "Vanille, jasmin, ylang-ylang. Flacon 250ml.", price: 8000, currency: "FCFA", category: "produits-adultes", city: "Pointe-Noire", images: [img("1608571423902-eed4a5ad8108")], user_id: "user-ent-3", user_name: "Boutique Adult Congo", user_phone: "+242 06 555 6666", is_premium: false, is_urgent: false, views: 234, status: "active", created_at: "2026-05-02T10:00:00Z", updated_at: "2026-05-02T10:00:00Z" },
  { id: "ad-23", title: "Bougies parfumées romantiques", description: "Set de 6 bougies, longue durée.", price: 12000, currency: "FCFA", category: "produits-adultes", city: "Brazzaville", images: [img("1602607688066-59df701924b6")], user_id: "user-ent-3", user_name: "Boutique Adult Congo", user_phone: "+242 06 555 6666", is_premium: false, is_urgent: false, views: 156, status: "active", created_at: "2026-05-03T10:00:00Z", updated_at: "2026-05-03T10:00:00Z" },
  { id: "ad-24", title: "Parfums aphrodisiaques", description: "Collection de parfums aux phéromones. Import direct.", price: 18000, currency: "FCFA", category: "produits-adultes", city: "Brazzaville", images: [img("1541643600914-78b084683601")], user_id: "user-ent-3", user_name: "Boutique Adult Congo", user_phone: "+242 06 555 6666", is_premium: true, is_urgent: false, views: 456, status: "active", created_at: "2026-04-28T10:00:00Z", updated_at: "2026-04-28T10:00:00Z" },
  { id: "ad-25", title: "Draps satin luxe", description: "Parure de draps satin de soie. King size.", price: 35000, currency: "FCFA", category: "produits-adultes", city: "Pointe-Noire", images: [img("1631049307264-da0ec9d70304")], user_id: "user-ent-3", user_name: "Boutique Adult Congo", user_phone: "+242 06 555 6666", is_premium: false, is_urgent: false, views: 189, status: "active", created_at: "2026-05-04T10:00:00Z", updated_at: "2026-05-04T10:00:00Z" },
  { id: "ad-29", title: "Jeux de société pour adultes", description: "Jeux coquins pour soirées entre adultes.", price: 10000, currency: "FCFA", category: "produits-adultes", city: "Brazzaville", images: [img("1610890716171-6b1bb98ffd09")], user_id: "user-ent-3", user_name: "Boutique Adult Congo", user_phone: "+242 06 555 6666", is_premium: false, is_urgent: true, views: 312, status: "active", created_at: "2026-05-08T10:00:00Z", updated_at: "2026-05-08T10:00:00Z" },
];

export const sampleConversations = [
  { id: "conv-1", participant_1: "user-p-1", participant_2: "user-ent-1", ad_id: "ad-11", ad_title: "Massage relaxant professionnel", created_at: "2026-05-10T09:00:00Z", updated_at: "2026-05-10T10:05:00Z" },
  { id: "conv-2", participant_1: "user-p-2", participant_2: "user-ent-2", ad_id: "ad-12", ad_title: "Escorte VIP - Soirées", created_at: "2026-05-11T14:00:00Z", updated_at: "2026-05-11T14:30:00Z" },
];

export const sampleMessages = [
  { id: "msg-1", conversation_id: "conv-1", sender_id: "user-p-1", content: "Bonjour, quels sont vos horaires pour le massage ?", read: true, created_at: "2026-05-10T09:00:00Z" },
  { id: "msg-2", conversation_id: "conv-1", sender_id: "user-ent-1", content: "Bonjour ! Du lundi au samedi, 9h à 20h.", read: true, created_at: "2026-05-10T09:30:00Z" },
  { id: "msg-3", conversation_id: "conv-1", sender_id: "user-p-1", content: "Parfait, je passe demain à 15h.", read: false, created_at: "2026-05-10T10:05:00Z" },
  { id: "msg-4", conversation_id: "conv-2", sender_id: "user-p-2", content: "Bonsoir, êtes-vous disponible ce week-end ?", read: false, created_at: "2026-05-11T14:00:00Z" },
  { id: "msg-5", conversation_id: "conv-2", sender_id: "user-ent-2", content: "Oui, samedi soir je suis libre.", read: true, created_at: "2026-05-11T14:30:00Z" },
];

export const sampleNotifications = [
  { id: "notif-1", user_id: "user-p-1", title: "Nouveau message", message: "Spa Eden Brazza vous a répondu", type: "message", read: false, created_at: "2026-05-10T09:30:00Z" },
  { id: "notif-2", user_id: "user-ent-1", title: "Nouvelle vue", message: "Votre annonce a reçu 50 nouvelles vues", type: "info", read: false, created_at: "2026-05-09T16:00:00Z" },
  { id: "notif-3", user_id: "user-ent-1", title: "Top 10 cette semaine", message: "Votre annonce est dans le top 10", type: "success", read: true, created_at: "2026-05-08T12:00:00Z" },
];

export const sampleReviews = [
  { id: "rev-1", ad_id: "ad-11", user_id: "user-p-1", user_name: "Jean-Claude Mboko", rating: 5, comment: "Excellent massage, très professionnel !", created_at: "2026-05-05T10:00:00Z" },
  { id: "rev-2", ad_id: "ad-11", user_id: "user-p-2", user_name: "Alain Moukoko", rating: 4, comment: "Bon service, je recommande.", created_at: "2026-05-06T14:00:00Z" },
  { id: "rev-3", ad_id: "ad-12", user_id: "user-p-1", user_name: "Jean-Claude Mboko", rating: 5, comment: "Très classe et professionnelle.", created_at: "2026-05-04T18:00:00Z" },
  { id: "rev-4", ad_id: "ad-21", user_id: "user-p-3", user_name: "Céline Bantou", rating: 5, comment: "Qualité au rendez-vous, livraison rapide.", created_at: "2026-05-03T11:00:00Z" },
];

export const sampleReports = [
  { id: "rep-1", ad_id: "ad-5", reporter_id: "user-p-3", reason: "Contenu inapproprié", details: "Photos non conformes", status: "pending", reviewed_by: null, reviewed_at: null, created_at: "2026-05-09T15:00:00Z" },
];

export const sampleFavorites = [
  { user_id: "user-p-1", ad_id: "ad-11" },
  { user_id: "user-p-1", ad_id: "ad-12" },
  { user_id: "user-p-2", ad_id: "ad-21" },
];

// Backwards compat exports (in case any old code imports these)
export const sampleUsers = sampleProfiles as any;
