/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Location, City, User } from '../types';
import { formatINR, formatSqft } from '../utils/db';
import { MapPin, Users, Building, Plus, Edit3, Trash2, Shield, Eye, Lock, Globe, Phone, Contact } from 'lucide-react';
import { CityModal, UserModal, LocationModal } from './Modals';

interface AdminPanelProps {
  locations: Location[];
  cities: City[];
  users: User[];
  currentUser: User;
  onSaveLocation: (loc: Location) => void;
  onDeleteLocation: (id: string) => void;
  onSaveCity: (city: City) => void;
  onDeleteCity: (id: string) => void;
  onSaveUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  initialAction?: 'add-plot' | null;
  onClearInitialAction?: () => void;
}

type AdminTab = 'locations' | 'cities' | 'users';

export default function AdminPanel({
  locations,
  cities,
  users,
  currentUser,
  onSaveLocation,
  onDeleteLocation,
  onSaveCity,
  onDeleteCity,
  onSaveUser,
  onDeleteUser,
  initialAction,
  onClearInitialAction,
}: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('locations');

  // Custom Confirmation Dialog State
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Custom Alert Dialog State
  const [alertState, setAlertState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, confirmLabel = 'Confirm Delete') => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      confirmLabel,
      onConfirm,
    });
  };

  const triggerAlert = (title: string, message: string) => {
    setAlertState({
      isOpen: true,
      title,
      message,
    });
  };

  // Modal Control States
  const [editingCity, setEditingCity] = useState<City | null>(null);
  const [showCityForm, setShowCityForm] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [showLocationForm, setShowLocationForm] = useState(false);

  // Trigger initial action if supplied (e.g., deep-link navigation from Empty/No Asset states)
  useEffect(() => {
    if (initialAction === 'add-plot') {
      setActiveTab('locations');
      setEditingLocation(null);
      setShowLocationForm(true);
      if (onClearInitialAction) {
        onClearInitialAction();
      }
    }
  }, [initialAction, onClearInitialAction]);

  // Helper mapping cities
  const getCityDetails = (cityId: string) => {
    return cities.find((c) => c.id === cityId);
  };

  const handleEditCity = (city: City) => {
    setEditingCity(city);
    setShowCityForm(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserForm(true);
  };

  const handleEditLocation = (loc: Location) => {
    setEditingLocation(loc);
    setShowLocationForm(true);
  };

  const handleAddNewCity = () => {
    setEditingCity(null);
    setShowCityForm(true);
  };

  const handleAddNewUser = () => {
    setEditingUser(null);
    setShowUserForm(true);
  };

  const handleAddNewLocation = () => {
    setEditingLocation(null);
    setShowLocationForm(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" id="admin-panel-container">
      {/* Page Header */}
      <div className="mb-8 border-b border-neutral-200/60 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#2563EB] font-bold block mb-1">
            Sovereign Admin Console
          </span>
          <h2 className="text-3xl font-serif text-[#1D1D1F] tracking-tight font-bold">
            Real Estate Master Administration
          </h2>
          <p className="text-[#6E6E73] text-xs mt-1 font-light">
            Keep credentials, empty land plot specifications, and geographic coordinates aligned in real-time.
          </p>
        </div>

        {/* Dynamic Action Buttons depending on Tab */}
        <div className="self-start md:self-auto">
          {activeTab === 'locations' && (
            <button
              id="admin-add-location-btn"
              onClick={handleAddNewLocation}
              className="btn-premium btn-primary-luxury text-xs py-2.5 px-5 gap-2 bg-[#2563EB] border-[#2563EB] text-white hover:bg-blue-700 hover:border-blue-700 font-bold rounded-2xl shadow-sm hover:shadow transition duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Plot</span>
            </button>
          )}

          {activeTab === 'cities' && (
            <button
              id="admin-add-city-btn"
              onClick={handleAddNewCity}
              className="btn-premium btn-primary-luxury text-xs py-2.5 px-5 gap-2 bg-[#2563EB] border-[#2563EB] text-white hover:bg-blue-700 hover:border-blue-700 font-bold rounded-2xl shadow-sm hover:shadow transition duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Hub</span>
            </button>
          )}

          {activeTab === 'users' && (
            <button
              id="admin-add-user-btn"
              onClick={handleAddNewUser}
              className="btn-premium btn-primary-luxury text-xs py-2.5 px-5 gap-2 bg-[#2563EB] border-[#2563EB] text-white hover:bg-blue-700 hover:border-blue-700 font-bold rounded-2xl shadow-sm hover:shadow transition duration-200"
            >
              <Plus className="w-4 h-4" />
              <span>Add User Profile</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-neutral-200 mb-8 overflow-x-auto pb-1" id="admin-tabs">
        <button
          id="tab-locations-btn"
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 shrink-0 ${
            activeTab === 'locations'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Properties Listings ({locations.length})</span>
        </button>

        <button
          id="tab-cities-btn"
          onClick={() => setActiveTab('cities')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 shrink-0 ${
            activeTab === 'cities'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Geographic Hubs ({cities.length})</span>
        </button>

        <button
          id="tab-users-btn"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-3 px-5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all duration-200 shrink-0 ${
            activeTab === 'users'
              ? 'border-[#2563EB] text-[#2563EB]'
              : 'border-transparent text-[#6E6E73] hover:text-[#1D1D1F]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Security Profiles ({users.length})</span>
        </button>
      </div>

      {/* ACTIVE TAB MANAGER TABLES */}
      <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden" id="admin-table-wrapper">
        {/* ======================================================= */}
        {/* TAB 1: PROPERTIES (LOCATIONS) */}
        {/* ======================================================= */}
        {activeTab === 'locations' && (
          <div className="overflow-x-auto" id="admin-table-locations">
            {locations.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/75 border-b border-neutral-100 uppercase tracking-wider text-[#6E6E73] font-medium font-sans">
                    <th className="py-4 px-6">Plot Details</th>
                    <th className="py-4 px-6">Associated Hub</th>
                    <th className="py-4 px-6">Sizing & Zoning</th>
                    <th className="py-4 px-6">Landed Owner</th>
                    <th className="py-4 px-6">Capital Price</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[#1D1D1F]">
                  {locations.map((loc) => {
                    const cInfo = getCityDetails(loc.cityId);
                    const isSold = loc.status === 'sold';
                    const isBuilding = loc.structureType === 'building';
                    
                    return (
                      <tr key={loc.id} className="hover:bg-neutral-50/40 transition duration-150">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-sm text-[#1D1D1F]">{loc.name}</div>
                          <div className="text-[10px] text-[#6E6E73] mt-0.5 font-mono">
                            GPS: {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
                          </div>
                        </td>
                        <td className="py-4 px-6 font-medium text-neutral-600">
                          {cInfo ? `${cInfo.name}, ${cInfo.state}` : 'Unknown Hub'}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-mono font-medium">{formatSqft(loc.sqft)}</div>
                          <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[200px]">
                            <span className="text-[9px] font-semibold bg-neutral-100 text-neutral-700 uppercase px-1.5 py-0.5 rounded">
                              {loc.zoned}
                            </span>
                            <span className="text-[9px] font-semibold bg-[#2563EB]/10 text-[#2563EB] uppercase px-1.5 py-0.5 rounded">
                              {loc.type}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                              isSold ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
                            }`}>
                              {isSold ? 'Sold' : 'Available'}
                            </span>
                            <span className="text-[9px] font-semibold bg-neutral-900 text-white uppercase px-1.5 py-0.5 rounded">
                              {isBuilding ? 'Building' : 'Land'}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-semibold flex items-center gap-1">
                            <Contact className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{loc.customerName}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-serif font-bold text-sm text-[#2563EB]">
                          {formatINR(loc.price)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              id={`edit-loc-${loc.id}`}
                              onClick={() => handleEditLocation(loc)}
                              className="p-2 text-[#6E6E73] hover:text-[#2563EB] hover:bg-neutral-50 rounded-full transition"
                              title="Edit specifications"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              id={`delete-loc-${loc.id}`}
                              onClick={() => {
                                triggerConfirm(
                                  'Deregister Holding',
                                  `Are you sure you want to deregister the property holding "${loc.name}"? This action cannot be undone.`,
                                  () => onDeleteLocation(loc.id)
                                );
                              }}
                              className="p-2 text-[#6E6E73] hover:text-[#FF453A] hover:bg-neutral-50 rounded-full transition"
                              title="Delete listing"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-neutral-400 font-light">
                No active properties listed in database. Click "Register New Plot" above.
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 2: GEOGRAPHIC HUBS (CITIES) */}
        {/* ======================================================= */}
        {activeTab === 'cities' && (
          <div className="overflow-x-auto" id="admin-table-cities">
            {cities.length > 0 ? (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-50/75 border-b border-neutral-100 uppercase tracking-wider text-[#6E6E73] font-medium font-sans">
                    <th className="py-4 px-6">Hub Identifier</th>
                    <th className="py-4 px-6">Region / State</th>
                    <th className="py-4 px-6">Country Origin</th>
                    <th className="py-4 px-6">Center GPS Anchor</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-[#1D1D1F]">
                  {cities.map((city) => (
                    <tr key={city.id} className="hover:bg-neutral-50/40 transition duration-150">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-sm text-[#1D1D1F] flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#C7A15A]" />
                          <span>{city.name}</span>
                        </div>
                        <div className="text-[9px] text-[#6E6E73] mt-0.5 font-mono uppercase">ID: {city.id}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-neutral-600">
                        {city.state}
                      </td>
                      <td className="py-4 px-6 font-light">
                        {city.country}
                      </td>
                      <td className="py-4 px-6 font-mono text-[#6E6E73]">
                        {city.lat.toFixed(5)}, {city.lng.toFixed(5)}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            id={`edit-city-${city.id}`}
                            onClick={() => handleEditCity(city)}
                            className="p-2 text-[#6E6E73] hover:text-[#0071E3] hover:bg-neutral-50 rounded-full transition"
                            title="Edit geographical details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-city-${city.id}`}
                            onClick={() => {
                              const relatedCount = locations.filter((l) => l.cityId === city.id).length;
                              if (relatedCount > 0) {
                                triggerAlert(
                                  'Action Denied',
                                  `Geographic Hub "${city.name}" has ${relatedCount} active property listings attached. Please re-assign or de-register those listings before removing this hub.`
                                );
                                return;
                              }
                              triggerConfirm(
                                'Remove Geographic Hub',
                                `Are you sure you want to remove the geographic hub "${city.name}" from active mapping indexing? This action cannot be undone.`,
                                () => onDeleteCity(city.id)
                              );
                            }}
                            className="p-2 text-[#6E6E73] hover:text-[#FF453A] hover:bg-neutral-50 rounded-full transition"
                            title="Delete hub"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-16 text-center text-neutral-400 font-light">
                No active hubs registered. Click "Register New Hub" to initiate coordinates.
              </div>
            )}
          </div>
        )}

        {/* ======================================================= */}
        {/* TAB 3: USER PROFILES */}
        {/* ======================================================= */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto" id="admin-table-users">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-neutral-50/75 border-b border-neutral-100 uppercase tracking-wider text-[#6E6E73] font-medium font-sans">
                  <th className="py-4 px-6">Identity Person</th>
                  <th className="py-4 px-6">Username Credential</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Security Password</th>
                  <th className="py-4 px-6">Operational Clearance</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-[#1D1D1F]">
                {users.map((u) => {
                  const isCurrentUser = currentUser.id === u.id;
                  return (
                    <tr key={u.id} className="hover:bg-neutral-50/40 transition duration-150">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-sm text-[#1D1D1F] flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 font-medium text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <span>{u.name}</span>
                          {isCurrentUser && (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase">
                              Active You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 font-mono font-medium text-neutral-600">
                        {u.username}
                      </td>
                      <td className="py-4 px-6 font-light">
                        {u.email}
                      </td>
                      <td className="py-4 px-6 font-mono text-neutral-400 font-medium">
                        {u.password}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5">
                          {u.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                              <Shield className="w-3 h-3" />
                              Administrator
                            </span>
                          ) : u.role === 'map_no_price' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-800 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                              <Lock className="w-3 h-3" />
                              No Price Explorer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                              <Eye className="w-3 h-3" />
                              Standard Client
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            id={`edit-user-${u.id}`}
                            onClick={() => handleEditUser(u)}
                            className="p-2 text-[#6E6E73] hover:text-[#2563EB] hover:bg-neutral-50 rounded-full transition"
                            title="Modify role or password"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          
                          {/* Disable self-deletion to prevent administrative lockout */}
                          <button
                            id={`delete-user-${u.id}`}
                            disabled={isCurrentUser}
                            onClick={() => {
                              triggerConfirm(
                                'Revoke User Credentials',
                                `Are you sure you want to revoke and delete all security credentials for "${u.name}"?`,
                                () => onDeleteUser(u.id)
                              );
                            }}
                            className="p-2 text-[#6E6E73] hover:text-[#FF453A] hover:bg-neutral-50 disabled:opacity-30 disabled:hover:bg-transparent disabled:text-neutral-300 rounded-full transition"
                            title={isCurrentUser ? ' lockout prevention' : 'Delete user profile'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RENDER MODAL CONDITIONS */}
      {showCityForm && (
        <CityModal
          city={editingCity}
          onClose={() => {
            setShowCityForm(false);
            setEditingCity(null);
          }}
          onSave={(city) => {
            onSaveCity(city);
            setShowCityForm(false);
            setEditingCity(null);
          }}
        />
      )}

      {showUserForm && (
        <UserModal
          user={editingUser}
          onClose={() => {
            setShowUserForm(false);
            setEditingUser(null);
          }}
          onSave={(u) => {
            onSaveUser(u);
            setShowUserForm(false);
            setEditingUser(null);
          }}
        />
      )}

      {showLocationForm && (
        <LocationModal
          location={editingLocation}
          cities={cities}
          onClose={() => {
            setShowLocationForm(false);
            setEditingLocation(null);
          }}
          onSave={(loc) => {
            onSaveLocation(loc);
            setShowLocationForm(false);
            setEditingLocation(null);
          }}
        />
      )}
      {/* CUSTOM CONFIRM DIALOG MODAL */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[2000] animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 transform scale-100 transition-all">
            <h3 className="text-lg font-serif font-bold text-[#1D1D1F] mb-2">{confirmState.title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">{confirmState.message}</p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setConfirmState(prev => ({ ...prev, isOpen: false }))}
                className="py-2.5 px-5 border border-neutral-200 text-neutral-600 font-semibold rounded-2xl hover:bg-neutral-50 transition text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmState.onConfirm();
                  setConfirmState(prev => ({ ...prev, isOpen: false }));
                }}
                className="py-2.5 px-5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-2xl transition text-xs shadow-md shadow-red-500/10 cursor-pointer"
              >
                {confirmState.confirmLabel || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM ALERT DIALOG MODAL */}
      {alertState.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[2000] animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 transform scale-100 transition-all">
            <h3 className="text-lg font-serif font-bold text-red-600 mb-2">{alertState.title}</h3>
            <p className="text-neutral-500 text-sm leading-relaxed mb-6">{alertState.message}</p>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setAlertState(prev => ({ ...prev, isOpen: false }))}
                className="py-2.5 px-5 bg-neutral-900 hover:bg-neutral-800 text-white font-semibold rounded-2xl transition text-xs shadow-md cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
