/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, City, Location } from './types';
import { 
  initDB, 
  getCurrentUser, 
  setCurrentUser as dbSetCurrentUser, 
  getUsers, 
  saveUsers, 
  getCities, 
  saveCities, 
  getLocations, 
  saveLocations 
} from './utils/db';

import Login from './components/Login';
import Welcome from './components/Welcome';
import MapExplorer from './components/MapExplorer';
import LocationDetails from './components/LocationDetails';
import AdminPanel from './components/AdminPanel';
import AcquisitionCalculator from './components/AcquisitionCalculator';
import SketchPad from './components/SketchPad';

import { Compass, Map, ShieldAlert, LogOut, Shield, MapPin, EyeOff, Sparkles, User as UserIcon, Calculator, Sun, Moon, Edit3 } from 'lucide-react';

type ViewMode = 'home' | 'map' | 'calculator' | 'admin' | 'sketch';

export default function App() {
  // Session States
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Database States
  const [locations, setLocations] = useState<Location[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Navigation / Interactive States
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [selectedPropertyForMap, setSelectedPropertyForMap] = useState<Location | null>(null);

  // Fullscreen Media State
  const [fullscreenProperty, setFullscreenProperty] = useState<Location | null>(null);
  const [fullscreenStartIndex, setFullscreenStartIndex] = useState<number>(0);

  // Initial Action state for Admin Panel deep linking
  const [adminInitialAction, setAdminInitialAction] = useState<'add-plot' | null>(null);

  const handleNavigateToAdminAddPlot = () => {
    setViewMode('admin');
    setAdminInitialAction('add-plot');
  };

  // Apply Theme - Locked to Light Mode
  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  // Scroll to top on view mode change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [viewMode]);

  // Initialize DB and fetch session
  useEffect(() => {
    initDB();
    const sessionUser = getCurrentUser();
    setCurrentUser(sessionUser);

    setLocations(getLocations());
    setCities(getCities());
    setUsers(getUsers());
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    // Refresh collections
    setLocations(getLocations());
    setCities(getCities());
    setUsers(getUsers());
    setViewMode('home');
  };

  const handleLogout = () => {
    dbSetCurrentUser(null);
    setCurrentUser(null);
    setViewMode('home');
    setSelectedPropertyForMap(null);
    setFullscreenProperty(null);
  };

  // Location/Property Listings Save & Delete
  const handleSaveLocation = (loc: Location) => {
    const updated = [...locations];
    const index = updated.findIndex((l) => l.id === loc.id);
    if (index >= 0) {
      updated[index] = loc;
    } else {
      updated.push(loc);
    }
    setLocations(updated);
    saveLocations(updated);

    // If editing currently highlighted property, keep details synced
    if (selectedPropertyForMap && selectedPropertyForMap.id === loc.id) {
      setSelectedPropertyForMap(loc);
    }
  };

  const handleDeleteLocation = (id: string) => {
    const updated = locations.filter((l) => l.id !== id);
    setLocations(updated);
    saveLocations(updated);

    if (selectedPropertyForMap && selectedPropertyForMap.id === id) {
      setSelectedPropertyForMap(null);
    }
  };

  // Cities Save & Delete
  const handleSaveCity = (city: City) => {
    const updated = [...cities];
    const index = updated.findIndex((c) => c.id === city.id);
    if (index >= 0) {
      updated[index] = city;
    } else {
      updated.push(city);
    }
    setCities(updated);
    saveCities(updated);
  };

  const handleDeleteCity = (id: string) => {
    const updated = cities.filter((c) => c.id !== id);
    setCities(updated);
    saveCities(updated);
  };

  // Users Save & Delete
  const handleSaveUser = (u: User) => {
    const updated = [...users];
    const index = updated.findIndex((usr) => usr.id === u.id);
    if (index >= 0) {
      updated[index] = u;
    } else {
      updated.push(u);
    }
    setUsers(updated);
    saveUsers(updated);

    // If self editing, sync session user
    if (currentUser && currentUser.id === u.id) {
      setCurrentUser(u);
      dbSetCurrentUser(u);
    }
  };

  const handleDeleteUser = (id: string) => {
    if (currentUser && currentUser.id === id) {
      alert('Action Denied: You cannot delete your currently logged-in account.');
      return;
    }
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    saveUsers(updated);
  };

  const handleSelectPropertyForMap = (property: Location) => {
    setSelectedPropertyForMap(property);
    setViewMode('map');
  };

  const handleOpenFullscreenMedia = (property: Location, index: number) => {
    setFullscreenProperty(property);
    setFullscreenStartIndex(index);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F5F7] text-[#1D1D1F]">
        <div className="text-center">
          <Compass className="w-12 h-12 text-[#2563EB] animate-spin mx-auto stroke-1" />
          <h3 className="text-xl font-serif font-semibold mt-4">DMNS Plots Service</h3>
          <p className="text-xs text-[#6E6E73] mt-2 font-mono">Verifying operational clearance...</p>
        </div>
      </div>
    );
  }

  // Session verification
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] flex flex-col" id="app-root-layout">
      
      {/* 72PX FIXED STICKY NAVIGATION HEADER */}
      <header 
        className="sticky top-0 h-[72px] bg-white/80 backdrop-blur-md border-b border-neutral-200/50 flex items-center justify-between px-6 z-[1000] select-none"
        id="app-sticky-header"
      >
        {/* Brand */}
        <button 
          onClick={() => { setViewMode('home'); setSelectedPropertyForMap(null); }}
          className="flex items-center gap-2 text-left hover:opacity-90 transition cursor-pointer focus:outline-none"
          id="nav-brand-logo"
        >
          <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white font-serif font-bold text-base shadow-sm">
            D
          </div>
          <div>
            <h1 className="text-sm lg:text-base font-serif font-bold tracking-tight text-[#1D1D1F] leading-none">
              DMNS Plots
            </h1>
            <span className="text-[9px] text-[#2563EB] uppercase tracking-widest font-semibold font-sans block mt-1">
              Plots Service
            </span>
          </div>
        </button>

        {/* Center Segmented Nav Control */}
        <nav className="hidden lg:flex items-center bg-neutral-100 border border-neutral-200/50 p-1 rounded-2xl gap-1 shadow-inner" id="nav-navigation-links">
          <button
            id="nav-home-btn"
            onClick={() => { setViewMode('home'); setSelectedPropertyForMap(null); }}
            className={`py-1.5 px-4.5 rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-wider text-[10px] font-bold flex items-center gap-2 focus:outline-none ${
              viewMode === 'home'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/10'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
            }`}
          >
            <Compass className={`w-3.5 h-3.5 transition-colors ${viewMode === 'home' ? 'text-[#2563EB]' : 'text-neutral-400'}`} />
            <span>Explore Holdings</span>
          </button>

          <button
            id="nav-map-btn"
            onClick={() => setViewMode('map')}
            className={`py-1.5 px-4.5 rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-wider text-[10px] font-bold flex items-center gap-2 focus:outline-none ${
              viewMode === 'map'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/10'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
            }`}
          >
            <Map className={`w-3.5 h-3.5 transition-colors ${viewMode === 'map' ? 'text-[#2563EB]' : 'text-neutral-400'}`} />
            <span>Interactive Mapping</span>
          </button>

          <button
            id="nav-calc-btn"
            onClick={() => setViewMode('calculator')}
            className={`py-1.5 px-4.5 rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-wider text-[10px] font-bold flex items-center gap-2 focus:outline-none ${
              viewMode === 'calculator'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/10'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
            }`}
          >
            <Calculator className={`w-3.5 h-3.5 transition-colors ${viewMode === 'calculator' ? 'text-[#2563EB]' : 'text-neutral-400'}`} />
            <span>Decision Planner</span>
          </button>

          <button
            id="nav-sketch-btn"
            onClick={() => setViewMode('sketch')}
            className={`py-1.5 px-4.5 rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-wider text-[10px] font-bold flex items-center gap-2 focus:outline-none ${
              viewMode === 'sketch'
                ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/10'
                : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
            }`}
          >
            <Edit3 className={`w-3.5 h-3.5 transition-colors ${viewMode === 'sketch' ? 'text-[#2563EB]' : 'text-neutral-400'}`} />
            <span>Sketch Studio</span>
          </button>

          {/* Administrative Desk - Admins ONLY */}
          {currentUser.role === 'admin' && (
            <button
              id="nav-admin-btn"
              onClick={() => setViewMode('admin')}
              className={`py-1.5 px-4.5 rounded-xl transition-all duration-200 cursor-pointer uppercase tracking-wider text-[10px] font-bold flex items-center gap-2 focus:outline-none ${
                viewMode === 'admin'
                  ? 'bg-white text-neutral-900 shadow-sm border border-neutral-200/10'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-white/40'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 transition-colors ${viewMode === 'admin' ? 'text-amber-500' : 'text-neutral-400'}`} />
              <span>Administrative Desk</span>
            </button>
          )}
        </nav>

        {/* Profile readout & Logout */}
        <div className="flex items-center gap-2 lg:gap-3.5" id="nav-profile-readout">
          {/* Circular User Avatar Only */}
          <div 
            className="w-9 h-9 rounded-full bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-sm shrink-0 border border-[#2563EB]/20 shadow-sm" 
            title={`${currentUser.name} (${currentUser.role})`}
          >
            {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <button
            id="nav-logout-btn"
            onClick={handleLogout}
            className="p-2 lg:p-2.5 rounded-xl bg-neutral-50 border border-neutral-200/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-[#6E6E73] transition duration-200 flex items-center justify-center cursor-pointer shrink-0 focus:outline-none"
            title="Log out of system"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* MOBILE LOWER NAVIGATION TAB BAR */}
      <div 
        className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex items-center justify-around px-4 z-[999] shadow-lg select-none"
        id="app-mobile-nav"
      >
        <button
          onClick={() => { setViewMode('home'); setSelectedPropertyForMap(null); }}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${viewMode === 'home' ? 'text-[#1D1D1F]' : 'text-neutral-400'}`}
        >
          <Compass className="w-5 h-5" />
          <span>Explore</span>
        </button>

        <button
          onClick={() => setViewMode('map')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${viewMode === 'map' ? 'text-[#1D1D1F]' : 'text-neutral-400'}`}
        >
          <Map className="w-5 h-5" />
          <span>Live Map</span>
        </button>

        <button
          onClick={() => setViewMode('calculator')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${viewMode === 'calculator' ? 'text-[#1D1D1F]' : 'text-neutral-400'}`}
        >
          <Calculator className="w-5 h-5" />
          <span>Planner</span>
        </button>

        <button
          onClick={() => setViewMode('sketch')}
          className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${viewMode === 'sketch' ? 'text-[#1D1D1F]' : 'text-neutral-400'}`}
        >
          <Edit3 className="w-5 h-5" />
          <span>Sketch</span>
        </button>

        {currentUser.role === 'admin' && (
          <button
            onClick={() => setViewMode('admin')}
            className={`flex flex-col items-center gap-1 text-[10px] font-semibold ${viewMode === 'admin' ? 'text-[#1D1D1F]' : 'text-neutral-400'}`}
          >
            <Shield className="w-5 h-5" />
            <span>Admin</span>
          </button>
        )}
      </div>

      {/* PRIMARY VIEWER WINDOW */}
      <main className="flex-grow pb-16 lg:pb-0" id="app-primary-viewport">
        {viewMode === 'home' && (
          <Welcome
            locations={locations}
            cities={cities}
            currentUser={currentUser}
            onSelectProperty={handleSelectPropertyForMap}
            onNavigateToMap={() => setViewMode('map')}
            onNavigateToAdminAddPlot={handleNavigateToAdminAddPlot}
          />
        )}

        {viewMode === 'map' && (
          <MapExplorer
            locations={locations}
            cities={cities}
            currentUser={currentUser}
            selectedProperty={selectedPropertyForMap}
            onSelectProperty={setSelectedPropertyForMap}
            onBackToHome={() => { setViewMode('home'); setSelectedPropertyForMap(null); }}
            onViewFullscreenMedia={handleOpenFullscreenMedia}
            onNavigateToAdminAddPlot={handleNavigateToAdminAddPlot}
          />
        )}

        {viewMode === 'calculator' && (
          <AcquisitionCalculator
            locations={locations}
            cities={cities}
            onSelectProperty={handleSelectPropertyForMap}
          />
        )}

        {viewMode === 'sketch' && (
          <SketchPad />
        )}

        {viewMode === 'admin' && currentUser.role === 'admin' && (
          <AdminPanel
            locations={locations}
            cities={cities}
            users={users}
            currentUser={currentUser}
            onSaveLocation={handleSaveLocation}
            onDeleteLocation={handleDeleteLocation}
            onSaveCity={handleSaveCity}
            onDeleteCity={handleDeleteCity}
            onSaveUser={handleSaveUser}
            onDeleteUser={handleDeleteUser}
            initialAction={adminInitialAction}
            onClearInitialAction={() => setAdminInitialAction(null)}
          />
        )}
      </main>

      {/* FULLSCREEN SAME-PAGE MEDIA VIEWER OVERLAY */}
      {fullscreenProperty && (
        <LocationDetails
          property={fullscreenProperty}
          currentUser={currentUser}
          startIndex={fullscreenStartIndex}
          onClose={() => {
            setFullscreenProperty(null);
            setFullscreenStartIndex(0);
          }}
        />
      )}

    </div>
  );
}
