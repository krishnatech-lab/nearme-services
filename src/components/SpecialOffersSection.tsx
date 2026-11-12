import React, { useState } from 'react';
import {
  Tag,
  Percent,
  Clock,
  MapPin,
  Copy,
  Check,
  PlusCircle,
  Trash2,
  Sparkles,
  Calendar,
  MessageSquare,
  Gift,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Flame,
} from 'lucide-react';
import { SpecialOffer, WorkerProfile } from '../types';

interface SpecialOffersSectionProps {
  worker: WorkerProfile;
  offers: SpecialOffer[];
  onOfferAdded: (newOffer: SpecialOffer) => void;
  onOfferDeleted?: (offerId: string) => void;
}

export const SpecialOffersSection: React.FC<SpecialOffersSectionProps> = ({
  worker,
  offers,
  onOfferAdded,
  onOfferDeleted,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'flat' | 'free_addon'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [locality, setLocality] = useState(worker.locality || worker.city || '');
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [description, setDescription] = useState('');
  const [terms, setTerms] = useState('Valid on direct calls & WhatsApp bookings via NearMe Services');

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch {
      // Fallback
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !discountValue.trim() || !couponCode.trim()) {
      setErrorMsg('Please fill in Offer Title, Discount Value, and Coupon Code.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/workers/${worker.id}/offers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          couponCode: couponCode.toUpperCase().replace(/\s+/g, ''),
          discountType,
          discountValue,
          locality: locality || worker.locality || worker.city,
          validUntil,
          minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : undefined,
          description,
          terms,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create offer');
      }

      const data = await res.json();
      onOfferAdded(data.offer);
      setSuccessMsg('Promotional offer published successfully! Customers in your locality can now claim this coupon.');
      
      // Reset form
      setTitle('');
      setCouponCode('');
      setDiscountValue('');
      setDescription('');
      setShowForm(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating special offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm('Are you sure you want to remove this promotional offer?')) return;
    try {
      const res = await fetch(`/api/workers/${worker.id}/offers/${offerId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onOfferDeleted?.(offerId);
      }
    } catch (err) {
      console.error('Failed to delete offer:', err);
    }
  };

  const cleanPhone = (worker.whatsapp || worker.phone).replace(/[^0-9]/g, '');

  return (
    <div className="pt-2">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-linear-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs">
            <Flame className="w-4 h-4 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">
                Special Offers & Locality Coupons
              </h4>
              <span className="text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                {offers.length} {offers.length === 1 ? 'Deal' : 'Deals'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Exclusive discounts & verified coupons for residents in {worker.locality || worker.city}
            </p>
          </div>
        </div>

        {/* Post an offer button */}
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs ${
            showForm
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-linear-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white'
          }`}
          title="Post a discount coupon for local customers"
        >
          {showForm ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Post Offer</span>
            </>
          )}
        </button>
      </div>

      {/* Success notification */}
      {successMsg && (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Provider Post Offer Form */}
      {showForm && (
        <form
          onSubmit={handleCreateOffer}
          className="mb-4 p-4.5 bg-linear-to-br from-amber-50/80 via-orange-50/50 to-white rounded-2xl border-2 border-amber-200/80 shadow-md space-y-3.5 animate-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-center justify-between pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-bold text-slate-900">
                Post a Promotional Coupon / Discount for Customers in {worker.locality || worker.city}
              </span>
            </div>
            <span className="text-[10px] font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
              Provider Portal
            </span>
          </div>

          {errorMsg && (
            <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Offer Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 20% Off on AC Jet Cleaning"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Coupon Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. COOL20 or INDIRA50"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                required
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-900 uppercase focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Discount Type
              </label>
              <select
                value={discountType}
                onChange={(e) => setDiscountType(e.target.value as any)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500 font-medium"
              >
                <option value="percentage">Percentage Off (%)</option>
                <option value="flat">Flat Amount (₹)</option>
                <option value="free_addon">Free Inspection / Add-on</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Discount Badge Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 25% OFF or ₹150 OFF"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                required
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Target Locality / Area
              </label>
              <input
                type="text"
                placeholder="e.g. Indiranagar & HAL 2nd Stage"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-orange-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                Min. Order Value (₹ Optional)
              </label>
              <input
                type="number"
                placeholder="e.g. 499 (optional)"
                value={minOrderAmount}
                onChange={(e) => setMinOrderAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-orange-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Description & Deal Details
            </label>
            <textarea
              rows={2}
              placeholder="Explain what is included in this offer and how customers can redeem it..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-hidden focus:border-orange-500 font-medium resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-linear-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Special Offer'}
            </button>
          </div>
        </form>
      )}

      {/* Offers Cards List */}
      {offers.length === 0 ? (
        <div className="p-5 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2">
            <Tag className="w-5 h-5" />
          </div>
          <h5 className="text-xs font-bold text-slate-800">No active special offers currently</h5>
          <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
            {worker.name} has not posted a promotional coupon yet. Are you this provider? Click "+ Post Offer" above to create an introductory discount for customers in {worker.locality || worker.city}.
          </p>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Create Promotional Offer</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {offers.map((offer) => {
            const isCopied = copiedCode === offer.couponCode;
            const waCouponUrl = `https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
              worker.name
            )},%20I%20saw%20your%20Special%20Offer%20on%20NearMe%20Services:%20%22${encodeURIComponent(
              offer.title
            )}%22.%20I%20would%20like%20to%20apply%20Coupon%20Code:%20${encodeURIComponent(
              offer.couponCode
            )}%20(${encodeURIComponent(offer.discountValue)}).%20Please%20confirm!`;

            return (
              <div
                key={offer.id}
                className="relative bg-linear-to-r from-amber-50/70 via-orange-50/40 to-white rounded-2xl border border-amber-200/90 shadow-xs hover:shadow-md transition-all p-3.5 sm:p-4 overflow-hidden group"
              >
                {/* Decorative cutouts for ticket look */}
                <div className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border border-amber-200/90 pointer-events-none" />
                <div className="absolute -right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full border border-amber-200/90 pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pl-2 sm:pl-3 pr-2 sm:pr-3">
                  {/* Left Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-linear-to-r from-red-600 to-orange-600 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                        <Sparkles className="w-3 h-3 fill-white" />
                        {offer.discountValue}
                      </span>

                      {offer.locality && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300/60">
                          <MapPin className="w-3 h-3 text-amber-700" />
                          <span>{offer.locality}</span>
                        </span>
                      )}

                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        Valid till: {offer.validUntil}
                      </span>
                    </div>

                    <h5 className="text-xs sm:text-sm font-black text-slate-900 leading-snug">
                      {offer.title}
                    </h5>

                    {offer.description && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {offer.description}
                      </p>
                    )}

                    {offer.minOrderAmount && (
                      <p className="text-[10px] text-amber-800 font-semibold mt-1">
                        • Min. service value: ₹{offer.minOrderAmount}
                      </p>
                    )}

                    {offer.terms && (
                      <p className="text-[10px] text-slate-400 mt-0.5 italic">
                        {offer.terms}
                      </p>
                    )}
                  </div>

                  {/* Right: Coupon Code & Claim actions */}
                  <div className="w-full sm:w-auto shrink-0 flex flex-col sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-amber-200/60">
                    {/* Coupon Box */}
                    <div className="flex items-center justify-between sm:justify-start gap-2 bg-white px-3 py-1.5 rounded-xl border-2 border-dashed border-amber-400 shadow-2xs">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Coupon Code
                        </span>
                        <span className="font-mono text-xs font-black tracking-wider text-orange-600">
                          {offer.couponCode}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyCode(offer.couponCode)}
                        className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                        }`}
                        title="Copy coupon code"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* WhatsApp Claim Action */}
                    <div className="flex items-center gap-1.5 w-full sm:w-auto">
                      <a
                        href={waCouponUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial py-1.5 px-3 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-colors shadow-2xs"
                        title="Claim offer directly on WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Claim via WhatsApp</span>
                      </a>

                      {onOfferDeleted && (
                        <button
                          type="button"
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete offer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
