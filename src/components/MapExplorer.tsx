/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { Location, City, User } from '../types';
import { formatINR, formatSqft } from '../utils/db';
import { 
  MapPin, 
  Phone, 
  User as UserIcon, 
  ArrowLeft, 
  RefreshCw, 
  Compass, 
  X, 
  Tag, 
  Layers, 
  Building, 
  Map, 
  Maximize2,
  Ruler
} from 'lucide-react';

declare const L: any;

interface MapExplorerProps {
  locations: Location[];
  cities: City[];
  currentUser: User;
  selectedProperty: Location | null;
  onSelectProperty: (property: Location | null) => void;
  onBackToHome: () => void;
  onViewFullscreenMedia: (property: Location, startIndex: number) => void;
  onNavigateToAdminAddPlot?: () => void;
}

export default function MapExplorer({
  locations,
  cities,
  currentUser,
  selectedProperty,
  onSelectProperty,
  onBackToHome,
  onViewFullscreenMedia,
  onNavigateToAdminAddPlot,
}: MapExplorerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [activeCityId, setActiveCityId] = useState<string>('all');
  const [activeStructureType, setActiveStructureType] = useState<string>('all');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  
  // Computed Filtered Locations based on Active City & Structure Category
  const displayLocations = locations.filter((loc) => {
    if (activeCityId !== 'all' && loc.cityId !== activeCityId) {
      return false;
    }
    if (activeStructureType !== 'all') {
      const isBuilding = loc.structureType === 'building';
      if (activeStructureType === 'building' && !isBuilding) return false;
      if (activeStructureType === 'land' && isBuilding) return false;
    }
    return true;
  });

  // Keep track of previous coordinates to prevent infinite updates
  const prevCoordsRef = useRef<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Destroy existing map instance to prevent "Map container already initialized" errors
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center - Bangalore
    const initialCenter = [12.9716, 77.5946];
    const initialZoom = 11;

    try {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false, // We'll place it custom
      });

      mapInstanceRef.current = map;

      // Add zoom control to top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Add CartoDB Voyager tile layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      // Resize observer to ensure the map expands to fill the grid container
      const resizeObserver = new ResizeObserver(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      });
      resizeObserver.observe(mapContainerRef.current);

      return () => {
        resizeObserver.disconnect();
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    } catch (err) {
      console.error('Error initializing Leaflet map:', err);
    }
  }, []);

  // Update Markers when locations or selected property changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    displayLocations.forEach((loc) => {
      // If a property is selected, only show its marker and hide all other locations
      if (selectedProperty && selectedProperty.id !== loc.id) {
        return;
      }

      const isSelected = selectedProperty && selectedProperty.id === loc.id;
      const isSold = loc.status === 'sold';
      const statusClass = isSold ? 'marker-sold' : 'marker-available';
      const selectedClass = isSelected ? 'marker-selected' : '';
      
      // Create customized Cobalt Circle HTML Marker
      const markerHtml = `
        <div class="custom-leaflet-marker ${statusClass} ${selectedClass}">
          <div style="width: 8px; height: 8px; background-color: white; border-radius: 50%; z-index: 10;"></div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: '', // Clear default styling
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const tooltipContent = `
        <div style="font-family: 'Inter', sans-serif; padding: 2px;">
          <strong style="color: #1D1D1F; font-size: 13px; display: block; margin-bottom: 2px;">${loc.name}</strong>
          <span style="color: #6E6E73; font-size: 11px; display: block;">Owner: ${loc.customerName}</span>
          <span style="color: #2563EB; font-weight: 500; font-size: 11px; display: block; margin-top: 2px;">📍 ${loc.address || getCityName(loc.cityId)}</span>
          ${(loc.width || loc.length) 
            ? `<span style="color: #4F46E5; font-weight: 600; font-size: 11px; display: block; margin-top: 2px;">Dimensions: ${loc.width || '?'} ft × ${loc.length || '?'} ft</span>` 
            : ''
          }
          ${currentUser.role !== 'map_no_price' 
            ? `<span style="color: #2563EB; font-weight: 600; font-size: 12px; display: block; margin-top: 4px;">${formatINR(loc.price)}</span>` 
            : ''
          }
        </div>
      `;

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon })
        .addTo(map)
        .bindTooltip(tooltipContent, {
          direction: 'top',
          offset: [0, -10],
          opacity: 0.95,
        });

      // Handle Pin Clicks
      marker.on('click', () => {
        onSelectProperty(loc);
        map.setView([loc.lat, loc.lng], 13, { animate: true, duration: 0.8 });
      });

      markersRef.current.push(marker);
    });

    // If a property is selected, pan the map directly to it
    if (selectedProperty) {
      const alreadyChecked = prevCoordsRef.current && 
                             prevCoordsRef.current.lat === selectedProperty.lat && 
                             prevCoordsRef.current.lng === selectedProperty.lng;

      if (!alreadyChecked) {
        map.setView([selectedProperty.lat, selectedProperty.lng], 13, { animate: true, duration: 0.8 });
        prevCoordsRef.current = { lat: selectedProperty.lat, lng: selectedProperty.lng };
      }
    }
  }, [locations, selectedProperty, activeCityId, activeStructureType, currentUser.role, onSelectProperty]);

  // Recenter map on selected City changes
  const handleCityChange = (cityId: string) => {
    setActiveCityId(cityId);
    const map = mapInstanceRef.current;
    if (!map) return;

    if (cityId === 'all') {
      // Fit map bounds around all coordinates
      if (locations.length > 0) {
        const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.lng]));
        map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
      }
    } else {
      const city = cities.find(c => c.id === cityId);
      if (city) {
        map.setView([city.lat, city.lng], 12, { animate: true, duration: 1 });
      }
    }
    // Deselect property upon global city navigation
    onSelectProperty(null);
    prevCoordsRef.current = null;
  };

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (!city) return 'All Cities, India';
    const lowerCity = city.name.toLowerCase();
    if (lowerCity === 'puttur') {
      return 'Puttur, AP';
    }
    if (lowerCity === 'narayanavanam' || lowerCity === 'narayanvanam') {
      return 'Narayanavanam, Andhra Pradesh';
    }
    const stateName = city.state.toLowerCase() === 'andhra pradesh' ? 'AP' : city.state;
    return `${city.name}, ${stateName}`;
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-72px-64px)] md:min-h-[calc(100vh-72px)] bg-[#F5F5F7] pb-12" id="full-map-explorer-root">
      
      {/* TOP PORTION: INTERACTIVE MAP CANVAS */}
      <div 
        className={`w-full relative transition-all duration-300 ${
          selectedProperty ? 'h-[200px] md:h-[380px]' : 'h-[260px] md:h-[480px]'
        } border-b border-neutral-200/60 shadow-sm shrink-0`}
        id="map-canvas-wrapper"
      >
        {/* Leaflet instance element */}
        <div 
          ref={mapContainerRef} 
          id="leaflet-canvas-container" 
          className="w-full h-full bg-neutral-100 z-0"
        />

        {/* Floating Custom elegant Change City Dropdown */}
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-[1000] flex flex-col gap-2">
          <div className="relative">
            <button
              id="map-change-city-btn"
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              className="px-3 py-2 md:px-4.5 md:py-2.5 bg-white hover:bg-neutral-50 text-[#1D1D1F] rounded-full shadow-md border border-neutral-200/80 flex items-center gap-1.5 text-xs font-bold transition-all duration-200 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Change City</span>
              <span className="text-[10px] text-[#6E6E73] font-normal px-2 py-0.5 bg-neutral-100 rounded-full font-sans">
                {activeCityId === 'all' ? 'All' : getCityName(activeCityId).split(',')[0]}
              </span>
            </button>

            {showCityDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-neutral-200/70 rounded-2xl shadow-xl py-2 z-[1010] animate-fade-in">
                <div className="px-4 py-2 border-b border-neutral-100 mb-1.5 flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#6E6E73] uppercase tracking-wider">
                    Select City Focus
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse"></span>
                </div>
                
                <button
                  onClick={() => {
                    handleCityChange('all');
                    setShowCityDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-xs font-semibold flex items-center justify-between hover:bg-neutral-50/80 transition ${
                    activeCityId === 'all' ? 'text-[#2563EB]' : 'text-[#1D1D1F]'
                  }`}
                >
                  <span>All Cities (Show All Bounds)</span>
                  {activeCityId === 'all' && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>}
                </button>

                {cities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => {
                      handleCityChange(city.id);
                      setShowCityDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs flex items-center justify-between hover:bg-neutral-50/80 transition ${
                      activeCityId === city.id ? 'text-[#2563EB] font-semibold' : 'text-[#1D1D1F]'
                    }`}
                  >
                    <span>{getCityName(city.id)}</span>
                    {activeCityId === city.id && <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Reset Button */}
        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-[1000] flex gap-2">
          <button
            id="map-recenter-all-btn"
            onClick={() => handleCityChange('all')}
            className="p-2.5 md:p-3 bg-white hover:bg-neutral-50 text-[#1D1D1F] rounded-full shadow-md border border-neutral-200/80 flex items-center justify-center transition hover:scale-105 active:scale-95 duration-200 cursor-pointer"
            title="Recenter global bounds"
          >
            <RefreshCw className="w-4 h-4 text-[#2563EB]" />
          </button>
        </div>
      </div>

      {/* BOTTOM PORTION: DYNAMIC VIEW AREA */}
      <div className="w-full flex-grow" id="map-explorer-content-body">
        {selectedProperty ? (
          /* DISPLAY GORGEOUS SELECTED DETAILS BELOW MAP */
          <div className="max-w-7xl mx-auto w-full p-6 md:p-8 lg:px-12 animate-fade-in" id="selected-property-details-container">
            
            {/* Header row with Title and Close Button */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#1D1D1F] tracking-tight leading-tight">
                  {selectedProperty.name}
                </h2>
                
                {/* Location / Locality and Coordinates Sub-header */}
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[#6E6E73] text-sm mt-3 font-sans">
                  <span className="flex items-center gap-1.5 font-bold text-[#2563EB]">
                    <MapPin className="w-4 h-4 text-[#FF453A]" />
                    <span>{selectedProperty.address || 'Premium Locality'}</span>
                  </span>
                  <span className="flex items-center gap-1.5 font-mono text-xs text-neutral-500 border-l border-neutral-300 pl-5">
                    <span>GPS Coordinates: {selectedProperty.lat.toFixed(5)}, {selectedProperty.lng.toFixed(5)}</span>
                  </span>
                </div>
              </div>

              {/* Close Details Button */}
              <button
                id="clear-property-selection-btn"
                onClick={() => onSelectProperty(null)}
                className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-neutral-200/80 flex items-center justify-center text-[#6E6E73] transition duration-150 cursor-pointer shrink-0"
                title="Deselect property and view list"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Badges / Pill row */}
            <div className="flex flex-wrap gap-2.5 mt-6">
              {/* Valuation Badge - Completely hidden for no_price users */}
              {currentUser.role !== 'map_no_price' && (
                <div className="bg-[#2563EB]/10 border border-[#2563EB]/25 text-[#2563EB] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
                  <Tag className="w-4 h-4 text-[#2563EB]" />
                  <span className={selectedProperty.status === 'sold' ? 'line-through opacity-65' : ''}>
                    {formatINR(selectedProperty.price, currentUser.role)}
                  </span>
                </div>
              )}

              {/* Price Per Sq Ft Badge - completely hidden for no_price users */}
              {currentUser.role !== 'map_no_price' && (
                <div className="bg-indigo-50 border border-indigo-200/50 text-[#2563EB] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm font-mono">
                  <span className="font-sans font-semibold text-indigo-500 uppercase text-[9px] tracking-wider">Rate:</span>
                  <span>
                    ₹{(selectedProperty.pricePerSqft || Math.round(Number(selectedProperty.price) / selectedProperty.sqft)).toLocaleString('en-IN')}/sqft
                  </span>
                </div>
              )}

              {/* Sold/Available Status Badge */}
              <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border ${
                selectedProperty.status === 'sold' 
                  ? 'bg-red-50/80 border-red-200/50 text-red-700' 
                  : 'bg-emerald-50/80 border-emerald-200/50 text-emerald-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selectedProperty.status === 'sold' ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`}></span>
                <span>{selectedProperty.status === 'sold' ? 'SOLD OUT' : 'AVAILABLE'}</span>
              </div>

              {/* Road Access Badge */}
              <div className="bg-white border border-neutral-200/80 text-[#1D1D1F] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
                <Map className="w-4 h-4 text-[#6E6E73]" />
                <span>{selectedProperty.roadAccess || 'Direct Access'}</span>
              </div>

              {/* Area Sizing Badge */}
              <div className="bg-white border border-neutral-200/80 text-[#1D1D1F] px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm">
                <Building className="w-4 h-4 text-[#6E6E73]" />
                <span>{formatSqft(selectedProperty.sqft)}</span>
              </div>

              {/* Plot Dimensions Badge */}
              {(selectedProperty.width || selectedProperty.length) && (
                <div className="bg-[#4F46E5]/10 border border-[#4F46E5]/25 text-[#4F46E5] px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fade-in">
                  <Ruler className="w-4 h-4" />
                  <span>
                    Dimensions: {selectedProperty.width || '?'} ft × {selectedProperty.length || '?'} ft
                  </span>
                </div>
              )}

              {/* Survey Number Badge */}
              {selectedProperty.surveyNumber && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm font-mono animate-fade-in">
                  <span className="font-sans font-bold text-amber-700">Survey:</span>
                  <span>{selectedProperty.surveyNumber}</span>
                </div>
              )}

              {/* Plot Number Badge */}
              {selectedProperty.plotNumber && (
                <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm font-mono animate-fade-in">
                  <span className="font-sans font-bold text-indigo-700">Plot No:</span>
                  <span>{selectedProperty.plotNumber}</span>
                </div>
              )}
            </div>

            {/* Divider Line */}
            <div className="border-t border-neutral-200/60 my-6"></div>

            {/* Content Columns (Split into Left details, Right Media preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Description & Actions */}
              <div className="lg:col-span-7 space-y-5">
                <p className="text-sm md:text-base text-[#6E6E73] leading-relaxed font-light font-sans">
                  {selectedProperty.description || 'No descriptive remarks are currently registered for this empty layout plot.'}
                </p>

                {/* Owner Summary Card with Details displayed below Landed Owner details */}
                <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/60 shadow-sm flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#6E6E73] uppercase tracking-wider block font-semibold">Landed Owner</span>
                      <span className="text-base font-bold text-[#1D1D1F]">{selectedProperty.customerName}</span>
                    </div>
                  </div>
                  
                  {/* Category, Zoning and Structure details displayed below landed owner details */}
                  <div className="border-t border-neutral-200/50 pt-3 mt-1 flex flex-wrap gap-2 text-xs">
                    <span className="bg-[#2563EB]/10 text-[#2563EB] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg">
                      {selectedProperty.zoned} Zone
                    </span>
                    <span className="bg-neutral-950/10 text-neutral-800 font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg">
                      {selectedProperty.type}
                    </span>
                    <span className="bg-neutral-600/10 text-neutral-600 font-semibold tracking-wider uppercase px-2.5 py-1 rounded-lg">
                      {selectedProperty.structureType === 'building' ? 'Plot with Building' : 'Vacant Land Plot'}
                    </span>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-4.5 border border-neutral-200/60 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">Coordinates Routing</h4>
                    <p className="text-xs text-[#6E6E73] mt-0.5 font-light">Get driving directions to this location instantly on Google Maps</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${selectedProperty.lat},${selectedProperty.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-premium btn-primary-luxury text-xs py-2.5 px-4.5 shadow-sm flex items-center gap-2 font-semibold cursor-pointer shrink-0"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Get GPS Route</span>
                  </a>
                </div>
              </div>

              {/* Right Column: Beautiful Image Thumbnail with Gallery Trigger */}
              <div className="lg:col-span-5">
                <div className="relative rounded-3xl overflow-hidden aspect-[16/10] bg-neutral-100 shadow-sm border border-neutral-200/40 group">
                  {selectedProperty.images && selectedProperty.images.length > 0 ? (
                    <>
                      <img
                        src={selectedProperty.images[0]}
                        alt={selectedProperty.name}
                        referrerPolicy="no-referrer"
                        className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* View Gallery Overlay Panel */}
                      <div className="absolute inset-0 bg-black/25 flex items-end justify-center p-4">
                        <button
                          id="trigger-fullscreen-gallery-overlay"
                          type="button"
                          onClick={() => onViewFullscreenMedia(selectedProperty, 0)}
                          className="bg-white/95 backdrop-blur-md hover:bg-white text-[#1D1D1F] text-xs font-bold py-2.5 px-5.5 rounded-full border border-neutral-200/50 shadow-md transition-all duration-300 flex items-center gap-2 cursor-pointer hover:scale-105"
                        >
                          <Maximize2 className="w-4 h-4 text-[#2563EB]" />
                          <span>View Fullscreen Media</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 p-4">
                      <Compass className="w-8 h-8 text-neutral-300 stroke-1 mb-2 animate-spin-slow" />
                      <span className="text-xs font-mono">No imagery loaded</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* NO HIGHLIGHTED PLOT SELECTED: SHOW BEAUTIFUL PREMIUM LAND CATALOG BELOW MAP */
          <div className="max-w-7xl mx-auto w-full p-4 md:p-8 lg:px-12 animate-fade-in" id="available-holdings-list-container">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5 md:mb-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1D1D1F] tracking-tight">
                  Premium Real-Estate Land Catalog
                </h3>
                <p className="text-xs text-[#6E6E73] mt-1 font-light">
                  {activeCityId === 'all' 
                    ? `Displaying all ${locations.length} coordinates available across active hubs` 
                    : `Showing available land assets in ${getCityName(activeCityId)}`
                  }
                </p>
              </div>

              {/* Filtering dropdowns inline - Responsive and elegant */}
              <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-xs text-[#6E6E73] font-mono shrink-0">City:</span>
                  <select
                    id="catalog-city-filter"
                    value={activeCityId}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full sm:w-auto text-xs py-2 px-3 bg-white border border-neutral-200/80 rounded-xl shadow-sm cursor-pointer focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition font-sans"
                  >
                    <option value="all">All Cities / Bounds</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {getCityName(city.id)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 w-full sm:w-auto">
                  <span className="text-xs text-[#6E6E73] font-mono shrink-0">Structure:</span>
                  <select
                    id="catalog-structure-filter"
                    value={activeStructureType}
                    onChange={(e) => setActiveStructureType(e.target.value)}
                    className="w-full sm:w-auto text-xs py-2 px-3 bg-white border border-neutral-200/80 rounded-xl shadow-sm cursor-pointer focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition font-sans"
                  >
                    <option value="all">All Category Types</option>
                    <option value="land">🏞️ Vacant Land</option>
                    <option value="building">🏡 Plot with Building</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Responsive Land Holdings Cards Grid */}
            {displayLocations.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/60 p-8 max-w-xl mx-auto shadow-sm" id="map-no-results">
                <Layers className="w-12 h-12 text-[#2563EB] stroke-1 mx-auto mb-4" />
                <h4 className="text-xl font-serif font-semibold text-[#1D1D1F]">
                  No Matching Land Holdings
                </h4>
                <p className="text-sm text-[#6E6E73] mt-2 leading-relaxed">
                  There are no land assets or portfolios currently matching your active geographic filters.
                  {currentUser.role === 'admin' ? ' Start registering new land coordinates from the Administrative Desk.' : ''}
                </p>
                {currentUser.role === 'admin' && onNavigateToAdminAddPlot && (
                  <button
                    id="map-add-asset-empty-btn"
                    type="button"
                    onClick={onNavigateToAdminAddPlot}
                    className="btn-premium btn-primary-luxury text-xs mt-6 bg-[#2563EB] border border-[#2563EB] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] font-semibold py-3 px-6 rounded-2xl cursor-pointer"
                  >
                    Add an Asset
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayLocations.map((loc) => {
                  const hasImage = loc.images && loc.images.length > 0;
                  const isSold = loc.status === 'sold';
                  const isBuilding = loc.structureType === 'building';
                  
                  return (
                    <button
                      key={loc.id}
                      onClick={() => {
                        onSelectProperty(loc);
                        const map = mapInstanceRef.current;
                        if (map) {
                          map.setView([loc.lat, loc.lng], 13, { animate: true, duration: 0.8 });
                        }
                      }}
                      className={`group text-left bg-white border border-neutral-200/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-[#2563EB]/45 transition-all duration-300 flex flex-col h-full cursor-pointer relative ${
                        isSold ? 'opacity-90' : ''
                      }`}
                    >
                      {/* SOLD/AVAILABLE STATUS BADGE OVERLAY */}
                      {isSold ? (
                        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-red-200 text-red-600 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-15 flex items-center gap-1.5 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                          SOLD
                        </div>
                      ) : (
                        <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-md border border-emerald-200 text-emerald-700 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-15 flex items-center gap-1.5 font-sans">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          AVAILABLE
                        </div>
                      )}

                      {/* Thumbnail box */}
                      <div className="relative aspect-[16/10] bg-neutral-100 overflow-hidden shrink-0">
                        {hasImage ? (
                          <img
                            src={loc.images[0]}
                            alt={loc.name}
                            referrerPolicy="no-referrer"
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-neutral-300 bg-neutral-50">
                            <Layers className="w-8 h-8 stroke-1" />
                          </div>
                        )}
                      </div>

                      {/* Meta/details content box */}
                      <div className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#1D1D1F] group-hover:text-[#2563EB] transition duration-150 line-clamp-1">
                            {loc.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#6E6E73] mt-1">
                            <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                            <span>{loc.address || getCityName(loc.cityId)}</span>
                          </div>

                          {/* Property classification details displayed below primary info */}
                          <div className="mt-2 flex flex-wrap gap-1 text-[9px] font-semibold uppercase tracking-wider">
                            <span className="bg-[#2563EB]/10 text-[#2563EB] px-2 py-0.5 rounded">
                              {loc.zoned}
                            </span>
                            <span className="bg-neutral-100 text-neutral-800 px-2 py-0.5 rounded">
                              {loc.type.replace(" Land", "")}
                            </span>
                            <span className="bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                              {isBuilding ? 'Building' : 'Plot'}
                            </span>
                          </div>
                        </div>

                        {/* Area and valuation footer */}
                        <div className="border-t border-neutral-100 pt-3 mt-4 flex items-center justify-between text-xs font-sans">
                          <div>
                            <span className="text-[9px] text-[#6E6E73] uppercase tracking-wider block font-medium">Dimension</span>
                            <span className="font-mono font-bold text-[#1D1D1F]">
                              {formatSqft(loc.sqft).split(' ')[0]} Sqft
                            </span>
                            {(loc.width || loc.length) && (
                              <span className="text-[10px] text-[#4F46E5] block mt-0.5 font-semibold">
                                {loc.width || '?'} × {loc.length || '?'} ft
                              </span>
                            )}
                          </div>
                          
                          {currentUser.role !== 'map_no_price' ? (
                            <div className="text-right">
                              <span className="text-[9px] text-[#6E6E73] uppercase tracking-wider block font-medium">Valuation</span>
                              <span className={`font-serif font-bold text-[#2563EB] ${isSold ? 'line-through text-neutral-400' : ''}`}>
                                {formatINR(loc.price)}
                              </span>
                            </div>
                          ) : (
                            /* Hide valuation completely if restricted */
                            <div />
                          )}
                        </div>
                      </div>

                    </button>
                  );
                })}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}
