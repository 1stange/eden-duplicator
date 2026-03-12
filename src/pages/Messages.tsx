import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { messages as msgStorage } from "@/lib/localStorage";
import { MessageSquare, Send, Check, CheckCheck, ArrowLeft, Search, MoreVertical } from "lucide-react";

export default function Messages() {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState(user ? msgStorage.getForUser(user.id) : []);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages, selectedConv]);

  if (!user) return null;

  // Group by conversation partner
  const conversations = new Map<string, { partnerId: string; partnerName: string; partnerAvatar: string; adTitle: string; messages: typeof allMessages }>();
  allMessages.forEach((msg) => {
    const partnerId = msg.senderId === user.id ? msg.receiverId : msg.senderId;
    const partnerName = msg.senderId === user.id ? msg.receiverName : msg.senderName;
    const key = `${partnerId}-${msg.adId}`;
    if (!conversations.has(key)) {
      conversations.set(key, { partnerId, partnerName, partnerAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerName}`, adTitle: msg.adTitle, messages: [] });
    }
    conversations.get(key)!.messages.push(msg);
  });

  const convList = Array.from(conversations.entries()).filter(([, conv]) =>
    !searchQuery || conv.partnerName.toLowerCase().includes(searchQuery.toLowerCase()) || conv.adTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
  const selectedPartner = selectedConv ? conversations.get(selectedConv) : null;

  const formatTime = (date: string) => new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Hier";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  // Group messages by date
  const groupedMessages = [...selectedMessages].reverse().reduce((groups, msg) => {
    const dateKey = new Date(msg.createdAt).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {} as Record<string, typeof selectedMessages>);

  return (
    <div className="h-[calc(100vh-4rem)] max-w-5xl mx-auto flex">
      {/* Conversations List - WhatsApp style */}
      <div className={`${selectedConv ? "hidden md:flex" : "flex"} flex-col w-full md:w-[360px] border-r border-border bg-card`}>
        {/* Header */}
        <div className="p-4 eden-gradient">
          <h1 className="text-lg font-display font-bold text-primary-foreground">Messages</h1>
        </div>
        
        {/* Search */}
        <div className="p-2 bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="eden-input pl-10 h-9 text-sm bg-muted"
            />
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-auto">
          {convList.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Aucun message</p>
            </div>
          ) : (
            convList.map(([key, conv]) => {
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
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${selectedConv === key ? "bg-muted" : ""}`}
                >
                  <img src={conv.partnerAvatar} alt="" className="w-12 h-12 rounded-full bg-muted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground truncate">{conv.partnerName}</p>
                      <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(lastMsg.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {lastMsg.senderId === user.id && (
                          <span className="inline-flex mr-1">
                            {lastMsg.read ? <CheckCheck className="h-3 w-3 text-primary inline" /> : <Check className="h-3 w-3 inline" />}
                          </span>
                        )}
                        {lastMsg.content}
                      </p>
                      {unread > 0 && (
                        <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shrink-0">{unread}</span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area - WhatsApp style */}
      {selectedConv && selectedPartner ? (
        <div className="flex-1 flex flex-col bg-background">
          {/* Chat header */}
          <div className="px-4 py-3 eden-gradient flex items-center gap-3">
            <button onClick={() => setSelectedConv(null)} className="md:hidden text-primary-foreground">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <img src={selectedPartner.partnerAvatar} alt="" className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-primary-foreground">{selectedPartner.partnerName}</p>
              <p className="text-xs text-primary-foreground/70 truncate">Re: {selectedPartner.adTitle}</p>
            </div>
            <button className="text-primary-foreground/70 hover:text-primary-foreground">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>

          {/* Messages area with pattern background */}
          <div className="flex-1 overflow-auto p-4 space-y-1" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
            {Object.entries(groupedMessages).map(([dateKey, msgs]) => (
              <div key={dateKey}>
                <div className="flex justify-center my-3">
                  <span className="bg-muted text-muted-foreground text-[11px] px-3 py-1 rounded-full shadow-sm">
                    {formatDate(msgs[0].createdAt)}
                  </span>
                </div>
                {msgs.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.senderId === user.id ? "justify-end" : "justify-start"} mb-1`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm relative ${
                      msg.senderId === user.id
                        ? "bg-primary/15 text-foreground rounded-tr-none"
                        : "bg-card text-foreground rounded-tl-none"
                    }`}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                      <div className={`flex items-center gap-1 justify-end mt-1 text-[10px] text-muted-foreground`}>
                        <span>{formatTime(msg.createdAt)}</span>
                        {msg.senderId === user.id && (
                          msg.read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={sendReply} className="p-3 bg-card border-t border-border flex items-center gap-2">
            <input
              type="text"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Tapez un message..."
              className="eden-input flex-1 rounded-full px-4"
            />
            <button type="submit" className="w-10 h-10 rounded-full eden-gradient flex items-center justify-center text-primary-foreground shrink-0 hover:opacity-90 transition-opacity shadow-md">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-muted/30">
          <div className="text-center">
            <MessageSquare className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-muted-foreground text-sm">Sélectionnez une conversation</p>
          </div>
        </div>
      )}
    </div>
  );
}
