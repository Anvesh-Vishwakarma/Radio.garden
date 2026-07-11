import React, { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';

export function GlobeView({
  points,
  selectedCity,
  onSelectCity,
  flyToTrigger
}) {
  const globeRef = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [isRotating, setIsRotating] = useState(true);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      // Calculate width taking the sidebar (380px) into account on desktop
      const sidebarWidth = window.innerWidth > 768 ? 380 : 0;
      setDimensions({
        width: window.innerWidth - sidebarWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Configure Globe on load (camera settings, lighting, etc.)
  useEffect(() => {
    if (globeRef.current) {
      // Set initial camera view
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.2 }, 0);
      
      // Configure controls
      const controls = globeRef.current.controls();
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 250; // Don't allow zooming inside Earth
      controls.maxDistance = 1500; // Don't allow zooming out too far
    }
  }, []);

  // Handle auto-rotation
  useEffect(() => {
    if (globeRef.current && isRotating) {
      const controls = globeRef.current.controls();
      // Rotate slowly
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;
    } else if (globeRef.current && !isRotating) {
      const controls = globeRef.current.controls();
      controls.autoRotate = false;
    }
  }, [isRotating]);

  // Handle camera flying to selected coordinates
  useEffect(() => {
    if (flyToTrigger && globeRef.current) {
      setIsRotating(false); // Stop rotation during exploration
      
      // Fly to the new point
      globeRef.current.pointOfView(
        {
          lat: flyToTrigger.lat,
          lng: flyToTrigger.lng,
          altitude: 0.75 // Zoomed-in altitude
        },
        1600 // Animation duration in ms
      );
    }
  }, [flyToTrigger]);

  const handlePointClick = (point) => {
    setIsRotating(false); // Stop rotation when user interacts
    
    // Zoom and center on the clicked point
    if (globeRef.current) {
      globeRef.current.pointOfView(
        {
          lat: point.lat,
          lng: point.lng,
          altitude: 0.75
        },
        1200
      );
    }
    
    // Notify parent
    onSelectCity(point);
  };

  const handleGlobeClick = () => {
    // Resume rotation if they click on empty space (and no city is selected)
    if (!selectedCity) {
      setIsRotating(true);
    }
  };

  return (
    <div 
      className="globe-container" 
      style={{ 
        width: `${dimensions.width}px`, 
        height: `${dimensions.height}px`,
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseDown={() => setIsRotating(false)} // Pause rotation when dragging globe
    >
      <Globe
        ref={globeRef}
        width={dimensions.width}
        height={dimensions.height}
        backgroundColor="rgba(0, 0, 0, 0)" // Transparent, using CSS background stars
        
        // Option B: Realistic Earth textures
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="" // Let CSS handle the background space
        
        // Atmosphere style
        showAtmosphere={true}
        atmosphereColor="#3b82f6" // Light blue atmosphere glow
        atmosphereDaylightAlpha={0.25}

        // Plotting points (Cities)
        pointsData={points}
        pointLat="lat"
        pointLng="lng"
        pointColor={() => '#10b981'} // Emerald green glowing dots
        pointAltitude={0.015} // Hover slightly above surface
        pointRadius={0.18}
        pointsMerge={false}
        
        // Labels on hover
        pointLabel={(d) => `
          <div class="globe-tooltip">
            <div class="tooltip-city">${d.city}</div>
            <div class="tooltip-country">${d.country}</div>
            <div class="tooltip-stations">${d.stations.length} station${d.stations.length > 1 ? 's' : ''}</div>
          </div>
        `}
        onPointClick={handlePointClick}
        onGlobeClick={handleGlobeClick}
      />

      {/* Info indicator overlay */}
      <div className="globe-overlay-info">
        {isRotating ? (
          <span>🌍 Rotating Earth (Click and drag to explore)</span>
        ) : (
          <button className="resume-rotate-btn" onClick={() => setIsRotating(true)}>
            🔄 Resume Auto-Rotation
          </button>
        )}
      </div>
    </div>
  );
}
