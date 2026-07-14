/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user' | 'map_no_price';
}

export interface City {
  id: string;
  name: string;
  country: string;
  state: string;
  lat: number;
  lng: number;
}

export interface Location {
  id: string;
  cityId?: string;
  name: string;
  customerName: string;
  customerMobile?: string;
  description: string;
  lat: number;
  lng: number;
  price: string; // Formatted price (e.g. '₹4,50,00,000') or raw numeric string
  type: string;  // 'Agricultural Land', 'Commercial Land', 'Farm Land', 'Industrial Land', etc.
  zoned: string; // 'Agricultural', 'Commercial', 'Residential', 'Industrial'
  roadAccess: string; // e.g., '60ft Road Access'
  beds: number;  // 0 for land
  baths: number; // 0 for land
  sqft: number;  // Total Area (Sq Ft)
  images: string[]; // Base64 or online URLs
  videos: string[]; // Base64 or online URLs
  status?: 'available' | 'sold'; // Status indicator
  structureType?: 'land' | 'building'; // Plot structure type
  surveyNumber?: string; // Optional survey number
  plotNumber?: string; // Optional plot number
  pricePerSqft?: number; // Price per sqft
  width?: number; // Width of the land plot (ft)
  length?: number; // Length of the land plot (ft)
  address?: string; // Accurate geocoded or custom address/locality
}
