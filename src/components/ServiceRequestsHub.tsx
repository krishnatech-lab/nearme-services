import React, { useState, useEffect } from 'react';
import {
  Send,
  Clock,
  MapPin,
  CheckCircle2,
  DollarSign,
  Phone,
  MessageSquare,
  AlertCircle,
  Plus,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { ServiceRequest, Category, UserAccount, LocationCoordinates, WorkerProfile } from '../types';

interface ServiceRequestsHubProps {
  categories: Category[];
  user: UserAccount | null;
  userLocation: LocationCoordinates;
  workers: WorkerProfile[];
  onOpenAuthModal: () => void;
  defaultTab?: 'browse' | 'post' | 'my-requests';
}

export const ServiceRequestsHub: React.FC<ServiceRequestsHubProps> = ({
  categories,
  user,
  userLocation,
  workers,
  onOpenAuthModal,
  defaultTab = 'browse',
}) => {
  const [activeTab, setActiveTab] = useState<'browse' | 'post' | 'my-requests'>(defaultTab);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Post form state
  const [postCategory, setPostCategory] = useState(categories[0]?.name || 'Home Repair & Maintenance');
  const [postSubcategory, setPostSubcategory] = useState(categories[0]?.subcategories[0] || 'Electrician');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'immediate' | 'today' | 'tomorrow' | 'flexible'>('today');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('Morning (9 AM - 12 PM)');
  const [address, setAddress] = useState(userLocation.formattedAddress || 'Main Road');
  const [locality, setLocality] = useState(userLocation.locality || '');
  const [city, setCity] = useState(userLocation.city || 'Bengaluru');
  const [pincode, setPincode] = useState(userLocation.pincode || '');
  const [budget, setBudget] = useState('₹500 - ₹1,500');
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [postSuccessMsg, setPostSuccessMsg] = useState<string | null>(null);
  const [submittingPost, setSubmittingPost] = useState(false);

  // Quote submission state
  const [quotingRequestId, setQuotingRequestId] = useState<string | null>(null);
  const [quotePrice, setQuotePrice] = useState<string>('');
  const [quoteMessage, setQuoteMessage] = useState<string>('');
  const [quoteAvailableTime, setQuoteAvailableTime] = useState<string>('Can start within 1 hour');
  const [quoteProviderName, setQuoteProviderName] = useState<string>(user?.name || '');
  const [quoteProviderPhone, setQuoteProviderPhone] = useState<string>(user?.phone || '');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/service-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (err) {
      console.error('Failed to fetch service requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Update subcategories when post category changes
  const selectedCatObj = categories.find((c) => c.name === postCategory);
  const availableSubcategories = selectedCatObj?.subcategories || [];

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !description || !address) {
      alert('Please fill all required fields');
      return;
    }

    setSubmittingPost(true);
    try {
      const res = await fetch('/api/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          category: postCategory,
          subcategory: postSubcategory,
          title: title || `${postSubcategory} needed in ${locality || city}`,
          description,
          urgency,
          preferredDate,
          preferredTime,
          address,
          locality,
          city,
          pincode,
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          budget,
          userId: user?.id,
        }),
      });

      if (res.ok) {
        const created = await res.json();
        setPostSuccessMsg('Service request posted successfully! Local professionals will begin sending quotes.');
        // reset form
        setTitle('');
        setDescription('');
        await fetchRequests();
        setTimeout(() => {
          setPostSuccessMsg(null);
          setActiveTab('my-requests');
          setExpandedRequestId(created.id);
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting request:', err);
      alert('Could not submit request. Please try again.');
    } finally {
      setSubmittingPost(false);
    }
  };

  const handleSendQuote = async (requestId: string) => {
    if (!quotePrice || !quoteProviderName || !quoteProviderPhone) {
      alert('Please provide price, your name, and contact phone number');
      return;
    }

    setSubmittingQuote(true);
    try {
      // Find matching worker profile if existing
      const matchedWorker = workers.find((w) => w.phone === quoteProviderPhone);

      const res = await fetch(`/api/service-requests/${requestId}/quotes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: matchedWorker ? matchedWorker.id : 'w-' + Date.now(),
          providerName: quoteProviderName,
          providerBusiness: matchedWorker?.businessName || quoteProviderName + ' Services',
          providerPhone: quoteProviderPhone,
          providerImage:
            matchedWorker?.profileImage ||
            'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
          providerRating: matchedWorker?.rating || 5.0,
          quotedPrice: parseFloat(quotePrice),
          message: quoteMessage || 'Ready to provide quick and high quality service.',
          availableTime: quoteAvailableTime,
        }),
      });

      if (res.ok) {
        setQuoteSuccessMsg('Quote sent to customer successfully!');
        setQuotingRequestId(null);
        setQuotePrice('');
        setQuoteMessage('');
        await fetchRequests();
        setTimeout(() => setQuoteSuccessMsg(null), 3000);
      }
    } catch (err) {
      console.error('Error submitting quote:', err);
      alert('Failed to send quote.');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleAcceptQuote = async (requestId: string, quoteId: string) => {
    try {
      const res = await fetch(`/api/service-requests/${requestId}/accept-quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId }),
      });
      if (res.ok) {
        alert('Quote accepted! You can now call or message the provider directly to confirm timing.');
        await fetchRequests();
      }
    } catch (err) {
      console.error('Error accepting quote:', err);
    }
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    if (filterCategory !== 'all') {
      return (
        r.category.toLowerCase().includes(filterCategory.toLowerCase()) ||
        r.subcategory.toLowerCase().includes(filterCategory.toLowerCase())
      );
    }
    return true;
  });

  const myRequests = user?.phone
    ? requests.filter((r) => r.customerPhone === user.phone || r.userId === user.id)
    : requests;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-8">
      {/* Top Banner / Heading */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-xs mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Proactive Service Finding Mechanism</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Post a Service Request & Receive Free Quotes
            </h2>
            <p className="text-blue-100/90 text-sm mt-1 max-w-2xl leading-relaxed">
              Describe your repair or job requirement. Verified local technicians and professionals review your request, provide estimated quotes, and you pick the best deal!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('post')}
              className="px-5 py-2.5 bg-white text-blue-700 hover:bg-blue-50 font-bold text-sm rounded-xl shadow-lg shadow-black/10 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Post New Request</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'browse'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            📋 Open Requests Board ({filteredRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'post'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            ✍️ Post a Service Need
          </button>
          <button
            onClick={() => setActiveTab('my-requests')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
              activeTab === 'my-requests'
                ? 'bg-white text-slate-900 shadow-md'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            💬 My Requests & Quotes ({myRequests.length})
          </button>
        </div>
      </div>

      {quoteSuccessMsg && (
        <div className="bg-emerald-500 text-white text-sm font-semibold p-3 text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{quoteSuccessMsg}</span>
        </div>
      )}

      {/* TAB 1: BROWSE OPEN REQUESTS */}
      {activeTab === 'browse' && (
        <div className="p-6">
          {/* Category Filter */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filter Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold py-1.5 px-3 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-slate-400">
              Service providers can click "Send Quote" to submit instant estimates
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">Loading service requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold">No open service requests in this category.</p>
              <p className="text-xs text-slate-400 mt-1">Be the first to post a service requirement!</p>
              <button
                onClick={() => setActiveTab('post')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Create Request
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {filteredRequests.map((req) => {
                const urgencyColors: Record<string, string> = {
                  immediate: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
                  today: 'bg-amber-100 text-amber-800 border-amber-200',
                  tomorrow: 'bg-blue-100 text-blue-700 border-blue-200',
                  flexible: 'bg-slate-100 text-slate-700 border-slate-200',
                };

                return (
                  <div
                    key={req.id}
                    className="border border-slate-200 rounded-2xl p-5 hover:shadow-md transition-shadow bg-slate-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                              {req.subcategory}
                            </span>
                            <span
                              className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                                urgencyColors[req.urgency] || urgencyColors.flexible
                              }`}
                            >
                              ⚡ {req.urgency}
                            </span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-base mt-2">{req.title}</h4>
                        </div>

                        {req.budget && (
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 shrink-0">
                            {req.budget}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
                        {req.description}
                      </p>

                      <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                          <span className="truncate">{req.locality || req.city}</span>
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="truncate">{req.preferredTime || 'Preferred Date'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action: Send Quote or View Quotes */}
                    <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-500">
                        💬 {req.quotes?.length || 0} Quotes Received
                      </span>

                      {quotingRequestId === req.id ? (
                        <div className="w-full mt-3 bg-white p-4 rounded-xl border border-blue-300 shadow-md animate-in fade-in">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                            <span className="text-xs font-bold text-slate-800">Submit Your Quote:</span>
                            <button
                              onClick={() => setQuotingRequestId(null)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              Cancel
                            </button>
                          </div>
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">Your Quote (₹)</label>
                                <input
                                  type="number"
                                  placeholder="e.g. 500"
                                  value={quotePrice}
                                  onChange={(e) => setQuotePrice(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">Available Time</label>
                                <input
                                  type="text"
                                  placeholder="e.g. In 1 hour / 3 PM"
                                  value={quoteAvailableTime}
                                  onChange={(e) => setQuoteAvailableTime(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">Provider Name</label>
                                <input
                                  type="text"
                                  placeholder="Your full name"
                                  value={quoteProviderName}
                                  onChange={(e) => setQuoteProviderName(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500">Contact Phone</label>
                                <input
                                  type="text"
                                  placeholder="+91..."
                                  value={quoteProviderPhone}
                                  onChange={(e) => setQuoteProviderPhone(e.target.value)}
                                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-slate-500">Proposal / Note</label>
                              <textarea
                                placeholder="Explain how you can solve this issue..."
                                rows={2}
                                value={quoteMessage}
                                onChange={(e) => setQuoteMessage(e.target.value)}
                                className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs"
                              />
                            </div>
                            <button
                              onClick={() => handleSendQuote(req.id)}
                              disabled={submittingQuote}
                              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            >
                              {submittingQuote ? 'Sending...' : 'Send Quote to Customer'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setQuotingRequestId(req.id);
                            if (user?.name) setQuoteProviderName(user.name);
                            if (user?.phone) setQuoteProviderPhone(user.phone);
                          }}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          Send Quote (₹)
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: POST A SERVICE REQUEST */}
      {activeTab === 'post' && (
        <form onSubmit={handlePostSubmit} className="p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          {postSuccessMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-sm font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{postSuccessMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Service Category <span className="text-red-500">*</span>
              </label>
              <select
                value={postCategory}
                onChange={(e) => {
                  setPostCategory(e.target.value);
                  const cat = categories.find((c) => c.name === e.target.value);
                  if (cat && cat.subcategories.length > 0) {
                    setPostSubcategory(cat.subcategories[0]);
                  }
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Subcategory / Worker Type <span className="text-red-500">*</span>
              </label>
              <select
                value={postSubcategory}
                onChange={(e) => setPostSubcategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              >
                {availableSubcategories.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Short Title of Problem <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Geyser not heating, water leaking from pipe, or MCB switch burnt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Explain the issue, appliance brand, error signs, or specific materials needed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Urgency</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="immediate">🚨 Immediate / Emergency</option>
                <option value="today">⚡ Today</option>
                <option value="tomorrow">📅 Tomorrow</option>
                <option value="flexible">🕊️ Flexible</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Time</label>
              <input
                type="text"
                placeholder="e.g. 10:00 AM or Evening"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Expected Budget (₹)</label>
              <input
                type="text"
                placeholder="e.g. ₹500 or Under ₹1,500"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          {/* Location Fields */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-blue-600" />
                Service Address & Location
              </span>
              <button
                type="button"
                onClick={() => {
                  setAddress(userLocation.formattedAddress || 'My Current Location');
                  setLocality(userLocation.locality || '');
                  setCity(userLocation.city || 'Bengaluru');
                  setPincode(userLocation.pincode || '');
                }}
                className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Autofill Current Location
              </button>
            </div>

            <div>
              <input
                type="text"
                placeholder="House / Flat No., Street, Landmark"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Area / Locality"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
              <input
                type="text"
                placeholder="PIN Code"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Priya Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number for Quotes <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submittingPost}
            className="w-full py-3.5 px-6 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-xl shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="w-4 h-4" />
            <span>{submittingPost ? 'Posting Requirement...' : 'Post Request & Receive Quotes'}</span>
          </button>
        </form>
      )}

      {/* TAB 3: MY REQUESTS & RECEIVED QUOTES */}
      {activeTab === 'my-requests' && (
        <div className="p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Your Active Requests & Received Quotes</h3>
              <p className="text-xs text-slate-500">
                Review estimates submitted by local technicians, compare prices, and pick the best professional.
              </p>
            </div>
          </div>

          {myRequests.length === 0 ? (
            <div className="py-12 text-center">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-700 font-bold">You haven't posted any service requests yet.</p>
              <button
                onClick={() => setActiveTab('post')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Post Your First Request
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.map((req) => {
                const isExpanded = expandedRequestId === req.id || req.quotes.length > 0;

                return (
                  <div
                    key={req.id}
                    className="border border-slate-200 rounded-2xl p-5 bg-white shadow-xs hover:border-blue-300 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                            {req.subcategory}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              req.status === 'assigned'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {req.status === 'assigned' ? '✓ Provider Assigned' : '⏳ Open for Quotes'}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-base mt-1.5">{req.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">{req.description}</p>
                        <p className="text-[11px] text-slate-400 mt-2">
                          📍 {req.address}, {req.locality} • Urgency: <strong>{req.urgency}</strong>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full">
                          {req.quotes.length} Quotes
                        </span>
                      </div>
                    </div>

                    {/* Quotes Received List */}
                    {req.quotes && req.quotes.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <p className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          Quotes from Interested Workers:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {req.quotes.map((q) => {
                            const isAccepted = q.status === 'accepted';
                            const cleanPhone = q.providerPhone.replace(/[^0-9]/g, '');

                            return (
                              <div
                                key={q.id}
                                className={`p-4 rounded-xl border transition-all ${
                                  isAccepted
                                    ? 'bg-emerald-50/60 border-emerald-300 ring-2 ring-emerald-500/20'
                                    : 'bg-slate-50 border-slate-200'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={q.providerImage}
                                      alt={q.providerName}
                                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white"
                                    />
                                    <div>
                                      <p className="font-bold text-slate-900 text-xs sm:text-sm">
                                        {q.providerName}
                                      </p>
                                      <p className="text-[10px] text-slate-500">{q.providerBusiness}</p>
                                    </div>
                                  </div>

                                  <div className="text-right">
                                    <p className="text-base font-black text-emerald-700">₹{q.quotedPrice}</p>
                                    <p className="text-[10px] text-slate-400">{q.availableTime}</p>
                                  </div>
                                </div>

                                <p className="text-xs text-slate-600 mt-2.5 bg-white p-2 rounded-lg border border-slate-100">
                                  "{q.message}"
                                </p>

                                {/* Action Buttons for Quote */}
                                <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-slate-200/60">
                                  {isAccepted ? (
                                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                      <CheckCircle2 className="w-4 h-4" />
                                      Hired / Accepted
                                    </span>
                                  ) : (
                                    <button
                                      onClick={() => handleAcceptQuote(req.id, q.id)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                                    >
                                      Accept Quote
                                    </button>
                                  )}

                                  <div className="flex items-center gap-1.5">
                                    <a
                                      href={`tel:${q.providerPhone}`}
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700"
                                      title="Call Provider"
                                    >
                                      <Phone className="w-3 h-3" />
                                      <span>Call</span>
                                    </a>
                                    <a
                                      href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(
                                        q.providerName
                                      )},%20I%20saw%20your%20quote%20of%20₹${q.quotedPrice}%20for%20my%20service%20request.`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600"
                                      title="WhatsApp Provider"
                                    >
                                      <MessageSquare className="w-3 h-3" />
                                      <span>WhatsApp</span>
                                    </a>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
