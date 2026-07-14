/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, City, Location } from '../types';

// Pre-seeded Users
const DEFAULT_USERS: User[] = [
  {
    id: 'u_1',
    name: 'Dinesh',
    username: 'dinesh',
    email: 'dinesh@gmail.com',
    password: '123',
    role: 'admin',
  },
  {
    id: 'u_2',
    name: 'Map Explorer',
    username: 'mapuser',
    email: 'mapuser@cityexplorer.com',
    password: 'user123',
    role: 'map_no_price',
  },
  {
    id: 'u_3',
    name: 'Standard Guest',
    username: 'user',
    email: 'user@cityexplorer.com',
    password: '123',
    role: 'user',
  }
];

// Pre-seeded Cities
const DEFAULT_CITIES: City[] = [
  {
    id: 'c1',
    name: 'Bangalore',
    country: 'India',
    state: 'Karnataka',
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: 'c2',
    name: 'Chennai',
    country: 'India',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    id: 'c3',
    name: 'Tirupati',
    country: 'India',
    state: 'Andhra Pradesh',
    lat: 13.6284,
    lng: 79.4192,
  },
  {
    id: 'c4',
    name: 'Puttur',
    country: 'India',
    state: 'Andhra Pradesh',
    lat: 13.4390,
    lng: 79.5510,
  },
  {
    id: 'c5',
    name: 'Narayanavanam',
    country: 'India',
    state: 'Andhra Pradesh',
    lat: 13.4215,
    lng: 79.5815,
  }
];

// Pre-seeded luxury land properties
const DEFAULT_LOCATIONS: Location[] = [
  {
    id: 'l1',
    cityId: 'c1',
    name: 'Green Meadows Agricultural Plot',
    customerName: 'M. Ramakrishna',
    customerMobile: '+91 98450 12345',
    description: 'Beautiful 2.5-acre fertile agricultural holding located near Devanahalli. Ideal for organic farming, luxury estate manor, or private retreat. Accessible via a well-paved 30ft road, complete with standard electrical connection and active borewell.',
    lat: 13.2450,
    lng: 77.7120,
    price: '35000000', // ₹3,50,00,000
    type: 'Agricultural Land',
    zoned: 'Agricultural',
    roadAccess: '30ft Tar Road',
    beds: 0,
    baths: 0,
    sqft: 108900, // 2.5 acres
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    surveyNumber: '104/A',
    plotNumber: 'Plot 12'
  },
  {
    id: 'l2',
    cityId: 'c1',
    name: 'Whitefield Commercial Hub Corner',
    customerName: 'Luxe Ventures Ltd',
    customerMobile: '+91 80 4123 9999',
    description: 'Premium corner plot in the heart of Whitefield\'s premier commercial zone. 15,000 sq ft, absolute main road visibility, ideal for high-rise corporate office, retail complex or luxury hotel project.',
    lat: 12.9698,
    lng: 77.7499,
    price: '185000000', // ₹18,50,00,000
    type: 'Commercial Land',
    zoned: 'Commercial',
    roadAccess: '80ft Main Road',
    beds: 0,
    baths: 0,
    sqft: 15000,
    images: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1541480601022-2308c0f02487?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    surveyNumber: '42/C',
    plotNumber: 'Corner Suite 3'
  },
  {
    id: 'l3',
    cityId: 'c2',
    name: 'OMR Tech Corridor Plot',
    customerName: 'V. Srinivasan',
    customerMobile: '+91 94440 98765',
    description: 'Spacious commercial land parcel with excellent layout. Direct access from Old Mahabalipuram Road (OMR), fully zoned for IT/ITES and commercial developments. Outstanding capital appreciation potential and fast clearance status.',
    lat: 12.8425,
    lng: 80.2260,
    price: '245000000', // ₹24,50,00,000
    type: 'Commercial Land',
    zoned: 'Commercial',
    roadAccess: '100ft Double Road',
    beds: 0,
    baths: 0,
    sqft: 32000,
    images: [
      'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    surveyNumber: '89-2B',
    plotNumber: 'Tech Plot 8'
  },
  {
    id: 'l4',
    cityId: 'c2',
    name: 'East Coast Road Luxury Farm Plot',
    customerName: 'Anjali Krishnan',
    customerMobile: '+91 98840 54321',
    description: 'Serene ocean-breeze rich farm plot on ECR, perfect for constructing a luxury beach villa, farmhouse, or wellness resort. Direct private access, fully secure premium masonry fencing and high security gates.',
    lat: 12.7214,
    lng: 80.2455,
    price: '68000000', // ₹6,80,00,000
    type: 'Farm Land',
    zoned: 'Residential',
    roadAccess: '40ft Gated Road',
    beds: 0,
    baths: 0,
    sqft: 12000,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    surveyNumber: '315/1',
    plotNumber: 'Breeze Villa 4'
  },
  {
    id: 'l5',
    cityId: 'c3',
    name: 'Renigunta Industrial Layout Plot',
    customerName: 'Prasad Rao',
    customerMobile: '+91 877 225 4433',
    description: 'Strategically located industrial plot near Renigunta Airport and major national highways. Perfect for warehousing, light manufacturing, logistics center, or heavy machinery yard. Clear titles and industrial approval certificates available.',
    lat: 13.6350,
    lng: 79.5220,
    price: '42000000', // ₹4,20,00,000
    type: 'Industrial Land',
    zoned: 'Industrial',
    roadAccess: '60ft Industrial Link Road',
    beds: 0,
    baths: 0,
    sqft: 45000,
    images: [
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    surveyNumber: '502/7',
    plotNumber: 'Logistics Plot F'
  },
  {
    id: 'l6',
    cityId: 'c3',
    name: 'Kapila Theertham Residential Land',
    customerName: 'Sitaram Reddy',
    customerMobile: '+91 99080 33221',
    description: 'Ultra-premium residential plot located at the foothills of Tirumala with scenic, spiritual views of Kapila Theertham. Exclusive gated community with 24/7 round-the-clock security, pure groundwater source, and paved walking avenues.',
    lat: 13.6492,
    lng: 79.4185,
    price: '15000000', // ₹1,50,00,000
    type: 'Residential Land',
    zoned: 'Residential',
    roadAccess: '30ft Cement Road',
    beds: 0,
    baths: 0,
    sqft: 4400,
    images: [
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    status: 'available',
    structureType: 'land',
    surveyNumber: '12/4',
    plotNumber: 'Hillview Plot 1A'
  },
  {
    id: 'l7',
    cityId: 'c4',
    name: 'Puttur Surroundings Mango Grove Plot',
    customerName: 'G. Venkatesh',
    customerMobile: '+91 94405 55666',
    description: 'Beautiful 1.8-acre mature mango orchard plot near Puttur surroundings. Extremely fertile soil, high-yield tree density, continuous groundwater supply, fully fenced boundary, and 30ft road access. Excellent for agricultural investment or country estate.',
    lat: 13.4350,
    lng: 79.5620,
    price: '28000000', // ₹2,80,00,000
    type: 'Agricultural Land',
    zoned: 'Agricultural',
    roadAccess: '30ft Gravel Road',
    beds: 0,
    baths: 0,
    sqft: 78400,
    images: [
      'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    status: 'available',
    structureType: 'land',
    surveyNumber: '28/9B',
    plotNumber: 'Grove Plot 45'
  },
  {
    id: 'l8',
    cityId: 'c5',
    name: 'Narayanavanam Heritage Farm Villa Plot',
    customerName: 'K. Balaji Prasad',
    customerMobile: '+91 98480 88990',
    description: 'Premium plot containing a newly built 2 BHK eco-farmhouse structure in Narayanavanam. High security gates, elegant landscape gardens, dual borewells, and uninterrupted views of surrounding hills. Ready to move in or lease out.',
    lat: 13.4240,
    lng: 79.5890,
    price: '49000000', // ₹4,90,00,000
    type: 'Farm Land',
    zoned: 'Residential',
    roadAccess: '40ft Tar Road',
    beds: 2,
    baths: 2,
    sqft: 22000,
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
    ],
    videos: [],
    status: 'available',
    structureType: 'building',
    surveyNumber: '74/2',
    plotNumber: 'Heritage Plot 3'
  }
];

// Database Key Constants
const DB_KEYS = {
  USERS: 'cityexplorer_db_users',
  CITIES: 'cityexplorer_db_cities',
  LOCATIONS: 'cityexplorer_db_locations',
  CURRENT_USER: 'cityexplorer_db_current_user'
};

// Database Initialization
export const initDB = () => {
  if (!localStorage.getItem(DB_KEYS.USERS)) {
    localStorage.setItem(DB_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(DB_KEYS.CITIES)) {
    localStorage.setItem(DB_KEYS.CITIES, JSON.stringify(DEFAULT_CITIES));
  }
  if (!localStorage.getItem(DB_KEYS.LOCATIONS)) {
    localStorage.setItem(DB_KEYS.LOCATIONS, JSON.stringify(DEFAULT_LOCATIONS));
  }
};

// Users Table Methods
export const getUsers = (): User[] => {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEYS.USERS) || '[]');
};

export const saveUsers = (users: User[]): void => {
  localStorage.setItem(DB_KEYS.USERS, JSON.stringify(users));
};

// Cities Table Methods
export const getCities = (): City[] => {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEYS.CITIES) || '[]');
};

