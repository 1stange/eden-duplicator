import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { notifications as notifStorage } from "@/lib/localStorage";
import { Bell, Check, CheckCheck, Info, MessageSquare, AlertTriangle, ShoppingBag } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info className="h-4 w-4 text-eden-info" />,
  success: <Check className="h-4 w-4 text-eden-success" />,
  warning: <AlertTriangle className="h-4 w-4 text-accent" />,
  ad: <ShoppingBag className="h-4 w-4 text-primary" />,
  message: <MessageSquare className="h-4 w-4 text-primary" />,
};

export default function Notifications() {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState(user ? notifStorage.getForUser(user.id) : []);

  if (!user) return null;

  const markAllRead = () => {
    notifStorage.markAllAsRead(user.id);
    setNotifs(notifStorage.getForUser(user.id));
  };

  const markRead = (id: string) => {
    notifStorage.markAsRead(id);
    setNotifs(notifStorage.getForUser(user.id));
  };

  const unreadCount = notifs.filter((n) => !n.read).length;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="eden-section-title">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-sm text-primary hover:underline flex items-center gap-1">
            <CheckCheck className="h-4 w-4" /> Tout marquer lu
          </button>
        )}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucune notification</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left eden-card p-4 transition-all ${!n.read ? "border-primary/20 bg-primary/5" : "opacity-70"}`}
            >
              <div className="flex gap-3">
                <div className="mt-0.5">{typeIcons[n.type] || typeIcons.info}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-sm ${!n.read ? "font-semibold text-foreground" : "text-foreground"}`}>{n.title}</p>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.createdAt).toLocaleDateString("fr-FR")}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
