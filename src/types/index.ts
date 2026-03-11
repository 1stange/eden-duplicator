export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  avatar: string;
  createdAt: string;
  role?: 'entreprise' | 'particulier';
  companyName?: string;
  pseudo?: string;
  gender?: 'homme' | 'femme' | 'autre';
  firstName?: string;
  lastName?: string;
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
  lat?: number;
  lng?: number;
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

// Coordinates for Congo cities (for map)
export const CITY_COORDS: Record<string, [number, number]> = {
  "Brazzaville": [-4.2634, 15.2429],
  "Pointe-Noire": [-4.7692, 11.8664],
  "Dolisie": [-4.1986, 12.6668],
  "Nkayi": [-4.1744, 13.2847],
  "Ouesso": [1.6138, 16.0517],
  "Owando": [-0.4864, 15.8997],
  "Impfondo": [1.6180, 18.0596],
  "Madingou": [-4.1536, 13.5500],
  "Sibiti": [-3.6833, 13.3500],
  "Kinkala": [-4.3614, 14.7644],
  "Mossendjo": [-2.9500, 12.7000],
  "Gamboma": [-1.8764, 15.8644],
  "Djambala": [-2.5439, 14.7536],
  "Ewo": [-0.8728, 14.8203],
  "Loandjili": [-4.7560, 11.8580],
};

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
