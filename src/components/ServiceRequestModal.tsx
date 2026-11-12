import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, Phone } from 'lucide-react';
import { WorkerProfile, LocationCoordinates, UserAccount } from '../types';

interface ServiceRequestModalProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
  userLocation: LocationCoordinates;
  user: UserAccount | null;
}

export const ServiceRequestModal: React.FC<ServiceRequestModalProps> = ({
  worker,
  isOpen,
  onClose,
  userLocation,
  user,
}) => {
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [serviceRequested, setServiceRequested] = useState(worker?.subcategory || '');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState(userLocation.formattedAddress || 'My Residence');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone || !address) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workerId: worker.id,
          workerName: worker.name,
          customerName,
          customerPhone,
          serviceRequested: serviceRequested || worker.subcategory,
          preferredDate,
          address,
          details,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Direct Service Booking</h3>
              <p className="text-xs text-slate-500">Request visit from {worker.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-900 text-lg">Booking Request Sent!</p>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">
              Your service request has been notified to <strong>{worker.name}</strong>. They will call you at{' '}
              <strong>{customerPhone}</strong> to confirm the exact time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
              <img src={worker.profileImage} alt={worker.name} className="w-10 h-10 rounded-lg object-cover" />
              <div>
                <p className="text-xs font-bold text-slate-900">{worker.name}</p>
                <p className="text-[10px] text-blue-600 font-semibold">{worker.subcategory} • {worker.pricing}</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
              <input
                type="text"
                placeholder="e.g. Sumanth Patel"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Mobile Number</label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Date</label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Service Required</label>
              <input
                type="text"
                placeholder="e.g. Fan installation, MCB trip, Pipe leak repair"
                value={serviceRequested}
                onChange={(e) => setServiceRequested(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Complete Address / Landmark</label>
              <input
                type="text"
                placeholder="Flat / House No, Street, Society"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Problem Details (Optional)</label>
              <textarea
                rows={2}
                placeholder="Any special tools required, materials bought, or specific time instructions..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Sending Request...' : 'Send Service Booking Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
