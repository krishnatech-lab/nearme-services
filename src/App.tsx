import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  MapPin,
  SlidersHorizontal,
  Star,
  ShieldCheck,
  Phone,
  MessageSquare,
  Navigation,
  Sparkles,
  Layers,
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  RefreshCw,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import {
  WorkerProfile,
  Category,
  SiteSettings,
  LocationCoordinates,
  UserAccount,
  WorkerAvailabilityStatus,
} from './types';
import { Navbar } from './components/Navbar';
import { QuotaBanner } from './components/QuotaBanner';
import { WorkerCard } from './components/WorkerCard';
import { WorkerDetailModal } from './components/WorkerDetailModal';
import { LocationModal } from './components/LocationModal';
import { WorkerRegisterModal } from './components/WorkerRegisterModal';
import { AuthModal } from './components/AuthModal';
import { ServiceRequestsHub } from './components/ServiceRequestsHub';
import { ServiceRequestModal } from './components/ServiceRequestModal';
import { ReportModal } from './components/ReportModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MapDirectory } from './components/MapDirectory';
import { CategoryIcon } from './components/CategoryIcon';
import { PopularSearches } from './components/PopularSearches';
import { RecentSearches } from './components/RecentSearches';
import { Testimonials } from './components/Testimonials';
import { Footer } from './components/Footer';
import { PopularSearchItem } from './types';
import { useTranslation } from './context/LanguageContext';

