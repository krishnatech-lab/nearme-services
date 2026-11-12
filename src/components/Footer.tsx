import React from 'react';
import { Wrench, Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { SiteSettings, Category } from '../types';

interface FooterProps {
  settings: SiteSettings;
  categories: Category[];
  onSelectCategory: (categoryName: string) => void;
  onOpenRegisterModal: () => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  categories,
  onSelectCategory,
  onOpenRegisterModal,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 pt-16 pb-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md">
                <Wrench className="w-5 h-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-black tracking-tight">{settings.siteName || 'NearMe Services'}</span>
            </div>
            <p className="text-slate-400 text-xs max-w-sm leading-relaxed">
              India's leading hyperlocal directory connecting households and enterprises with background-verified electricians, plumbers, carpenters, mechanics, cleaners, and technical professionals.
            </p>

            <div className="pt-2 space-y-2">
              <p className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Helpline: {settings.contactPhone}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>{settings.contactEmail}</span>
              </p>
              <p className="flex items-center gap-2 text-slate-400">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Serving all major metropolitan areas across India</span>
              </p>
            </div>
          </div>

          {/* Quick Categories */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Top Services</h4>
            <ul className="space-y-2">
              {['Electrician', 'Plumber', 'Carpenter', 'AC Technician', 'Car Mechanic', 'House Cleaning', 'CCTV Installer'].map((item) => (
                <li key={item}>
                  <button
                    onClick={() => {
                      onSelectCategory(item);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    {item} Near Me
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Service Categories */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.slice(0, 7).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(cat.name);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className="hover:text-white transition-colors cursor-pointer text-left truncate max-w-full"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* For Workers & Admin */}
          <div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">For Workers</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onOpenRegisterModal}
                  className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer text-left"
                >
                  + Join as Service Provider
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="text-slate-400 hover:text-white transition-colors cursor-pointer text-left"
                >
                  Admin Control Center
                </button>
              </li>
              <li>
                <span className="text-slate-500">ID Verification Guidelines</span>
              </li>
              <li>
                <span className="text-slate-500">Terms of Service</span>
              </li>
              <li>
                <span className="text-slate-500">Privacy & Data Security</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} {settings.siteName || 'NearMe Services'}. All rights reserved. Zero commission, direct local contacts.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              100% Genuine Provider Directory
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
