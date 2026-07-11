const BASE_URLS = [
  'https://de1.api.radio-browser.info/json',
  'https://nl1.api.radio-browser.info/json',
  'https://at1.api.radio-browser.info/json'
];

let currentBaseUrlIndex = 0;

async function fetchFromApi(endpoint, params = {}) {
  const query = new URLSearchParams(params).toString();
  const urlSuffix = query ? `?${query}` : '';
  
  for (let i = 0; i < BASE_URLS.length; i++) {
    const index = (currentBaseUrlIndex + i) % BASE_URLS.length;
    const baseUrl = BASE_URLS[index];
    try {
      const response = await fetch(`${baseUrl}${endpoint}${urlSuffix}`);
      if (response.ok) {
        currentBaseUrlIndex = index; // Keep using this working server
        return await response.json();
      }
    } catch (error) {
      console.warn(`Failed to fetch from ${baseUrl}:`, error);
    }
  }
  throw new Error('All Radio Browser API mirrors failed to respond.');
}

/**
 * Fetches popular stations and groups them by city to plot as points on the globe.
 */
export async function fetchGlobePoints() {
  try {
    const stations = await fetchFromApi('/stations/search', {
      limit: 2000,
      order: 'votes',
      reverse: true,
      has_geo_info: true,
      hidebroken: true
    });

    const citiesMap = new Map();
    stations.forEach(station => {
      if (!station.geo_lat || !station.geo_long) return;
      const lat = parseFloat(station.geo_lat);
      const lng = parseFloat(station.geo_long);
      if (isNaN(lat) || isNaN(lng)) return;

      // Group nearby coordinates (rounded to 3 decimals is approx 110 meters)
      // or exact combinations.
      const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
      
      const cityName = (station.city || '').trim() || 'Unknown City';
      const countryName = (station.country || '').trim() || 'Unknown Country';

      if (!citiesMap.has(key)) {
        citiesMap.set(key, {
          id: key,
          lat,
          lng,
          city: cityName,
          country: countryName,
          stations: []
        });
      }
      
      citiesMap.get(key).stations.push({
        id: station.stationuuid,
        name: station.name,
        url: station.url_resolved || station.url,
        favicon: station.favicon,
        tags: station.tags ? station.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        votes: station.votes,
        codec: station.codec
      });
    });

    return Array.from(citiesMap.values());
  } catch (error) {
    console.error('Error fetching globe points:', error);
    return [];
  }
}

/**
 * Searches stations by query.
 */
export async function searchStations(query) {
  if (!query || query.trim().length < 2) return [];
  
  try {
    const results = await fetchFromApi('/stations/search', {
      name: query,
      limit: 80,
      order: 'votes',
      reverse: true,
      hidebroken: true,
      has_geo_info: true
    });

    return results.map(station => ({
      id: station.stationuuid,
      name: station.name,
      url: station.url_resolved || station.url,
      favicon: station.favicon,
      city: station.city || 'Unknown City',
      country: station.country || 'Unknown Country',
      lat: parseFloat(station.geo_lat),
      lng: parseFloat(station.geo_long),
      tags: station.tags ? station.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      codec: station.codec
    }));
  } catch (error) {
    console.error('Error searching stations:', error);
    return [];
  }
}

/**
 * Fetches additional stations for a specific city.
 */
export async function fetchStationsByCity(city) {
  if (!city) return [];
  try {
    const results = await fetchFromApi('/stations/search', {
      city: city,
      limit: 50,
      order: 'votes',
      reverse: true,
      hidebroken: true
    });

    return results.map(station => ({
      id: station.stationuuid,
      name: station.name,
      url: station.url_resolved || station.url,
      favicon: station.favicon,
      city: station.city,
      country: station.country,
      lat: parseFloat(station.geo_lat),
      lng: parseFloat(station.geo_long),
      tags: station.tags ? station.tags.split(',').map(t => t.trim()).filter(Boolean) : []
    }));
  } catch (error) {
    console.error(`Error fetching stations for city ${city}:`, error);
    return [];
  }
}
