import React, { useState, useEffect } from 'react';

export const QuotaBanner: React.FC = () => {
  const [isExceeded, setIsExceeded] = useState(false);

  useEffect(() => {
    const handleQuotaExceeded = () => {
      setIsExceeded(true);
    };

    window.addEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuotaExceeded);
    };
  }, []);

  if (!isExceeded) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm flex items-center justify-center gap-2">
      <span>
        Google Maps Platform quota reached. If you are the app owner, visit{' '}
        <a
          href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-semibold text-amber-950 hover:text-amber-800"
        >
          maps developer site
        </a>{' '}
        for instructions to update your account.
      </span>
      <button
        onClick={() => setIsExceeded(false)}
        className="ml-2 text-amber-800 hover:text-amber-950 font-bold px-1.5 py-0.5 rounded text-xs border border-amber-300"
      >
        Dismiss
      </button>
    </div>
  );
};
