import React from 'react';
import {
  Phone,
  MessageSquare,
  Navigation,
  Star,
  ShieldCheck,
  Clock,
  MapPin,
  Heart,
  ChevronRight,
  Sparkles,
  Share2,
  Tag,
} from 'lucide-react';
import { WorkerProfile } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';
import { useTranslation } from '../context/LanguageContext';

interface WorkerCardProps {
  worker: WorkerProfile;
  isFavourite: boolean;
  onToggleFavourite: (workerId: string) => void;
  onViewProfile: (worker: WorkerProfile) => void;
  onQuickBook?: (worker: WorkerProfile) => void;
}

export const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  isFavourite,
  onToggleFavourite,
  onViewProfile,
  onQuickBook,
}) => {
  const { t } = useTranslation();
  // Format WhatsApp number (strip non-digits, ensure country code)
  const cleanPhone = (worker.whatsapp || worker.phone).replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
    worker.name
  )},%20I%20found%20your%20listing%20on%20NearMe%20Services.%20Are%20you%20available%20for%20${encodeURIComponent(
    worker.subcategory
  )}%20work?`;

  // Google Maps directions URL
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${worker.latitude},${worker.longitude}`;

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/#worker-${worker.id}`
      : '';
    const shareTitle = `${worker.name} - Verified ${worker.subcategory}`;
    const shareText = `Check out ${worker.name} (${worker.businessName || worker.subcategory}) on NearMe Services!
📍 ${worker.locality || worker.city} • ⭐ ${worker.rating.toFixed(1)}/5
📞 Call: ${worker.phone}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl || window.location.href,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          alert('Worker link copied to clipboard!');
        }
      }
    } else {
      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
      alert('Worker profile details copied to clipboard!');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between overflow-hidden group">
      {/* Card Header & Profile info */}
      <div className="p-5">
        <div className="flex items-start gap-4">
          {/* Worker Photo */}
          <div className="relative shrink-0">
            <img
              src={worker.profileImage}
              alt={worker.name}
              className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover ring-2 ring-slate-100 group-hover:ring-blue-400 transition-all shadow-xs"
              loading="lazy"
            />
            {worker.isVerified && (
              <div
                className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-md"
                title="100% ID & Police Background Verified"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <div>
                <h3
                  onClick={() => onViewProfile(worker)}
                  className="font-bold text-slate-900 text-base sm:text-lg hover:text-blue-600 cursor-pointer truncate transition-colors"
                >
                  {worker.name}
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate">
                  {worker.businessName || `${worker.subcategory} Specialist`}
                </p>
              </div>

              {/* Actions: Share & Favourite */}
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors cursor-pointer"
                  title="Share worker profile"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onToggleFavourite(worker.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors cursor-pointer"
                  title={isFavourite ? 'Remove from saved' : 'Save worker'}
                >
                  <Heart className={`w-4 h-4 ${isFavourite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            {/* Subcategory Pill & Rating */}
            <div className="flex items-center flex-wrap gap-2 mt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                {worker.subcategory}
              </span>

              <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span className="text-xs font-bold text-amber-900">{worker.rating.toFixed(1)}</span>
                <span className="text-[10px] text-amber-700 font-medium">({worker.reviewCount})</span>
              </div>

              {worker.isFeatured && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  <Sparkles className="w-2.5 h-2.5" />
                  Featured
                </span>
              )}

              {worker.specialOffers && worker.specialOffers.length > 0 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProfile(worker);
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-linear-to-r from-amber-500 to-orange-500 text-white shadow-2xs hover:scale-105 transition-all cursor-pointer"
                  title={`View special locality deal: ${worker.specialOffers[0].title}`}
                >
                  <Tag className="w-2.5 h-2.5 fill-white" />
                  <span>{worker.specialOffers[0].discountValue} Deal</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Real-Time Availability & Distance Row */}
        <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <AvailabilityBadge status={worker.availabilityStatus || (worker.isAvailable ? 'available_now' : 'offline')} size="sm" />
          </div>

          <div className="flex items-center gap-1 text-slate-600 font-medium">
            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            <span>
              {worker.distanceKm !== undefined ? (
                <strong className="text-blue-700 font-bold">{worker.distanceKm} KM away</strong>
              ) : (
                <span>{worker.locality || worker.city}</span>
              )}
            </span>
          </div>
        </div>

        {/* Bio / Services Snippet */}
        <p className="text-xs text-slate-600 line-clamp-2 mt-2.5 leading-relaxed">
          {worker.bio}
        </p>

        {/* Key Attributes Tags */}
        <div className="mt-3 flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
          <span className="font-medium text-slate-700">
            ⏳ {worker.experienceYears}+ yrs exp
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" />
            {worker.workingHours}
          </span>
        </div>

        {/* Location & Pricing */}
        <div className="mt-2.5 bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500 truncate max-w-[55%]">
            📍 {worker.locality}, {worker.city} - {worker.pincode}
          </span>
          <span className="font-bold text-slate-800 text-[11px] truncate">
            {worker.pricing}
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="p-3 bg-slate-50/70 border-t border-slate-100 grid grid-cols-4 gap-1.5">
        {/* Call Now */}
        <a
          href={`tel:${worker.phone}`}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          title={`Call ${worker.name} directly`}
        >
          <Phone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Call</span>
        </a>

        {/* WhatsApp */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          title="Chat on WhatsApp"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        {/* Directions */}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          title="Get Directions on Google Maps"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Map</span>
        </a>

        {/* View Profile */}
        <button
          type="button"
          onClick={() => onViewProfile(worker)}
          className="flex flex-col sm:flex-row items-center justify-center gap-1 py-2 px-1 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-95"
          title="View Complete Profile & Reviews"
        >
          <span className="hidden sm:inline">Profile</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
