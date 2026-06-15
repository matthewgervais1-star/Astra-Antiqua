export interface CityEntry {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  popular?: boolean;
}

/**
 * A quick-pick list of major modern cities for the birthplace field. This is
 * only the instant, offline suggestion set; anything not here is found by the
 * worldwide OpenStreetMap geocoder (see src/lib/geocoding.ts), so any real
 * place on earth can be entered. The list leads with `popular` cities, shown
 * before the user types, and stays modern: nobody is born in an archaeological
 * site, so the ancient ritual centers that belong to the pantheons live on the
 * pantheon pages, not in this picker.
 */
export const CITIES: readonly CityEntry[] = [
  // Popular defaults (shown before the user types), spread across regions.
  { name: "New York", country: "United States", latitude: 40.7128, longitude: -74.006, popular: true },
  { name: "London", country: "United Kingdom", latitude: 51.5074, longitude: -0.1278, popular: true },
  { name: "Los Angeles", country: "United States", latitude: 34.0522, longitude: -118.2437, popular: true },
  { name: "Toronto", country: "Canada", latitude: 43.6532, longitude: -79.3832, popular: true },
  { name: "Paris", country: "France", latitude: 48.8566, longitude: 2.3522, popular: true },
  { name: "Rome", country: "Italy", latitude: 41.9028, longitude: 12.4964, popular: true },
  { name: "Mumbai", country: "India", latitude: 19.076, longitude: 72.8777, popular: true },
  { name: "Tokyo", country: "Japan", latitude: 35.6762, longitude: 139.6503, popular: true },
  { name: "Sydney", country: "Australia", latitude: -33.8688, longitude: 151.2093, popular: true },
  { name: "Lagos", country: "Nigeria", latitude: 6.5244, longitude: 3.3792, popular: true },

  // North America
  { name: "Chicago", country: "United States", latitude: 41.8781, longitude: -87.6298 },
  { name: "Houston", country: "United States", latitude: 29.7604, longitude: -95.3698 },
  { name: "Phoenix", country: "United States", latitude: 33.4484, longitude: -112.074 },
  { name: "Philadelphia", country: "United States", latitude: 39.9526, longitude: -75.1652 },
  { name: "San Antonio", country: "United States", latitude: 29.4241, longitude: -98.4936 },
  { name: "San Diego", country: "United States", latitude: 32.7157, longitude: -117.1611 },
  { name: "Dallas", country: "United States", latitude: 32.7767, longitude: -96.797 },
  { name: "Memphis", country: "United States (Tennessee)", latitude: 35.1495, longitude: -90.049 },
  { name: "Atlanta", country: "United States", latitude: 33.749, longitude: -84.388 },
  { name: "Boston", country: "United States", latitude: 42.3601, longitude: -71.0589 },
  { name: "Seattle", country: "United States", latitude: 47.6062, longitude: -122.3321 },
  { name: "Denver", country: "United States", latitude: 39.7392, longitude: -104.9903 },
  { name: "Miami", country: "United States", latitude: 25.7617, longitude: -80.1918 },
  { name: "Montreal", country: "Canada", latitude: 45.5017, longitude: -73.5673 },
  { name: "Vancouver", country: "Canada", latitude: 49.2827, longitude: -123.1207 },
  { name: "Mexico City", country: "Mexico", latitude: 19.4326, longitude: -99.1332 },

  // Europe
  { name: "Berlin", country: "Germany", latitude: 52.52, longitude: 13.405 },
  { name: "Madrid", country: "Spain", latitude: 40.4168, longitude: -3.7038 },
  { name: "Barcelona", country: "Spain", latitude: 41.3874, longitude: 2.1686 },
  { name: "Lisbon", country: "Portugal", latitude: 38.7223, longitude: -9.1393 },
  { name: "Amsterdam", country: "Netherlands", latitude: 52.3676, longitude: 4.9041 },
  { name: "Vienna", country: "Austria", latitude: 48.2082, longitude: 16.3738 },
  { name: "Stockholm", country: "Sweden", latitude: 59.3293, longitude: 18.0686 },
  { name: "Dublin", country: "Ireland", latitude: 53.3498, longitude: -6.2603 },
  { name: "Athens", country: "Greece", latitude: 37.9838, longitude: 23.7275 },
  { name: "Rome", country: "Italy", latitude: 41.9028, longitude: 12.4964 },
  { name: "Milan", country: "Italy", latitude: 45.4642, longitude: 9.19 },
  { name: "Moscow", country: "Russia", latitude: 55.7558, longitude: 37.6173 },
  { name: "Istanbul", country: "Turkey", latitude: 41.0082, longitude: 28.9784 },

  // Middle East / North Africa
  { name: "Cairo", country: "Egypt", latitude: 30.0444, longitude: 31.2357 },
  { name: "Beirut", country: "Lebanon", latitude: 33.8938, longitude: 35.5018 },
  { name: "Tunis", country: "Tunisia", latitude: 36.8065, longitude: 10.1815 },
  { name: "Dubai", country: "United Arab Emirates", latitude: 25.2048, longitude: 55.2708 },
  { name: "Tel Aviv", country: "Israel", latitude: 32.0853, longitude: 34.7818 },

  // Sub-Saharan Africa, South Asia
  { name: "Johannesburg", country: "South Africa", latitude: -26.2041, longitude: 28.0473 },
  { name: "Nairobi", country: "Kenya", latitude: -1.2921, longitude: 36.8219 },
  { name: "Delhi", country: "India", latitude: 28.6139, longitude: 77.209 },
  { name: "Karachi", country: "Pakistan", latitude: 24.8607, longitude: 67.0011 },

  // East Asia, Oceania, South America
  { name: "Seoul", country: "South Korea", latitude: 37.5665, longitude: 126.978 },
  { name: "Beijing", country: "China", latitude: 39.9042, longitude: 116.4074 },
  { name: "Shanghai", country: "China", latitude: 31.2304, longitude: 121.4737 },
  { name: "Hong Kong", country: "China", latitude: 22.3193, longitude: 114.1694 },
  { name: "Singapore", country: "Singapore", latitude: 1.3521, longitude: 103.8198 },
  { name: "Manila", country: "Philippines", latitude: 14.5995, longitude: 120.9842 },
  { name: "Jakarta", country: "Indonesia", latitude: -6.2088, longitude: 106.8456 },
  { name: "Auckland", country: "New Zealand", latitude: -36.8485, longitude: 174.7633 },
  { name: "Sao Paulo", country: "Brazil", latitude: -23.5505, longitude: -46.6333 },
  { name: "Buenos Aires", country: "Argentina", latitude: -34.6037, longitude: -58.3816 },
  { name: "Lima", country: "Peru", latitude: -12.0464, longitude: -77.0428 },
  { name: "Bogota", country: "Colombia", latitude: 4.711, longitude: -74.0721 },
];

export function searchCities(query: string, limit = 8): readonly CityEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return CITIES.filter((c) => c.popular);
  }
  const matches: CityEntry[] = [];
  for (const c of CITIES) {
    if (c.name.toLowerCase().includes(q) || c.country.toLowerCase().includes(q)) {
      matches.push(c);
      if (matches.length >= limit) break;
    }
  }
  return matches;
}
