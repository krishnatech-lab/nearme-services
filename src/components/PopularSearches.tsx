import React, { useState, useEffect } from 'react';
import { Flame, MapPin, TrendingUp, Sparkles, ArrowRight, Activity } from 'lucide-react';
import { PopularSearchesData, PopularSearchItem, PopularLocationItem, LocationCoordinates } from '../types';

interface PopularSearchesProps {
  onSelectQuery: (item: PopularSearchItem) => void;
  onSelectLocation: (loc: LocationCoordinates) => void;
  currentLocality?: string;
}

export const PopularSearches: React.FC<PopularSearchesProps> = ({
  onSelectQuery,
  onSelectLocation,
  currentLocality,
}) => {
  const [data, setData] = useState<PopularSearchesData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/popular-searches')
      .then((res) => (res.ok ? res.json() : null))
      .then((resData) => {
        if (resData) setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching popular searches:', err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-md p-4 sm:p-5 my-4 transition-all">
      {/* Header bar with activity badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
            <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
              <span>Popular & Trending Searches</span>
              <span className="hidden md:inline-block bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">
                Live Analysis
              </span>
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
          <Activity className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span>
            <strong className="text-slate-800 font-bold">{data.totalSearchesToday}+</strong> local searches analyzed today
          </span>
        </div>
      </div>

      {/* Row 1: Trending Service Queries */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          Services:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {data.trendingQueries.map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectQuery(item)}
              className="group flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-blue-50 hover:border-blue-300 text-slate-700 hover:text-blue-700 border border-slate-200/80 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-2xs hover:scale-102 active:scale-98"
              title={`Click to find ${item.text}`}
            >
              <span>{item.text}</span>
              {item.tag && (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                  {item.tag}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Popular Search Localities */}
      <div className="flex items-center gap-2 flex-wrap pt-2.5 border-t border-slate-100 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          Hot Areas:
        </span>
        <div className="flex items-center gap-1.5 flex-wrap">
          {data.topLocations.map((loc) => {
            const isCurrent = currentLocality?.toLowerCase() === loc.name.toLowerCase();
            return (
              <button
                key={loc.name}
                onClick={() =>
                  onSelectLocation({
                    latitude: loc.lat,
                    longitude: loc.lng,
                    city: loc.city,
                    locality: loc.name,
                    pincode: loc.pincode,
                    formattedAddress: `${loc.name}, ${loc.city}`,
                  })
                }
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={`Switch location to ${loc.name}, ${loc.city}`}
              >
                <span>📍 {loc.name}</span>
                <span className="text-[10px] opacity-75 font-normal">({loc.searches})</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
