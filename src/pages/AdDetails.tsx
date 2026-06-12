import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAd, useReviews, useCreateReview, useFavorites, useToggleFavorite, useSendMessage, useIncrementViews, useAddHistory, useCreateReport, useSuggestedAds, useProfile } from "@/hooks/useSupabaseData";
import { ArrowLeft, Heart, Share2, MapPin, Eye, Clock, Phone, MessageSquare, User, Send, Star, Flag, BadgeCheck, Video } from "lucide-react";

function formatPrice(price: number, currency: string) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}

export default function AdDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: ad } = useAd(id);
  const { data: reviews = [] } = useReviews(id);
  const { data: favs = [] } = useFavorites();
  const { data: suggestedAds = [] } = useSuggestedAds(ad);
  const { data: adOwnerProfile } = useProfile(ad?.user_id);
  const toggleFavMut = useToggleFavorite();
  const sendMessageMut = useSendMessage();
  const createReviewMut = useCreateReview();
  const incrementViews = useIncrementViews();
  const addHistory = useAddHistory();
  const createReport = useCreateReport();

  const [message, setMessage] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSent, setReviewSent] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [reportSent, setReportSent] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (ad && user) {
      incrementViews.mutate(ad.id);
      addHistory.mutate({ user_id: user.id, ad_id: ad.id, ad_title: ad.title, ad_image: ad.images?.[0] || "", ad_price: ad.price || 0, action: "view" });
    }
  }, [ad?.id]);

  if (!ad) return <div className="flex items-center justify-center h-64"><p className="text-muted-foreground">Chargement...</p></div>;

  const isFav = favs.includes(ad.id);
  const avgRating = reviews.length > 0 ? reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length : 0;
  const isCertified = (adOwnerProfile as any)?.is_certified === true;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    sendMessageMut.mutate({ receiverId: ad.user_id, adId: ad.id, adTitle: ad.title, content: message.trim() });
    setMessage(""); setMsgSent(true);
    setTimeout(() => setMsgSent(false), 3000);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    createReviewMut.mutate({ ad_id: ad.id, user_id: user.id, user_name: user.pseudo || user.name, rating: newRating, comment: newComment.trim() });
    setNewComment(""); setNewRating(5); setReviewSent(true);
    setTimeout(() => setReviewSent(false), 3000);
  };

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportReason) return;
    createReport.mutate({ ad_id: ad.id, reporter_id: user.id, reason: reportReason, details: reportDetails || undefined });
    setShowReport(false); setReportReason(""); setReportDetails(""); setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  const allImages = ad.images || [];

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image gallery */}
        <div>
          <div className="relative rounded-2xl overflow-hidden aspect-video bg-muted shadow-md">
            <img src={allImages[activeImage] || "/placeholder.svg"} alt={ad.title} className="w-full h-full object-contain" />
            <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
            <div className="absolute top-3 left-3 flex gap-2">
              {ad.is_premium && <span className="eden-badge-premium shadow-md">⭐ Premium</span>}
              {ad.is_urgent && <span className="eden-badge bg-destructive text-destructive-foreground shadow-md">🔥 Urgent</span>}
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              <button onClick={() => toggleFavMut.mutate(ad.id)} className="p-2 rounded-full bg-card/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform">
                <Heart className={`h-5 w-5 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
              </button>
              <button className="p-2 rounded-full bg-card/90 backdrop-blur-sm shadow-md hover:scale-110 transition-transform">
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            {allImages.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
                {allImages.map((_: string, i: number) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all ${i === activeImage ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />
                ))}
              </div>
            )}
          </div>
          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-2 mt-3">
              {allImages.map((img: string, i: number) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 bg-muted transition-all ${i === activeImage ? "border-primary scale-105" : "border-transparent opacity-70 hover:opacity-100"}`}>
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
          {/* Video */}
          {(ad as any).video && (
            <div className="mt-3 rounded-2xl overflow-hidden border bg-black">
              <video src={(ad as any).video} controls className="w-full aspect-video" />
            </div>
          )}
        </div>

        <div>
          <span className="eden-badge-category mb-2">{ad.category}</span>
          <h1 className="text-xl md:text-2xl font-display font-bold text-foreground mt-2">{ad.title}</h1>
          <p className="text-2xl md:text-3xl font-bold text-primary mt-3">{formatPrice(ad.price || 0, ad.currency || "FCFA")}</p>

          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}</div>
              <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({reviews.length} avis)</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{ad.city}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{ad.views} vues</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{new Date(ad.created_at!).toLocaleDateString("fr-FR")}</span>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">{ad.description}</p>
          </div>

          {/* Seller card */}
          <div className="mt-6 eden-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground flex items-center gap-1.5">
                  {ad.user_name}
                  {isCertified && <BadgeCheck className="h-4 w-4 text-primary" />}
                </p>
                {ad.user_phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{ad.user_phone}</p>}
              </div>
            </div>
            {ad.user_phone && <a href={`tel:${ad.user_phone}`} className="eden-btn-primary w-full mt-3"><Phone className="h-4 w-4 mr-2" /> Appeler</a>}
          </div>

          {/* Report */}
          {user && user.id !== ad.user_id && (
            <button onClick={() => setShowReport(!showReport)} className="mt-3 text-sm text-destructive hover:underline flex items-center gap-1">
              <Flag className="h-3.5 w-3.5" /> Signaler cette annonce
            </button>
          )}
          {reportSent && <p className="text-sm text-eden-success mt-2">✅ Signalement envoyé, merci !</p>}
          {showReport && (
            <form onSubmit={handleReport} className="mt-3 eden-card p-4 space-y-3">
              <h3 className="font-semibold text-foreground text-sm flex items-center gap-2"><Flag className="h-4 w-4 text-destructive" /> Signaler</h3>
              <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="eden-input text-sm" required>
                <option value="">Raison du signalement...</option>
                <option value="spam">Spam / Publicité abusive</option>
                <option value="inappropriate">Contenu inapproprié</option>
                <option value="fraud">Arnaque / Fraude</option>
                <option value="underage">Contenu impliquant des mineurs</option>
                <option value="other">Autre</option>
              </select>
              <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Détails supplémentaires..." className="eden-input min-h-[60px] text-sm" />
              <button type="submit" className="eden-btn-primary w-full text-sm">Envoyer le signalement</button>
            </form>
          )}

          {/* Message form */}
          {user && user.id !== ad.user_id && (
            <form onSubmit={handleSendMessage} className="mt-4 eden-card p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Envoyer un message</h3>
              {msgSent && <p className="text-sm text-eden-success mb-2">Message envoyé !</p>}
              <div className="flex gap-2">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre message..." className="eden-input flex-1" />
                <button type="submit" className="eden-btn-primary px-3"><Send className="h-4 w-4" /></button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="eden-section-title mb-4 flex items-center gap-2"><Star className="h-5 w-5 text-accent" /> Avis ({reviews.length})</h2>
        {user && user.id !== ad.user_id && (
          <form onSubmit={handleSubmitReview} className="eden-card p-4 mb-4">
            {reviewSent && <p className="text-sm text-eden-success mb-2">Avis publié !</p>}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-foreground">Votre note :</span>
              <div className="flex">{[1,2,3,4,5].map((s) => (
                <button key={s} type="button" onClick={() => setNewRating(s)}>
                  <Star className={`h-6 w-6 transition-colors ${s <= newRating ? "fill-accent text-accent" : "text-muted-foreground/30 hover:text-accent/50"}`} />
                </button>
              ))}</div>
            </div>
            <div className="flex gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Votre avis..." className="eden-input flex-1" />
              <button type="submit" className="eden-btn-primary px-4">Publier</button>
            </div>
          </form>
        )}
        <div className="space-y-3">
          {reviews.map((review: any) => (
            <div key={review.id} className="eden-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"><User className="h-4 w-4 text-secondary-foreground" /></div>
                  <span className="font-medium text-sm text-foreground">{review.user_name}</span>
                </div>
                <div className="flex items-center gap-1">{[1,2,3,4,5].map((s) => <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />)}</div>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2">{new Date(review.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
          ))}
          {reviews.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Aucun avis pour le moment</p>}
        </div>
      </div>

      {/* Suggested Ads */}
      {suggestedAds.length > 0 && (
        <div className="mt-8">
          <h2 className="eden-section-title mb-4">Annonces similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {suggestedAds.map((sAd: any) => (
              <div key={sAd.id} onClick={() => navigate(`/ad/${sAd.id}`)} className="eden-card cursor-pointer overflow-hidden group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img src={sAd.images?.[0] || "/placeholder.svg"} alt={sAd.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-2.5">
                  <h3 className="font-medium text-xs text-foreground line-clamp-2">{sAd.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{sAd.description}</p>
                  <p className="text-primary font-bold text-xs mt-1">{formatPrice(sAd.price || 0, sAd.currency || "FCFA")}</p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3 w-3" />{sAd.city}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
