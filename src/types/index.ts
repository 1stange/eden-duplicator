export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar: string;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  city: string;
  images: string[];
  userId: string;
  userName: string;
  userPhone: string;
  isPremium: boolean;
  isUrgent: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  adId: string;
  adTitle: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'ad' | 'message';
  read: boolean;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  userId: string;
  adId: string;
  adTitle: string;
  adImage: string;
  adPrice: number;
  action: 'view' | 'favorite' | 'contact' | 'publish';
  createdAt: string;
}

export interface AppSettings {
  notifications: boolean;
  language: string;
  currency: string;
  theme: 'light' | 'dark';
}

export type Category = {
  id: string;
  name: string;
  icon: string;
  count: number;
};

export const CONGO_CITIES = [
  "Brazzaville",
  "Pointe-Noire",
  "Dolisie",
  "Nkayi",
  "Ouesso",
  "Owando",
  "Impfondo",
  "Madingou",
  "Sibiti",
  "Kinkala",
  "Mossendjo",
  "Gamboma",
  "Djambala",
  "Ewo",
  "Loandjili",
] as const;

export const CATEGORIES = [
  { id: "vehicules", name: "Véhicules", icon: "🚗", count: 0 },
  { id: "immobilier", name: "Immobilier", icon: "🏠", count: 0 },
  { id: "electronique", name: "Électronique", icon: "📱", count: 0 },
  { id: "mode", name: "Mode & Vêtements", icon: "👗", count: 0 },
  { id: "maison", name: "Maison & Jardin", icon: "🪴", count: 0 },
  { id: "emploi", name: "Emploi", icon: "💼", count: 0 },
  { id: "services", name: "Services", icon: "🔧", count: 0 },
  { id: "loisirs", name: "Loisirs & Sports", icon: "⚽", count: 0 },
  { id: "alimentation", name: "Alimentation", icon: "🍽️", count: 0 },
  { id: "education", name: "Éducation", icon: "📚", count: 0 },
  { id: "sante", name: "Santé & Beauté", icon: "💊", count: 0 },
  { id: "animaux", name: "Animaux", icon: "🐕", count: 0 },
] as const;
