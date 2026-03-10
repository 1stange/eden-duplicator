import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { messages as msgStorage } from "@/lib/localStorage";
import { MessageSquare, Send, Check, CheckCheck } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState(user ? msgStorage.getForUser(user.id) : []);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  if (!user) return null;

  // Group by conversation partner
  const conversations = new Map<string, { partnerId: string; partnerName: string; adTitle: string; messages: typeof allMessages }>();
  allMessages.forEach((msg) => {
    const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
    const partnerName = msg.senderId === user.id ? msg.receiverName : msg.senderName;
    const key = `${partnerId}-${msg.adId}`;
    if (!conversations.has(key)) {
      conversations.set(key, { partnerId, partnerName, adTitle: msg.adTitle, messages: [] });
    }
    conversations.get(key)!.messages.push(msg);
  });

  const convList = Array.from(conversations.entries());

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedConv) return;
    const conv = conversations.get(selectedConv);
    if (!conv) return;
    msgStorage.send({
      senderId: user.id,
      senderName: user.name,
      receiverId: conv.partnerId,
      receiverName: conv.partnerName,
      adId: conv.messages[0].adId,
      adTitle: conv.adTitle,
      content: reply.trim(),
    });
    setReply("");
    setAllMessages(msgStorage.getForUser(user.id));
  };

  const selectedMessages = selectedConv ? conversations.get(selectedConv)?.messages || [] : [];

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="eden-section-title mb-6">Messages</h1>

      {convList.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">Aucun message</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-[300px_1fr] gap-4">
          {/* Conversation list */}
          <div className="space-y-2">
            {convList.map(([key, conv]) => {
              const lastMsg = conv.messages[0];
              const unread = conv.messages.filter((m) => m.receiverId === user.id && !m.read).length;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setSelectedConv(key);
                    conv.messages.forEach((m) => { if (m.receiverId === user.id && !m.read) msgStorage.markAsRead(m.id); });
                    setAllMessages(msgStorage.getForUser(user.id));
                  }}
                  className={`w-full text-left eden-card p-3 transition-all ${selectedConv === key ? "border-primary/50 bg-primary/5" : ""}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{conv.partnerName}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">Re: {conv.adTitle}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">{lastMsg.content}</p>
                    </div>
                    {unread > 0 && (
                      <span className="eden-badge-premium text-[10px] px-1.5 shrink-0 ml-2">{unread}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Messages */}
          {selectedConv ? (
            <div className="eden-card flex flex-col h-[400px]">
              <div className="p-3 border-b">
                <p className="font-medium text-sm text-foreground">{conversations.get(selectedConv)?.partnerName}</p>
                <p className="text-xs text-muted-foreground">Re: {conversations.get(selectedConv)?.adTitle}</p>
              </div>
              <div className="flex-1 overflow-auto p-3 space-y-3">
                {[...selectedMessages].reverse().map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.senderId === user.id ? "eden-gradient text-primary-foreground" : "bg-muted text-foreground"}`}>
                      <p>{msg.content}</p>
                      <div className={`flex items-center gap-1 mt-1 text-[10px] ${msg.senderId === user.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        <span>{new Date(msg.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        {msg.senderId === user.id && (msg.read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReply} className="p-3 border-t flex gap-2">
                <input type="text" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Votre message..." className="eden-input flex-1" />
                <button type="submit" className="eden-btn-primary px-3"><Send className="h-4 w-4" /></button>
              </form>
            </div>
          ) : (
            <div className="eden-card flex items-center justify-center h-[400px] text-muted-foreground text-sm">
              Sélectionnez une conversation
            </div>
          )}
        </div>
      )}
    </div>
  );
}
