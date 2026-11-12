import React from 'react';
import { MapPin, Heart, User, ShieldCheck, PlusCircle, Wrench, Menu, X } from 'lucide-react';
import { SiteSettings, UserAccount, LocationCoordinates } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { LanguageDropdown } from './LanguageDropdown';

interface NavbarProps {
  settings: SiteSettings;
  user: UserAccount | null;
  userLocation: LocationCoordinates;
  onOpenLocationModal: () => void;
  onOpenAuthModal: () => void;
  onOpenRegisterModal: () => void;
  onOpenAdmin: () => void;
  onSelectFavourites: () => void;
  onLogout: () => void;
  activeView: 'home' | 'favourites' | 'admin';
  setActiveView: (view: 'home' | 'favourites' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  user,
  userLocation,
  onOpenLocationModal,
  onOpenAuthModal,
  onOpenRegisterModal,
  onOpenAdmin,
  onSelectFavourites,
  onLogout,
  activeView,
  setActiveView,
}) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all shadow-xs">
      {/* Top micro banner */}
      {settings.bannerNotice && (
        <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 text-white text-xs py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
          <span>{t('navbar.bannerNotice', settings.bannerNotice)}</span>
          <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
            {t('navbar.directoryBadge', '24/7 Local Directory')}
          </span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {settings.siteName || 'NearMe Services'}
                </span>
                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block leading-none mt-0.5">
                {settings.tagline || 'Local Workers & Professionals Finder'}
              </p>
            </div>
          </div>

          {/* Location Chip Selector */}
          <button
            onClick={onOpenLocationModal}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-slate-700 text-xs sm:text-sm font-medium rounded-full border border-slate-200 transition-all cursor-pointer truncate max-w-[170px] sm:max-w-xs"
            title="Click to detect GPS or change your location"
          >
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0 animate-bounce" />
            <span className="truncate">
              {userLocation.locality ? `${userLocation.locality}, ${userLocation.city}` : userLocation.city || 'Detecting Location...'}
            </span>
            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.5 rounded-full font-bold ml-1 hidden md:inline">
              {t('common.change', 'Change')}
            </span>
          </button>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <LanguageDropdown />

            {/* Favourites Button */}
            <button
              onClick={() => {
                setActiveView('favourites');
                onSelectFavourites();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeView === 'favourites'
                  ? 'bg-red-50 text-red-600'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Heart className={`w-4 h-4 ${activeView === 'favourites' ? 'fill-red-500 text-red-500' : ''}`} />
              <span>{t('navbar.savedWorkers', 'Saved')}</span>
              {user?.favourites?.length ? (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {user.favourites.length}
                </span>
              ) : null}
            </button>

            {/* Register as Worker CTA */}
            <button
              onClick={onOpenRegisterModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('navbar.registerWorker', 'Register as Worker')}</span>
            </button>

            {/* Admin Dashboard */}
            <button
              onClick={onOpenAdmin}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
                activeView === 'admin'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{t('navbar.adminPanel', 'Admin Panel')}</span>
            </button>

            {/* Auth / Account */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{user.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.role}</p>
                </div>
                <button
                  onClick={onLogout}
                  className="text-xs text-red-600 hover:underline cursor-pointer ml-1 font-medium"
                >
                  {t('navbar.logout', 'Logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>{t('navbar.loginOtp', 'Login / OTP')}</span>
              </button>
            )}
          </div>

          {/* Mobile Actions: Language Dropdown + Hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageDropdown />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-3 shadow-xl">
          {/* Mobile Language Selector inside Drawer */}
          <div className="pb-3 border-b border-slate-100">
            <LanguageDropdown isMobile={true} />
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">
                {userLocation.locality || userLocation.city}
              </span>
            </div>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenLocationModal();
              }}
              className="text-xs text-blue-600 font-bold underline cursor-pointer"
            >
              {t('common.change', 'Change')}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView('home');
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-800 text-left cursor-pointer"
            >
              🏠 {t('common.home', 'Home')}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView('favourites');
                onSelectFavourites();
              }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-medium text-slate-800 text-left flex items-center justify-between cursor-pointer"
            >
              <span>❤️ {t('navbar.savedWorkers', 'Saved Workers')}</span>
              {user?.favourites?.length ? (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {user.favourites.length}
                </span>
              ) : null}
            </button>
          </div>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenRegisterModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 text-blue-700 font-bold rounded-lg border border-blue-200 text-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('navbar.registerWorker', 'Register as a Service Provider')}</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{t('navbar.adminPanel', 'Admin Dashboard')}</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.phone} ({user.role})</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="text-xs text-red-600 font-bold cursor-pointer"
                >
                  {t('navbar.logout', 'Logout')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg text-xs text-center shadow-sm cursor-pointer"
              >
                {t('navbar.loginOtp', 'Sign In with Mobile OTP')}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
