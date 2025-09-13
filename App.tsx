import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Sound, Theme, FadeOutOption } from './types';
import { SOUND_CATEGORIES, DEFAULT_SOUND } from './constants';
import { useSoundCloudWidget } from './hooks/useSoundCloudWidget';
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
  
  // Idle State
  const [isIdle, setIsIdle] = useState<boolean>(false);
  // Fix: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string>('');

  // Screen Wake Lock
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

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
    },
    onPause: () => setIsPlaying(false),
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
    // If idle mode is disabled, ensure everything is clean.
    if (!isIdleModeEnabled) {
        setIsIdle(false);
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        return;
    }

    const handleUserActivity = () => {
        setIsIdle(false); // User is active, so not idle.
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current); // Stop any pending idle timer.
        
        // If music is playing, we should restart the idle countdown.
        if (isPlaying) {
            resetIdleTimer();
        }
    };

    const activityEvents = ['mousemove', 'mousedown', 'touchstart', 'keydown', 'scroll'];
    activityEvents.forEach(event => window.addEventListener(event, handleUserActivity));

    // If music starts playing, begin the idle countdown.
    if (isPlaying) {
        resetIdleTimer();
    } else {
        // If music stops, just clear the pending countdown.
        // Don't change isIdle state, to keep screen black if timer just finished.
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    }

    return () => {
        activityEvents.forEach(event => window.removeEventListener(event, handleUserActivity));
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isIdleModeEnabled, isPlaying, resetIdleTimer]);
  // --- End of Idle Mode Logic ---

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
      widget.load(sound.url, { auto_play: true, show_artwork: true });
      setCurrentSound(sound);
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
  
  const handleAddCustomSound = useCallback((url: string) => {
    if (url && url.includes('soundcloud.com')) {
      const customSound: Sound = { name: 'Faixa Personalizada', url: url, duration: 'N/A' };
      setLoadingSoundUrl(url);
      widget.load(url, { auto_play: true, show_artwork: true });
      setCurrentSound(customSound);
      setIsSettingsOpen(false);
    } else {
      alert("Por favor, insira um link válido do SoundCloud.");
    }
  }, [widget]);
  
  const handleSetKeepScreenOn = (keepOn: boolean) => {
    setKeepScreenOn(keepOn);
    if (!keepOn) {
        setIsIdleModeEnabled(false);
        setIsIdle(false);
    }
  };

  const isEffectivePerformanceMode = isPerformanceMode || (isIdle && theme !== Theme.Translucent);

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
      className={`relative h-screen font-sans ${!isEffectivePerformanceMode ? 'transition-all duration-500' : ''} ${themeClasses}`}
    >
      <div className={`absolute inset-0 w-full h-full ${!isEffectivePerformanceMode ? 'transition-opacity duration-500' : ''} ${theme === Theme.Translucent ? 'bg-black/50' : ''}`}></div>
      <div className="relative z-10 flex flex-col h-full">
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
      />
      {isIdle && <IdleOverlay onExit={() => setIsIdle(false)} />}
    </main>
  );
};

export default App;