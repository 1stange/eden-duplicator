import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ============ ADS ============
export function useAds(filters?: { category?: string; city?: string; query?: string }) {
  return useQuery({
    queryKey: ["ads", filters],
    queryFn: async () => {
      let q = supabase.from("ads").select("*").eq("status", "active").order("created_at", { ascending: false });
      if (filters?.category) q = q.eq("category", filters.category);
      if (filters?.city) q = q.eq("city", filters.city);
      if (filters?.query) q = q.or(`title.ilike.%${filters.query}%,description.ilike.%${filters.query}%`);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function useAd(id: string | undefined) {
  return useQuery({
    queryKey: ["ad", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from("ads").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useSuggestedAds(currentAd: any) {
  return useQuery({
    queryKey: ["suggested-ads", currentAd?.id],
    queryFn: async () => {
      if (!currentAd) return [];
      const { data } = await supabase
        .from("ads")
        .select("*")
        .eq("status", "active")
        .eq("category", currentAd.category)
        .neq("id", currentAd.id)
        .order("created_at", { ascending: false })
        .limit(6);
      return data || [];
    },
    enabled: !!currentAd,
  });
}

export function useUserAds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-ads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("ads").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
}

export function useCreateAd() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ad: any) => {
      const { data, error } = await supabase.from("ads").insert(ad).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["ads"] }),
  });
}

export function useIncrementViews() {
  return useMutation({
    mutationFn: async (adId: string) => {
      const { data: ad } = await supabase.from("ads").select("views").eq("id", adId).single();
      if (ad) {
        await supabase.from("ads").update({ views: (ad.views || 0) + 1 }).eq("id", adId);
      }
    },
  });
}

// ============ FAVORITES ============
export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("favorites").select("ad_id").eq("user_id", user.id);
      return data?.map((f: any) => f.ad_id) || [];
    },
    enabled: !!user,
  });
}

export function useFavoriteAds() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["favorite-ads", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data: favs } = await supabase.from("favorites").select("ad_id").eq("user_id", user.id);
      if (!favs?.length) return [];
      const ids = favs.map((f: any) => f.ad_id);
      const { data: ads } = await supabase.from("ads").select("*").in("id", ids);
      return ads || [];
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
      const { data: existing } = await supabase.from("favorites").select("id").eq("user_id", user.id).eq("ad_id", adId).single();
      if (existing) {
        await supabase.from("favorites").delete().eq("id", existing.id);
        return false;
      } else {
        await supabase.from("favorites").insert({ user_id: user.id, ad_id: adId });
        return true;
      }
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
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("conversations")
        .select(`*, messages(*)`)
        .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
        .order("updated_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      return data || [];
    },
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ receiverId, adId, adTitle, content }: { receiverId: string; adId: string; adTitle: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${receiverId}),and(participant_1.eq.${receiverId},participant_2.eq.${user.id})`)
        .eq("ad_id", adId)
        .single();

      let conversationId: string;
      if (existing) {
        conversationId = existing.id;
        await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
      } else {
        const { data: newConv, error } = await supabase.from("conversations").insert({
          participant_1: user.id, participant_2: receiverId, ad_id: adId, ad_title: adTitle,
        }).select().single();
        if (error) throw error;
        conversationId = newConv.id;
      }

      const { data: msg, error } = await supabase.from("messages").insert({
        conversation_id: conversationId, sender_id: user.id, content,
      }).select().single();
      if (error) throw error;
      return msg;
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
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("conversations").update({ updated_at: new Date().toISOString() }).eq("id", conversationId);
      const { data, error } = await supabase.from("messages").insert({
        conversation_id: conversationId, sender_id: user.id, content,
      }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["conversations"] });
      qc.invalidateQueries({ queryKey: ["messages", vars.conversationId] });
    },
  });
}

export function useMarkMessagesRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user) return;
      await supabase.from("messages").update({ read: true }).eq("conversation_id", conversationId).neq("sender_id", user.id);
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
    queryFn: async () => {
      if (!adId) return [];
      const { data } = await supabase.from("reviews").select("*").eq("ad_id", adId).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!adId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (review: { ad_id: string; user_id: string; user_name: string; rating: number; comment: string }) => {
      const { data, error } = await supabase.from("reviews").insert(review).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ["reviews", vars.ad_id] }),
  });
}

// ============ REPORTS ============
export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (report: { ad_id: string; reporter_id: string; reason: string; details?: string }) => {
      const { data, error } = await supabase.from("reports").insert(report).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reports"] }),
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data } = await supabase.from("reports").select("*, ads(title, images, user_name, category, city)").order("created_at", { ascending: false });
      return data || [];
    },
  });
}

export function useUpdateReport() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async ({ reportId, status, adStatus }: { reportId: string; status: string; adStatus?: string }) => {
      if (!user) throw new Error("Not authenticated");
      await supabase.from("reports").update({ status, reviewed_by: user.id, reviewed_at: new Date().toISOString() }).eq("id", reportId);
      if (adStatus) {
        const { data: report } = await supabase.from("reports").select("ad_id").eq("id", reportId).single();
        if (report) await supabase.from("ads").update({ status: adStatus }).eq("id", report.ad_id);
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
      qc.invalidateQueries({ queryKey: ["ads"] });
    },
  });
}

// ============ NOTIFICATIONS ============
export function useNotifications() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });
}

export function useMarkNotifRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (notifId: string) => {
      await supabase.from("notifications").update({ read: true }).eq("id", notifId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotifsRead() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("notifications").update({ read: true }).eq("user_id", user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ============ HISTORY ============
export function useHistory() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase.from("history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100);
      return data || [];
    },
    enabled: !!user,
  });
}

export function useAddHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (entry: { user_id: string; ad_id: string; ad_title: string; ad_image: string; ad_price: number; action: string }) => {
      await supabase.from("history").insert(entry);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}

export function useClearHistory() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async () => {
      if (!user) return;
      await supabase.from("history").delete().eq("user_id", user.id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }),
  });
}

// ============ PROFILES ============
export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
      return data;
    },
    enabled: !!userId,
  });
}

// ============ CERTIFICATION ============
export function useCertifyUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, certified }: { userId: string; certified: boolean }) => {
      const { error } = await supabase.from("profiles").update({ is_certified: certified } as any).eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["all-profiles"] });
      qc.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useAllProfiles() {
  return useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });
}

// ============ ALL ADS (for admin) ============
export function useAllAds() {
  return useQuery({
    queryKey: ["all-ads"],
    queryFn: async () => {
      const { data } = await supabase.from("ads").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });
}

export function useUpdateAdStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ adId, status }: { adId: string; status: string }) => {
      await supabase.from("ads").update({ status }).eq("id", adId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ads"] });
      qc.invalidateQueries({ queryKey: ["all-ads"] });
    },
  });
}
