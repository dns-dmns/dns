/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Location, City, User } from '../types';
import { formatINR, formatSqft, getCities } from '../utils/db';
import { SlidersHorizontal, Search, MapPin, Minimize2, Eye, Phone, Grid, Layers, Route } from 'lucide-react';

interface WelcomeProps {
  locations: Location[];
  cities: City[];
  currentUser: User;
  onSelectProperty: (property: Location) => void;
  onNavigateToMap: () => void;
  onNavigateToAdminAddPlot?: () => void;
}

export default function Welcome({
  locations,
  cities,
  currentUser,
  onSelectProperty,
  onNavigateToMap,
  onNavigateToAdminAddPlot,
}: WelcomeProps) {
  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [maxBudget, setMaxBudget] = useState<number>(300000000); // Max 30 Crores
  const [selectedCityId, setSelectedCityId] = useState<string>('all');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [minSqft, setMinSqft] = useState<number>(0);
  const [selectedZoned, setSelectedZoned] = useState<string>('all');
  const [selectedStructureType, setSelectedStructureType] = useState<string>('all');

  // Filter Logic
  const filteredLocations = locations.filter((loc) => {
    // 1. Budget Filter
    const numericPrice = parseFloat(loc.price.replace(/[^0-9]/g, ''));
    if (!isNaN(numericPrice) && numericPrice > maxBudget && currentUser.role !== 'map_no_price') {
      return false;
    }

    // 2. City Filter
    if (selectedCityId !== 'all' && loc.cityId !== selectedCityId) {
      return false;
    }

    // 3. Keyword Filter (searches Name, CustomerName, Description, State, City, Price, or Sqft)
    if (searchKeyword.trim()) {
      const query = searchKeyword.toLowerCase();
      const parentCity = cities.find((c) => c.id === loc.cityId);
      const stateName = parentCity ? parentCity.state.toLowerCase() : '';
      const cityName = parentCity ? parentCity.name.toLowerCase() : '';
      
      const nameMatch = loc.name.toLowerCase().includes(query);
      const ownerMatch = loc.customerName.toLowerCase().includes(query);
      const descMatch = loc.description.toLowerCase().includes(query);
      const locationTypeMatch = loc.type.toLowerCase().includes(query);
      const cityMatch = cityName.includes(query);
      const stateMatch = stateName.includes(query) || (stateName.includes('andhra pradesh') && query === 'ap');
      
      // Support searching by numeric price or sqft
      const priceMatch = currentUser.role !== 'map_no_price' && loc.price.toString().includes(query);
      const sqftMatch = loc.sqft.toString().includes(query);
      const addressMatch = loc.address ? loc.address.toLowerCase().includes(query) : false;

      if (
         !nameMatch &&
         !ownerMatch &&
         !descMatch &&
         !cityMatch &&
         !stateMatch &&
         !locationTypeMatch &&
         !priceMatch &&
         !sqftMatch &&
         !addressMatch
      ) {
        return false;
      }
    }

    // 4. Area Filter
    if (loc.sqft < minSqft) {
      return false;
    }

    // 5. Zoning Filter
    if (selectedZoned !== 'all' && loc.zoned.toLowerCase() !== selectedZoned.toLowerCase()) {
      return false;
    }

    // 6. Structure Type Filter
    if (selectedStructureType !== 'all') {
      const isBuilding = loc.structureType === 'building';
      if (selectedStructureType === 'building' && !isBuilding) {
        return false;
      }
      if (selectedStructureType === 'land' && isBuilding) {
        return false;
      }
    }

    return true;
  });

  const getCityName = (cityId: string) => {
    const city = cities.find((c) => c.id === cityId);
    if (!city) return 'India';
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

  const handleResetFilters = () => {
    setMaxBudget(300000000);
    setSelectedCityId('all');
    setSearchKeyword('');
    setMinSqft(0);
    setSelectedZoned('all');
    setSelectedStructureType('all');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="welcome-container">
      {/* Editorial Slogan / Hero Greeting */}
      <div className="mb-12 border-b border-neutral-200/60 pb-8" id="welcome-hero">
        <span className="text-xs uppercase tracking-widest text-[#2563EB] font-bold block mb-2">
          Curated Indian Holdings
        </span>
        <h2 className="text-4xl sm:text-5xl font-serif text-[#1D1D1F] tracking-tight leading-tight">
          Sovereign Land Plots &amp; Agricultural Retreats
        </h2>
        <p className="text-[#6E6E73] mt-3 max-w-2xl text-sm leading-relaxed">
          Explore premier industrial developments, custom estate layout plots, and historic farming holdings centered across South India's high-growth technological hubs.
        </p>
      </div>

      {/* DIRECT INTEGRATED SEARCH BAR & SEARCH BUTTON */}
      <div className="bg-white rounded-3xl border-2 border-neutral-300 shadow-md p-5 mb-10 flex flex-col md:flex-row gap-4 items-stretch" id="direct-search-panel">
        <div className="relative flex-grow">
          <label htmlFor="direct-search-input" className="sr-only">Search locations, price, sqft</label>
          <input
            id="direct-search-input"
            type="text"
            placeholder="Search lands by location (e.g. Puttur), price (e.g. 28000000), sqft (e.g. 22000), owner or category..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="w-full bg-neutral-50 border-2 border-neutral-300 text-neutral-900 placeholder-neutral-500 rounded-2xl pl-12 pr-10 text-sm h-12 focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 focus:outline-none transition-all duration-200 font-medium"
          />
          <Search className="w-5 h-5 text-neutral-500 absolute left-4.5 top-3.5" />
          {searchKeyword && (
            <button
              type="button"
              onClick={() => setSearchKeyword('')}
              className="absolute right-3.5 top-3.5 text-neutral-400 hover:text-neutral-600 transition"
              title="Clear search"
            >
              <Minimize2 className="w-4 h-4 rotate-45" />
            </button>
          )}
        </div>
        <button
          id="direct-search-trigger-btn"
          type="button"
          className="btn-premium btn-primary-luxury text-sm py-3 px-8 h-12 flex items-center justify-center gap-2 shrink-0 bg-[#2563EB] border-2 border-[#2563EB] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] font-bold shadow-sm rounded-2xl cursor-pointer"
        >
          <Search className="w-4 h-4 stroke-[2.5]" />
          <span>Search Registry</span>
        </button>
      </div>

      {/* Main Panel Header & Filter Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6" id="grid-header-actions">
        <div className="flex items-center gap-3">
          <Grid className="w-5 h-5 text-[#2563EB]" />
          <h3 className="text-xl font-serif font-semibold text-[#1D1D1F]">
            Featured Property Portfolios
          </h3>
          <span className="bg-neutral-100 text-[#1D1D1F] text-xs font-mono font-medium px-2 py-0.5 rounded-full">
            {filteredLocations.length} Listed
          </span>
        </div>

        {/* Filter Trigger Button */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            id="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-premium text-xs gap-2 py-2 px-4 ${
              showFilters
                ? 'bg-[#1D1D1F] text-white'
                : 'bg-white hover:bg-neutral-50 text-[#1D1D1F] border border-neutral-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{showFilters ? 'Collapse Settings' : 'Filter Settings'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Glassmorphic Filter Box */}
      {showFilters && (
        <div
          className="glass-panel rounded-2xl p-6 mb-8 border border-neutral-200/80 shadow-md animate-slide-up"
          id="filter-settings-panel"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Keyword */}
            <div>
              <label htmlFor="search-input" className="block text-xs font-medium text-[#6E6E73] mb-2 uppercase tracking-wider">
                Sovereign Search Keyword
              </label>
              <div className="relative">
                <input
                  id="search-input"
                  type="text"
                  placeholder="Owner, mobile, layout note, state..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="input-luxury pl-10 text-xs"
                />
                <Search className="w-4 h-4 text-[#6E6E73] absolute left-3 top-3.5" />
              </div>
            </div>

            {/* City Selector */}
            <div>
              <label htmlFor="city-select" className="block text-xs font-medium text-[#6E6E73] mb-2 uppercase tracking-wider">
                Geographic Hub (City)
              </label>
              <select
                id="city-select"
                value={selectedCityId}
                onChange={(e) => setSelectedCityId(e.target.value)}
                className="input-luxury text-xs py-[11px]"
              >
                <option value="all">All Locations (Global India)</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {getCityName(city.id)}
                  </option>
                ))}
              </select>
            </div>

            {/* Zoning Selector */}
            <div>
              <label htmlFor="zoned-select" className="block text-xs font-medium text-[#6E6E73] mb-2 uppercase tracking-wider">
                Zoning Standard
              </label>
              <select
                id="zoned-select"
                value={selectedZoned}
                onChange={(e) => setSelectedZoned(e.target.value)}
                className="input-luxury text-xs py-[11px]"
              >
                <option value="all">All Zoning Rules</option>
                <option value="agricultural">Agricultural Only</option>
                <option value="commercial">Commercial Hubs</option>
                <option value="residential">Residential Enclaves</option>
                <option value="industrial">Industrial Parks</option>
              </select>
            </div>

            {/* Structure Category Selector */}
            <div>
              <label htmlFor="structure-select" className="block text-xs font-medium text-[#6E6E73] mb-2 uppercase tracking-wider">
                Structure Category
              </label>
              <select
                id="structure-select"
                value={selectedStructureType}
                onChange={(e) => setSelectedStructureType(e.target.value)}
                className="input-luxury text-xs py-[11px]"
              >
                <option value="all">All Category Types (Any)</option>
                <option value="land">🏞️ Vacant Land Plot</option>
                <option value="building">🏡 Plot with Building/Structure</option>
              </select>
            </div>

            {/* Min Area Slider */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="area-range" className="text-xs font-medium text-[#6E6E73] uppercase tracking-wider">
                  Min Land Area (Sq Ft)
                </label>
                <span className="text-xs font-mono font-medium text-[#1D1D1F]">
                  {minSqft === 0 ? 'Any Sizing' : `${minSqft.toLocaleString('en-IN')} sqft`}
                </span>
              </div>
              <input
                id="area-range"
                type="range"
                min="0"
                max="120000"
                step="2000"
                value={minSqft}
                onChange={(e) => setMinSqft(parseInt(e.target.value))}
                className="w-full accent-[#2563EB] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#6E6E73] mt-1">
                <span>0 sqft</span>
                <span>60,000 sqft</span>
                <span>1,20,000 sqft</span>
              </div>
            </div>

            {/* Max Price Slider */}
            {currentUser.role !== 'map_no_price' && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="budget-range" className="text-xs font-medium text-[#6E6E73] uppercase tracking-wider">
                    Max Capital Budget
                  </label>
                  <span className="text-xs font-mono font-medium text-[#1D1D1F]">
                    {formatINR(maxBudget)}
                  </span>
                </div>
                <input
                  id="budget-range"
                  type="range"
                  min="10000000" // 1 Crore
                  max="300000000" // 30 Crores
                  step="5000000"
                  value={maxBudget}
                  onChange={(e) => setMaxBudget(parseInt(e.target.value))}
                  className="w-full accent-[#2563EB] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#6E6E73] mt-1">
                  <span>₹1.0 Cr</span>
                  <span>₹15.0 Cr</span>
                  <span>₹30.0 Cr</span>
                </div>
              </div>
            )}

            {/* Action Toggles */}
            <div className="flex items-end justify-end gap-3 md:col-span-3">
              <button
                id="reset-filters-btn"
                type="button"
                onClick={handleResetFilters}
                className="btn-premium btn-secondary-luxury text-xs py-2 px-4"
              >
                Reset All
              </button>
              <button
                id="apply-filters-btn"
                type="button"
                onClick={() => setShowFilters(false)}
                className="btn-premium btn-primary-luxury text-xs py-2 px-4 bg-[#2563EB] border-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Property Grids */}
      {filteredLocations.length > 0 ? (
        <div className="property-grid" id="properties-grid-list">
          {filteredLocations.map((loc) => {
            const hasAccess = currentUser.role !== 'map_no_price';
            const isSold = loc.status === 'sold';
            const isBuilding = loc.structureType === 'building';
            
            return (
              <div
                key={loc.id}
                id={`property-card-${loc.id}`}
                className={`group bg-white rounded-2xl overflow-hidden border border-neutral-100 shadow-sm hover:shadow-xl transition-luxury flex flex-col h-full relative ${
                  isSold ? 'opacity-90' : ''
                }`}
              >
                {/* SOLD/AVAILABLE STATUS BADGE OVERLAY */}
                {isSold ? (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-red-200 text-red-600 text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-20 flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    SOLD
                  </div>
                ) : (
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-emerald-200 text-emerald-700 text-[9.5px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-20 flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    AVAILABLE
                  </div>
                )}

                {/* Visual Image Banner with hover zoom */}
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-100">
                  {loc.images && loc.images.length > 0 ? (
                    <img
                      src={loc.images[0]}
                      alt={loc.name}
                      referrerPolicy="no-referrer"
                      className="object-cover w-full h-full group-hover:scale-105 transition-all duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-400 gap-2 p-4">
                      <Layers className="w-8 h-8 text-neutral-300 stroke-1" />
                      <span className="text-[11px] font-medium uppercase tracking-wider">No visual asset</span>
                    </div>
                  )}
                </div>

                {/* Card Content Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    {/* Geography Node */}
                    <div className="flex items-center gap-1 text-[#6E6E73] text-xs mb-2">
                      <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span className="font-semibold text-neutral-700">{loc.address || getCityName(loc.cityId)}</span>
                    </div>

                    {/* Plot Title */}
                    <h4 className="text-xl font-serif text-[#1D1D1F] font-semibold tracking-tight leading-snug group-hover:text-[#2563EB] transition duration-200">
                      {loc.name}
                    </h4>

                    {/* Mini Spec Badges */}
                    <div className="grid grid-cols-2 gap-3 my-4 border-y border-neutral-100 py-3.5">
                      <div className="flex items-center gap-2">
                        <Minimize2 className="w-4 h-4 text-[#6E6E73] stroke-1" />
                        <div>
                          <div className="text-[9px] text-[#6E6E73] uppercase tracking-wider font-medium">Area Sizing</div>
                          <div className="text-xs font-mono font-medium text-[#1D1D1F]">{formatSqft(loc.sqft)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Route className="w-4 h-4 text-[#6E6E73] stroke-1" />
                        <div>
                          <div className="text-[9px] text-[#6E6E73] uppercase tracking-wider font-medium">Access Road</div>
                          <div className="text-xs font-medium text-[#1D1D1F] truncate max-w-[110px]">{loc.roadAccess || 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Owner Summary (Admin or Std User only) with Details Below Owner */}
                    <div className="bg-neutral-50 rounded-xl p-3.5 flex flex-col gap-2.5 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-[#6E6E73] uppercase tracking-wider block font-medium">Landed Owner</span>
                          <span className="text-xs font-semibold text-[#1D1D1F]">{loc.customerName}</span>
                        </div>
                      </div>
                      
                      {/* Zoning, Category and Structure Type Details placed below Landed Owner details */}
                      <div className="border-t border-neutral-200/50 pt-2 flex flex-wrap gap-1.5 text-[9.5px]">
                        <span className="bg-[#2563EB]/10 text-[#2563EB] font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                          {loc.zoned}
                        </span>
                        <span className="bg-neutral-950/10 text-neutral-800 font-bold tracking-wider uppercase px-2 py-0.5 rounded">
                          {loc.type}
                        </span>
                        <span className="bg-neutral-600/10 text-neutral-600 font-semibold tracking-wider uppercase px-2 py-0.5 rounded">
                          {isBuilding ? 'With Building/Structure' : 'Vacant Land Plot'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Row */}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-2">
                    {hasAccess ? (
                      <div>
                        <span className="text-[9px] text-[#6E6E73] uppercase tracking-wider block font-medium">Capital Valuation</span>
                        <span className={`text-base md:text-lg font-serif font-bold text-[#2563EB] ${isSold ? 'line-through text-neutral-400' : ''}`}>
                          {formatINR(loc.price, currentUser.role)}
                        </span>
                        {/* Price per sqft */}
                        {loc.price && loc.sqft && (
                          <span className="text-[10px] text-[#6E6E73] font-mono block mt-0.5 font-medium">
                            ₹{(loc.pricePerSqft || Math.round(Number(loc.price) / loc.sqft)).toLocaleString('en-IN')}/sqft
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Price is restricted: show an empty div or nothing so it aligns Map Details correctly */
                      <div />
                    )}

                    <button
                      id={`view-map-detail-btn-${loc.id}`}
                      type="button"
                      onClick={() => onSelectProperty(loc)}
                      className="btn-premium btn-primary-luxury text-xs py-2 px-3.5 gap-1.5 bg-[#2563EB] border-[#2563EB] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] dark:hover:bg-[#1D4ED8]"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Map Details</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200/60 p-8 max-w-xl mx-auto shadow-sm" id="filter-no-results">
          <Layers className="w-12 h-12 text-[#2563EB] stroke-1 mx-auto mb-4" />
          {locations.length === 0 ? (
            <>
              <h4 className="text-xl font-serif font-semibold text-[#1D1D1F]">
                No Land Assets Registered
              </h4>
              <p className="text-sm text-[#6E6E73] mt-2 leading-relaxed">
                There are no land assets or portfolios currently registered in the database.
                {currentUser.role === 'admin' 
                  ? ' Get started by registering your first luxury property plot.' 
                  : ' Please contact an administrator to register new assets.'}
              </p>
              {currentUser.role === 'admin' && onNavigateToAdminAddPlot && (
                <button
                  id="add-first-asset-empty-btn"
                  type="button"
                  onClick={onNavigateToAdminAddPlot}
                  className="btn-premium btn-primary-luxury text-xs mt-6 bg-[#2563EB] border-2 border-[#2563EB] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] font-bold py-3 px-6 rounded-2xl cursor-pointer"
                >
                  Add an Asset
                </button>
              )}
            </>
          ) : (
            <>
              <h4 className="text-xl font-serif font-semibold text-[#1D1D1F]">
                No Land Holdings Match
              </h4>
              <p className="text-sm text-[#6E6E73] mt-2 leading-relaxed">
                There are no portfolios found with your specified filters. Adjust your budget range, geographic hub, or zoning type to refine your exploration.
              </p>
              <div className="flex flex-wrap gap-3 justify-center mt-6">
                <button
                  id="clear-filters-empty-btn"
                  type="button"
                  onClick={handleResetFilters}
                  className="btn-premium btn-secondary-luxury text-xs py-2.5 px-4.5 border border-neutral-200 text-neutral-600 rounded-xl hover:bg-neutral-50 transition font-semibold cursor-pointer"
                >
                  Clear All Search Settings
                </button>
                {currentUser.role === 'admin' && onNavigateToAdminAddPlot && (
                  <button
                    id="add-asset-filtered-empty-btn"
                    type="button"
                    onClick={onNavigateToAdminAddPlot}
                    className="btn-premium btn-primary-luxury text-xs py-2.5 px-4.5 bg-[#2563EB] border border-[#2563EB] text-white hover:bg-[#1D4ED8] hover:border-[#1D4ED8] rounded-xl font-semibold cursor-pointer"
                  >
                    Add an Asset
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
