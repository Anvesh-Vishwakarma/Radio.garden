import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { GlobeView } from './components/GlobeView';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { fetchGlobePoints } from './services/radioApi';

function App() {
  const [globePoints, setGlobePoints] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [flyToTrigger, setFlyToTrigger] = useState(null);
  const [isLoadingApp, setIsLoadingApp] = useState(true);

  // Initialize Audio Player Hook
  const {
    currentStation,
    isPlaying,
    isLoading: isLoadingAudio,
    error: audioError,
    volume,
    setVolume,
    togglePlay,
    selectStation
  } = useAudioPlayer();

  // Load points for the globe on mount
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const points = await fetchGlobePoints();
        if (active) {
          setGlobePoints(points);
          setIsLoadingApp(false);
        }
      } catch (error) {
        console.error('Failed to load initial globe data:', error);
        if (active) {
          setIsLoadingApp(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  // Called when user clicks a point on the 3D globe
  const handleSelectCity = (cityPoint) => {
    setSelectedCity(cityPoint);
    
    // Auto-play the first station in this city if available
    if (cityPoint.stations && cityPoint.stations.length > 0) {
      selectStation(cityPoint.stations[0]);
    }
  };

  // Called when a search result is clicked
  const handleSelectLocationFromSearch = (location) => {
    // Zoom/rotate the camera
    setFlyToTrigger({
      lat: location.lat,
      lng: location.lng,
      timestamp: Date.now() // Unique trigger to run the effect
    });

    // Update selected city panel
    setSelectedCity({
      city: location.city,
      country: location.country,
      stations: location.stations
    });
  };

  return (
    <div className="app-container">
      {/* Initial App Load Overlay */}
      {isLoadingApp && (
        <div className="app-loading-overlay">
          <div className="app-loading-spinner"></div>
          <div className="app-loading-text">Connecting to Radio Garden...</div>
          <div className="app-loading-sub">Fetching global radio points</div>
        </div>
      )}

      {/* Split-pane layout: Sidebar on the left */}
      <Sidebar
        selectedCity={selectedCity}
        currentStation={currentStation}
        isPlaying={isPlaying}
        isLoading={isLoadingAudio}
        error={audioError}
        volume={volume}
        setVolume={setVolume}
        togglePlay={togglePlay}
        selectStation={selectStation}
        onSelectLocation={handleSelectLocationFromSearch}
      />

      {/* 3D Globe in the remaining pane */}
      <div className="globe-wrapper">
        <GlobeView
          points={globePoints}
          selectedCity={selectedCity}
          onSelectCity={handleSelectCity}
          flyToTrigger={flyToTrigger}
        />
      </div>
    </div>
  );
}

export default App;
