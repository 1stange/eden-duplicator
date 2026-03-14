import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function RealtimeNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;

    // Listen for new messages
    const msgChannel = supabase
      .channel("new-messages-notif")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        const msg = payload.new as any;
        if (msg.sender_id !== user.id) {
          toast.info("💬 Nouveau message", { description: msg.content?.slice(0, 60) });
          qc.invalidateQueries({ queryKey: ["conversations"] });
          qc.invalidateQueries({ queryKey: ["messages"] });
        }
      })
      .subscribe();

    // Listen for notifications
    const notifChannel = supabase
      .channel("new-notifs")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, (payload) => {
        const notif = payload.new as any;
        toast.info(notif.title, { description: notif.message });
        qc.invalidateQueries({ queryKey: ["notifications"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
      supabase.removeChannel(notifChannel);
    };
  }, [user?.id]);

  return null;
}
