// LocalStorage-backed data layer. All snake_case to mirror the previous Supabase shapes.
import {
  sampleProfiles, sampleAds, sampleConversations, sampleMessages,
  sampleNotifications, sampleReviews, sampleReports, sampleFavorites,
  MockProfile, MockAd,
} from "./seedData";

const KEYS = {
  CURRENT_USER_ID: "eden_current_user_id",
  PROFILES: "eden_profiles",
  ADS: "eden_ads",
  FAVORITES: "eden_favorites",
  CONVERSATIONS: "eden_conversations",
  MESSAGES: "eden_messages",
  NOTIFICATIONS: "eden_notifications",
  HISTORY: "eden_history",
  REVIEWS: "eden_reviews",
  REPORTS: "eden_reports",
  USER_ROLES: "eden_user_roles",
  SETTINGS: "eden_settings",
  INITIALIZED: "eden_initialized_v4",
  ADS_SEED_VERSION: "eden_ads_seed_version",
};

const ADS_SEED_VERSION = "v2-2026-05-22";

function get<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function set(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

const uid = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const now = () => new Date().toISOString();

export function initializeData() {
  if (localStorage.getItem(KEYS.INITIALIZED) === "true") return;
  set(KEYS.PROFILES, sampleProfiles);
  set(KEYS.ADS, sampleAds);
  set(KEYS.CONVERSATIONS, sampleConversations);
  set(KEYS.MESSAGES, sampleMessages);
  set(KEYS.NOTIFICATIONS, sampleNotifications);
  set(KEYS.REVIEWS, sampleReviews);
  set(KEYS.REPORTS, sampleReports);
  set(KEYS.FAVORITES, sampleFavorites);
  set(KEYS.HISTORY, []);
  set(KEYS.USER_ROLES, [
    { user_id: "user-admin", role: "admin" },
  ]);
  set(KEYS.SETTINGS, { notifications: true, language: "fr", currency: "FCFA", theme: "light" });
  localStorage.setItem(KEYS.INITIALIZED, "true");
}

// Ensure seed always available on import
initializeData();

// Non-destructive merge for new seed ads (keeps user-edited profiles & ads intact)
function mergeNewAds() {
  if (localStorage.getItem(KEYS.ADS_SEED_VERSION) === ADS_SEED_VERSION) return;
  const existing = get<MockAd[]>(KEYS.ADS, []);
  const ids = new Set(existing.map((a) => a.id));
  const additions = sampleAds.filter((a) => !ids.has(a.id));
  if (additions.length) set(KEYS.ADS, [...additions, ...existing]);
  localStorage.setItem(KEYS.ADS_SEED_VERSION, ADS_SEED_VERSION);
}
mergeNewAds();

// ---------- AUTH ----------
export const authStore = {
  getCurrentUserId(): string | null {
    return localStorage.getItem(KEYS.CURRENT_USER_ID);
  },
  setCurrentUserId(id: string | null) {
    if (id) localStorage.setItem(KEYS.CURRENT_USER_ID, id);
    else localStorage.removeItem(KEYS.CURRENT_USER_ID);
  },
  login(email: string, password: string): MockProfile | null {
    const profiles = get<MockProfile[]>(KEYS.PROFILES, []);
    const p = profiles.find((u) => u.email.toLowerCase() === email.toLowerCase() && (u as any).password === password);
    if (!p) return null;
    this.setCurrentUserId(p.id);
    return p;
  },
  signup(data: Partial<MockProfile> & { email: string; password: string; name: string }): { profile?: MockProfile; error?: string } {
    const profiles = get<MockProfile[]>(KEYS.PROFILES, []);
    if (profiles.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      return { error: "Un compte existe déjà avec cet email." };
    }
    const id = uid("user");
    const profile: MockProfile = {
      id,
      email: data.email,
      password: data.password,
      name: data.name,
      phone: data.phone ?? null,
      city: data.city ?? "Brazzaville",
      avatar: data.avatar ?? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`,
      first_name: data.first_name ?? null,
      last_name: data.last_name ?? null,
      pseudo: data.pseudo ?? null,
      gender: data.gender ?? null,
      role: (data.role as any) ?? "particulier",
      company_name: data.company_name ?? null,
      birth_date: data.birth_date ?? null,
      is_certified: false,
      created_at: now(),
    };
    profiles.push(profile);
    set(KEYS.PROFILES, profiles);
    this.setCurrentUserId(id);
    return { profile };
  },
  logout() { this.setCurrentUserId(null); },
  getProfile(id: string): MockProfile | null {
    return get<MockProfile[]>(KEYS.PROFILES, []).find((p) => p.id === id) || null;
  },
  updateProfile(id: string, updates: Partial<MockProfile>): MockProfile | null {
    const profiles = get<MockProfile[]>(KEYS.PROFILES, []);
    const idx = profiles.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    profiles[idx] = { ...profiles[idx], ...updates };
    set(KEYS.PROFILES, profiles);
    return profiles[idx];
  },
  getAllProfiles(): MockProfile[] {
    return get<MockProfile[]>(KEYS.PROFILES, []);
  },
  hasRole(userId: string, role: string): boolean {
    const profile = this.getProfile(userId);
    if (profile?.role === role) return true;
    const roles = get<{ user_id: string; role: string }[]>(KEYS.USER_ROLES, []);
    return roles.some((r) => r.user_id === userId && r.role === role);
  },
  getBlocked(userId: string): string[] {
    const p = this.getProfile(userId) as any;
    return Array.isArray(p?.blocked) ? p.blocked : [];
  },
  isBlocked(userId: string, otherId: string): boolean {
    return this.getBlocked(userId).includes(otherId);
  },
  toggleBlock(userId: string, otherId: string): boolean {
    const blocked = this.getBlocked(userId);
    const i = blocked.indexOf(otherId);
    if (i >= 0) blocked.splice(i, 1); else blocked.push(otherId);
    this.updateProfile(userId, { blocked } as any);
    return blocked.includes(otherId);
  },
};

// ---------- ADS ----------
export const adsStore = {
  list(filters?: { category?: string; city?: string; query?: string; status?: string }): MockAd[] {
    let list = get<MockAd[]>(KEYS.ADS, []);
    const status = filters?.status ?? "active";
    list = list.filter((a) => a.status === status);
    if (filters?.category) list = list.filter((a) => a.category === filters.category);
    if (filters?.city) list = list.filter((a) => a.city === filters.city);
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
    }
    return list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
  listAll(): MockAd[] {
    return get<MockAd[]>(KEYS.ADS, []).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
  byId(id: string): MockAd | null {
    return get<MockAd[]>(KEYS.ADS, []).find((a) => a.id === id) || null;
  },
  byUser(userId: string): MockAd[] {
    return get<MockAd[]>(KEYS.ADS, []).filter((a) => a.user_id === userId);
  },
  byIds(ids: string[]): MockAd[] {
    const set = new Set(ids);
    return get<MockAd[]>(KEYS.ADS, []).filter((a) => set.has(a.id));
  },
  create(ad: Partial<MockAd>): MockAd {
    const all = get<MockAd[]>(KEYS.ADS, []);
    const newAd: MockAd = {
      id: uid("ad"),
      title: ad.title || "",
      description: ad.description || "",
      price: ad.price ?? 0,
      currency: ad.currency || "FCFA",
      category: ad.category || "produits-adultes",
      city: ad.city || "Brazzaville",
      images: ad.images || [],
      video: ad.video || null,
      user_id: ad.user_id!,
      user_name: ad.user_name!,
      user_phone: ad.user_phone || "",
      is_premium: !!ad.is_premium,
      is_urgent: !!ad.is_urgent,
      views: 0,
      status: "active",
      created_at: now(),
      updated_at: now(),
    };
    all.unshift(newAd);
    set(KEYS.ADS, all);
    return newAd;
  },
  update(id: string, updates: Partial<MockAd>): MockAd | null {
    const all = get<MockAd[]>(KEYS.ADS, []);
    const i = all.findIndex((a) => a.id === id);
    if (i < 0) return null;
    all[i] = { ...all[i], ...updates, updated_at: now() };
    set(KEYS.ADS, all);
    return all[i];
  },
  incrementViews(id: string) {
    const ad = this.byId(id);
    if (ad) this.update(id, { views: (ad.views || 0) + 1 });
  },
};

// ---------- FAVORITES ----------
export const favoritesStore = {
  forUser(userId: string): string[] {
    return get<{ user_id: string; ad_id: string }[]>(KEYS.FAVORITES, [])
      .filter((f) => f.user_id === userId)
      .map((f) => f.ad_id);
  },
  toggle(userId: string, adId: string): boolean {
    const list = get<{ user_id: string; ad_id: string }[]>(KEYS.FAVORITES, []);
    const idx = list.findIndex((f) => f.user_id === userId && f.ad_id === adId);
    if (idx >= 0) {
      list.splice(idx, 1);
      set(KEYS.FAVORITES, list);
      return false;
    }
    list.push({ user_id: userId, ad_id: adId });
    set(KEYS.FAVORITES, list);
    return true;
  },
};

// ---------- CONVERSATIONS & MESSAGES ----------
export interface MockConversation {
  id: string; participant_1: string; participant_2: string;
  ad_id: string; ad_title: string; created_at: string; updated_at: string;
  messages?: MockMessage[];
}
export interface MockMessage {
  id: string; conversation_id: string; sender_id: string;
  content: string; read: boolean; created_at: string;
  type?: "text" | "image" | "audio"; media?: string | null;
}

export const conversationsStore = {
  forUser(userId: string): MockConversation[] {
    const convs = get<MockConversation[]>(KEYS.CONVERSATIONS, []);
    const msgs = get<MockMessage[]>(KEYS.MESSAGES, []);
    return convs
      .filter((c) => c.participant_1 === userId || c.participant_2 === userId)
      .map((c) => ({ ...c, messages: msgs.filter((m) => m.conversation_id === c.id) }))
      .sort((a, b) => (a.updated_at < b.updated_at ? 1 : -1));
  },
  messages(conversationId: string): MockMessage[] {
    return get<MockMessage[]>(KEYS.MESSAGES, [])
      .filter((m) => m.conversation_id === conversationId)
      .sort((a, b) => (a.created_at < b.created_at ? -1 : 1));
  },
  ensureConversation(userId: string, receiverId: string, adId: string, adTitle: string): MockConversation {
    const convs = get<MockConversation[]>(KEYS.CONVERSATIONS, []);
    let conv = convs.find((c) => c.ad_id === adId && (
      (c.participant_1 === userId && c.participant_2 === receiverId) ||
      (c.participant_1 === receiverId && c.participant_2 === userId)
    ));
    if (!conv) {
      conv = {
        id: uid("conv"), participant_1: userId, participant_2: receiverId,
        ad_id: adId, ad_title: adTitle, created_at: now(), updated_at: now(),
      };
      convs.push(conv);
      set(KEYS.CONVERSATIONS, convs);
    } else {
      conv.updated_at = now();
      set(KEYS.CONVERSATIONS, convs);
    }
    return conv;
  },
  touch(conversationId: string) {
    const convs = get<MockConversation[]>(KEYS.CONVERSATIONS, []);
    const c = convs.find((x) => x.id === conversationId);
    if (c) { c.updated_at = now(); set(KEYS.CONVERSATIONS, convs); }
  },
  sendMessage(conversationId: string, senderId: string, content: string, opts?: { type?: "text" | "image" | "audio"; media?: string | null }): MockMessage | { error: string } {
    const conv = get<MockConversation[]>(KEYS.CONVERSATIONS, []).find((c) => c.id === conversationId);
    if (conv) {
      const otherId = conv.participant_1 === senderId ? conv.participant_2 : conv.participant_1;
      // Block guard: either party blocked the other → no send
      if (authStore.isBlocked(senderId, otherId)) return { error: "Vous avez bloqué cet utilisateur." };
      if (authStore.isBlocked(otherId, senderId)) return { error: "Ce contact ne peut pas recevoir vos messages." };
    }
    const msgs = get<MockMessage[]>(KEYS.MESSAGES, []);
    const m: MockMessage = {
      id: uid("msg"), conversation_id: conversationId, sender_id: senderId,
      content, read: false, created_at: now(),
      type: opts?.type || "text", media: opts?.media ?? null,
    };
    msgs.push(m);
    set(KEYS.MESSAGES, msgs);
    this.touch(conversationId);

    if (conv) {
      const otherId = conv.participant_1 === senderId ? conv.participant_2 : conv.participant_1;
      const sender = authStore.getProfile(senderId);
      const preview = m.type === "image" ? "📷 Image" : m.type === "audio" ? "🎤 Vocal" : content;
      notificationsStore.add({
        user_id: otherId,
        title: "💬 Nouveau message",
        message: `${sender?.name || "Quelqu'un"}: ${preview.slice(0, 60)}`,
        type: "message",
      });
    }
    return m;
  },

  markRead(conversationId: string, currentUserId: string) {
    const msgs = get<MockMessage[]>(KEYS.MESSAGES, []);
    let changed = false;
    msgs.forEach((m) => {
      if (m.conversation_id === conversationId && m.sender_id !== currentUserId && !m.read) {
        m.read = true; changed = true;
      }
    });
    if (changed) set(KEYS.MESSAGES, msgs);
  },
};

// ---------- REVIEWS ----------
export const reviewsStore = {
  forAd(adId: string) {
    return get<any[]>(KEYS.REVIEWS, [])
      .filter((r) => r.ad_id === adId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
  add(review: { ad_id: string; user_id: string; user_name: string; rating: number; comment: string }) {
    const all = get<any[]>(KEYS.REVIEWS, []);
    const r = { ...review, id: uid("rev"), created_at: now() };
    all.unshift(r);
    set(KEYS.REVIEWS, all);
    return r;
  },
};

// ---------- REPORTS ----------
export const reportsStore = {
  list() {
    const reports = get<any[]>(KEYS.REPORTS, []);
    const ads = get<MockAd[]>(KEYS.ADS, []);
    return reports
      .map((r) => ({ ...r, ads: ads.find((a) => a.id === r.ad_id) || null }))
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
  add(report: { ad_id: string; reporter_id: string; reason: string; details?: string }) {
    const all = get<any[]>(KEYS.REPORTS, []);
    const r = { ...report, id: uid("rep"), status: "pending", reviewed_by: null, reviewed_at: null, admin_notes: "", created_at: now() };
    all.unshift(r);
    set(KEYS.REPORTS, all);
    return r;
  },
  update(reportId: string, patch: { status?: string; admin_notes?: string; reviewerId?: string }) {
    const all = get<any[]>(KEYS.REPORTS, []);
    const r = all.find((x) => x.id === reportId);
    if (r) {
      if (patch.status !== undefined) r.status = patch.status;
      if (patch.admin_notes !== undefined) r.admin_notes = patch.admin_notes;
      if (patch.reviewerId) { r.reviewed_by = patch.reviewerId; r.reviewed_at = now(); }
      set(KEYS.REPORTS, all);
    }
    return r;
  },
  remove(reportId: string) {
    set(KEYS.REPORTS, get<any[]>(KEYS.REPORTS, []).filter((r) => r.id !== reportId));
  },
};


// ---------- NOTIFICATIONS ----------
export const notificationsStore = {
  forUser(userId: string) {
    return get<any[]>(KEYS.NOTIFICATIONS, [])
      .filter((n) => n.user_id === userId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  },
  add(notif: { user_id: string; title: string; message: string; type: string }) {
    const all = get<any[]>(KEYS.NOTIFICATIONS, []);
    const n = { ...notif, id: uid("notif"), read: false, created_at: now() };
    all.unshift(n);
    set(KEYS.NOTIFICATIONS, all);
    window.dispatchEvent(new CustomEvent("eden:notification", { detail: n }));
    return n;
  },
  markRead(id: string) {
    const all = get<any[]>(KEYS.NOTIFICATIONS, []);
    const n = all.find((x) => x.id === id);
    if (n) { n.read = true; set(KEYS.NOTIFICATIONS, all); }
  },
  markAllRead(userId: string) {
    const all = get<any[]>(KEYS.NOTIFICATIONS, []);
    all.forEach((n) => { if (n.user_id === userId) n.read = true; });
    set(KEYS.NOTIFICATIONS, all);
  },
};

// ---------- HISTORY ----------
export const historyStore = {
  forUser(userId: string) {
    return get<any[]>(KEYS.HISTORY, [])
      .filter((h) => h.user_id === userId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
      .slice(0, 100);
  },
  add(entry: { user_id: string; ad_id: string; ad_title: string; ad_image: string; ad_price: number; action: string }) {
    const all = get<any[]>(KEYS.HISTORY, []);
    all.unshift({ ...entry, id: uid("hist"), created_at: now() });
    if (all.length > 500) all.length = 500;
    set(KEYS.HISTORY, all);
  },
  clear(userId: string) {
    set(KEYS.HISTORY, get<any[]>(KEYS.HISTORY, []).filter((h) => h.user_id !== userId));
  },
};

// ---------- SETTINGS ----------
export const settingsStore = {
  get() { return get<any>(KEYS.SETTINGS, { notifications: true, language: "fr", currency: "FCFA", theme: "light" }); },
  update(updates: any) { const s = { ...this.get(), ...updates }; set(KEYS.SETTINGS, s); return s; },
};
