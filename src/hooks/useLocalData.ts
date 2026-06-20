// LocalStorage-backed hooks. Names & signatures kept identical to previous Supabase versions
// so consuming pages stay unchanged.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  adsStore, favoritesStore, conversationsStore, reviewsStore,
  reportsStore, notificationsStore, historyStore, authStore,
} from "@/lib/localStorage";

// ============ ADS ============
export function useAds(filters?: { category?: string; city?: string; query?: string }) {
  return useQuery({
    queryKey: ["ads", filters],
    queryFn: async () => adsStore.list(filters),
  });
}

export function useAd(id: string | undefined) {
  return useQuery({
    queryKey: ["ad", id],
    queryFn: async () => (id ? adsStore.byId(id) : null),
    enabled: !!id,
  });
}

export function useSuggestedAds(currentAd: any) {
  return useQuery({
    queryKey: ["suggested-ads", currentAd?.id],
    queryFn: async () => {
      if (!currentAd) return [];
      return adsStore.list({ category: currentAd.category })
        .filter((a) => a.id !== currentAd.id)
        .slice(0, 6);
    },
    enabled: !!currentAd,
  });
}

export function useUserAds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-ads", user?.id],
    queryFn: async () => (user ? adsStore.byUser(user.id) : []),
    enabled: !!user,
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ad: any) => adsStore.create(ad),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
      qc.invalidateQueries({ queryKey: ["user-ads"] });
      qc.invalidateQueries({ queryKey: ["all-ads"] });
    },
  });
}

export function useIncrementViews() {
  return useMutation({
    mutationFn: async (adId: string) => { adsStore.incrementViews(adId); },
  });
}

// ============ FAVORITES ============
export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => (user ? favoritesStore.forUser(user.id) : []),
    enabled: !!user,
  });
}

export function useFavoriteAds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-ads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const ids = favoritesStore.forUser(user.id);
      return ids.length ? adsStore.byIds(ids) : [];
    },
    enabled: !!user,
  });
}

export function useToggleFavorite() {
  const { user } = useAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (adId: string) => {
      if (!user) throw new Error("Not authenticated");
      return favoritesStore.toggle(user.id, adId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites"] });
      qc.invalidateQueries({ queryKey: ["favorite-ads"] });
    },
  });
}

// ============ CONVERSATIONS & MESSAGES ============
export function useConversations() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: async () => (user ? conversationsStore.forUser(user.id) : []),
    enabled: !!user,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => (conversationId ? conversationsStore.messages(conversationId) : []),
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ receiverId, adId, adTitle, content }: { receiverId: string; adId: string; adTitle: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const conv = conversationsStore.ensureConversation(user.id, receiverId, adId, adTitle);
      return conversationsStore.sendMessage(conv.id, user.id, content);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useSendMessageInConversation() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ conversationId, content, type, media }: { conversationId: string; content: string; type?: "text" | "image" | "audio"; media?: string | null }) => {
      if (!user) throw new Error("Not authenticated");
      return conversationsStore.sendMessage(conversationId, user.id, content, { type, media });
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
    },
  });
}

export function useToggleBlock() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (otherId: string) => {
      if (!user) throw new Error("Not authenticated");
      return authStore.toggleBlock(user.id, otherId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["blocked"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useBlockedUsers() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["blocked", user?.id],
    queryFn: async () => (user ? authStore.getBlocked(user.id) : []),
    enabled: !!user,
  });
}

export function useMarkMessagesRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return;
      conversationsStore.markRead(conversationId, user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// ============ REVIEWS ============
export function useReviews(adId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", adId],
    queryFn: async () => (adId ? reviewsStore.forAd(adId) : []),
    enabled: !!adId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { ad_id: string; user_id: string; user_name: string; rating: number; comment: string }) =>
      reviewsStore.add(review),
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["reviews", vars.ad_id] }),
  });
}

// ============ REPORTS ============
export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: { ad_id: string; reporter_id: string; reason: string; details?: string }) =>
      reportsStore.add(report),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => reportsStore.list(),
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ reportId, status, adStatus }: { reportId: string; status: string; adStatus?: string }) => {
      if (!user) throw new Error("Not authenticated");
      const r = reportsStore.update(reportId, status, user.id);
      if (adStatus && r) adsStore.update(r.ad_id, { status: adStatus as any });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["ads"] });
      qc.invalidateQueries({ queryKey: ["all-ads"] });
    },
  });
}

// ============ NOTIFICATIONS ============
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => (user ? notificationsStore.forUser(user.id) : []),
    enabled: !!user,
  });
}

export function useMarkNotifRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notifId: string) => { notificationsStore.markRead(notifId); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotifsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => { if (user) notificationsStore.markAllRead(user.id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ============ HISTORY ============
export function useHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["history", user?.id],
    queryFn: async () => (user ? historyStore.forUser(user.id) : []),
    enabled: !!user,
  });
}

export function useAddHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { user_id: string; ad_id: string; ad_title: string; ad_image: string; ad_price: number; action: string }) => {
      historyStore.add(entry);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}

export function useClearHistory() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => { if (user) historyStore.clear(user.id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}

// ============ PROFILES ============
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const p = authStore.getProfile(userId) as any;
      if (!p) return null;
      const { password, ...safe } = p;
      return safe;
    },
    enabled: !!userId,
  });
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => authStore.getAllProfiles().map(({ password, ...p }: any) => p),
  });
}

// ============ CERTIFICATION ============
export function useCertifyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, certified }: { userId: string; certified: boolean }) => {
      authStore.updateProfile(userId, { is_certified: certified } as any);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-profiles"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

// ============ ALL ADS (admin) ============
export function useAllAds() {
  return useQuery({
    queryKey: ["all-ads"],
    queryFn: async () => adsStore.listAll(),
  });
}

export function useUpdateAdStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ adId, status }: { adId: string; status: string }) => {
      adsStore.update(adId, { status: status as any });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
      qc.invalidateQueries({ queryKey: ["all-ads"] });
    },
  });
}
