import React, { useState } from 'react';
import { X, Phone, ShieldCheck, CheckCircle2, User, KeyRound } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [debugOtp, setDebugOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (targetPhone?: string) => {
    const p = targetPhone || phone;
    if (!p || p.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: p }),
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        if (data.debugOtp) setDebugOtp(data.debugOtp);
      } else {
        setErrorMsg(data.error || 'Failed to send OTP');
      }
    } catch {
      setErrorMsg('Error sending OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string, customPhone?: string, customName?: string) => {
    const code = codeToVerify || otpCode;
    const p = customPhone || phone;
    if (!code) {
      setErrorMsg('Please enter OTP');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: p,
          code,
          name: customName || name,
        }),
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Invalid OTP');
      }
    } catch {
      setErrorMsg('Verification error');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test login helpers
  const handleQuickLogin = (role: 'superadmin' | 'user' | 'worker') => {
    if (role === 'superadmin') {
      setPhone('+919999999999');
      setName('Super Administrator');
      handleVerifyOtp('123456', '+919999999999', 'Super Administrator');
    } else if (role === 'worker') {
      setPhone('+919876543210');
      setName('Ramesh Sharma');
      handleVerifyOtp('123456', '+919876543210', 'Ramesh Sharma');
    } else {
      setPhone('+919876500000');
      setName('Amit Customer');
      handleVerifyOtp('123456', '+919876500000', 'Amit Customer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">User & Provider Login</h3>
              <p className="text-xs text-slate-500">Sign in securely using Mobile OTP</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              placeholder="e.g. Rahul Verma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={loading}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
              >
                {otpSent ? 'Resend' : 'Send OTP'}
              </button>
            </div>
          </div>

          {otpSent && (
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Enter OTP:</label>
                {debugOtp && (
                  <span
                    onClick={() => setOtpCode(debugOtp)}
                    className="text-xs text-blue-700 font-bold bg-blue-200/70 px-2 py-0.5 rounded cursor-pointer hover:bg-blue-300"
                  >
                    Auto-Fill: {debugOtp}
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
                  className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-center font-bold tracking-widest font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleVerifyOtp()}
                  disabled={loading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Verify
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Switcher */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
              ⚡ Quick Demo 1-Click Access
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin')}
                className="py-2 px-2 bg-slate-900 text-white text-[11px] font-bold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer text-center"
              >
                🛡️ Super Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('worker')}
                className="py-2 px-2 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-bold rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer text-center"
              >
                🔧 Provider
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('user')}
                className="py-2 px-2 bg-slate-100 text-slate-700 text-[11px] font-bold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
              >
                👤 Customer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
