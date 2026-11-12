import React, { useState } from 'react';
import {
  X,
  PlusCircle,
  MapPin,
  CheckCircle2,
  Navigation,
  ShieldCheck,
  Send,
  Camera,
  AlertCircle,
} from 'lucide-react';
import { Category, WorkerProfile, LocationCoordinates, WorkerAvailabilityStatus } from '../types';

interface WorkerRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  userLocation: LocationCoordinates;
  onSuccess: (newWorker: WorkerProfile) => void;
}

export const WorkerRegisterModal: React.FC<WorkerRegisterModalProps> = ({
  isOpen,
  onClose,
  categories,
  userLocation,
  onSuccess,
}) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Basic & Phone OTP, Step 2: Service & Address details
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Step 2 details
  const [category, setCategory] = useState(categories[0]?.name || 'Home Repair & Maintenance');
  const [subcategory, setSubcategory] = useState(categories[0]?.subcategories[0] || 'Electrician');
  const [profileImage, setProfileImage] = useState(
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400'
  );
  const [bio, setBio] = useState('');
  const [experienceYears, setExperienceYears] = useState('5');
  const [workingHours, setWorkingHours] = useState('8:00 AM - 8:00 PM (Everyday)');
  const [pricing, setPricing] = useState('₹250 Inspection charge');
  const [availabilityStatus, setAvailabilityStatus] = useState<WorkerAvailabilityStatus>('available_now');
  const [address, setAddress] = useState(userLocation.formattedAddress || 'Main Road');
  const [locality, setLocality] = useState(userLocation.locality || '');
  const [city, setCity] = useState(userLocation.city || 'Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState(userLocation.pincode || '');
  const [lat, setLat] = useState<number>(userLocation.latitude || 12.9784);
  const [lng, setLng] = useState<number>(userLocation.longitude || 77.6408);
  const [servicesInput, setServicesInput] = useState('');
  const [languagesInput, setLanguagesInput] = useState('Hindi, English');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successWorker, setSuccessWorker] = useState<WorkerProfile | null>(null);

  if (!isOpen) return null;

  const selectedCatObj = categories.find((c) => c.name === category);
  const subcategories = selectedCatObj?.subcategories || [];

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        if (data.debugOtp) setDebugOtp(data.debugOtp);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP');
      }
    } catch {
      setErrorMsg('Network error sending OTP');
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode) {
      setErrorMsg('Please enter OTP code');
      return;
    }
    setErrorMsg(null);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otpCode, name, requestedRole: 'worker' }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpVerified(true);
        setStep(2);
      } else {
        setErrorMsg(data.error || 'Invalid OTP');
      }
    } catch {
      setErrorMsg('Error verifying OTP');
    }
  };

  const handleDetectGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const servicesList = servicesInput
        ? servicesInput.split(',').map((s) => s.trim())
        : [subcategory, `${subcategory} Repair`, 'Maintenance'];
      const languagesList = languagesInput.split(',').map((l) => l.trim());

      const res = await fetch('/api/workers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          businessName,
          phone,
          whatsapp: whatsapp || phone,
          category,
          subcategory,
          profileImage,
          bio: bio || `${subcategory} technician with ${experienceYears} years experience serving ${locality || city}.`,
          experienceYears: parseInt(experienceYears, 10),
          workingHours,
          pricing,
          availabilityStatus,
          address,
          locality,
          city,
          state,
          pincode,
          latitude: lat,
          longitude: lng,
          services: servicesList,
          languages: languagesList,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessWorker(data);
        onSuccess(data);
      } else {
        setErrorMsg(data.error || 'Failed to register');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Server connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900">Service Provider Registration</h3>
              <p className="text-xs text-slate-500">
                Join our verified directory and receive direct customer calls & job quotes
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successWorker ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h4 className="text-xl font-bold text-slate-900">Registration Submitted!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your profile for <strong className="text-slate-900">{successWorker.name}</strong> ({successWorker.subcategory}) has been registered.
              {successWorker.status === 'pending'
                ? ' Submissions undergo admin verification to maintain high trust and will become visible shortly.'
                : ' Your listing is now active in the directory!'}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm"
            >
              Done
            </button>
          </div>
        ) : step === 1 ? (
          /* STEP 1: Phone & Mobile OTP Verification */
          <div className="mt-6 space-y-4">
            <div className="bg-blue-50/70 p-4 rounded-2xl border border-blue-100">
              <p className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                Step 1 of 2: Mobile Number Verification
              </p>
              <p className="text-[11px] text-blue-700 mt-1">
                We verify contact numbers to prevent fake listings and guarantee customer trust.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Business / Shop Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Kumar Electricals & Repairs"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Primary Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+91 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpVerified}
                  className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={otpSent && !debugOtp}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                >
                  {otpSent ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>
            </div>

            {otpSent && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Enter 6-Digit OTP:</label>
                  {debugOtp && (
                    <span
                      onClick={() => setOtpCode(debugOtp)}
                      className="text-xs text-blue-600 font-bold bg-blue-100 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-200"
                    >
                      Click to Auto-fill: {debugOtp}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm tracking-widest font-mono text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Verify & Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STEP 2: Full Profile Details */
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    const cat = categories.find((c) => c.name === e.target.value);
                    if (cat && cat.subcategories.length > 0) {
                      setSubcategory(cat.subcategories[0]);
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
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
                  Subcategory / Trade <span className="text-red-500">*</span>
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  required
                >
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Experience (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Number</label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Initial Availability</label>
                <select
                  value={availabilityStatus}
                  onChange={(e) => setAvailabilityStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  <option value="available_now">🟢 Available Now</option>
                  <option value="on_job">🟡 On a Job</option>
                  <option value="offline">⚪ Offline</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Profile Photo URL (Image link)
              </label>
              <input
                type="url"
                value={profileImage}
                onChange={(e) => setProfileImage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                About / Professional Bio <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={2}
                placeholder="Mention your certifications, specialties, and service guarantee..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Working Hours</label>
                <input
                  type="text"
                  placeholder="e.g. 8:00 AM - 9:00 PM"
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visiting / Inspection Fee</label>
                <input
                  type="text"
                  placeholder="e.g. ₹250 Visiting Charge"
                  value={pricing}
                  onChange={(e) => setPricing(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Address & GPS */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  Address & GPS Location
                </span>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  className="text-xs text-blue-600 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Navigation className="w-3 h-3" />
                  <span>Use Device Coordinates</span>
                </button>
              </div>

              <input
                type="text"
                placeholder="Shop / House No., Building, Street"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                required
              />

              <div className="grid grid-cols-4 gap-2">
                <input
                  type="text"
                  placeholder="Area / Locality"
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
                <input
                  type="text"
                  placeholder="PIN Code"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Complete Worker Registration'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
