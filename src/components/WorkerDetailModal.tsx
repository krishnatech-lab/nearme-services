import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  Navigation,
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Heart,
  Share2,
  Check,
} from 'lucide-react';
import { WorkerProfile, Review, WorkerAvailabilityStatus, SpecialOffer } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { SpecialOffersSection } from './SpecialOffersSection';

interface WorkerDetailModalProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  isFavourite: boolean;
  onToggleFavourite: (workerId: string) => void;
  onReportWorker: (worker: WorkerProfile) => void;
  onRequestService: (worker: WorkerProfile) => void;
  onStatusUpdated?: (workerId: string, newStatus: WorkerAvailabilityStatus) => void;
}

export const WorkerDetailModal: React.FC<WorkerDetailModalProps> = ({
  worker,
  isOpen,
  onClose,
  isFavourite,
  onToggleFavourite,
  onReportWorker,
  onRequestService,
  onStatusUpdated,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<WorkerAvailabilityStatus>(
    worker?.availabilityStatus || 'available_now'
  );
  const [offers, setOffers] = useState<SpecialOffer[]>(worker?.specialOffers || []);

  const handleOfferAdded = (newOffer: SpecialOffer) => {
    setOffers((prev) => [newOffer, ...prev]);
    if (worker) {
      worker.specialOffers = [newOffer, ...(worker.specialOffers || [])];
    }
  };

  const handleOfferDeleted = (offerId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
    if (worker && worker.specialOffers) {
      worker.specialOffers = worker.specialOffers.filter((o) => o.id !== offerId);
    }
  };

  // Review form
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerPhone, setReviewerPhone] = useState('');
  const [ratingValue, setRatingValue] = useState(5);
  const [commentText, setCommentText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const fallbackCopy = async (shareText: string, shareUrl: string) => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n\nProfile Link: ${shareUrl}`);
      setShareFeedback('Worker details & profile link copied to clipboard!');
      setTimeout(() => setShareFeedback(null), 3500);
    } catch {
      setShareFeedback('Could not copy link to clipboard');
      setTimeout(() => setShareFeedback(null), 3000);
    }
  };

  const handleShare = async () => {
    if (!worker) return;

    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/#worker-${worker.id}`
      : '';
    const shareTitle = `${worker.name} - Verified ${worker.subcategory} on NearMe Services`;
    const shareText = `Check out ${worker.name} (${worker.businessName || worker.subcategory}) on NearMe Services!
📍 Location: ${worker.locality || worker.city}
⭐ Rating: ${worker.rating.toFixed(1)}/5 (${worker.reviewCount} reviews)
⚡ Status: ${
      worker.availabilityStatus === 'available_now'
        ? 'Available Now'
        : worker.availabilityStatus === 'on_job'
        ? 'On a Job'
        : 'Offline'
    }
📞 Mobile: ${worker.phone}
💬 WhatsApp: ${worker.whatsapp || worker.phone}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl || window.location.href,
        });
        setShareFeedback('Worker profile shared successfully!');
        setTimeout(() => setShareFeedback(null), 3000);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await fallbackCopy(shareText, shareUrl || window.location.href);
        }
      }
    } else {
      await fallbackCopy(shareText, shareUrl || window.location.href);
    }
  };

  useEffect(() => {
    if (worker) {
      setCurrentStatus(worker.availabilityStatus || 'available_now');
      setOffers(worker.specialOffers || []);
      setLoadingReviews(true);

      // Fetch reviews
      fetch(`/api/workers/${worker.id}/reviews`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          setReviews(data);
          setLoadingReviews(false);
        })
        .catch(() => setLoadingReviews(false));

      // Fetch live special offers
      fetch(`/api/workers/${worker.id}/offers`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => {
          if (Array.isArray(data)) {
            setOffers(data);
          }
        })
        .catch(() => {});
    }
  }, [worker]);

  if (!isOpen || !worker) return null;

  const cleanPhone = (worker.whatsapp || worker.phone).replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
    worker.name
  )},%20I%20found%20your%20listing%20on%20NearMe%20Services.%20Are%20you%20available%20for%20${encodeURIComponent(
    worker.subcategory
  )}%20work?`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${worker.latitude},${worker.longitude}`;

  const handleStatusChange = async (newSt: WorkerAvailabilityStatus) => {
    setCurrentStatus(newSt);
    try {
      const res = await fetch(`/api/workers/${worker.id}/availability-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newSt }),
      });
      if (res.ok) {
        onStatusUpdated?.(worker.id, newSt);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !commentText) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/workers/${worker.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: reviewerName,
          userPhone: reviewerPhone,
          rating: ratingValue,
          comment: commentText,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReviews([data.review, ...reviews]);
        setReviewSuccessMsg('Thank you! Your verified rating & review was published.');
        setReviewerName('');
        setCommentText('');
        setTimeout(() => setReviewSuccessMsg(null), 3500);
      }
    } catch (err) {
      console.error('Error posting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-100 flex flex-col">
        {/* Header Photo & Identity */}
        <div className="relative bg-slate-900 text-white p-6 sm:p-8 rounded-t-3xl overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Close & Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors flex items-center gap-1.5 px-3"
              title="Share worker profile via Web Share or Copy Link"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">Share</span>
            </button>
            <button
              onClick={() => onToggleFavourite(worker.id)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
              title="Save to favorites"
            >
              <Heart className={`w-5 h-5 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative">
              <img
                src={worker.profileImage}
                alt={worker.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-xl"
              />
              {worker.isVerified && (
                <div
                  className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow-md"
                  title="Verified Professional"
                >
                  <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold bg-blue-500/30 text-blue-200 border border-blue-400/40 px-2.5 py-0.5 rounded-full">
                  {worker.subcategory}
                </span>
                <span className="text-xs font-bold bg-white/10 text-slate-300 px-2.5 py-0.5 rounded-full">
                  {worker.category}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black mt-1.5">{worker.name}</h2>
              <p className="text-xs text-blue-200/90 font-medium">
                {worker.businessName || `${worker.subcategory} Professional`}
              </p>

              <div className="flex items-center gap-3 mt-3 text-xs">
                <div className="flex items-center gap-1 bg-amber-400/20 px-2 py-0.5 rounded text-amber-300 font-bold border border-amber-400/30">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  <span>{worker.rating.toFixed(1)}</span>
                  <span className="text-amber-200 font-normal">({worker.reviewCount} reviews)</span>
                </div>

                <span className="text-slate-300">
                  ⏳ {worker.experienceYears}+ Years Experience
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Availability Bar */}
        <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Real-Time Status:</span>
            <AvailabilityBadge status={currentStatus} size="md" />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Change Status:</span>
            <AvailabilityBadge
              status={currentStatus}
              interactive
              onStatusChange={handleStatusChange}
            />
          </div>
        </div>

        {/* Main Content Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {shareFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 animate-in fade-in shadow-xs">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{shareFeedback}</span>
            </div>
          )}

          {/* Quick Contact Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <a
              href={`tel:${worker.phone}`}
              className="py-3 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <Navigation className="w-4 h-4" />
              <span>Directions</span>
            </a>

            <button
              onClick={handleShare}
              className="py-3 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
              title="Share worker profile with friends or family via mobile messaging"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={() => onRequestService(worker)}
              className="py-3 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer col-span-2 sm:col-span-1"
            >
              <Calendar className="w-4 h-4" />
              <span>Book / Quote</span>
            </button>
          </div>

          {/* Special Offers & Locality Promotional Coupons */}
          <SpecialOffersSection
            worker={worker}
            offers={offers}
            onOfferAdded={handleOfferAdded}
            onOfferDeleted={handleOfferDeleted}
          />

          {/* About / Bio */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About & Expertise</h4>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {worker.bio}
            </p>
          </div>

          {/* Services Offered */}
          {worker.services && worker.services.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Services & Specialties</h4>
              <div className="flex flex-wrap gap-2">
                {worker.services.map((svc, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-semibold"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    {svc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Operational Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Service Address & Area
              </p>
              <p className="mt-1 text-slate-600">{worker.address}</p>
              <p className="text-slate-500">{worker.locality}, {worker.city} - {worker.pincode}</p>
              {worker.distanceKm !== undefined && (
                <p className="text-blue-700 font-bold mt-1">📍 {worker.distanceKm} KM from your selected location</p>
              )}
            </div>

            <div className="space-y-2">
              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Working Hours
                </p>
                <p className="mt-0.5">{worker.workingHours}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Visiting / Inspection Charges
                </p>
                <p className="mt-0.5 font-bold text-slate-800">{worker.pricing}</p>
              </div>

              <div>
                <p className="font-bold text-slate-800">Languages Known:</p>
                <p className="mt-0.5 text-slate-500">{worker.languages?.join(', ') || 'Hindi, English'}</p>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Customer Reviews & Ratings</span>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {reviews.length}
                </span>
              </h4>
            </div>

            {loadingReviews ? (
              <p className="text-xs text-slate-400">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No reviews yet. Be the first to review {worker.name}!</p>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{rev.userName}</span>
                        {rev.userPhone && <span className="text-[10px] text-slate-400">({rev.userPhone})</span>}
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="mt-1.5 text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Submit a Review Form */}
            <form onSubmit={handleReviewSubmit} className="mt-5 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-3">
              <p className="text-xs font-bold text-slate-800">Rate & Review this Service Provider</p>

              {reviewSuccessMsg && (
                <div className="p-2.5 bg-emerald-500 text-white text-xs rounded-lg font-semibold">
                  {reviewSuccessMsg}
                </div>
              )}

              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 font-medium">Your Rating:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingValue(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 cursor-pointer"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= ratingValue ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                  required
                />
                <input
                  type="text"
                  placeholder="Your Mobile (Optional)"
                  value={reviewerPhone}
                  onChange={(e) => setReviewerPhone(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <textarea
                placeholder="Share your experience (punctuality, quality of repair, polite behavior, honest pricing)..."
                rows={2}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                required
              />

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {submittingReview ? 'Submitting...' : 'Post Verified Review'}
              </button>
            </form>
          </div>

          {/* Report Incorrect Info Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Notice any incorrect details or bad behavior?</span>
            <button
              onClick={() => onReportWorker(worker)}
              className="text-red-600 hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Report Provider</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
