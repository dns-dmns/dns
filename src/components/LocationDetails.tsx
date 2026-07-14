/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Location, User } from '../types';
import { formatINR, formatSqft } from '../utils/db';
import { X, ChevronLeft, ChevronRight, Play, Maximize2, MapPin, Minimize2, Route, Calendar, Phone, Mail } from 'lucide-react';

interface LocationDetailsProps {
  property: Location;
  currentUser: User;
  onClose: () => void;
  startIndex?: number;
}

export default function LocationDetails({
  property,
  currentUser,
  onClose,
  startIndex = 0,
}: LocationDetailsProps) {
  const [activeIndex, setActiveIndex] = useState<number>(startIndex);
  const mediaItems = [
    ...(property.images || []).map((img) => ({ type: 'image' as const, url: img })),
    ...(property.videos || []).map((vid) => ({ type: 'video' as const, url: vid })),
  ];

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % mediaItems.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  return (
    <div
      className="fixed inset-0 bg-[#1D1D1F]/98 backdrop-blur-xl z-[2005] flex flex-col justify-between animate-fade-in text-white"
      id="fullscreen-media-gallery"
    >
      {/* Top Bar actions */}
      <div className="p-5 flex items-center justify-between border-b border-white/10 relative z-[2006] bg-gradient-to-b from-black/50 to-transparent">
        <div>
          <span className="text-[10px] text-[#2563EB] uppercase tracking-widest font-bold block">
            LuxeEstate Sovereign Gallery
          </span>
          <h2 className="text-lg font-serif font-bold text-white truncate max-w-md sm:max-w-xl md:max-w-2xl mt-0.5">
            {property.name}
          </h2>
        </div>

        {/* High-contrast Red Close trigger labeled exactly "Close Gallery" */}
        <button
          id="close-gallery-btn"
          onClick={onClose}
          className="btn-premium bg-[#FF453A] hover:bg-[#FF453A]/90 text-white font-bold text-xs uppercase py-2 px-5 rounded-full flex items-center gap-2 border border-[#FF453A] shadow-md hover:scale-105 active:scale-95 transition-luxury shrink-0"
        >
          <X className="w-4 h-4" />
          <span>Close Gallery</span>
        </button>
      </div>

      {/* Main viewport - Left/Right arrows and primary asset display */}
      <div className="flex-grow flex items-center justify-between px-4 relative z-[2006]" id="gallery-carousel-viewport">
        {mediaItems.length > 1 && (
          <button
            id="gallery-prev-btn"
            onClick={handlePrev}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 shrink-0"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        {/* Active Media Container */}
        <div className="flex-grow max-w-4xl mx-auto h-[60vh] flex items-center justify-center p-4">
          {mediaItems.length > 0 ? (
            mediaItems[activeIndex].type === 'image' ? (
              <img
                src={mediaItems[activeIndex].url}
                alt={`${property.name} - Slide ${activeIndex + 1}`}
                referrerPolicy="no-referrer"
                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-fade-in"
              />
            ) : (
              <video
                src={mediaItems[activeIndex].url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-2xl shadow-2xl animate-fade-in"
              />
            )
          ) : (
            <div className="text-center text-neutral-400">
              <span className="text-sm font-mono block">No luxury media registered for this holding.</span>
            </div>
          )}
        </div>

        {mediaItems.length > 1 && (
          <button
            id="gallery-next-btn"
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition hover:scale-105 shrink-0"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom control panel / Carousel navigation */}
      <div className="bg-gradient-to-t from-black/80 to-transparent p-6 border-t border-white/5 relative z-[2006]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Thumbnails list */}
          <div className="flex gap-2.5 overflow-x-auto pb-2 max-w-full" id="gallery-thumbnails">
            {mediaItems.map((item, idx) => (
              <button
                key={idx}
                id={`gallery-thumb-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden shrink-0 transition-all duration-300 relative border-2 ${
                  idx === activeIndex ? 'border-[#2563EB] scale-105 shadow-md' : 'border-white/20 opacity-50 hover:opacity-80'
                }`}
              >
                {item.type === 'image' ? (
                  <img src={item.url} alt="" referrerPolicy="no-referrer" className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <Play className="w-4 h-4 text-[#2563EB]" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Quick Specifications Detail Card overlaying the gallery */}
          <div className="glass-panel-dark rounded-2xl p-4 min-w-[320px] text-left shrink-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-[#2563EB] font-bold uppercase tracking-widest">Sovereign Plot Specifications</span>
              <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white font-medium">
                {activeIndex + 1} / {mediaItems.length}
              </span>
            </div>
            
            <div className="space-y-1.5 text-xs text-neutral-300">
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-light text-neutral-400">Total Area</span>
                <span className="font-mono font-medium text-white">{formatSqft(property.sqft)}</span>
              </div>
              {property.surveyNumber && (
                <div className="flex justify-between border-b border-white/5 pb-1 font-mono">
                  <span className="font-light text-neutral-400 font-sans">Survey Number</span>
                  <span className="font-medium text-white">{property.surveyNumber}</span>
                </div>
              )}
              {property.plotNumber && (
                <div className="flex justify-between border-b border-white/5 pb-1 font-mono">
                  <span className="font-light text-neutral-400 font-sans">Plot Number</span>
                  <span className="font-medium text-white">{property.plotNumber}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-light text-neutral-400">Sovereign Owner</span>
                <span className="font-medium text-white">{property.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-light text-neutral-400">Land Category</span>
                <span className="font-medium text-white">{property.type}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-light text-neutral-400">Landed Zoning</span>
                <span className="font-medium text-white">{property.zoned} Zone</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-light text-neutral-400">Structure Type</span>
                <span className="font-medium text-white">
                  {property.structureType === 'building' ? 'Plot with Building' : 'Vacant Land Plot'}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1">
                <span className="font-light text-neutral-400">Status</span>
                <span className={`font-semibold ${property.status === 'sold' ? 'text-red-400' : 'text-green-400'}`}>
                  {property.status === 'sold' ? '🔴 SOLD OUT' : '🟢 AVAILABLE'}
                </span>
              </div>
              {currentUser.role !== 'map_no_price' && (
                <>
                  <div className="flex justify-between pt-1 font-serif text-sm border-b border-white/5 pb-1">
                    <span className="text-[#2563EB] font-semibold">Estate Valuation</span>
                    <span className={`font-bold text-[#2563EB] ${property.status === 'sold' ? 'line-through opacity-60' : ''}`}>
                      {formatINR(property.price)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 font-mono text-xs">
                    <span className="text-neutral-400">Price per Sq Ft</span>
                    <span className="text-white font-medium">
                      ₹{(property.pricePerSqft || Math.round(Number(property.price) / property.sqft)).toLocaleString('en-IN')}/sqft
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
