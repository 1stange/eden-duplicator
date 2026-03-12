import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ads as adsStorage, favorites as favStorage, history as histStorage, messages as msgStorage, reviews as revStorage } from "@/lib/localStorage";
import { useAuth } from "@/contexts/AuthContext";
import { Ad } from "@/types";
import { ArrowLeft, Heart, Share2, MapPin, Eye, Clock, Phone, MessageSquare, User, Send, Star } from "lucide-react";

function formatPrice(price: number, currency: string) {
  if (price === 0) return "Gratuit";
  return `${price.toLocaleString("fr-FR")} ${currency}`;
}

export default function AdDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ad, setAd] = useState<Ad | undefined>();
  const [isFav, setIsFav] = useState(false);
  const [message, setMessage] = useState("");
  const [msgSent, setMsgSent] = useState(false);
  const [adReviews, setAdReviews] = useState(id ? revStorage.getForAd(id) : []);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [reviewSent, setReviewSent] = useState(false);

  useEffect(() => {
    if (!id) return;
    const found = adsStorage.getById(id);
    setAd(found);
    setIsFav(favStorage.isFavorite(id));
    setAdReviews(revStorage.getForAd(id));
    if (found) {
      adsStorage.incrementViews(id);
      if (user) {
        histStorage.add({ userId: user.id, adId: found.id, adTitle: found.title, adImage: found.images[0], adPrice: found.price, action: "view" });
      }
    }
  }, [id, user]);

  if (!ad) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-muted-foreground">Annonce introuvable</p>
    </div>
  );

  const toggleFav = () => { favStorage.toggle(ad.id); setIsFav(!isFav); };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !message.trim()) return;
    msgStorage.send({ senderId: user.id, senderName: user.name, receiverId: ad.userId, receiverName: ad.userName, adId: ad.id, adTitle: ad.title, content: message.trim() });
    setMessage("");
    setMsgSent(true);
    setTimeout(() => setMsgSent(false), 3000);
  };

  const submitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;
    revStorage.add({ adId: ad.id, userId: user.id, userName: user.pseudo || user.name, rating: newRating, comment: newComment.trim() });
    setAdReviews(revStorage.getForAd(ad.id));
    setNewComment("");
    setNewRating(5);
    setReviewSent(true);
    setTimeout(() => setReviewSent(false), 3000);
  };

  const avgRating = revStorage.getAverageRating(ad.id);

  return (
    <div className="max-w-4xl mx-auto p-4 animate-fade-in">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour
      </button>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className="relative rounded-xl overflow-hidden aspect-[4/3] bg-muted">
          <img src={ad.images[0]} alt={ad.title} className="w-full h-full object-cover" />
          <div className="absolute top-3 left-3 flex gap-2">
            {ad.isPremium && <span className="eden-badge-premium">⭐ Premium</span>}
            {ad.isUrgent && <span className="eden-badge bg-destructive text-destructive-foreground">🔥 Urgent</span>}
          </div>
          <div className="absolute top-3 right-3 flex gap-2">
            <button onClick={toggleFav} className="p-2 rounded-full bg-card/80 backdrop-blur-sm shadow-md">
              <Heart className={`h-5 w-5 ${isFav ? "fill-destructive text-destructive" : "text-muted-foreground"}`} />
            </button>
            <button className="p-2 rounded-full bg-card/80 backdrop-blur-sm shadow-md">
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Info */}
        <div>
          <span className="eden-badge-category mb-2">{ad.category}</span>
          <h1 className="text-xl md:text-2xl font-display font-bold text-foreground mt-2">{ad.title}</h1>
          <p className="text-2xl md:text-3xl font-bold text-primary mt-3">{formatPrice(ad.price, ad.currency)}</p>

          {/* Rating summary */}
          {adReviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">{avgRating.toFixed(1)} ({adReviews.length} avis)</span>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{ad.city}</span>
            <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{ad.views} vues</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{ad.createdAt}</span>
          </div>

          <div className="mt-6">
            <h3 className="font-semibold text-foreground mb-2">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{ad.description}</p>
          </div>

          {/* Seller */}
          <div className="mt-6 eden-card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="font-medium text-foreground">{ad.userName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" />{ad.userPhone}</p>
              </div>
            </div>
            <a href={`tel:${ad.userPhone}`} className="eden-btn-primary w-full mt-3">
              <Phone className="h-4 w-4 mr-2" /> Appeler
            </a>
          </div>

          {/* Message */}
          {user && user.id !== ad.userId && (
            <form onSubmit={sendMessage} className="mt-4 eden-card p-4">
              <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" /> Envoyer un message
              </h3>
              {msgSent && <p className="text-sm text-eden-success mb-2">Message envoyé !</p>}
              <div className="flex gap-2">
                <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Votre message..." className="eden-input flex-1" />
                <button type="submit" className="eden-btn-primary px-3"><Send className="h-4 w-4" /></button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <div className="mt-8">
        <h2 className="eden-section-title mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-accent" /> Avis ({adReviews.length})
        </h2>

        {/* Add review */}
        {user && user.id !== ad.userId && (
          <form onSubmit={submitReview} className="eden-card p-4 mb-4">
            {reviewSent && <p className="text-sm text-eden-success mb-2">Avis publié !</p>}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-foreground">Votre note :</span>
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <button key={s} type="button" onClick={() => setNewRating(s)}>
                    <Star className={`h-6 w-6 transition-colors ${s <= newRating ? "fill-accent text-accent" : "text-muted-foreground/30 hover:text-accent/50"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input type="text" value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Votre avis..." className="eden-input flex-1" />
              <button type="submit" className="eden-btn-primary px-4">Publier</button>
            </div>
          </form>
        )}

        {/* Reviews list */}
        <div className="space-y-3">
          {adReviews.map((review) => (
            <div key={review.id} className="eden-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <span className="font-medium text-sm text-foreground">{review.userName}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} className={`h-3.5 w-3.5 ${s <= review.rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
              <p className="text-[10px] text-muted-foreground/60 mt-2">
                {new Date(review.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          ))}
          {adReviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Aucun avis pour le moment</p>
          )}
        </div>
      </div>
    </div>
  );
}
