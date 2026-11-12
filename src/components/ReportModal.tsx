import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { WorkerProfile } from '../types';

interface ReportModalProps {
  worker: WorkerProfile | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ worker, isOpen, onClose }) => {
  const [reason, setReason] = useState('Incorrect phone number or address');
  const [details, setDetails] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !worker) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!details) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/workers/${worker.id}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details, reporterPhone }),
      });
      if (res.ok) {
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          onClose();
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900">Report Service Provider</h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <p className="font-bold text-slate-900">Report Submitted</p>
            <p className="text-xs text-slate-500">
              Our administrative moderation team will investigate this listing and take immediate action.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <p className="text-xs text-slate-600">
              Reporting: <strong className="text-slate-900">{worker.name}</strong> ({worker.businessName})
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issue Category</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="Incorrect phone number or address">Incorrect phone number or address</option>
                <option value="Unreachable / Switched off phone">Unreachable / Switched off phone</option>
                <option value="Unprofessional behavior / Overcharging">Unprofessional behavior / Overcharging</option>
                <option value="Fake credentials or fake reviews">Fake credentials or fake reviews</option>
                <option value="Other grievance">Other grievance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Explanation</label>
              <textarea
                rows={3}
                placeholder="Describe what occurred with as much detail as possible..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Your Contact Phone (Optional)</label>
              <input
                type="tel"
                placeholder="+91..."
                value={reporterPhone}
                onChange={(e) => setReporterPhone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
