import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// LocalStorage build: emulates realtime by listening to custom DOM events
// fired from the data layer.
export function RealtimeNotifications() {
  const { user } = useAuth();
  const qc = useQueryClient();

  useEffect(() => {
    if (!user) return;
    const onNotif = (e: Event) => {
      const n = (e as CustomEvent).detail;
      if (n && n.user_id === user.id) {
        toast.info(n.title, { description: n.message });
        qc.invalidateQueries({ queryKey: ["notifications"] });
        qc.invalidateQueries({ queryKey: ["conversations"] });
        qc.invalidateQueries({ queryKey: ["messages"] });
      }
    };
    window.addEventListener("eden:notification", onNotif);
    return () => window.removeEventListener("eden:notification", onNotif);
  }, [user?.id, qc]);

  return null;
}
