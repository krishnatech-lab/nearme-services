import React, { createContext, useContext, useState, useEffect } from 'react';
import translationsData from '../i18n/translations.json';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (_path: string, fallback?: string) => fallback || '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('nearme_lang');
      if (saved === 'hi' || saved === 'en') {
        return saved;
      }
    } catch {}
    return 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('nearme_lang', lang);
      document.documentElement.lang = lang;
    } catch {}
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (path: string, fallback?: string): string => {
    const keys = path.split('.');
    const langObj = (translationsData as any)[language] || (translationsData as any)['en'];
    
    let current: any = langObj;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English if missing in Hindi
        const enObj = (translationsData as any)['en'];
        let enCurrent: any = enObj;
        for (const enKey of keys) {
          if (enCurrent && typeof enCurrent === 'object' && enKey in enCurrent) {
            enCurrent = enCurrent[enKey];
          } else {
            return fallback || path;
          }
        }
        return typeof enCurrent === 'string' ? enCurrent : (fallback || path);
      }
    }

    return typeof current === 'string' ? current : (fallback || path);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
