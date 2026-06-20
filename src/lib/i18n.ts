import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

const fr = {
  common: {
    home: "Accueil", search: "Recherche", publish: "Publier", favorites: "Favoris",
    messages: "Messages", notifications: "Notifications", history: "Historique",
    settings: "Paramètres", profile: "Profil", admin: "Modération", analytics: "Analytiques",
    logout: "Déconnexion", login: "Connexion", signup: "Inscription",
    save: "Enregistrer", cancel: "Annuler", send: "Envoyer", delete: "Supprimer",
    language: "Langue", theme: "Thème", account: "Compte",
    block: "Bloquer", unblock: "Débloquer", typing: "en train d'écrire…",
    distance_km: "{{km}} km", filters: "Filtres", price: "Prix", city: "Ville",
    category: "Catégorie", certifiedOnly: "Certifiés uniquement", apply: "Appliquer",
    report: "Signaler", reportSent: "Signalement envoyé, merci !",
    reportReason: "Raison du signalement…",
    report_scam: "Arnaque", report_illegal: "Contenu illégal",
    report_fake: "Faux profil", report_other: "Autre",
  },
};
const en = {
  common: {
    home: "Home", search: "Search", publish: "Publish", favorites: "Favorites",
    messages: "Messages", notifications: "Notifications", history: "History",
    settings: "Settings", profile: "Profile", admin: "Moderation", analytics: "Analytics",
    logout: "Logout", login: "Login", signup: "Sign up",
    save: "Save", cancel: "Cancel", send: "Send", delete: "Delete",
    language: "Language", theme: "Theme", account: "Account",
    block: "Block", unblock: "Unblock", typing: "typing…",
    distance_km: "{{km}} km", filters: "Filters", price: "Price", city: "City",
    category: "Category", certifiedOnly: "Certified only", apply: "Apply",
    report: "Report", reportSent: "Report sent, thanks!",
    reportReason: "Report reason…",
    report_scam: "Scam", report_illegal: "Illegal content",
    report_fake: "Fake profile", report_other: "Other",
  },
};
const ln = {
  common: {
    home: "Ndako", search: "Koluka", publish: "Kotia", favorites: "Bilembo",
    messages: "Bansango", notifications: "Bayebisi", history: "Mokolo na mokolo",
    settings: "Bibongiseli", profile: "Mwa moto", admin: "Bokengeli", analytics: "Bituluku",
    logout: "Kobima", login: "Kokota", signup: "Komikomisa",
    save: "Kobomba", cancel: "Kotika", send: "Kotinda", delete: "Kolongola",
    language: "Lokota", theme: "Lolenge", account: "Konti",
    block: "Kokanga", unblock: "Kofungola", typing: "azali kokoma…",
    distance_km: "{{km}} km", filters: "Bopona", price: "Talo", city: "Engumba",
    category: "Lolenge", certifiedOnly: "Bandimi kaka", apply: "Salela",
    report: "Koyebisa", reportSent: "Boyebisi etindami, matondo!",
    reportReason: "Ntina ya boyebisi…",
    report_scam: "Moyibi", report_illegal: "Eloko ya mabe",
    report_fake: "Profil ya lokuta", report_other: "Mosusu",
  },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
  fallbackLng: "fr",
  supportedLngs: ["fr", "en", "ln"],
  defaultNS: "common",
  resources: { fr, en, ln },
  detection: { order: ["localStorage", "navigator"], lookupLocalStorage: "eden_lang", caches: ["localStorage"] },
  interpolation: { escapeValue: false },
});

export default i18n;

export const LANGUAGES = [
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "ln", label: "Lingala", flag: "🇨🇬" },
] as const;
