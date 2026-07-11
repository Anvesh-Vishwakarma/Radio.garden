import React, { useState, useEffect } from 'react';
import { Search, Play, Pause, Volume2, VolumeX, Globe, Radio, MapPin, Loader, AlertCircle, X } from 'lucide-react';
import { searchStations, fetchStationsByCity } from '../services/radioApi';
import { AudioVisualizer } from './AudioVisualizer';
import './Sidebar.css';

export function Sidebar({
  selectedCity,
  currentStation,
  isPlaying,
  isLoading,
  error,
  volume,
  setVolume,
  togglePlay,
  selectStation,
  onSelectLocation
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [cityStations, setCityStations] = useState([]);
  const [isLoadingCityStations, setIsLoadingCityStations] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0.8);

  // Sync city stations when selectedCity changes
  useEffect(() => {
    if (!selectedCity) {
      setCityStations([]);
      return;
    }

    // If selectedCity already has stations pre-loaded (from the globe points)
    if (selectedCity.stations && selectedCity.stations.length > 0) {
      setCityStations(selectedCity.stations);
      return;
    }

    // Otherwise, fetch them dynamically
    const loadCityStations = async () => {
      setIsLoadingCityStations(true);
      try {
        const stations = await fetchStationsByCity(selectedCity.city);
        setCityStations(stations);
      } catch (err) {
        console.error('Failed to load city stations:', err);
      } finally {
        setIsLoadingCityStations(false);
      }
    };

    loadCityStations();
  }, [selectedCity]);

  // Handle Search Input
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchStations(searchQuery);
        setSearchResults(results);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleMuteToggle = () => {
    if (isMuted) {
      setVolume(prevVolume);
      setIsMuted(false);
    } else {
      setPrevVolume(volume);
      setVolume(0);
      setIsMuted(true);
    }
  };

  const handleSearchResultClick = (station) => {
    // 1. Notify parent to rotate/zoom the globe
    onSelectLocation({
      lat: station.lat,
      lng: station.lng,
      city: station.city,
      country: station.country,
      stations: [station] // Load this station
    });

    // 2. Play the station
    selectStation(station);

    // 3. Clear search query
    setSearchQuery('');
  };

  return (
    <aside className="app-sidebar">
      {/* Header / Logo */}
      <div className="sidebar-header">
        <div className="brand">
          <Globe className="brand-icon" />
          <h1>radio.garden</h1>
        </div>
        <p className="brand-tagline">Explore live radio stations around the Earth</p>
      </div>

      {/* Search Section */}
      <div className="search-container">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search stations, cities, countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>

        {/* Search Results Dropdown / Panel */}
        {searchQuery.trim().length >= 2 && (
          <div className="search-results-panel">
            {isSearching ? (
              <div className="search-status">
                <Loader className="spinner" size={20} />
                <span>Searching stations...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="search-status">No stations found.</div>
            ) : (
              <ul className="search-results-list">
                {searchResults.map((station) => (
                  <li
                    key={station.id}
                    onClick={() => handleSearchResultClick(station)}
                    className="search-result-item"
                  >
                    <Radio className="item-icon" size={16} />
                    <div className="item-details">
                      <span className="station-name">{station.name}</span>
                      <span className="station-location">
                        {station.city}, {station.country}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area: City and Stations */}
      <div className="sidebar-content">
        {selectedCity ? (
          <div className="city-panel">
            <div className="city-header">
              <MapPin className="pin-icon" size={20} />
              <div>
                <h2>{selectedCity.city}</h2>
                <h3>{selectedCity.country}</h3>
              </div>
            </div>

            <div className="stations-section">
              <h4 className="section-title">Available Stations</h4>
              {isLoadingCityStations ? (
                <div className="loading-stations">
                  <Loader className="spinner" size={24} />
                  <span>Loading city stations...</span>
                </div>
              ) : cityStations.length === 0 ? (
                <p className="no-stations">No stations found in this city.</p>
              ) : (
                <ul className="stations-list">
                  {cityStations.map((station) => {
                    const isCurrent = currentStation?.id === station.id;
                    return (
                      <li
                        key={station.id}
                        onClick={() => selectStation(station)}
                        className={`station-item ${isCurrent ? 'active' : ''}`}
                      >
                        <div className="station-item-left">
                          <Radio size={16} className="station-radio-icon" />
                          <span className="station-name">{station.name}</span>
                        </div>
                        {isCurrent && isPlaying && (
                          <div className="mini-visualizer">
                            <span className="mini-bar"></span>
                            <span className="mini-bar"></span>
                            <span className="mini-bar"></span>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <Globe className="empty-globe-icon" size={48} />
            <p>Click on any glowing city on the globe, or search above to play live radio streams.</p>
          </div>
        )}
      </div>

      {/* Floating Audio Player Panel (always visible at bottom) */}
      <div className="sidebar-player">
        {currentStation ? (
          <div className="player-controls-container">
            {error && (
              <div className="player-error">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}
            
            <div className="player-info">
              <div className="player-text">
                <div className="now-playing-label">Now Playing</div>
                <div className="station-title">{currentStation.name}</div>
                <div className="station-meta">
                  {currentStation.city}, {currentStation.country}
                </div>
              </div>
              <button
                className="play-pause-btn"
                onClick={togglePlay}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="spinner" size={24} />
                ) : isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" />
                )}
              </button>
            </div>

            {/* Simulated visualizer */}
            <AudioVisualizer isPlaying={isPlaying && !isLoading} barCount={18} />

            {/* Volume Control */}
            <div className="volume-control">
              <button className="mute-btn" onClick={handleMuteToggle}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (val > 0) setIsMuted(false);
                }}
                className="volume-slider"
              />
            </div>
          </div>
        ) : (
          <div className="player-empty">
            <span>No station selected</span>
          </div>
        )}
      </div>
    </aside>
  );
}
