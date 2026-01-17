import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Sound, Theme, FadeOutOption } from './types';
import { SOUND_CATEGORIES, DEFAULT_SOUND } from './constants';
import { useSoundCloudWidget } from './hooks/useSoundCloudWidget';
import { useAudioKeepAlive } from './hooks/useAudioKeepAlive';
import Header from './components/Header';
import SoundGrid from './components/SoundGrid';
import SettingsModal from './components/SettingsModal';
import { VolumeControl } from './components/VolumeControl';
import IdleOverlay from './components/IdleOverlay';

// Add WakeLockSentinel type for Screen Wake Lock API
type WakeLockSentinel = EventTarget & {
  release: () => Promise<void>;
};

const App: React.FC = () => {
  // Core State
  const [currentSound, setCurrentSound] = useState<Sound>(DEFAULT_SOUND);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [loadingSoundUrl, setLoadingSoundUrl] = useState<string | null>(null);
  
  // Settings State
  const [theme, setTheme] = useState<Theme>(Theme.Dark);
  const [isAttached, setIsAttached] = useState<boolean>(true); // Container mode default
  const [fadeOutDuration, setFadeOutDuration] = useState<FadeOutOption>(10);
  const [keepScreenOn, setKeepScreenOn] = useState<boolean>(false);
  const [isPerformanceMode, setIsPerformanceMode] = useState<boolean>(false);
  const [isIdleModeEnabled, setIsIdleModeEnabled] = useState<boolean>(false);

  // Timer State
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [timerRemaining, setTimerRemaining] = useState<number | null>(null);
  const [isTimerPaused, setIsTimerPaused] = useState<boolean>(true);
  
  // Idle, Fullscreen and Media Session State
  const [isIdle, setIsIdle] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(!!document.fullscreenElement);
  const [positionState, setPositionState] = useState<{ duration: number; position: number } | null>(null);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');

  // Screen Wake Lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Audio Keep Alive (prevents Android throttling)
  useAudioKeepAlive(isPlaying);

  const activeIframeId = isAttached ? 'sc-widget-iframe-attached' : 'sc-widget-iframe-fixed';

  const attachedWidgetUrl = useMemo(() => {
    const url = new URL('https://w.soundcloud.com/player/');
    url.searchParams.set('url', DEFAULT_SOUND.url);
    url.searchParams.set('auto_play', 'false');
    url.searchParams.set('hide_related', 'true');
    url.searchParams.set('show_comments', 'false');
    url.searchParams.set('show_user', 'false');
    url.searchParams.set('show_reposts', 'false');
    url.searchParams.set('visual', 'false');
    url.searchParams.set('color', 'ff5500');
    return url.toString();
  }, []);

  const fixedWidgetUrl = useMemo(() => {
    const url = new URL('https://w.soundcloud.com/player/');
    url.searchParams.set('url', DEFAULT_SOUND.url);
    url.searchParams.set('auto_play', 'false');
    url.searchParams.set('hide_related', 'true');
    url.searchParams.set('show_comments', 'false');
    url.searchParams.set('show_user', 'false');
    url.searchParams.set('show_reposts', 'false');
    url.searchParams.set('visual', 'true');
    url.searchParams.set('show_artwork', 'false');
    url.searchParams.set('color', 'ff5500');
    return url.toString();
  }, []);

  const widget = useSoundCloudWidget(activeIframeId, {
    onPlay: () => {
      setIsPlaying(true);
      setLoadingSoundUrl(null);
      // Set metadata here for maximum reliability, ensuring the system notification
      // updates at the exact moment playback starts.
      if ('mediaSession' in navigator && currentSound) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSound.name,
          artist: 'SonarCloud',
          album: 'Sons Relaxantes',
          artwork: [
            // Provide multiple sizes and an absolute URL for better compatibility.
            { src: new URL('/icon.svg', window.location.origin).href, sizes: '96x96', type: 'image/svg+xml' },
            { src: new URL('/icon.svg', window.location.origin).href, sizes: '128x128', type: 'image/svg+xml' },
            { src: new URL('/icon.svg', window.location.origin).href, sizes: '192x192', type: 'image/svg+xml' },
            { src: new URL('/icon.svg', window.location.origin).href, sizes: '256x256', type: 'image/svg+xml' },
            { src: new URL('/icon.svg', window.location.origin).href, sizes: '384x384', type: 'image/svg+xml' },
            { src: new URL('/icon.svg', window.location.origin).href, sizes: '512x512', type: 'image/svg+xml' },
          ]
        });
      }
    },
    onPause: () => {
      setIsPlaying(false);
      setPositionState(null); // Clear position state when paused
    },
    onProgress: ({ currentPosition, duration }) => {
      // SoundCloud provides time in ms, Media Session API requires seconds.
      setPositionState({ position: currentPosition / 1000, duration: duration / 1000 });
    },
  });
  
  // --- Idle Mode Logic ---
  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) {
        clearTimeout(idleTimerRef.current);
    }
    idleTimerRef.current = setTimeout(() => {
        setIsIdle(true);
    }, 10000); // 10 seconds
  }, []);

  useEffect(() => {
    if (!isIdleModeEnabled) {
        setIsIdle(false);
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
        return;
    }

    const handleUserActivity = () => {
        setIsIdle(false);
        // Only reset the timer if music is playing.
        if (isPlaying) {
            resetIdleTimer();
        }
    };

    const activityEvents = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
    activityEvents.forEach(event => {
        window.addEventListener(event, handleUserActivity);
    });

    if (isPlaying) {
        resetIdleTimer();
    } else {
        // If music stops, clear the timer but don't exit idle mode.
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
    }

    return () => {
        activityEvents.forEach(event => {
            window.removeEventListener(event, handleUserActivity);
        });
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
        }
    };
  }, [isIdleModeEnabled, isPlaying, resetIdleTimer]);
  // --- End of Idle Mode Logic ---

  const isEffectivePerformanceMode = isPerformanceMode || (isIdle && theme !== Theme.Translucent);

  // --- Dynamic Theme Color for PWA ---
  useEffect(() => {
    const metaThemeColor = document.querySelector("meta[name=theme-color]");
    if (metaThemeColor) {
        let newColor = '#0f172a'; // Default for Dark theme

        if (isIdle) {
            newColor = '#000000';
        } else if (isEffectivePerformanceMode) {
            newColor = theme === Theme.Light ? '#FFFFFF' : '#000000';
        } else {
            switch (theme) {
                case Theme.Light:
                    newColor = '#FFFFFF';
                    break;
                case Theme.Dark:
                    newColor = '#0f172a'; // slate-900, a dark blueish color.
                    break;
                case Theme.Translucent:
                    newColor = '#000000';
                    break;
            }
        }
        metaThemeColor.setAttribute("content", newColor);
    }
  }, [theme, isEffectivePerformanceMode, isIdle]);

  // --- Fullscreen Logic ---
  const handleEnterFullscreen = useCallback(async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err: any) {
      console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
    }
  }, []);

  const handleExitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen && document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch (err: any) {
      console.error(`Error attempting to exit fullscreen mode: ${err.message} (${err.name})`);
    }
  }, []);
  
  useEffect(() => {
    const handleFullscreenChange = () => {
        setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
        document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // --- Media Session API ---
  
  // This effect manages the playback state (play/pause) and registers the action handlers
  // (e.g., for lock screen controls).
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
      
      const handlePlay = () => widget.play();
      const handlePause = () => widget.pause();

      navigator.mediaSession.setActionHandler('play', isPlaying ? null : handlePlay);
      navigator.mediaSession.setActionHandler('pause', isPlaying ? handlePause : null);
      
      // Registering other handlers signals to the OS that this is a full-featured media app,
      // improving background stability.
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    }
  }, [isPlaying, widget]);

  // This effect manages the track progress bar in the system notification.
  // This is crucial for stability, as it proves to the OS that media is actively progressing.
  useEffect(() => {
    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      if (isPlaying && positionState && positionState.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: positionState.duration,
            position: positionState.position,
          });
        } catch (e) {
          console.error("Failed to set Media Session position state:", e);
        }
      } else {
        // Clear the position state when not playing or if state is invalid.
        navigator.mediaSession.setPositionState(null);
      }
    }
  }, [isPlaying, positionState]);
  // --- End of Media Session API ---

  // --- Screen Wake Lock Logic ---
  const acquireWakeLock = useCallback(async () => {
    if ('wakeLock' in navigator && !wakeLockRef.current) {
      try {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log('Screen Wake Lock acquired.');
        wakeLockRef.current.addEventListener('release', () => {
          console.log('Screen Wake Lock released by system.');
          wakeLockRef.current = null;
        });
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      try {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Screen Wake Lock released.');
      } catch (err: any) {
        console.error(`${err.name}, ${err.message}`);
      }
    }
  }, []);

  useEffect(() => {
    if (keepScreenOn && isPlaying) {
      acquireWakeLock();
    } else {
      releaseWakeLock();
    }
    // Cleanup on component unmount
    return () => {
      releaseWakeLock();
    };
  }, [keepScreenOn, isPlaying, acquireWakeLock, releaseWakeLock]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (wakeLockRef.current !== null && document.visibilityState === 'visible') {
        acquireWakeLock();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [acquireWakeLock]);
  // --- End of Wake Lock Logic ---

  useEffect(() => {
    if (widget.isReady) {
        widget.setVolume(volume);
    }
  }, [widget.isReady, volume, widget.setVolume, activeIframeId]);

  useEffect(() => {
    document.documentElement.classList.remove(Theme.Light, Theme.Dark);
    document.documentElement.classList.add(theme);
    if (theme === Theme.Translucent) {
      setBackgroundImageUrl(`https://picsum.photos/1920/1000?random=${new Date().getTime()}`);
    }
  }, [theme]);

  useEffect(() => {
    // Reset player state when switching between attached/fixed mode
    // to prevent state desynchronization.
    if (widget.isReady) {
      widget.pause();
    }
    setCurrentSound(DEFAULT_SOUND);
    setIsPlaying(false);
    setLoadingSoundUrl(null);
  }, [isAttached, widget.isReady, widget.pause]);

  const handleSoundSelect = useCallback((sound: Sound, event: React.MouseEvent) => {
    event.preventDefault();
    if (sound.url !== currentSound?.url) {
      setLoadingSoundUrl(sound.url);
      setCurrentSound(sound); // Set sound info immediately for Media Session
      widget.load(sound.url, { auto_play: true, show_artwork: true });
    } else {
      widget.toggle();
    }
  }, [currentSound?.url, widget]);

  const handleSetTimer = useCallback((minutes: number) => {
    setTimerDuration(minutes);
    if (minutes > 0) {
      widget.startTimer(minutes, fadeOutDuration, setTimerRemaining);
      setIsTimerPaused(false);
    } else {
      widget.clearTimer(setTimerRemaining);
      setIsTimerPaused(true);
    }
  }, [widget, fadeOutDuration]);
  
  const handleToggleTimerPause = useCallback(() => {
    if (timerDuration > 0) {
      setIsTimerPaused(prev => {
        if (prev) widget.resumeTimer(fadeOutDuration, setTimerRemaining);
        else widget.pauseTimer();
        return !prev;
      });
    }
  }, [widget, timerDuration, fadeOutDuration]);

  const handleRestartTimer = useCallback(() => {
    if (timerDuration > 0) {
        handleSetTimer(timerDuration);
    }
  }, [timerDuration, handleSetTimer]);
  
  const handleAddCustomSound = useCallback(async (url: string) => {
    if (!url || !url.includes('soundcloud.com')) {
      alert("Por favor, insira um link válido do SoundCloud.");
      return;
    }
    
    setLoadingSoundUrl(url);
    setIsSettingsOpen(false);
    
    try {
      // Fetch track title from SoundCloud oEmbed endpoint for a better user experience.
      const response = await fetch(`https://soundcloud.com/oembed?format=json&url=${encodeURIComponent(url)}`);
      if (!response.ok) throw new Error('Failed to fetch track info');
      const data = await response.json();
      const title = data.title || 'Faixa Personalizada';
      
      // The oEmbed title can be long ("Title by Artist"), let's shorten it.
      const shorterTitle = title.split(' by ')[0];
      const customSound: Sound = { name: shorterTitle, url: url, duration: 'N/A' };
      
      setCurrentSound(customSound);
      widget.load(url, { auto_play: true, show_artwork: true });

    } catch (error) {
      console.error("Error fetching SoundCloud track info:", error);
      // Fallback to the old behavior if the API fails, so the sound still plays.
      const customSound: Sound = { name: 'Faixa Personalizada', url: url, duration: 'N/A' };
      setCurrentSound(customSound);
      widget.load(url, { auto_play: true, show_artwork: true });
      alert("Não foi possível obter o nome da faixa, mas ela será tocada.");
    }
  }, [widget]);
  
  const handleSetKeepScreenOn = (keepOn: boolean) => {
    setKeepScreenOn(keepOn);
    if (!keepOn) {
        setIsIdleModeEnabled(false);
        setIsIdle(false);
    }
  };
  
  const handleExitIdleMode = useCallback(() => {
    setIsIdle(false);
    // Do not exit fullscreen when idle mode ends, let the user control it.
  }, []);

  const themeClasses = useMemo(() => {
    if (theme === Theme.Translucent) return 'bg-cover bg-center bg-fixed text-white';
    
    if (isEffectivePerformanceMode) {
      const bgColor = theme === Theme.Light ? 'bg-white' : 'bg-black';
      const textColor = theme === Theme.Light ? 'text-slate-900' : 'text-white';
      return `${bgColor} ${textColor}`;
    }

    const gradient = theme === Theme.Light ? 'from-sky-100 to-blue-200' : 'from-slate-800 to-black';
    const textColor = theme === Theme.Light ? 'text-slate-800' : 'text-white';
    return `bg-gradient-to-br ${gradient} ${textColor}`;
  }, [theme, isEffectivePerformanceMode]);
  
  const themeStyle = useMemo(() => {
    return theme === Theme.Translucent ? { backgroundImage: `url(${backgroundImageUrl})` } : {};
  }, [theme, backgroundImageUrl]);
  
  const textColor = theme === Theme.Light ? 'text-slate-800' : 'text-white';

  return (
    <main 
      style={themeStyle}
      className={`relative min-h-screen font-sans ${!isEffectivePerformanceMode ? 'transition-all duration-500' : ''} ${themeClasses}`}
    >
      <div className={`absolute inset-0 w-full h-full ${!isEffectivePerformanceMode ? 'transition-opacity duration-500' : ''} ${theme === Theme.Translucent ? 'bg-black/50' : ''}`}></div>
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          theme={theme}
          timerRemaining={timerRemaining}
          isTimerPaused={isTimerPaused}
          timerDuration={timerDuration}
          onSetTimer={handleSetTimer}
          onToggleTimerPause={handleToggleTimerPause}
          onRestartTimer={handleRestartTimer}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />
        
        {isAttached ? (
          <div className="flex-grow w-full px-8 md:px-12 pt-8 flex flex-col items-center">
            <div className="w-full max-w-5xl mx-auto bg-black/20 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-6">
              <iframe
                id="sc-widget-iframe-attached"
                width="100%"
                height="166"
                scrolling="no"
                frameBorder="no"
                allow="autoplay"
                src={attachedWidgetUrl}
                tabIndex={-1}
              ></iframe>
            </div>
            <div className="w-full max-w-xl mx-auto mb-6 bg-black/10 dark:bg-white/5 backdrop-blur-sm p-4 rounded-2xl">
              <VolumeControl theme={theme} volume={volume} onVolumeChange={setVolume} />
            </div>
            <SoundGrid
              isAttached={true}
              categories={SOUND_CATEGORIES}
              onSoundSelect={handleSoundSelect}
              currentSoundUrl={currentSound?.url}
              isPlaying={isPlaying}
              loadingSoundUrl={loadingSoundUrl}
              isPerformanceMode={isEffectivePerformanceMode}
            />
          </div>
        ) : (
          <>
            <div className="pt-8">
              <SoundGrid
                isAttached={false}
                categories={SOUND_CATEGORIES}
                onSoundSelect={handleSoundSelect}
                currentSoundUrl={currentSound?.url}
                isPlaying={isPlaying}
                loadingSoundUrl={loadingSoundUrl}
                isPerformanceMode={isEffectivePerformanceMode}
              />
            </div>
            <div 
                className="fixed bottom-0 left-0 right-0 z-30 bg-gray-900/50 backdrop-blur-lg p-3 text-white"
                style={{ paddingBottom: `calc(0.75rem + env(safe-area-inset-bottom))` }}
            >
               <div className="max-w-7xl mx-auto grid grid-cols-[1fr_auto] items-center gap-4">
                  <iframe
                    id="sc-widget-iframe-fixed"
                    width="100%"
                    height="80"
                    scrolling="no"
                    frameBorder="no"
                    allow="autoplay"
                    src={fixedWidgetUrl}
                    tabIndex={-1}
                  ></iframe>
                  <div className="w-48">
                    <VolumeControl theme={Theme.Dark} volume={volume} onVolumeChange={setVolume} />
                  </div>
               </div>
            </div>
          </>
        )}
        <footer 
            className={`text-center py-8 mt-auto ${textColor} text-sm opacity-70`}
            style={{ paddingBottom: `calc(2rem + env(safe-area-inset-bottom))` }}
        >
          Desenvolvido por <a href="https://instagram.com/elias_jrnunes" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100">@elias_jrnunes</a>
        </footer>
      </div>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={theme}
        setTheme={setTheme}
        isAttached={isAttached}
        setIsAttached={setIsAttached}
        fadeOutDuration={fadeOutDuration}
        setFadeOutDuration={setFadeOutDuration}
        onAddCustomSound={handleAddCustomSound}
        keepScreenOn={keepScreenOn}
        setKeepScreenOn={handleSetKeepScreenOn}
        isPerformanceMode={isPerformanceMode}
        setIsPerformanceMode={setIsPerformanceMode}
        isIdleModeEnabled={isIdleModeEnabled}
        setIsIdleModeEnabled={setIsIdleModeEnabled}
        isFullscreen={isFullscreen}
        onEnterFullscreen={handleEnterFullscreen}
        onExitFullscreen={handleExitFullscreen}
      />
      
      {isIdle && <IdleOverlay onExit={handleExitIdleMode} />}
    </main>
  );
};

export default App;