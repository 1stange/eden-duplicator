import { Ad, User, Message, Notification, HistoryEntry, AppSettings } from "@/types";
import { sampleAds, sampleUsers, sampleMessages, sampleNotifications } from "./seedData";

const KEYS = {
  USER: "eden_current_user",
  USERS: "eden_users",
  ADS: "eden_ads",
  FAVORITES: "eden_favorites",
  MESSAGES: "eden_messages",
  NOTIFICATIONS: "eden_notifications",
  HISTORY: "eden_history",
  SETTINGS: "eden_settings",
  INITIALIZED: "eden_initialized",
};

function get<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function initializeData() {
  if (!localStorage.getItem(KEYS.INITIALIZED)) {
    set(KEYS.USERS, sampleUsers);
    set(KEYS.ADS, sampleAds);
    set(KEYS.MESSAGES, sampleMessages);
    set(KEYS.NOTIFICATIONS, sampleNotifications);
    set(KEYS.FAVORITES, []);
    set(KEYS.HISTORY, []);
    set(KEYS.SETTINGS, { notifications: true, language: "fr", currency: "FCFA", theme: "light" });
    localStorage.setItem(KEYS.INITIALIZED, "true");
  }
}

// Auth
export const auth = {
  login(email: string, password: string): User | null {
    const users = get<User[]>(KEYS.USERS, []);
    const user = users.find((u) => u.email === email);
    if (user) {
      set(KEYS.USER, user);
      return user;
    }
    return null;
  },
  signup(data: Omit<User, "id" | "createdAt" | "avatar">): User {
    const users = get<User[]>(KEYS.USERS, []);
    const newUser: User = {
      ...data,
      id: `user-${Date.now()}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
      createdAt: new Date().toISOString().split("T")[0],
    };
    users.push(newUser);
    set(KEYS.USERS, users);
    set(KEYS.USER, newUser);
    return newUser;
  },
  logout() {
    localStorage.removeItem(KEYS.USER);
  },
  getCurrentUser(): User | null {
    return get<User | null>(KEYS.USER, null);
  },
  updateUser(updates: Partial<User>): User | null {
    const user = this.getCurrentUser();
    if (!user) return null;
    const updated = { ...user, ...updates };
    set(KEYS.USER, updated);
    const users = get<User[]>(KEYS.USERS, []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) { users[idx] = updated; set(KEYS.USERS, users); }
    return updated;
  },
};

// Ads
export const ads = {
  getAll(): Ad[] { return get<Ad[]>(KEYS.ADS, []); },
  getById(id: string): Ad | undefined { return this.getAll().find((a) => a.id === id); },
  create(adData: Omit<Ad, "id" | "createdAt" | "updatedAt" | "views">): Ad {
    const all = this.getAll();
    const newAd: Ad = { ...adData, id: `ad-${Date.now()}`, views: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    all.unshift(newAd);
    set(KEYS.ADS, all);
    return newAd;
  },
  update(id: string, updates: Partial<Ad>): Ad | undefined {
    const all = this.getAll();
    const idx = all.findIndex((a) => a.id === id);
    if (idx < 0) return undefined;
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    set(KEYS.ADS, all);
    return all[idx];
  },
  delete(id: string): boolean {
    const all = this.getAll();
    const filtered = all.filter((a) => a.id !== id);
    set(KEYS.ADS, filtered);
    return filtered.length < all.length;
  },
  incrementViews(id: string) {
    const ad = this.getById(id);
    if (ad) this.update(id, { views: ad.views + 1 });
  },
  search(query: string, filters?: { category?: string; city?: string; minPrice?: number; maxPrice?: number }): Ad[] {
    let results = this.getAll();
    if (query) {
      const q = query.toLowerCase();
      results = results.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    if (filters?.category) results = results.filter((a) => a.category === filters.category);
    if (filters?.city) results = results.filter((a) => a.city === filters.city);
    if (filters?.minPrice) results = results.filter((a) => a.price >= filters.minPrice!);
    if (filters?.maxPrice) results = results.filter((a) => a.price <= filters.maxPrice!);
    return results;
  },
};

// Favorites
export const favorites = {
  getAll(): string[] { return get<string[]>(KEYS.FAVORITES, []); },
  add(adId: string) { const all = this.getAll(); if (!all.includes(adId)) { all.push(adId); set(KEYS.FAVORITES, all); } },
  remove(adId: string) { set(KEYS.FAVORITES, this.getAll().filter((id) => id !== adId)); },
  isFavorite(adId: string): boolean { return this.getAll().includes(adId); },
  toggle(adId: string): boolean { if (this.isFavorite(adId)) { this.remove(adId); return false; } this.add(adId); return true; },
};

// Messages
export const messages = {
  getAll(): Message[] { return get<Message[]>(KEYS.MESSAGES, []); },
  getForUser(userId: string): Message[] { return this.getAll().filter((m) => m.senderId === userId || m.receiverId === userId); },
  send(msg: Omit<Message, "id" | "createdAt" | "read">): Message {
    const all = this.getAll();
    const newMsg: Message = { ...msg, id: `msg-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
    all.unshift(newMsg);
    set(KEYS.MESSAGES, all);
    return newMsg;
  },
  markAsRead(id: string) {
    const all = this.getAll();
    const msg = all.find((m) => m.id === id);
    if (msg) { msg.read = true; set(KEYS.MESSAGES, all); }
  },
  getUnreadCount(userId: string): number { return this.getAll().filter((m) => m.receiverId === userId && !m.read).length; },
};

// Notifications
export const notifications = {
  getAll(): Notification[] { return get<Notification[]>(KEYS.NOTIFICATIONS, []); },
  getForUser(userId: string): Notification[] { return this.getAll().filter((n) => n.userId === userId); },
  add(notif: Omit<Notification, "id" | "createdAt" | "read">): Notification {
    const all = this.getAll();
    const n: Notification = { ...notif, id: `notif-${Date.now()}`, read: false, createdAt: new Date().toISOString() };
    all.unshift(n);
    set(KEYS.NOTIFICATIONS, all);
    return n;
  },
  markAsRead(id: string) {
    const all = this.getAll();
    const n = all.find((x) => x.id === id);
    if (n) { n.read = true; set(KEYS.NOTIFICATIONS, all); }
  },
  markAllAsRead(userId: string) {
    const all = this.getAll();
    all.forEach((n) => { if (n.userId === userId) n.read = true; });
    set(KEYS.NOTIFICATIONS, all);
  },
  getUnreadCount(userId: string): number { return this.getAll().filter((n) => n.userId === userId && !n.read).length; },
};

// History
export const history = {
  getAll(): HistoryEntry[] { return get<HistoryEntry[]>(KEYS.HISTORY, []); },
  getForUser(userId: string): HistoryEntry[] { return this.getAll().filter((h) => h.userId === userId); },
  add(entry: Omit<HistoryEntry, "id" | "createdAt">) {
    const all = this.getAll();
    all.unshift({ ...entry, id: `hist-${Date.now()}`, createdAt: new Date().toISOString() });
    if (all.length > 100) all.pop();
    set(KEYS.HISTORY, all);
  },
  clear(userId: string) { set(KEYS.HISTORY, this.getAll().filter((h) => h.userId !== userId)); },
};

// Settings
export const settings = {
  get(): AppSettings { return get<AppSettings>(KEYS.SETTINGS, { notifications: true, language: "fr", currency: "FCFA", theme: "light" }); },
  update(updates: Partial<AppSettings>): AppSettings { const s = { ...this.get(), ...updates }; set(KEYS.SETTINGS, s); return s; },
  reset(): AppSettings { const d: AppSettings = { notifications: true, language: "fr", currency: "FCFA", theme: "light" }; set(KEYS.SETTINGS, d); return d; },
};
