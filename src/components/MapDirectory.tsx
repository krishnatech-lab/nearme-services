import React, { useState, useEffect } from 'react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin, InfoWindow } from '@vis.gl/react-google-maps';
import { Phone, Navigation, Star, MapPin, Eye, ExternalLink } from 'lucide-react';
import { WorkerProfile, LocationCoordinates, WorkerAvailabilityStatus } from '../types';
import { AvailabilityBadge } from './AvailabilityBadge';

interface MapDirectoryProps {
  workers: WorkerProfile[];
  userLocation: LocationCoordinates;
  onSelectWorker: (worker: WorkerProfile) => void;
  apiKey?: string;
}

export const MapDirectory: React.FC<MapDirectoryProps> = ({
  workers,
  userLocation,
  onSelectWorker,
  apiKey,
}) => {
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [activeKey, setActiveKey] = useState<string>(apiKey || '');

  useEffect(() => {
    if (!activeKey) {
      fetch('/api/config/maps-key')
        .then((res) => res.json())
        .then((data) => {
          if (data.apiKey) setActiveKey(data.apiKey);
        })
        .catch(() => {});
    }
  }, [activeKey]);

  const defaultCenter = {
    lat: userLocation.latitude || 12.9784,
    lng: userLocation.longitude || 77.6408,
  };

  const getPinColors = (status: WorkerAvailabilityStatus) => {
    switch (status) {
      case 'available_now':
        return { background: '#10b981', glyphColor: '#ffffff', borderColor: '#065f46' };
      case 'on_job':
        return { background: '#f59e0b', glyphColor: '#ffffff', borderColor: '#b45309' };
      case 'offline':
      default:
        return { background: '#64748b', glyphColor: '#ffffff', borderColor: '#334155' };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden my-8">
      {/* Map Header Bar */}
      <div className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-bold text-base sm:text-lg">Live Geospatial Workers Map</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {workers.length} registered service providers near {userLocation.locality || userLocation.city}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 text-xs bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-200 text-[11px]">Available Now</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-200 text-[11px]">On a Job</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-200 text-[11px]">Offline</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-[450px] sm:h-[520px] bg-slate-100">
        <APIProvider apiKey={activeKey || ''}>
          <GoogleMap
            defaultCenter={defaultCenter}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            gestureHandling="greedy"
            disableDefaultUI={false}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            {/* User Location Marker */}
            {userLocation.latitude && userLocation.longitude && (
              <AdvancedMarker
                position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                title="Your Current Location"
              >
                <div className="relative flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-blue-600/30 animate-ping absolute" />
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg border-2 border-white text-[10px] font-bold">
                    📍
                  </div>
                </div>
              </AdvancedMarker>
            )}

            {/* Workers Markers */}
            {workers.map((worker) => {
              const colors = getPinColors(worker.availabilityStatus || 'available_now');
              return (
                <AdvancedMarker
                  key={worker.id}
                  position={{ lat: worker.latitude, lng: worker.longitude }}
                  title={`${worker.name} (${worker.subcategory})`}
                  onClick={() => setSelectedWorker(worker)}
                >
                  <Pin
                    background={colors.background}
                    borderColor={colors.borderColor}
                    glyphColor={colors.glyphColor}
                    scale={1.05}
                  />
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow on Marker Click */}
            {selectedWorker && (
              <InfoWindow
                position={{ lat: selectedWorker.latitude, lng: selectedWorker.longitude }}
                onCloseClick={() => setSelectedWorker(null)}
              >
                <div className="p-2 max-w-[260px] text-slate-900 font-sans">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={selectedWorker.profileImage}
                      alt={selectedWorker.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 ring-1 ring-slate-200"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm truncate">{selectedWorker.name}</p>
                      <p className="text-[11px] text-blue-600 font-semibold truncate">
                        {selectedWorker.subcategory}
                      </p>
                      <div className="flex items-center gap-1 text-[11px] text-amber-500 font-bold mt-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{selectedWorker.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">({selectedWorker.reviewCount})</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                    <AvailabilityBadge status={selectedWorker.availabilityStatus} size="sm" />
                    {selectedWorker.distanceKm !== undefined && (
                      <span className="text-[11px] text-blue-700 font-bold">
                        {selectedWorker.distanceKm} KM away
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-500 mt-1 truncate">
                    📍 {selectedWorker.locality || selectedWorker.city}
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <a
                      href={`tel:${selectedWorker.phone}`}
                      className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-center rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Call</span>
                    </a>
                    <button
                      onClick={() => onSelectWorker(selectedWorker)}
                      className="py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-center rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Profile</span>
                    </button>
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </APIProvider>
      </div>
    </div>
  );
};