export default function App() {
  const { t, language } = useTranslation();
  // Navigation & View state
  const [activeView, setActiveView] = useState<'home' | 'favourites' | 'admin'>('home');

  // Core Data
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'NearMe Services',
    tagline: 'Connect Instantly with Trusted Workers & Local Professionals',
    contactPhone: '+91 800-NEAR-ME',
    contactEmail: 'support@nearmeservices.local',
    autoApproveWorkers: false,
    defaultSearchRadiusKm: 10,
    bannerNotice: '⚡ 100% Verified Local Professionals. Direct Phone & WhatsApp Calling.',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // User state
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('nearme_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // User Location (defaults to Indiranagar, Bengaluru coordinates)
  const [userLocation, setUserLocation] = useState<LocationCoordinates>(() => {
    try {
      const saved = localStorage.getItem('nearme_loc');
      return saved
        ? JSON.parse(saved)
        : {
            latitude: 12.9784,
            longitude: 77.6408,
            city: 'Bengaluru',
            locality: 'Indiranagar',
            pincode: '560038',
            formattedAddress: 'Indiranagar, Bengaluru, Karnataka',
          };
    } catch {
      return {
        latitude: 12.9784,
        longitude: 77.6408,
        city: 'Bengaluru',
        locality: 'Indiranagar',
        pincode: '560038',
        formattedAddress: 'Indiranagar, Bengaluru, Karnataka',
      };
    }
  });

  // Filters & Search Parameters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('all');
  const [selectedRadius, setSelectedRadius] = useState<number | 'all'>(10);
  const [availabilityFilter, setAvailabilityFilter] = useState<'all' | WorkerAvailabilityStatus>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'rating' | 'experience' | 'recent'>('nearest');

  // Recent Searches state (stores user's last 5 search queries in localStorage)
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('nearme_recent_searches');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch {}
    return ['Electrician', 'AC Technician', 'Indiranagar'];
  });

  // Modals state
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedWorkerForDetail, setSelectedWorkerForDetail] = useState<WorkerProfile | null>(null);
  const [selectedWorkerForBooking, setSelectedWorkerForBooking] = useState<WorkerProfile | null>(null);
  const [selectedWorkerForReport, setSelectedWorkerForReport] = useState<WorkerProfile | null>(null);

  // Google Maps API Key
  const [mapsApiKey, setMapsApiKey] = useState<string>('');

  // Save location to storage
  useEffect(() => {
    localStorage.setItem('nearme_loc', JSON.stringify(userLocation));
  }, [userLocation]);

  // Save user to storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('nearme_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nearme_user');
    }
  }, [user]);

  // Save recent searches to storage
  useEffect(() => {
    try {
      localStorage.setItem('nearme_recent_searches', JSON.stringify(recentSearches));
    } catch (err) {
      console.error('Failed to save recent searches:', err);
    }
  }, [recentSearches]);

  // Initial fetch of settings, categories, and maps key
  const loadInitialData = async () => {
    try {
      const [settingsRes, categoriesRes, keyRes] = await Promise.all([
        fetch('/api/settings'),
        fetch('/api/categories'),
        fetch('/api/config/maps-key'),
      ]);

      if (settingsRes.ok) setSettings(await settingsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (keyRes.ok) {
        const kData = await keyRes.json();
        if (kData.apiKey) setMapsApiKey(kData.apiKey);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Fetch workers when search/filters/location changes
  const fetchWorkers = async () => {
    setLoadingWorkers(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedCategory !== 'all') params.set('category', selectedCategory);
      if (selectedSubcategory !== 'all') params.set('subcategory', selectedSubcategory);
      if (selectedRadius !== 'all') params.set('radius', selectedRadius.toString());
      if (availabilityFilter !== 'all') params.set('availabilityStatus', availabilityFilter);
      if (verifiedOnly) params.set('isVerified', 'true');
      if (sortBy) params.set('sort', sortBy);

      if (userLocation.latitude && userLocation.longitude) {
        params.set('lat', userLocation.latitude.toString());
        params.set('lng', userLocation.longitude.toString());
      }

      const res = await fetch(`/api/workers?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setWorkers(data);
      }
    } catch (err) {
      console.error('Error fetching workers:', err);
    } finally {
      setLoadingWorkers(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [
    searchQuery,
    selectedCategory,
    selectedSubcategory,
    selectedRadius,
    availabilityFilter,
    verifiedOnly,
    sortBy,
    userLocation,
  ]);

  // Handle Favourite Toggle
  const handleToggleFavourite = async (workerId: string) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}/favourites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workerId }),
      });
      if (res.ok) {
        const updatedFavs = await res.json();
        setUser({ ...user, favourites: updatedFavs });
      }
    } catch (err) {
      console.error('Failed to update favourite:', err);
    }
  };

  const handleStatusUpdated = (workerId: string, newStatus: WorkerAvailabilityStatus) => {
    setWorkers((prev) =>
      prev.map((w) => (w.id === workerId ? { ...w, availabilityStatus: newStatus, isAvailable: newStatus === 'available_now' } : w))
    );
    if (selectedWorkerForDetail && selectedWorkerForDetail.id === workerId) {
      setSelectedWorkerForDetail({
        ...selectedWorkerForDetail,
        availabilityStatus: newStatus,
        isAvailable: newStatus === 'available_now',
      });
    }
  };

  // Subcategories of selected category
  const activeCategoryObj = categories.find((c) => c.name === selectedCategory);
  const activeSubcategories = activeCategoryObj?.subcategories || [];

  // Filtered workers for Favourites view
  const displayedWorkers = useMemo(() => {
    if (activeView === 'favourites') {
      const favSet = new Set(user?.favourites || []);
      return workers.filter((w) => favSet.has(w.id));
    }
    return workers;
  }, [activeView, workers, user]);

  // Recent search helpers
  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 5);
    });
  };

  const handleSelectRecentSearch = (query: string) => {
    setSearchQuery(query);
    addRecentSearch(query);
    const resultsEl = document.getElementById('results-section');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRemoveRecentSearch = (query: string) => {
    setRecentSearches((prev) => prev.filter((item) => item.toLowerCase() !== query.toLowerCase()));
  };

  const handleClearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('nearme_recent_searches');
    } catch {}
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      // Log search for popularity
      fetch('/api/search-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          subcategory: selectedSubcategory !== 'all' ? selectedSubcategory : undefined,
          locality: userLocation.locality,
          city: userLocation.city,
        }),
      }).catch(() => {});
    }
    fetchWorkers();
    const resultsEl = document.getElementById('results-section');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPopularQuery = (item: PopularSearchItem) => {
    if (item.category) setSelectedCategory(item.category);
    if (item.subcategory) setSelectedSubcategory(item.subcategory);
    setSearchQuery(item.text);
    addRecentSearch(item.text);

    // Record search log on backend
    fetch('/api/search-log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: item.text,
        category: item.category,
        subcategory: item.subcategory,
        locality: userLocation.locality,
        city: userLocation.city,
      }),
    }).catch(() => {});

    const resultsEl = document.getElementById('results-section');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPopularLocation = (loc: LocationCoordinates) => {
    setUserLocation(loc);
    const resultsEl = document.getElementById('results-section');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Tier 2 Quota Defense Banner (Google Maps Platform Mandatory Rule) */}
      <QuotaBanner />

      {/* Main Navbar */}
      <Navbar
        settings={settings}
        user={user}
        userLocation={userLocation}
        onOpenLocationModal={() => setLocationModalOpen(true)}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenRegisterModal={() => setRegisterModalOpen(true)}
        onOpenAdmin={() => setActiveView('admin')}
        onSelectFavourites={() => setActiveView('favourites')}
        onLogout={() => setUser(null)}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* ADMIN DASHBOARD VIEW */}
      {activeView === 'admin' ? (
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <AdminDashboard
            categories={categories}
            workers={workers}
            settings={settings}
            onRefreshData={() => {
              loadInitialData();
              fetchWorkers();
            }}
            onClose={() => setActiveView('home')}
          />
        </main>
      ) : activeView === 'favourites' ? (
        /* SAVED WORKERS VIEW */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between pb-6 border-b border-slate-200">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Your Saved Workers & Specialists</h2>
              <p className="text-xs text-slate-500 mt-1">
                Quickly access verified phone numbers and directions for your favourite technicians
              </p>
            </div>
            <button
              onClick={() => setActiveView('home')}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl"
            >
              Back to Search
            </button>
          </div>

          {displayedWorkers.length === 0 ? (
            <div className="py-20 text-center">
              <span className="text-4xl">❤️</span>
              <h3 className="text-lg font-bold text-slate-800 mt-3">No Saved Workers Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Click the heart icon on any worker profile card to bookmark them for quick emergency access.
              </p>
              <button
                onClick={() => setActiveView('home')}
                className="mt-5 px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl"
              >
                Browse Nearby Workers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {displayedWorkers.map((worker) => (
                <WorkerCard
                  key={worker.id}
                  worker={worker}
                  isFavourite={user?.favourites?.includes(worker.id) || false}
                  onToggleFavourite={handleToggleFavourite}
                  onViewProfile={(w) => setSelectedWorkerForDetail(w)}
                  onQuickBook={(w) => setSelectedWorkerForBooking(w)}
                />
              ))}
            </div>
          )}
        </main>
      ) : (
        /* HOMEPAGE VIEW */
        <main className="flex-1">
          {/* HERO BANNER & SEARCH SECTION */}
          <section className="relative bg-linear-to-b from-blue-900 via-blue-800 to-indigo-900 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Background glowing spheres */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-5xl mx-auto text-center relative z-10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-blue-200 text-xs font-semibold backdrop-blur-md mb-4 border border-white/10 shadow-xs">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{t('hero.badge', 'Hyperlocal Service Discovery • 100% Genuine Phone & WhatsApp')}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                {t('hero.titlePart1', 'Find Trusted Workers &')} <br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-200 via-white to-amber-200">
                  {t('hero.titlePart2', 'Professionals Near You')}
                </span>
              </h1>

              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto font-medium">
                {t('hero.showingWorkersAround', 'Showing verified electricians, plumbers, carpenters, mechanics & technicians around')}{' '}
                <button
                  onClick={() => setLocationModalOpen(true)}
                  className="font-bold underline decoration-blue-300 hover:text-white cursor-pointer"
                >
                  {userLocation.locality ? `${userLocation.locality}, ${userLocation.city}` : userLocation.city}
                </button>
              </p>

              {/* Large Search Bar */}
              <div className="mt-8 max-w-3xl mx-auto">
                <form
                  onSubmit={handleSearchSubmit}
                  className="bg-white p-2 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col sm:flex-row items-center gap-2 border border-white/20"
                >
                  <div className="flex items-center gap-3 flex-1 w-full px-3 py-2 text-slate-800">
                    <Search className="w-5 h-5 text-blue-600 shrink-0" />
                    <input
                      type="text"
                      placeholder={t('hero.searchPlaceholder', 'Search Electrician, Plumber, Carpenter near you...')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-transparent border-none text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-hidden font-medium"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-xs text-slate-400 hover:text-slate-600 font-bold px-1.5 cursor-pointer"
                        title={t('common.clear', 'Clear search')}
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Location clicker inside search bar */}
                    <button
                      type="button"
                      onClick={() => setLocationModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl sm:rounded-2xl shrink-0 cursor-pointer transition-colors max-w-[140px] truncate"
                      title="Change search location"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{userLocation.locality || userLocation.city}</span>
                    </button>

                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl sm:rounded-2xl shadow-md shadow-blue-500/25 transition-all cursor-pointer whitespace-nowrap active:scale-98"
                    >
                      {t('common.search', 'Search')}
                    </button>
                  </div>
                </form>
              </div>

              {/* Radius Pills Selector */}
              <div className="mt-5 flex items-center justify-center flex-wrap gap-1.5 text-xs">
                <span className="text-blue-200 font-bold mr-1">{t('hero.radiusLabel', 'Radius:')}</span>
                {[1, 3, 5, 10, 20, 50, 'all'].map((rad) => {
                  const isSelected = selectedRadius === rad;
                  return (
                    <button
                      key={rad}
                      type="button"
                      onClick={() => setSelectedRadius(rad as any)}
                      className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-blue-900 shadow-md scale-105'
                          : 'bg-white/10 text-white/90 hover:bg-white/20'
                      }`}
                    >
                      {rad === 'all' ? t('hero.allDistance', 'All Distance') : `${rad} KM`}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          {/* POPULAR & RECENT SEARCHES */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-30 mb-4 flex flex-col gap-2">
            <PopularSearches
              onSelectQuery={handleSelectPopularQuery}
              onSelectLocation={handleSelectPopularLocation}
              currentLocality={userLocation.locality}
            />

            <RecentSearches
              searches={recentSearches}
              onSelectSearch={handleSelectRecentSearch}
              onRemoveSearch={handleRemoveRecentSearch}
              onClearAll={handleClearRecentSearches}
            />
          </section>

          {/* SERVICE CATEGORIES HORIZONTAL NAVIGATION */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200/80 p-4 sm:p-6">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    {t('categories.browseTitle', 'Browse Service Categories')}
                  </h3>
                </div>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedSubcategory('all');
                    }}
                    className="text-xs text-blue-600 font-bold hover:underline cursor-pointer"
                  >
                    {t('categories.viewAll', 'View All Categories')}
                  </button>
                )}
              </div>

              {/* Category Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 sm:gap-3">
                {categories.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedCategory('all');
                          setSelectedSubcategory('all');
                        } else {
                          setSelectedCategory(cat.name);
                          setSelectedSubcategory('all');
                        }
                      }}
                      className={`p-3 rounded-2xl flex flex-col items-center text-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                          : 'bg-slate-50 hover:bg-blue-50/60 text-slate-700 hover:text-blue-700 border border-slate-100'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-2 transition-transform ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-white text-blue-600 shadow-xs'
                        }`}
                      >
                        <CategoryIcon name={cat.icon} className="w-5 h-5 stroke-[2.2]" />
                      </div>
                      <span className="text-xs font-bold line-clamp-2 leading-tight">{cat.name}</span>
                      <span
                        className={`text-[10px] font-semibold mt-1 px-1.5 py-0.2 rounded-full ${
                          isSelected ? 'bg-white/20 text-white' : 'text-slate-400'
                        }`}
                      >
                        {cat.workerCount || 0} Pros
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategories Pills if a category is selected */}
              {selectedCategory !== 'all' && activeSubcategories.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center flex-wrap gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
                    Specialties:
                  </span>
                  <button
                    onClick={() => setSelectedSubcategory('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                      selectedSubcategory === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    All in {selectedCategory}
                  </button>
                  {activeSubcategories.map((sub) => {
                    const isSubSelected = selectedSubcategory === sub;
                    return (
                      <button
                        key={sub}
                        onClick={() => setSelectedSubcategory(isSubSelected ? 'all' : sub)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          isSubSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* PROACTIVE SERVICE REQUESTS & QUOTES HUB */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            <ServiceRequestsHub
              categories={categories}
              user={user}
              userLocation={userLocation}
              workers={workers}
              onOpenAuthModal={() => setAuthModalOpen(true)}
            />
          </section>

          {/* MAIN RESULTS SECTION & DIRECTORY */}
          <section id="results-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
            {/* Filter & Sort Controls Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {selectedCategory === 'all'
                    ? t('directory.resultsTitle', 'Nearby Workers & Service Providers')
                    : `${selectedCategory} near ${userLocation.locality || userLocation.city}`}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t('directory.showingCount', 'Showing verified listings')} (<strong>{displayedWorkers.length}</strong>)
                </p>
              </div>

              {/* Filters & Sorting Controls */}
              <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
                {/* Real-Time Availability Filter */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-500 px-2">{t('directory.filterTitle', 'Status')}:</span>
                  {(
                    [
                      { id: 'all', label: t('common.allWorkers', 'All') },
                      { id: 'available_now', label: `🟢 ${t('common.availableNow', 'Available')}` },
                      { id: 'on_job', label: `🟡 ${t('common.onJob', 'Busy')}` },
                      { id: 'offline', label: `⚪ ${t('common.offline', 'Off')}` },
                    ] as const
                  ).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => setAvailabilityFilter(st.id)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer text-xs ${
                        availabilityFilter === st.id
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>

                {/* Verified Toggle */}
                <button
                  type="button"
                  onClick={() => setVerifiedOnly(!verifiedOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    verifiedOnly
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{t('directory.verifiedOnly', 'Verified Only')}</span>
                </button>

                {/* Sort Selector */}
                <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent focus:outline-hidden cursor-pointer"
                  >
                    <option value="nearest">{t('directory.nearest', 'Nearest First')}</option>
                    <option value="rating">{t('directory.rating', 'Highest Rated')}</option>
                    <option value="experience">{t('directory.experience', 'Most Experienced')}</option>
                    <option value="recent">{t('directory.recent', 'Recently Added')}</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Workers Grid or Empty State */}
            {loadingWorkers ? (
              <div className="py-24 text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">Searching nearby verified workers...</p>
              </div>
            ) : displayedWorkers.length === 0 ? (
              /* REQUIRED EXACT EMPTY STATE */
              <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8 my-6">
                <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-900">
                  No service providers found in your area. Try increasing your search radius.
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  We could not find active workers within {selectedRadius === 'all' ? 'any' : `${selectedRadius} KM`} of{' '}
                  {userLocation.locality || userLocation.city}.
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setSelectedRadius('all')}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                  >
                    Expand to All Distances
                  </button>
                  <button
                    onClick={() => setLocationModalOpen(true)}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Change City / Area
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {displayedWorkers.map((worker) => (
                  <WorkerCard
                    key={worker.id}
                    worker={worker}
                    isFavourite={user?.favourites?.includes(worker.id) || false}
                    onToggleFavourite={handleToggleFavourite}
                    onViewProfile={(w) => setSelectedWorkerForDetail(w)}
                    onQuickBook={(w) => setSelectedWorkerForBooking(w)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* INTERACTIVE GOOGLE MAP COMPONENT */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
            <MapDirectory
              workers={displayedWorkers}
              userLocation={userLocation}
              onSelectWorker={(w) => setSelectedWorkerForDetail(w)}
              apiKey={mapsApiKey}
            />
          </section>

          {/* REGISTER AS SERVICE PROVIDER PROMO BANNER */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
            <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-3xl p-8 sm:p-12 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
              <div className="relative z-10 max-w-xl">
                <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-wider">
                  Grow Your Local Business
                </span>
                <h3 className="text-2xl sm:text-4xl font-black mt-2">
                  Are You a Skilled Worker or Technician?
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm mt-2 leading-relaxed">
                  Register your business on NearMe Services. Get discovered by thousands of nearby customers looking for electricians, plumbers, mechanics, carpenters, and appliance repair specialists.
                </p>
                <div className="flex items-center gap-4 mt-4 text-xs font-semibold text-blue-100">
                  <span>✓ 100% Free Listing</span>
                  <span>✓ Direct Customer Calls</span>
                  <span>✓ Real-Time Availability Toggle</span>
                </div>
              </div>

              <button
                onClick={() => setRegisterModalOpen(true)}
                className="px-8 py-4 bg-white text-blue-700 hover:bg-blue-50 font-black text-sm rounded-2xl shadow-xl hover:scale-105 transition-all cursor-pointer active:scale-95 whitespace-nowrap"
              >
                + Register as a Worker Now
              </button>
            </div>
          </section>

          {/* CUSTOMER TESTIMONIALS & TRUST PILLARS */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Testimonials />
          </div>

          {/* FOOTER */}
          <Footer
            settings={settings}
            categories={categories}
            onSelectCategory={(catName) => {
              setSelectedCategory(catName);
              setSelectedSubcategory('all');
            }}
            onOpenRegisterModal={() => setRegisterModalOpen(true)}
            onOpenAdmin={() => setActiveView('admin')}
          />
        </main>
      )}

      {/* MODALS */}
      <LocationModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={(loc) => setUserLocation(loc)}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLoginSuccess={(u) => setUser(u)}
      />

      <WorkerRegisterModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        categories={categories}
        userLocation={userLocation}
        onSuccess={() => {
          fetchWorkers();
          loadInitialData();
        }}
      />

      <WorkerDetailModal
        worker={selectedWorkerForDetail}
        isOpen={!!selectedWorkerForDetail}
        onClose={() => setSelectedWorkerForDetail(null)}
        isFavourite={
          selectedWorkerForDetail ? user?.favourites?.includes(selectedWorkerForDetail.id) || false : false
        }
        onToggleFavourite={handleToggleFavourite}
        onReportWorker={(w) => setSelectedWorkerForReport(w)}
        onRequestService={(w) => setSelectedWorkerForBooking(w)}
        onStatusUpdated={handleStatusUpdated}
      />

      <ServiceRequestModal
        worker={selectedWorkerForBooking}
        isOpen={!!selectedWorkerForBooking}
        onClose={() => setSelectedWorkerForBooking(null)}
        userLocation={userLocation}
        user={user}
      />

      <ReportModal
        worker={selectedWorkerForReport}
        isOpen={!!selectedWorkerForReport}
        onClose={() => setSelectedWorkerForReport(null)}
      />
    </div>
  );
}
