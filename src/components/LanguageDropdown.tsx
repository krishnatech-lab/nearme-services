import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useTranslation, Language } from '../context/LanguageContext';

interface LanguageDropdownProps {
  className?: string;
  isMobile?: boolean;
}

export const LanguageDropdown: React.FC<LanguageDropdownProps> = ({ className = '', isMobile = false }) => {
  const { language, setLanguage, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; native: string; badge: string }[] = [
    { code: 'en', label: 'English', native: 'English', badge: 'EN' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी', badge: 'HI' },
  ];

  const currentLang = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isMobile) {
    return (
      <div className={`space-y-1.5 ${className}`}>
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 px-1">
          <Globe className="w-3.5 h-3.5 text-blue-600" />
          <span>{t('navbar.language', 'Language')}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => setLanguage(item.code)}
                className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{item.native}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100/90 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 transition-all cursor-pointer shadow-2xs group"
        title="Select language / भाषा चुनें"
      >
        <Globe className="w-3.5 h-3.5 text-blue-600 group-hover:rotate-12 transition-transform" />
        <span className="tracking-tight">{currentLang.native}</span>
        <ChevronDown className={`w-3 h-3 text-slate-400 group-hover:text-blue-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-slate-100 ring-1 ring-black/5 p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
            {t('navbar.language', 'Language')}
          </div>
          {languages.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  setLanguage(item.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-blue-700 font-bold'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-slate-900">{item.native}</span>
                  <span className="text-[10px] text-slate-400">({item.label})</span>
                </div>
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-blue-600 stroke-[2.5]" />
                ) : (
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold px-1 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
