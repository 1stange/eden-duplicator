import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useConversations, useConversationMessages, useSendMessageInConversation,
  useMarkMessagesRead, useBlockedUsers, useToggleBlock, useBlockedConversations,
} from "@/hooks/useLocalData";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import {
  MessageSquare, Send, Check, CheckCheck, ArrowLeft, Search,
  MoreVertical, Image as ImageIcon, Mic, Ban, X,
} from "lucide-react";


const TYPING_EVENT = "eden:typing";

export default function Messages() {
  const { user } = useAuth();
  const [showBlockedList, setShowBlockedList] = useState(false);
  const { data: activeConvs = [] } = useConversations();
  const { data: blockedConvs = [] } = useBlockedConversations();
  const conversations = showBlockedList ? blockedConvs : activeConvs;
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const { data: messages = [] } = useConversationMessages(selectedConvId);
  const { data: blocked = [] } = useBlockedUsers();

  const sendMsg = useSendMessageInConversation();
  const markRead = useMarkMessagesRead();
  const toggleBlock = useToggleBlock();
  const [reply, setReply] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [recording, setRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLInputElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const partnerTypingTimerRef = useRef<number | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedConvId]);

  useEffect(() => {
    const handler = () => {
      qc.invalidateQueries({ queryKey: ["messages"] });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    };
    window.addEventListener("eden:notification", handler);
    return () => window.removeEventListener("eden:notification", handler);
  }, [qc]);

  // Listen for partner typing events
  useEffect(() => {
    const onTyping = (e: any) => {
      if (!user || !selectedConvId) return;
      const { conversationId, userId } = e.detail || {};
      if (conversationId === selectedConvId && userId !== user.id) {
        setPartnerTyping(true);
        if (partnerTypingTimerRef.current) window.clearTimeout(partnerTypingTimerRef.current);
        partnerTypingTimerRef.current = window.setTimeout(() => setPartnerTyping(false), 2500);
      }
    };
    window.addEventListener(TYPING_EVENT, onTyping as any);
    return () => window.removeEventListener(TYPING_EVENT, onTyping as any);
  }, [user, selectedConvId]);

  if (!user) return null;

  const getPartner = (conv: any) => {
    const isP1 = conv.participant_1 === user.id;
    return { id: isP1 ? conv.participant_2 : conv.participant_1 };
  };

  const filteredConvs = conversations.filter((conv: any) => {
    if (!searchQuery) return true;
    return conv.ad_title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find((c: any) => c.id === selectedConvId);
  const partnerId = selectedConv ? getPartner(selectedConv).id : null;
  const isPartnerBlocked = partnerId ? blocked.includes(partnerId) : false;

  const emitTyping = () => {
    if (!selectedConvId) return;
    if (typingTimerRef.current) return; // throttle
    window.dispatchEvent(new CustomEvent(TYPING_EVENT, { detail: { conversationId: selectedConvId, userId: user.id } }));
    typingTimerRef.current = window.setTimeout(() => { typingTimerRef.current = null; }, 1500);
  };

  const sendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim() || !selectedConvId || isPartnerBlocked) return;
    sendMsg.mutate(
      { conversationId: selectedConvId, content: reply.trim() },
      { onError: (err: any) => toast({ title: "Message non envoyé", description: err?.message || "Erreur", variant: "destructive" }) },
    );
    setReply("");
  };


  const handleAttachImage = async (file: File) => {
    if (!selectedConvId || isPartnerBlocked) return;
    const dataUrl: string = await new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(file);
    });
    sendMsg.mutate({ conversationId: selectedConvId, content: "📷 Image", type: "image", media: dataUrl });
  };

  const startVoiceRecording = async () => {
    if (!selectedConvId || isPartnerBlocked) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      audioRef.current?.click();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => chunks.push(e.data);
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const blob = new Blob(chunks, { type: "audio/webm" });
        const dataUrl: string = await new Promise((res, rej) => {
          const r = new FileReader();
          r.onload = () => res(r.result as string);
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
        sendMsg.mutate({ conversationId: selectedConvId, content: "🎤 Vocal", type: "audio", media: dataUrl });
      };
      rec.start();
      setRecording(true);
      window.setTimeout(() => { if (rec.state === "recording") rec.stop(); }, 5000);
    } catch {
      setRecording(false);
    }
  };

  const formatTime = (date: string) => new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  const formatDate = (date: string) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return "Hier";
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };

  const groupedMessages = messages.reduce((groups: Record<string, any[]>, msg: any) => {
    const dateKey = new Date(msg.created_at).toDateString();
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(msg);
    return groups;
  }, {});

  return (
    <div className="h-[calc(100vh-4rem)] max-w-5xl mx-auto flex">
      <div className={`${selectedConvId ? "hidden md:flex" : "flex"} flex-col w-full md:w-[360px] border-r border-border bg-card`}>
        <div className="p-4 eden-gradient">
          <h1 className="text-lg font-display font-bold text-primary-foreground">Messages</h1>
        </div>
        <div className="p-2 bg-card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="eden-input pl-10 h-9 text-sm bg-muted" />
          </div>
        </div>
        <div className="flex-1 overflow-auto">
          {filteredConvs.length === 0 ? (
            <div className="text-center py-16">
              <MessageSquare className="h-16 w-16 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">Aucun message</p>
            </div>
          ) : (
            filteredConvs.map((conv: any) => {
              const partner = getPartner(conv);
              const convMessages = conv.messages || [];
              const lastMsg = convMessages.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
              const unread = convMessages.filter((m: any) => m.sender_id !== user.id && !m.read).length;
              const partnerAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${partner.id}`;
              const isBlocked = blocked.includes(partner.id);

              return (
                <button key={conv.id} onClick={() => {
                  setSelectedConvId(conv.id);
                  markRead.mutate(conv.id);
                }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/50 transition-colors border-b border-border/50 ${selectedConvId === conv.id ? "bg-muted" : ""}`}>
                  <img src={partnerAvatar} alt="" className="w-12 h-12 rounded-full bg-muted shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground truncate flex items-center gap-1">
                        {conv.ad_title || "Conversation"}
                        {isBlocked && <Ban className="h-3 w-3 text-destructive" />}
                      </p>
                      {lastMsg && <span className="text-[10px] text-muted-foreground shrink-0">{formatTime(lastMsg.created_at)}</span>}
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <p className="text-xs text-muted-foreground truncate flex-1">
                        {lastMsg?.sender_id === user.id && (
                          <span className="inline-flex mr-1">
                            {lastMsg.read ? <CheckCheck className="h-3 w-3 text-primary inline" /> : <Check className="h-3 w-3 inline" />}
                          </span>
                        )}
                        {lastMsg?.content || ""}
                      </p>
                      {unread > 0 && <span className="ml-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold shrink-0">{unread}</span>}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {selectedConvId && selectedConv ? (
        <div className="flex-1 flex flex-col bg-background relative">
          <div className="px-4 py-3 eden-gradient flex items-center gap-3">
            <button onClick={() => setSelectedConvId(null)} className="md:hidden text-primary-foreground"><ArrowLeft className="h-5 w-5" /></button>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`} alt="" className="w-10 h-10 rounded-full bg-muted" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-primary-foreground">{selectedConv.ad_title || "Conversation"}</p>
              <p className="text-[11px] text-primary-foreground/80 h-3">
                {partnerTyping && !isPartnerBlocked ? "en train d'écrire…" : isPartnerBlocked ? "Bloqué" : ""}
              </p>
            </div>
            <button onClick={() => setShowMenu((s) => !s)} className="text-primary-foreground/70 hover:text-primary-foreground"><MoreVertical className="h-5 w-5" /></button>
          </div>

          {showMenu && (
            <div className="absolute right-3 top-16 z-20 bg-card border border-border rounded-lg shadow-lg w-44 text-sm overflow-hidden">
              <button
                onClick={() => { if (partnerId) toggleBlock.mutate(partnerId); setShowMenu(false); }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-muted text-foreground"
              >
                {isPartnerBlocked ? <X className="h-4 w-4 text-eden-success" /> : <Ban className="h-4 w-4 text-destructive" />}
                {isPartnerBlocked ? "Débloquer" : "Bloquer"}
              </button>
            </div>
          )}

          <div className="flex-1 overflow-auto p-4 space-y-1" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}>
            {Object.entries(groupedMessages).map(([dateKey, msgs]: [string, any[]]) => (
              <div key={dateKey}>
                <div className="flex justify-center my-3">
                  <span className="bg-muted text-muted-foreground text-[11px] px-3 py-1 rounded-full shadow-sm">{formatDate(msgs[0].created_at)}</span>
                </div>
                {msgs.map((msg: any) => (
                  <div key={msg.id} className={`flex ${msg.sender_id === user.id ? "justify-end" : "justify-start"} mb-1`}>
                    <div className={`max-w-[75%] px-3 py-2 rounded-lg text-sm shadow-sm relative ${msg.sender_id === user.id ? "bg-primary/15 text-foreground rounded-tr-none" : "bg-card text-foreground rounded-tl-none"}`}>
                      {msg.type === "image" && msg.media ? (
                        <img src={msg.media} alt="" className="rounded-md max-w-[240px] mb-1" />
                      ) : msg.type === "audio" && msg.media ? (
                        <audio controls src={msg.media} className="max-w-[240px] mb-1" />
                      ) : (
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      )}
                      <div className="flex items-center gap-1 justify-end mt-1 text-[10px] text-muted-foreground">
                        <span>{formatTime(msg.created_at)}</span>
                        {msg.sender_id === user.id && (msg.read ? <CheckCheck className="h-3 w-3 text-primary" /> : <Check className="h-3 w-3" />)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
            {partnerTyping && !isPartnerBlocked && (
              <div className="flex justify-start">
                <div className="bg-card text-foreground px-3 py-2 rounded-lg shadow-sm text-xs italic text-muted-foreground">en train d'écrire…</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {isPartnerBlocked ? (
            <div className="p-3 bg-destructive/10 border-t border-destructive/20 text-center text-xs text-destructive">
              Vous avez bloqué cet utilisateur. Débloquez-le pour reprendre la conversation.
            </div>
          ) : (
            <form onSubmit={sendReply} className="p-3 bg-card border-t border-border flex items-center gap-2">
              <input
                ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAttachImage(f); e.currentTarget.value = ""; }}
              />
              <input
                ref={audioRef} type="file" accept="audio/*" capture className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0]; e.currentTarget.value = "";
                  if (!f || !selectedConvId) return;
                  const dataUrl: string = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
                  sendMsg.mutate({ conversationId: selectedConvId, content: "🎤 Vocal", type: "audio", media: dataUrl });
                }}
              />
              <button type="button" onClick={() => fileRef.current?.click()} title="Image" className="w-9 h-9 rounded-full bg-muted hover:bg-muted/70 flex items-center justify-center text-muted-foreground shrink-0">
                <ImageIcon className="h-4 w-4" />
              </button>
              <button type="button" onClick={startVoiceRecording} title={recording ? "Enregistrement..." : "Vocal"} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${recording ? "bg-destructive text-destructive-foreground animate-pulse" : "bg-muted hover:bg-muted/70 text-muted-foreground"}`}>
                <Mic className="h-4 w-4" />
              </button>
              <input
                type="text" value={reply}
                onChange={(e) => { setReply(e.target.value); emitTyping(); }}
                placeholder="Tapez un message..." className="eden-input flex-1 rounded-full px-4"
              />
              <button type="submit" className="w-10 h-10 rounded-full eden-gradient flex items-center justify-center text-primary-foreground shrink-0 hover:opacity-90 transition-opacity shadow-md">
                <Send className="h-4 w-4" />
              </button>
            </form>
          )}
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
