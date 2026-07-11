import React from 'react';
import './AudioVisualizer.css';

export function AudioVisualizer({ isPlaying, barCount = 12 }) {
  const bars = Array.from({ length: barCount });

  return (
    <div className={`audio-visualizer ${isPlaying ? 'playing' : ''}`}>
      {bars.map((_, i) => {
        // Generate random-like height percentages and animation durations/delays for realism
        const randomHeight = 20 + Math.random() * 60;
        const animationDelay = `${(i * 0.15).toFixed(2)}s`;
        const animationDuration = `${(0.6 + Math.random() * 0.6).toFixed(2)}s`;

        return (
          <span
            key={i}
            className="visualizer-bar"
            style={{
              '--bar-height': `${randomHeight}%`,
              animationDelay,
              animationDuration
            }}
          />
        );
      })}
    </div>
  );
}
