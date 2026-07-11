import { useState, useEffect, useRef } from 'react';
import Hls from 'hls.js';

export function useAudioPlayer() {
  const [currentStation, setCurrentStation] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [volume, setVolume] = useState(0.8); // Default volume 80%

  const audioRef = useRef(new Audio());
  const hlsRef = useRef(null);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle station change and playback lifecycle
  useEffect(() => {
    const audio = audioRef.current;
    if (!currentStation) {
      // Pause and clear if no station is selected
      audio.pause();
      audio.src = '';
      setIsPlaying(false);
      setIsLoading(false);
      return;
    }

    const playStream = async () => {
      // Clean up previous HLS instance
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      setError(null);
      setIsLoading(true);
      
      const streamUrl = currentStation.url;
      const isHls = streamUrl.toLowerCase().includes('.m3u8');

      if (isHls) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
            backBufferLength: 90
          });
          hlsRef.current = hls;
          hls.loadSource(streamUrl);
          hls.attachMedia(audio);
          
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play()
              .then(() => {
                setIsPlaying(true);
                setIsLoading(false);
              })
              .catch((err) => {
                console.error('Play interrupted (HLS):', err);
                setError('Autoplay blocked or stream unavailable. Click play to start.');
                setIsPlaying(false);
                setIsLoading(false);
              });
          });

          hls.on(Hls.Events.ERROR, (event, data) => {
            console.error('HLS error:', data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.warn('Fatal HLS network error, trying to recover...');
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.warn('Fatal HLS media error, trying to recover...');
                  hls.recoverMediaError();
                  break;
                default:
                  setError('The stream went offline or is not reachable.');
                  setIsLoading(false);
                  setIsPlaying(false);
                  hls.destroy();
                  hlsRef.current = null;
                  break;
              }
            }
          });
        } 
        // Safari native support
        else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = streamUrl;
          try {
            await audio.play();
            setIsPlaying(true);
            setIsLoading(false);
          } catch (err) {
            setError('Autoplay blocked. Please click play.');
            setIsPlaying(false);
            setIsLoading(false);
          }
        } else {
          setError('HLS streaming is not supported in this browser.');
          setIsLoading(false);
        }
      } else {
        // Standard MP3 / AAC stream
        audio.src = streamUrl;
        // Some shoutcast servers require cors config or standard source loading
        audio.crossOrigin = 'anonymous'; 
        
        try {
          await audio.play();
          setIsPlaying(true);
          setIsLoading(false);
        } catch (err) {
          console.error('Play interrupted (MP3):', err);
          setError('Autoplay blocked or stream offline. Click play to retry.');
          setIsPlaying(false);
          setIsLoading(false);
        }
      }
    };

    playStream();

    // Event listeners for standard HTML5 audio state updates
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => {
      setIsLoading(false);
      setIsPlaying(true);
      setError(null);
    };
    const onPause = () => setIsPlaying(false);
    const onError = (e) => {
      // If we are using HLS.js, we let HLS.js handle its own errors.
      // Standard audio element errors are handled here.
      if (!streamUrl.toLowerCase().includes('.m3u8')) {
        console.error('Audio element error:', e);
        setError('This radio stream is currently offline or unreachable.');
        setIsLoading(false);
        setIsPlaying(false);
      }
    };

    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, [currentStation]);

  // Clean up player on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  const play = () => {
    if (audioRef.current && currentStation) {
      setError(null);
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(err => {
          console.error('Play call failed:', err);
          setError('Stream unavailable or offline.');
          setIsLoading(false);
        });
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const selectStation = (station) => {
    setCurrentStation(station);
  };

  return {
    currentStation,
    isPlaying,
    isLoading,
    error,
    volume,
    setVolume,
    play,
    pause,
    togglePlay,
    selectStation
  };
}
