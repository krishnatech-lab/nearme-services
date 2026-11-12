import React, { useState } from 'react';
import { MapPin, Navigation, X, Check, Search } from 'lucide-react';
import { LocationCoordinates } from '../types';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: LocationCoordinates;
  onSelectLocation: (loc: LocationCoordinates) => void;
}

const POPULAR_LOCATIONS: { name: string; state: string; lat: number; lng: number; locality?: string; pincode?: string }[] = [
  { name: 'Bengaluru - Indiranagar', state: 'Karnataka', lat: 12.9784, lng: 77.6408, locality: 'Indiranagar', pincode: '560038' },
  { name: 'Bengaluru - Koramangala', state: 'Karnataka', lat: 12.9352, lng: 77.6245, locality: 'Koramangala', pincode: '560034' },
  { name: 'Bengaluru - HSR Layout', state: 'Karnataka', lat: 12.9121, lng: 77.6446, locality: 'HSR Layout', pincode: '560102' },
  { name: 'Bengaluru - Whitefield', state: 'Karnataka', lat: 12.9698, lng: 77.7499, locality: 'Whitefield', pincode: '560066' },
  { name: 'New Delhi - Connaught Place', state: 'Delhi', lat: 28.6315, lng: 77.2167, locality: 'Connaught Place', pincode: '110001' },
  { name: 'Noida - Sector 18', state: 'Uttar Pradesh', lat: 28.5708, lng: 77.3260, locality: 'Sector 18', pincode: '201301' },
  { name: 'Gurugram - Cyber City', state: 'Haryana', lat: 28.4950, lng: 77.0895, locality: 'DLF Cyber City', pincode: '122002' },
  { name: 'Mumbai - Andheri West', state: 'Maharashtra', lat: 19.1136, lng: 72.8697, locality: 'Andheri West', pincode: '400058' },
  { name: 'Mumbai - Bandra West', state: 'Maharashtra', lat: 19.0596, lng: 72.8295, locality: 'Bandra West', pincode: '400050' },
  { name: 'Pune - Kothrud', state: 'Maharashtra', lat: 18.5074, lng: 73.8077, locality: 'Kothrud', pincode: '411038' },
  { name: 'Hyderabad - Hitec City', state: 'Telangana', lat: 17.4474, lng: 78.3762, locality: 'Madhapur', pincode: '500081' },
  { name: 'Chennai - T. Nagar', state: 'Tamil Nadu', lat: 13.0418, lng: 80.2341, locality: 'T. Nagar', pincode: '600017' },
];

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customCity, setCustomCity] = useState('');
  const [customArea, setCustomArea] = useState('');
  const [customPin, setCustomPin] = useState('');

  if (!isOpen) return null;

  const handleDetectGPS = () => {
    setIsLocating(true);
    setErrorMsg(null);

    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        onSelectLocation({
          latitude: lat,
          longitude: lng,
          city: 'Current Location',
          locality: 'Detected GPS Location',
          formattedAddress: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`,
        });
        onClose();
      },
      (error) => {
        setIsLocating(false);
        console.warn('GPS error:', error);
        setErrorMsg('GPS location access was denied or timed out. Please choose a city below or enter your area.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customCity && !customArea) {
      setErrorMsg('Please enter at least a city or area name.');
      return;
    }
    // approximate lat/long based on selected or default
    onSelectLocation({
      latitude: currentLocation.latitude || 12.9784,
      longitude: currentLocation.longitude || 77.6408,
      city: customCity || 'Local City',
      locality: customArea || 'Local Area',
      pincode: customPin,
      formattedAddress: `${customArea ? customArea + ', ' : ''}${customCity} ${customPin}`,
    });
    onClose();
  };

  const filteredLocations = POPULAR_LOCATIONS.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loc.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (loc.pincode && loc.pincode.includes(searchTerm))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-100 p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">Select Your Location</h3>
              <p className="text-xs text-slate-500">We will find workers and professionals closest to you</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* GPS Detection Button */}
        <div className="mt-5">
          <button
            onClick={handleDetectGPS}
            disabled={isLocating}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/20 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-70"
          >
            <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span>{isLocating ? 'Detecting Precise GPS Coordinates...' : 'Use My Current GPS Location'}</span>
          </button>
          <p className="text-[11px] text-center text-slate-400 mt-1.5">
            Requires location permission from your browser
          </p>
        </div>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 font-medium uppercase tracking-wider">
              Or pick an area / city
            </span>
          </div>
        </div>

        {/* Search Input for preset localities */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search city, area or PIN code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        {/* Preset Locations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
          {filteredLocations.map((loc) => {
            const isSelected =
              Math.abs(currentLocation.latitude - loc.lat) < 0.001 &&
              Math.abs(currentLocation.longitude - loc.lng) < 0.001;
            return (
              <button
                key={loc.name}
                onClick={() => {
                  onSelectLocation({
                    latitude: loc.lat,
                    longitude: loc.lng,
                    city: loc.name.split(' - ')[0],
                    locality: loc.locality || loc.name.split(' - ')[1] || '',
                    pincode: loc.pincode,
                    formattedAddress: `${loc.name}, ${loc.state}`,
                  });
                  onClose();
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl text-left border text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 text-blue-900 font-semibold shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="truncate">
                  <p className="font-bold truncate">{loc.name}</p>
                  <p className="text-[10px] text-slate-400">{loc.state} {loc.pincode ? `• ${loc.pincode}` : ''}</p>
                </div>
                {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Manual Address Form */}
        <form onSubmit={handleCustomSubmit} className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-800 mb-2">Can't find your area? Enter manually:</p>
          <div className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="City (e.g. Pune)"
              value={customCity}
              onChange={(e) => setCustomCity(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <input
              type="text"
              placeholder="Area / Locality"
              value={customArea}
              onChange={(e) => setCustomArea(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
            <input
              type="text"
              placeholder="PIN Code"
              value={customPin}
              onChange={(e) => setCustomPin(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
          <button
            type="submit"
            className="w-full mt-2.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer transition-all"
          >
            Set Custom Location
          </button>
        </form>
      </div>
    </div>
  );
};
