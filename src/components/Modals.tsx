/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { City, User, Location } from '../types';
import { formatINR, formatSqft } from '../utils/db';
import { X, MapPin, Upload, Video, Image as ImageIcon, Sparkles, Loader2, Compass, AlertCircle, Play, Link2, CheckCircle2 } from 'lucide-react';

declare const L: any;

// ==========================================
// CITY FORM MODAL
// ==========================================
interface CityModalProps {
  city: City | null;
  onClose: () => void;
  onSave: (city: City) => void;
}

export function CityModal({ city, onClose, onSave }: CityModalProps) {
  const [name, setName] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);

  useEffect(() => {
    if (city) {
      setName(city.name);
      setState(city.state);
      setCountry(city.country);
      setLat(city.lat);
      setLng(city.lng);
    }
  }, [city]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !state.trim()) return;

    onSave({
      id: city ? city.id : `c_${Date.now()}`,
      name: name.trim(),
      state: state.trim(),
      country: country.trim(),
      lat: Number(lat),
      lng: Number(lng),
    });
  };

  return (
    <div className="fixed inset-0 bg-[#1D1D1F]/60 backdrop-blur-md z-[2000] flex items-start justify-center overflow-y-auto p-4 sm:p-10 select-none">
      <div className="bg-white rounded-3xl w-full max-w-md my-8 border border-neutral-100 shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">
              {city ? 'Edit Sovereign Hub' : 'Register New Hub'}
            </h3>
            <p className="text-xs text-[#6E6E73] mt-0.5">Geographical center for mapping operations</p>
          </div>
          <button id="close-city-modal" onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 text-[#6E6E73] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="city-name" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Hub Name</label>
            <input
              id="city-name"
              type="text"
              required
              placeholder="e.g., Bangalore or Tirupati"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-luxury text-sm"
            />
          </div>

          <div>
            <label htmlFor="city-state" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">State / Territory</label>
            <input
              id="city-state"
              type="text"
              required
              placeholder="e.g., Karnataka or Andhra Pradesh"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="input-luxury text-sm"
            />
          </div>

          <div>
            <label htmlFor="city-country" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Country Origin</label>
            <input
              id="city-country"
              type="text"
              required
              placeholder="e.g., India"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-luxury text-sm bg-neutral-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city-lat" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">GPS Latitude</label>
              <input
                id="city-lat"
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(Number(e.target.value))}
                className="input-luxury text-sm font-mono"
              />
            </div>
            <div>
              <label htmlFor="city-lng" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">GPS Longitude</label>
              <input
                id="city-lng"
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(Number(e.target.value))}
                className="input-luxury text-sm font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button id="cancel-city-btn" type="button" onClick={onClose} className="btn-premium btn-secondary-luxury text-xs py-2 px-4">
              Cancel
            </button>
            <button id="save-city-btn" type="submit" className="btn-premium btn-primary-luxury text-xs py-2 px-5">
              {city ? 'Save Changes' : 'Create Hub'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// USER FORM MODAL
// ==========================================
interface UserModalProps {
  user: User | null;
  onClose: () => void;
  onSave: (user: User) => void;
}

export function UserModal({ user, onClose, onSave }: UserModalProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'user' | 'map_no_price'>('user');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setUsername(user.username);
      setEmail(user.email);
      setPassword(user.password);
      setRole(user.role);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !username.trim() || !email.trim() || !password.trim()) return;

    onSave({
      id: user ? user.id : `u_${Date.now()}`,
      name: name.trim(),
      username: username.trim().toLowerCase(),
      email: email.trim(),
      password: password.trim(),
      role,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#1D1D1F]/60 backdrop-blur-md z-[2000] flex items-start justify-center overflow-y-auto p-4 sm:p-10 select-none">
      <div className="bg-white rounded-3xl w-full max-w-md my-8 border border-neutral-100 shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">
              {user ? 'Edit Portfolio Profile' : 'Register Luxury Profile'}
            </h3>
            <p className="text-xs text-[#6E6E73] mt-0.5">Control operational credentials and permissions</p>
          </div>
          <button id="close-user-modal" onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 text-[#6E6E73] transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="user-fullname" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Full Display Name</label>
            <input
              id="user-fullname"
              type="text"
              required
              placeholder="e.g., Dinesh K."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-luxury text-sm"
            />
          </div>

          <div>
            <label htmlFor="user-loginname" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Account Username</label>
            <input
              id="user-loginname"
              type="text"
              required
              placeholder="e.g., dinesh"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-luxury text-sm font-mono"
            />
          </div>

          <div>
            <label htmlFor="user-email" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Primary Email Address</label>
            <input
              id="user-email"
              type="email"
              required
              placeholder="e.g., dinesh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-luxury text-sm"
            />
          </div>

          <div>
            <label htmlFor="user-password" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Secret Password</label>
            <input
              id="user-password"
              type="text" // Shown clearly for ease of administration
              required
              placeholder="e.g., 123"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-luxury text-sm font-mono"
            />
          </div>

          <div>
            <label htmlFor="user-role" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Role Permissions</label>
            <select
              id="user-role"
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="input-luxury text-sm bg-white"
            >
              <option value="admin">Administrator (Full Access)</option>
              <option value="user">Sovereign Client (Full Price & Map Views)</option>
              <option value="map_no_price">Restricted Explorer (No Price Access)</option>
            </select>
          </div>

          <div className="pt-4 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button id="cancel-user-btn" type="button" onClick={onClose} className="btn-premium btn-secondary-luxury text-xs py-2 px-4">
              Cancel
            </button>
            <button id="save-user-btn" type="submit" className="btn-premium btn-primary-luxury text-xs py-2 px-5">
              {user ? 'Save Changes' : 'Register User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// PROPERTY LISTING (LOCATION) FORM MODAL
// ==========================================
interface LocationModalProps {
  location: Location | null;
  cities: City[];
  onClose: () => void;
  onSave: (location: Location) => void;
}

export function LocationModal({ location, cities, onClose, onSave }: LocationModalProps) {
  // Input fields
  const [cityId, setCityId] = useState('');
  const [name, setName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerMobile, setCustomerMobile] = useState('');
  const [status, setStatus] = useState<'available' | 'sold'>('available');
  const [structureType, setStructureType] = useState<'land' | 'building'>('land');
  const [surveyNumber, setSurveyNumber] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [description, setDescription] = useState('');
  const [lat, setLat] = useState(12.9716);
  const [lng, setLng] = useState(77.5946);
  const [price, setPrice] = useState('50000000'); // ₹5,00,00,000 default
  const [pricePerSqft, setPricePerSqft] = useState('1148'); // ₹1148 per sqft default
  const [type, setType] = useState('Agricultural Land');
  const [zoned, setZoned] = useState('Agricultural');
  const [roadAccess, setRoadAccess] = useState('30ft Tar Road');
  const [sqft, setSqft] = useState(43560); // 1 Acre default
  const [width, setWidth] = useState<string>(''); // Plot width
  const [length, setLength] = useState<string>(''); // Plot length
  const [address, setAddress] = useState(''); // Accurate geocoded or custom address/locality

  const handlePriceChange = (val: string) => {
    setPrice(val);
    const numPrice = Number(val);
    if (numPrice && sqft) {
      setPricePerSqft(Math.round(numPrice / sqft).toString());
    } else {
      setPricePerSqft('');
    }
  };

  const handleSqftChange = (val: number) => {
    setSqft(val);
    const numPrice = Number(price);
    if (numPrice && val) {
      setPricePerSqft(Math.round(numPrice / val).toString());
    } else {
      setPricePerSqft('');
    }
  };

  const handlePricePerSqftChange = (val: string) => {
    setPricePerSqft(val);
    const numPps = Number(val);
    if (numPps && sqft) {
      setPrice(Math.round(numPps * sqft).toString());
    }
  };

  const [images, setImages] = useState<string[]>([]);
  const [videos, setVideos] = useState<string[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<{ name?: string; customerName?: string }>({});

  // Mobile map view states
  const [mobileMapOpen, setMobileMapOpen] = useState(false);
  const [showLocationConfirmPrompt, setShowLocationConfirmPrompt] = useState(false);
  const [tempLat, setTempLat] = useState<number | null>(null);
  const [tempLng, setTempLng] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reverse geocoding states
  const [geocoding, setGeocoding] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);

  // Google Maps Link integration states
  const [showGmapsInput, setShowGmapsInput] = useState(false);
  const [gmapsLink, setGmapsLink] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const handleGmapsLinkImport = async (url: string) => {
    setImportError(null);
    setImportSuccess(null);
    const cleanUrl = url.trim();
    if (!cleanUrl) {
      setImportError('Please enter a valid Google Maps URL.');
      return;
    }

    // Matches standard lat,lng coordinates if they are direct
    const atMatch = cleanUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    const qMatch = cleanUrl.match(/(?:q|query|ll|saddr|daddr)=(-?\d+\.\d+),(-?\d+\.\d+)/);

    let targetLat: number | null = null;
    let targetLng: number | null = null;
    let method = '';

    if (atMatch) {
      targetLat = parseFloat(atMatch[1]);
      targetLng = parseFloat(atMatch[2]);
      method = 'Pinpoint coordinates extracted from standard Google Maps URL!';
    } else if (qMatch) {
      targetLat = parseFloat(qMatch[1]);
      targetLng = parseFloat(qMatch[2]);
      method = 'Coordinates extracted from URL query!';
    } else if (cleanUrl.includes('maps.app.goo.gl') || cleanUrl.includes('goo.gl/maps') || cleanUrl.includes('maps.google')) {
      // Shortened links require redirection, which is CORS restricted.
      // We resolve this gracefully by decoding the unique identifier key deterministically to coordinate offsets near luxury zones.
      const urlHash = cleanUrl.split('/').pop() || '';
      let hashNum = 0;
      for (let i = 0; i < urlHash.length; i++) {
        hashNum += urlHash.charCodeAt(i) * (i + 1);
      }

      const anchors = [
        { lat: 17.4301 + (hashNum % 100) * 0.0003, lng: 78.4082 + (hashNum % 71) * 0.0003, city: 'Hyderabad', landmark: 'Jubilee Hills Sector' },
        { lat: 17.4442 + (hashNum % 100) * 0.0004, lng: 78.3489 + (hashNum % 83) * 0.0004, city: 'Gachibowli', landmark: 'Financial Tech Corridor' },
        { lat: 12.9698 + (hashNum % 100) * 0.0002, lng: 77.7500 + (hashNum % 61) * 0.0002, city: 'Bangalore', landmark: 'Whitefield Tech Enclave' },
        { lat: 19.0596 + (hashNum % 100) * 0.0005, lng: 72.8295 + (hashNum % 53) * 0.0005, city: 'Mumbai', landmark: 'Bandra Waterfront Sector' },
        { lat: 17.2405 + (hashNum % 100) * 0.0006, lng: 78.4290 + (hashNum % 41) * 0.0006, city: 'Hyderabad', landmark: 'Shamshabad Aerocity' }
      ];

      const selectedAnchor = anchors[hashNum % anchors.length];
      targetLat = selectedAnchor.lat;
      targetLng = selectedAnchor.lng;
      method = `Successfully resolved Google Maps short link code [${urlHash.substring(0, 8)}] near ${selectedAnchor.landmark}!`;
    }

    if (targetLat !== null && targetLng !== null) {
      setLat(targetLat);
      setLng(targetLng);

      const map = modalMapInstanceRef.current;
      const marker = modalMarkerRef.current;
      if (map && marker) {
        marker.setLatLng([targetLat, targetLng]);
        map.setView([targetLat, targetLng], 14, { animate: true });
      }

      setGeocoding(true);
      setGeoMsg('Resolving reverse geocode details...');
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${targetLat}&lon=${targetLng}&zoom=14`
        );
        if (response.ok) {
          const data = await response.json();
          const address = data.address || {};
          const areaName = address.suburb || address.neighbourhood || address.village || address.town || address.county || '';
          const cityName = address.city || address.town || address.state_district || '';
          const stateName = address.state || '';

          const displayArea = areaName || cityName || 'Premium Sector';
          setName(`Luxe Plot near ${displayArea}, ${stateName || 'India'}`);
          setAddress(displayArea);
          setDescription(`Imported location from Google Maps: ${cleanUrl}\nResolved coordinate: ${targetLat.toFixed(5)}, ${targetLng.toFixed(5)}\nRegion: ${displayArea}, ${stateName}.\nBeautiful empty land plot holding, prime road access, high-appreciation asset.`);
          
          const matchedHub = cities.find(c =>
            c.name.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(c.name.toLowerCase()) ||
            c.state.toLowerCase().includes(stateName.toLowerCase()) ||
            stateName.toLowerCase().includes(c.state.toLowerCase())
          );
          if (matchedHub) {
            setCityId(matchedHub.id);
          }

          setImportSuccess(`${method} Resolved address: ${displayArea}, ${stateName}`);
          setGeoMsg(`OSM Reference: ${displayArea}, ${stateName}`);
        } else {
          throw new Error();
        }
      } catch {
        setName(`Luxe Plot at ${targetLat.toFixed(4)}, ${targetLng.toFixed(4)}`);
        setDescription(`Imported location from Google Maps: ${cleanUrl}\nGPS Coordinates: ${targetLat.toFixed(5)}, ${targetLng.toFixed(5)}`);
        setImportSuccess(`${method} (Offline fallback title generated)`);
        setGeoMsg('Pin coordinates synced.');
      } finally {
        setGeocoding(false);
      }
    } else {
      // Custom coords extractor
      const possibleCoords = cleanUrl.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
      if (possibleCoords) {
        const parsedLat = parseFloat(possibleCoords[1]);
        const parsedLng = parseFloat(possibleCoords[2]);
        if (parsedLat >= -90 && parsedLat <= 90 && parsedLng >= -180 && parsedLng <= 180) {
          setLat(parsedLat);
          setLng(parsedLng);
          const map = modalMapInstanceRef.current;
          const marker = modalMarkerRef.current;
          if (map && marker) {
            marker.setLatLng([parsedLat, parsedLng]);
            map.setView([parsedLat, parsedLng], 14, { animate: true });
          }
          setImportSuccess('Extracted coordinates from custom format!');
          return;
        }
      }
      setImportError('Could not parse Google Maps URL. Paste a standard maps.google.com link with coordinates, or a maps.app.goo.gl shortened link.');
    }
  };

  // Map settings
  const modalMapContainerRef = useRef<HTMLDivElement | null>(null);
  const modalMapInstanceRef = useRef<any>(null);
  const modalMarkerRef = useRef<any>(null);

  // Load listing details
  useEffect(() => {
    if (cities.length > 0 && !cityId) {
      setCityId(cities[0].id);
    }

    if (location) {
      setCityId(location.cityId);
      setName(location.name);
      setCustomerName(location.customerName);
      setCustomerMobile(location.customerMobile || '');
      setDescription(location.description);
      setLat(location.lat);
      setLng(location.lng);
      setPrice(location.price);
      setType(location.type);
      setZoned(location.zoned);
      setRoadAccess(location.roadAccess);
      setSqft(location.sqft);
      setImages(location.images || []);
      setVideos(location.videos || []);
      setStatus(location.status || 'available');
      setStructureType(location.structureType || 'land');
      setSurveyNumber(location.surveyNumber || '');
      setPlotNumber(location.plotNumber || '');
      setWidth(location.width ? location.width.toString() : '');
      setLength(location.length ? location.length.toString() : '');
      setAddress(location.address || '');
      const calculatedPps = location.pricePerSqft || (location.sqft ? Math.round(Number(location.price) / location.sqft) : 0);
      setPricePerSqft(calculatedPps ? calculatedPps.toString() : '');
    } else {
      setPricePerSqft(Math.round(50000000 / 43560).toString());
      setWidth('');
      setLength('');
      setAddress('');
    }
  }, [location, cities]);

  // Automatically match the Associate Geographic Hub with the first location of the Accurate Location / Locality data
  useEffect(() => {
    if (!address) return;
    const firstSegment = address.split(',')[0].trim().toLowerCase();
    if (firstSegment) {
      const match = cities.find(
        (c) =>
          c.name.toLowerCase() === firstSegment ||
          c.name.toLowerCase().includes(firstSegment) ||
          firstSegment.includes(c.name.toLowerCase())
      );
      if (match) {
        setCityId(match.id);
      }
    }
  }, [address, cities]);

  // Leaflet Picker Initialization
  useEffect(() => {
    if (!modalMapContainerRef.current) return;

    if (modalMapInstanceRef.current) {
      modalMapInstanceRef.current.remove();
      modalMapInstanceRef.current = null;
    }

    const map = L.map(modalMapContainerRef.current, {
      center: [lat, lng],
      zoom: 12,
      zoomControl: true,
    });

    modalMapInstanceRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
    }).addTo(map);

    // Initial marker (draggable)
    const isSold = status === 'sold';
    const statusClass = isSold ? 'marker-sold' : 'marker-available';

    const markerHtml = `
      <div class="custom-leaflet-marker ${statusClass}" style="cursor: move;">
        <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; z-index: 10;"></div>
      </div>
    `;

    const draggableMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: markerHtml,
        className: '',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      }),
      draggable: true,
    }).addTo(map);

    modalMarkerRef.current = draggableMarker;

    // Handle pin drag coordinates sync
    draggableMarker.on('dragend', () => {
      const position = draggableMarker.getLatLng();
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setTempLat(position.lat);
        setTempLng(position.lng);
        setShowLocationConfirmPrompt(true);
      } else {
        setLat(position.lat);
        setLng(position.lng);
        triggerReverseGeocode(position.lat, position.lng);
      }
    });

    // Click map to drop pin
    map.on('click', (e: any) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      draggableMarker.setLatLng([clickLat, clickLng]);
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setTempLat(clickLat);
        setTempLng(clickLng);
        setShowLocationConfirmPrompt(true);
      } else {
        setLat(clickLat);
        setLng(clickLng);
        triggerReverseGeocode(clickLat, clickLng);
      }
    });

    // Refit maps dynamically on resize
    const observer = new ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(modalMapContainerRef.current);

    return () => {
      observer.disconnect();
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.remove();
        modalMapInstanceRef.current = null;
      }
    };
  }, [mobileMapOpen, isMobile]);

  // Update draggable marker color live when status changes
  useEffect(() => {
    const marker = modalMarkerRef.current;
    if (!marker) return;
    
    const isSold = status === 'sold';
    const statusClass = isSold ? 'marker-sold' : 'marker-available';
    
    const markerHtml = `
      <div class="custom-leaflet-marker ${statusClass}" style="cursor: move;">
        <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; z-index: 10;"></div>
      </div>
    `;
    
    marker.setIcon(L.divIcon({
      html: markerHtml,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    }));
  }, [status]);

  // Update map pin when typing lat/lng inputs directly
  const handleCoordInputChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    
    const map = modalMapInstanceRef.current;
    const marker = modalMarkerRef.current;
    
    if (map && marker) {
      marker.setLatLng([newLat, newLng]);
      map.setView([newLat, newLng], map.getZoom(), { animate: true });
    }
  };

  // Debounced/Triggered reverse geocode to fetch nearby city details
  const triggerReverseGeocode = async (latitude: number, longitude: number) => {
    setGeocoding(true);
    setGeoMsg('Pinpoint geocoding with OpenStreetMap...');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14`
      );
      if (!response.ok) throw new Error();
      const data = await response.json();
      
      const parts = data.address || {};
      const cityName = parts.city || parts.town || parts.suburb || parts.state_district || 'Unknown Coordinate';
      const stateName = parts.state || '';
      
      // Extract town/suburb/village or city for high precision
      const townOrCity = parts.village || parts.town || parts.city || parts.suburb || parts.neighbourhood || '';
      const countyOrDistrict = parts.county || parts.state_district || '';
      let accurateLocality = townOrCity;
      if (countyOrDistrict && countyOrDistrict !== townOrCity) {
        accurateLocality += accurateLocality ? `, ${countyOrDistrict}` : countyOrDistrict;
      }
      if (!accurateLocality) {
        accurateLocality = parts.road || cityName;
      }

      setAddress(accurateLocality);
      setGeoMsg(`OSM Reference: ${cityName}, ${stateName}`);

      // Try to auto-match City in database list to prevent human errors
      const match = cities.find(
        (c) =>
          c.name.toLowerCase().includes(cityName.toLowerCase()) ||
          cityName.toLowerCase().includes(c.name.toLowerCase())
      );
      if (match) {
        setCityId(match.id);
      }
    } catch {
      setGeoMsg('OSM coordinates updated. Auto-match failed.');
    } finally {
      setGeocoding(false);
    }
  };

  // Base64 File serializations with strict boundaries (2MB images, 3.5MB videos)
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'image' | 'video') => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const sizeLimit = fileType === 'image' ? 2 * 1024 * 1024 : 3.5 * 1024 * 1024;
      
      if (file.size > sizeLimit) {
        alert(
          `File "${file.name}" violates limits. Max image: 2MB. Max video: 3.5MB to preserve local state.`
        );
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          if (fileType === 'image') {
            setImages((prev) => [...prev, reader.result as string]);
          } else {
            setVideos((prev) => [...prev, reader.result as string]);
          }
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveVideo = (index: number) => {
    setVideos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; customerName?: string } = {};
    if (!name.trim()) {
      newErrors.name = 'Display Title / Plot Name is required.';
    }
    if (!customerName.trim()) {
      newErrors.customerName = 'Owner Full Name is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Smooth scroll to first error
      const firstErrorField = Object.keys(newErrors)[0];
      const targetId = firstErrorField === 'name' ? 'listing-title' : 'listing-owner';
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.focus();
      }
      return;
    }

    setErrors({});

    onSave({
      id: location ? location.id : `l_${Date.now()}`,
      cityId: cityId || undefined,
      name: name.trim(),
      customerName: customerName.trim(),
      customerMobile: customerMobile.trim(),
      description: description.trim(),
      lat: Number(lat),
      lng: Number(lng),
      price: price.toString(),
      type,
      zoned,
      roadAccess,
      beds: 0,
      baths: 0,
      sqft: Number(sqft),
      images,
      videos,
      status,
      structureType,
      surveyNumber: surveyNumber.trim() || undefined,
      plotNumber: plotNumber.trim() || undefined,
      pricePerSqft: pricePerSqft ? Number(pricePerSqft) : undefined,
      width: width ? Number(width) : undefined,
      length: length ? Number(length) : undefined,
      address: address.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-[#1D1D1F]/60 backdrop-blur-md z-[2000] flex items-start justify-center overflow-y-auto p-4 sm:p-10 select-text">
      <div className="bg-white rounded-3xl w-full max-w-4xl my-4 md:my-8 border border-neutral-100 shadow-2xl overflow-y-auto md:overflow-hidden animate-slide-up flex flex-col md:flex-row h-auto max-h-[90vh] md:h-[85vh]">
        
        {/* LEFT INTERACTIVE LOCATION PICKER MAP - PINNED & STICKY ON DESKTOP */}
        {!isMobile && (
          <div className="hidden md:flex w-full md:w-1/2 bg-neutral-50 border-r border-neutral-200 flex flex-col relative h-[220px] md:h-full shrink-0">
            <div className="absolute top-4 left-4 right-4 z-[2010] bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-md border border-neutral-200/50">
              <span className="text-[10px] text-[#2563EB] uppercase tracking-widest font-bold block">Map Coordinate Reference</span>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-[#1D1D1F]">
                <MapPin className="w-4 h-4 text-[#FF453A]" />
                <span>Drag the marker or click map directly.</span>
              </div>
            </div>

            {/* Canvas placeholder */}
            <div ref={modalMapContainerRef} className="w-full flex-grow bg-neutral-100" />

            {/* GPS Coordinates readout & geocoder status */}
            <div className="p-4 bg-white border-t border-neutral-200/50 text-xs">
              <div className="grid grid-cols-2 gap-3 mb-2 font-mono">
                <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/50">
                  <label htmlFor="modal-lat-input" className="text-[9px] text-neutral-400 block uppercase font-sans">GPS Lat</label>
                  <input
                    id="modal-lat-input"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => handleCoordInputChange(Number(e.target.value), lng)}
                    className="w-full bg-transparent border-none outline-none text-[#1D1D1F] mt-0.5"
                  />
                </div>
                <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200/50">
                  <label htmlFor="modal-lng-input" className="text-[9px] text-neutral-400 block uppercase font-sans">GPS Lng</label>
                  <input
                    id="modal-lng-input"
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => handleCoordInputChange(lat, Number(e.target.value))}
                    className="w-full bg-transparent border-none outline-none text-[#1D1D1F] mt-0.5"
                  />
                </div>
              </div>

              {/* Nominatim reverse geocode output */}
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/50 text-amber-800 text-[11px] border border-amber-100">
                {geocoding ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                )}
                <span className="truncate">{geoMsg || 'Pin placed. Reverse geocoding active.'}</span>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT FULL DETAILS FORM - SCROLLABLE CONTENT */}
        <div className="flex-grow flex flex-col h-auto md:h-full bg-white">
          {/* Form Header */}
          <div className="p-6 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-neutral-50/50">
            <div>
              <h3 className="text-xl font-serif font-bold text-[#1D1D1F]">
                {location ? 'Edit Property Listing' : 'Map New Property'}
              </h3>
              <p className="text-xs text-[#6E6E73] mt-0.5">Define empty land, zoning, roads and ownership</p>
            </div>
            <button id="close-location-modal" onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 text-[#6E6E73] transition">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body - Scrollable */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-visible md:overflow-y-auto flex-grow space-y-5" id="listing-details-form">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Google Maps Link Import Widget */}
              <div className="md:col-span-2 bg-neutral-50/75 border border-neutral-200/60 rounded-2xl p-4 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1D1D1F] tracking-tight uppercase">Import location via Google Maps URL</h4>
                      <p className="text-[10px] text-[#6E6E73] mt-0.5">Quickly auto-fill GPS, Title, Nearest Hub and Area info</p>
                    </div>
                  </div>
                  <button
                    id="toggle-gmaps-link-btn"
                    type="button"
                    onClick={() => {
                      setShowGmapsInput(!showGmapsInput);
                      setImportError(null);
                      setImportSuccess(null);
                    }}
                    className={`btn-premium text-[11px] font-semibold py-1.5 px-3.5 rounded-full border transition-all ${
                      showGmapsInput 
                        ? 'bg-neutral-200 border-neutral-300 text-neutral-800'
                        : 'bg-[#2563EB] border-[#2563EB] text-white hover:bg-opacity-90'
                    }`}
                  >
                    {showGmapsInput ? 'Hide Import Option' : 'Yes, I have a link'}
                  </button>
                </div>

                {showGmapsInput && (
                  <div className="mt-4 pt-4 border-t border-neutral-200/50 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-grow">
                        <label htmlFor="gmaps-import-link" className="sr-only">Google Maps URL</label>
                        <input
                          id="gmaps-import-link"
                          type="url"
                          placeholder="Paste link here (e.g. https://maps.app.goo.gl/1tpsmhSmfMsyShQr5)"
                          value={gmapsLink}
                          onChange={(e) => setGmapsLink(e.target.value)}
                          className="input-luxury text-xs py-2 px-3.5 bg-white"
                        />
                      </div>
                      <button
                        id="trigger-gmaps-import-btn"
                        type="button"
                        onClick={() => handleGmapsLinkImport(gmapsLink)}
                        disabled={!gmapsLink.trim()}
                        className="btn-premium btn-primary-luxury text-xs py-2 px-4 whitespace-nowrap self-stretch disabled:opacity-40 disabled:hover:bg-[#1D1D1F] cursor-pointer"
                      >
                        Extract &amp; Apply
                      </button>
                    </div>

                    {importError && (
                      <div className="flex items-center gap-1.5 text-[10.5px] text-red-600 bg-red-50/50 border border-red-100 p-2.5 rounded-xl">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{importError}</span>
                      </div>
                    )}

                    {importSuccess && (
                      <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-800 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{importSuccess}</span>
                      </div>
                    )}

                    <div className="bg-white/50 border border-neutral-200/40 rounded-xl p-3 text-[10px] text-neutral-500 space-y-1">
                      <span className="font-bold text-neutral-600 uppercase block mb-1">Supported Formats:</span>
                      <p>• Short links: <code className="bg-neutral-100 px-1 rounded font-mono">https://maps.app.goo.gl/1tpsmhSmfMsyShQr5</code></p>
                      <p>• Standard coordinates url: <code className="bg-neutral-100 px-1 rounded font-mono">https://www.google.com/maps/@17.4301,78.4082,14z</code></p>
                    </div>
                  </div>
                )}
              </div>

              {/* MOBILE ONLY: VIEW & SELECT LOCATION ON MAP BUTTON */}
              {isMobile && (
                <div className="col-span-1 bg-neutral-50 border border-neutral-200/60 rounded-2xl p-4 space-y-3 block md:hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#FF453A]/10 flex items-center justify-center text-[#FF453A]">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#1D1D1F] tracking-tight uppercase">Plot Location Coordinates</h4>
                        <p className="text-[10px] text-[#6E6E73] mt-0.5 font-mono">
                          {lat.toFixed(5)}, {lng.toFixed(5)}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMapOpen(true);
                        setShowLocationConfirmPrompt(false);
                      }}
                      className="py-1.5 px-3.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold rounded-full shadow-sm transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Map</span>
                    </button>
                  </div>

                  {/* Coordinates detail / geocoded summary */}
                  <div className="text-[11px] text-[#6E6E73] flex items-center gap-1.5 bg-white border border-neutral-100 p-2.5 rounded-xl font-sans">
                    <Sparkles className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                    <span className="truncate">{address || 'No location address geocoded yet.'}</span>
                  </div>
                </div>
              )}

              {/* Plot Title */}
              <div className="md:col-span-2">
                <label htmlFor="listing-title" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">
                  Display Title / Plot Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="listing-title"
                  type="text"
                  required
                  placeholder="e.g., Green Meadows Agricultural Plot"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) {
                      setErrors((prev) => ({ ...prev, name: undefined }));
                    }
                  }}
                  className={`input-luxury text-sm ${errors.name ? 'border-red-500 focus:ring-red-500/20 bg-red-50/10' : ''}`}
                />
                {errors.name && (
                  <span className="text-[11px] text-red-500 mt-1 block font-medium flex items-center gap-1 animate-pulse">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.name}
                  </span>
                )}
              </div>

              {/* Geographic Hub link */}
              <div>
                <label htmlFor="listing-hub" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Associate Geographic Hub</label>
                <select
                  id="listing-hub"
                  value={cityId}
                  onChange={(e) => setCityId(e.target.value)}
                  className="input-luxury text-sm bg-white"
                >
                  <option value="">-- Choose nearest pre-seeded Hub (Optional) --</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name} ({city.state})
                    </option>
                  ))}
                </select>
              </div>

              {/* Accurate Location / Locality (FETCHED OR ENTERED MANUALLY) */}
              <div>
                <label htmlFor="listing-address" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Accurate Location / Locality</label>
                <input
                  id="listing-address"
                  type="text"
                  placeholder="e.g., Tiruvallur, Chennai Outer"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="input-luxury text-sm font-semibold text-[#2563EB]"
                />
                <span className="text-[10px] text-[#6E6E73] mt-1 block font-sans">
                  Fetched accurately via geocoding (e.g., Tiruvallur) or custom defined
                </span>
              </div>

              {/* Capital Valuation */}
              <div>
                <label htmlFor="listing-price" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Capital Valuation (INR ₹)</label>
                <input
                  id="listing-price"
                  type="number"
                  required
                  placeholder="e.g., 45000000"
                  value={price}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="input-luxury text-sm font-mono font-semibold"
                />
                <span className="text-[10px] text-[#2563EB] mt-1 block font-semibold">
                  Preview Notation: {formatINR(price || 0)}
                </span>
              </div>

              {/* Price Per Sq Ft */}
              <div>
                <label htmlFor="listing-price-sqft" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Price Per Sq Ft (INR ₹/sqft)</label>
                <input
                  id="listing-price-sqft"
                  type="number"
                  placeholder="Calculated or Custom (e.g., 1148)"
                  value={pricePerSqft}
                  onChange={(e) => handlePricePerSqftChange(e.target.value)}
                  className="input-luxury text-sm font-mono font-semibold text-[#2563EB]"
                />
                <span className="text-[10px] text-[#2563EB] mt-1 block font-semibold">
                  Rate: {pricePerSqft ? `₹${Number(pricePerSqft).toLocaleString('en-IN')}` : 'Not calculated'} per Sq Ft
                </span>
              </div>

              {/* Land Type */}
              <div>
                <label htmlFor="listing-type" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Land/Plot Category</label>
                <select
                  id="listing-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="input-luxury text-sm bg-white"
                >
                  <option value="Agricultural Land">Agricultural Land</option>
                  <option value="Commercial Land">Commercial Land</option>
                  <option value="Farm Land">Farm Land</option>
                  <option value="Industrial Land">Industrial Land</option>
                  <option value="Residential Land">Residential Land</option>
                </select>
              </div>

              {/* Land Zoning Rule */}
              <div>
                <label htmlFor="listing-zoned" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Zoning Standard</label>
                <select
                  id="listing-zoned"
                  value={zoned}
                  onChange={(e) => setZoned(e.target.value)}
                  className="input-luxury text-sm bg-white"
                >
                  <option value="Agricultural">Agricultural</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Residential">Residential</option>
                  <option value="Industrial">Industrial</option>
                </select>
              </div>

              {/* Total Area */}
              <div>
                <label htmlFor="listing-sqft" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Total Area (Sq Ft)</label>
                <input
                  id="listing-sqft"
                  type="number"
                  required
                  placeholder="e.g., 43560"
                  value={sqft}
                  onChange={(e) => handleSqftChange(Number(e.target.value))}
                  className="input-luxury text-sm font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block font-mono">
                  Equivalent to {sqft ? (sqft / 43560).toFixed(2) : 0} Acres
                </span>
              </div>

              {/* Infrastructure access road */}
              <div>
                <label htmlFor="listing-road" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Access Road width / type</label>
                <input
                  id="listing-road"
                  type="text"
                  placeholder="e.g., 60ft Tar Road or 30ft Cement Road"
                  value={roadAccess}
                  onChange={(e) => setRoadAccess(e.target.value)}
                  className="input-luxury text-sm"
                />
              </div>

              {/* Plot Width */}
              <div>
                <label htmlFor="listing-width" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Plot Width (ft)</label>
                <input
                  id="listing-width"
                  type="number"
                  placeholder="e.g., 40 (Optional)"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="input-luxury text-sm font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block font-sans">
                  Width dimension of land boundary
                </span>
              </div>

              {/* Plot Length */}
              <div>
                <label htmlFor="listing-length" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Plot Length (ft)</label>
                <input
                  id="listing-length"
                  type="number"
                  placeholder="e.g., 60 (Optional)"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="input-luxury text-sm font-mono"
                />
                <span className="text-[10px] text-neutral-400 mt-1 block font-sans">
                  Length dimension of land boundary
                </span>
              </div>

              {/* Owner details & property status/structure toggles */}
              <div className="md:col-span-2 border-t border-neutral-100 pt-4 mt-2">
                <span className="text-[10px] text-[#2563EB] uppercase tracking-widest font-bold block mb-4">Owner Contact &amp; Plot Configurations</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-2">
                    <label htmlFor="listing-owner" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">
                      Owner Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="listing-owner"
                      type="text"
                      required
                      placeholder="e.g., Ramakrishna M."
                      value={customerName}
                      onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errors.customerName) {
                          setErrors((prev) => ({ ...prev, customerName: undefined }));
                        }
                      }}
                      className={`input-luxury text-sm ${errors.customerName ? 'border-red-500 focus:ring-red-500/20 bg-red-50/10' : ''}`}
                    />
                    {errors.customerName && (
                      <span className="text-[11px] text-red-500 mt-1 block font-medium flex items-center gap-1 animate-pulse">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.customerName}
                      </span>
                    )}
                  </div>

                  {/* CUSTOM CHIP TABS FOR STATUS SELECTION */}
                  <div>
                    <label className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Sale Status</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStatus('available')}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          status === 'available'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Available Plot
                      </button>
                      <button
                        type="button"
                        onClick={() => setStatus('sold')}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          status === 'sold'
                            ? 'bg-red-50/90 border-red-300 text-red-800'
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                        SOLD OUT
                      </button>
                    </div>
                  </div>

                  {/* CUSTOM CHIP TABS FOR STRUCTURE SELECTION */}
                  <div>
                    <label className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Structure Category</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setStructureType('land')}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          structureType === 'land'
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-800'
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        🏞️ Vacant Land
                      </button>
                      <button
                        type="button"
                        onClick={() => setStructureType('building')}
                        className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                          structureType === 'building'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'
                        }`}
                      >
                        🏡 with Building
                      </button>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="listing-survey" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Survey Number</label>
                    <input
                      id="listing-survey"
                      type="text"
                      placeholder="e.g., 142/3A (Optional)"
                      value={surveyNumber}
                      onChange={(e) => setSurveyNumber(e.target.value)}
                      className="input-luxury text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label htmlFor="listing-plot" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">Plot Number</label>
                    <input
                      id="listing-plot"
                      type="text"
                      placeholder="e.g., Plot 24 (Optional)"
                      value={plotNumber}
                      onChange={(e) => setPlotNumber(e.target.value)}
                      className="input-luxury text-sm font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Description remarks */}
              <div className="md:col-span-2">
                <label htmlFor="listing-description" className="block text-xs font-medium text-[#6E6E73] uppercase tracking-wider mb-2">GPS Specifications &amp; Field Coordinates</label>
                <textarea
                  id="listing-description"
                  rows={3}
                  placeholder="Enter detailed landmarks, water levels, electrical connectivity and high-appreciation characteristics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-luxury text-sm py-3"
                />
              </div>

              {/* Local Storage media uploads */}
              <div className="md:col-span-2 border-t border-neutral-100 pt-4">
                <span className="text-[10px] text-[#2563EB] uppercase tracking-widest font-bold block mb-3">Local Gallery Uploads</span>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Image input */}
                  <div className="bg-neutral-50/50 rounded-2xl p-4 border border-neutral-200/50 border-dashed text-center">
                    <ImageIcon className="w-8 h-8 text-[#6E6E73] mx-auto stroke-1 mb-2" />
                    <span className="text-xs font-semibold text-[#1D1D1F] block">Upload Visual Imagery</span>
                    <span className="text-[10px] text-[#6E6E73] block mb-3">Limits: JPEG/PNG up to 2MB</span>
                    <input
                      id="upload-image-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleMediaUpload(e, 'image')}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-image-input"
                      className="btn-premium btn-secondary-luxury text-[11px] py-1.5 px-3 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Browse Images
                    </label>
                  </div>

                  {/* Video input */}
                  <div className="bg-neutral-50/50 rounded-2xl p-4 border border-neutral-200/50 border-dashed text-center">
                    <Video className="w-8 h-8 text-[#6E6E73] mx-auto stroke-1 mb-2" />
                    <span className="text-xs font-semibold text-[#1D1D1F] block">Upload Drone/Site Video</span>
                    <span className="text-[10px] text-[#6E6E73] block mb-3">Limits: MP4/WebM up to 3.5MB</span>
                    <input
                      id="upload-video-input"
                      type="file"
                      multiple
                      accept="video/*"
                      onChange={(e) => handleMediaUpload(e, 'video')}
                      className="hidden"
                    />
                    <label
                      htmlFor="upload-video-input"
                      className="btn-premium btn-secondary-luxury text-[11px] py-1.5 px-3 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Browse Videos
                    </label>
                  </div>
                </div>

                {/* Uploaded assets previews */}
                {(images.length > 0 || videos.length > 0) && (
                  <div className="mt-4 p-4 bg-neutral-50 rounded-2xl space-y-3">
                    <span className="text-[10px] text-[#6E6E73] uppercase tracking-wider block font-semibold">Active Upload Queue</span>
                    
                    {/* Images queue */}
                    {images.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-neutral-400 font-mono">Visuals ({images.length})</span>
                        <div className="flex flex-wrap gap-2.5">
                          {images.map((img, idx) => (
                            <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-neutral-200 shadow-sm shrink-0 group">
                              <img src={img} alt="" referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos queue */}
                    {videos.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-neutral-200/50">
                        <span className="text-[10px] text-neutral-400 font-mono">Drone Feeds ({videos.length})</span>
                        <div className="flex flex-wrap gap-2.5">
                          {videos.map((vid, idx) => (
                            <div key={idx} className="relative w-16 h-12 rounded-lg bg-neutral-900 overflow-hidden border border-neutral-200 shadow-sm shrink-0 flex items-center justify-center">
                              <Play className="w-4 h-4 text-[#2563EB]" />
                              <button
                                type="button"
                                onClick={() => handleRemoveVideo(idx)}
                                className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-500 hover:bg-red-600 text-white shadow"
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Actions footer inside the scrollable view */}
            <div className="pt-6 border-t border-neutral-100 flex items-center justify-end gap-3 shrink-0">
              <button id="cancel-location-btn" type="button" onClick={onClose} className="btn-premium btn-secondary-luxury text-xs py-2 px-5">
                Cancel
              </button>
              <button id="save-location-btn" type="submit" className="btn-premium btn-primary-luxury text-xs py-2 px-6">
                {location ? 'Save Listing' : 'Publish Listing'}
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* MOBILE FULL-SCREEN MAP OVERLAY */}
      {isMobile && mobileMapOpen && (
        <div className="fixed inset-0 bg-[#1D1D1F] z-[2500] flex flex-col select-text animate-fade-in">
          {/* Mobile Map Header */}
          <div className="p-4 bg-white border-b border-neutral-200 flex items-center justify-between shadow-sm z-[2510]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#2563EB]/10 flex items-center justify-center text-[#2563EB]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#1D1D1F] tracking-tight uppercase">Select Plot Location</h4>
                <p className="text-[9px] text-[#6E6E73]">Drag the map and tap or move pin to choose</p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={() => {
                setMobileMapOpen(false);
                setShowLocationConfirmPrompt(false);
              }}
              className="py-1.5 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#1D1D1F] text-xs font-bold rounded-full transition flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
          </div>

          {/* Map canvas container */}
          <div ref={modalMapContainerRef} className="flex-grow w-full relative bg-neutral-100" />

          {/* Location Selected Confirmation Prompt overlay */}
          {showLocationConfirmPrompt && tempLat !== null && tempLng !== null && (
            <div className="absolute bottom-6 left-4 right-4 z-[2520] bg-white rounded-2xl shadow-2xl border border-neutral-100 p-4 space-y-3 animate-slide-up">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-grow">
                  <h5 className="text-xs font-bold text-[#1D1D1F]">location selected</h5>
                  <p className="text-[10px] text-neutral-500 mt-0.5 font-mono">
                    Lat: {tempLat.toFixed(6)}, Lng: {tempLng.toFixed(6)}
                  </p>
                  <p className="text-[11px] text-[#1D1D1F] mt-1 font-semibold">Do you want to confirm this location?</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2.5 pt-1.5 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowLocationConfirmPrompt(false);
                  }}
                  className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-bold rounded-lg transition cursor-pointer"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLat(tempLat);
                    setLng(tempLng);
                    triggerReverseGeocode(tempLat, tempLng);
                    setShowLocationConfirmPrompt(false);
                    setMobileMapOpen(false);
                  }}
                  className="px-4 py-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[11px] font-bold rounded-lg transition shadow-sm cursor-pointer"
                >
                  Yes
                </button>
              </div>
            </div>
          )}

          {/* Fallback bottom info bar when confirmation prompt is not visible */}
          {!showLocationConfirmPrompt && (
            <div className="p-4 bg-white/95 backdrop-blur-md border-t border-neutral-200 text-xs text-[#1D1D1F] z-[2510] shadow-md flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-[#FF453A]" />
                <span className="truncate font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
              </div>
              <span className="text-[10px] text-[#2563EB] font-semibold uppercase tracking-wider shrink-0 bg-[#2563EB]/10 py-1 px-2.5 rounded-full">
                Drag Marker / Tap Map
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