export const saveCities = (cities: City[]): void => {
  localStorage.setItem(DB_KEYS.CITIES, JSON.stringify(cities));
};

// Locations Table Methods
export const getLocations = (): Location[] => {
  initDB();
  return JSON.parse(localStorage.getItem(DB_KEYS.LOCATIONS) || '[]');
};

export const saveLocations = (locations: Location[]): void => {
  localStorage.setItem(DB_KEYS.LOCATIONS, JSON.stringify(locations));
};

// Current Session Methods
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(DB_KEYS.CURRENT_USER);
  return userJson ? JSON.parse(userJson) : null;
};

export const setCurrentUser = (user: User | null): void => {
  if (user) {
    localStorage.setItem(DB_KEYS.CURRENT_USER, JSON.stringify(user));
  } else {
    localStorage.removeItem(DB_KEYS.CURRENT_USER);
  }
};

// Currency Formatting helper (en-IN currency / Lakhs & Crores format)
export const formatINR = (value: string | number, role?: 'admin' | 'user' | 'map_no_price'): string => {
  if (role === 'map_no_price') {
    return 'Price Restricted';
  }
  const cleanVal = typeof value === 'string' ? value.replace(/[^0-9.-]/g, '') : value;
  const num = parseFloat(cleanVal as string);
  if (isNaN(num)) return 'Price Restricted';

  // Format using Indian Numbering System
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(num);
};

// Helper to determine format of general area sizing
export const formatSqft = (sqft: number): string => {
  if (!sqft) return 'N/A';
  return `${sqft.toLocaleString('en-IN')} Sq Ft`;
};
