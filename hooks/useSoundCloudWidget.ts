import { useState, useEffect, useRef, useCallback } from 'react';
import { SoundCloudWidget, FadeOutOption } from '../types';

interface WidgetEvents {
  onPlay?: () => void;
  onPause?: () => void;
  onFinish?: () => void;
  onProgress?: (positionInfo: { currentPosition: number; duration: number }) => void;
}

export const useSoundCloudWidget = (iframeId: string, events: WidgetEvents) => {
  const widgetRef = useRef<SoundCloudWidget | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);

  // Fix: Use ReturnType for browser compatibility instead of NodeJS.Timeout
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const remainingTimeRef = useRef<number>(0);
  const isPausedRef = useRef<boolean>(true);

  const eventsRef = useRef(events);
  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  useEffect(() => {
    setIsReady(false);
    widgetRef.current = null;

    // Cleanup timer intervals on re-initialization
    if (timerRef.current) clearTimeout(timerRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    const sc = window.SC;
    if (!sc?.Widget) {
        console.error("SoundCloud Widget API not found. Make sure the script is loaded.");
        return;
    }

    const iframeElement = document.getElementById(iframeId);
    if (!iframeElement) return;

    let scWidgetInstance: SoundCloudWidget | null = null;
    try {
        scWidgetInstance = sc.Widget(iframeElement as HTMLIFrameElement);
        widgetRef.current = scWidgetInstance;

        let currentDuration = 0; // Cache duration per track

        const readyCallback = () => setIsReady(true);
        
        const playCallback = () => {
          // When a new track starts, fetch its duration to enable progress tracking.
          widgetRef.current?.getDuration((duration) => {
            currentDuration = duration;
          });
          eventsRef.current.onPlay?.();
        };

        const pauseCallback = () => {
          currentDuration = 0; // Reset duration on pause
          eventsRef.current.onPause?.();
        };
        
        const finishCallback = () => {
          currentDuration = 0; // Reset duration on finish
          eventsRef.current.onFinish?.();
        };

        const progressCallback = (progressData: { currentPosition: number }) => {
            // Only emit progress if we have a valid duration.
            if (currentDuration > 0) {
                eventsRef.current.onProgress?.({
                    currentPosition: progressData.currentPosition,
                    duration: currentDuration,
                });
            }
        };
        
        scWidgetInstance.bind(sc.Widget.Events.READY, readyCallback);
        scWidgetInstance.bind(sc.Widget.Events.PLAY, playCallback);
        scWidgetInstance.bind(sc.Widget.Events.PAUSE, pauseCallback);
        scWidgetInstance.bind(sc.Widget.Events.FINISH, finishCallback);
        scWidgetInstance.bind(sc.Widget.Events.PLAY_PROGRESS, progressCallback);

        return () => {
             if (scWidgetInstance) {
                try {
                    scWidgetInstance.unbind(sc.Widget.Events.READY);
                    scWidgetInstance.unbind(sc.Widget.Events.PLAY);
                    scWidgetInstance.unbind(sc.Widget.Events.PAUSE);
                    scWidgetInstance.unbind(sc.Widget.Events.FINISH);
                    scWidgetInstance.unbind(sc.Widget.Events.PLAY_PROGRESS);
                } catch (e) { /* Widget might already be destroyed */ }
            }
        };
    } catch (e) {
        console.error("Error initializing SoundCloud widget:", e);
        widgetRef.current = null;
    }
  }, [iframeId]);

  const play = useCallback(() => {
    if (widgetRef.current && isReady) widgetRef.current.play();
  }, [isReady]);

  const pause = useCallback(() => {
    if (widgetRef.current && isReady) widgetRef.current.pause();
  }, [isReady]);

  const toggle = useCallback(() => {
    if (widgetRef.current && isReady) {
        widgetRef.current.toggle();
    }
  }, [isReady]);
  
  const load = useCallback((url: string, options: any) => {
    if (widgetRef.current && isReady) {
      widgetRef.current.load(url, options);
    }
  }, [isReady]);

  const setVolume = useCallback((volume: number) => {
    if (widgetRef.current && isReady) {
      widgetRef.current.setVolume(volume);
    }
  }, [isReady]);

  const fadeOut = useCallback((seconds: number) => {
    if (!widgetRef.current) return;
    
    const widget = widgetRef.current;
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

    if (seconds === 0) {
      widget.pause();
      return;
    }

    widget.getVolume((initialVolume) => {
      let currentVolume = initialVolume;
      const steps = seconds * 4;
      const stepVolume = initialVolume > 0 ? initialVolume / steps : 0;

      if (steps <= 0) {
        widget.pause();
        return;
      }

      fadeIntervalRef.current = setInterval(() => {
        currentVolume -= stepVolume;
        if (currentVolume <= 0) {
          if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
          widget.pause();
          setTimeout(() => {
            // Re-check ref in case component unmounted during the timeout
            if (widgetRef.current) {
              widgetRef.current.setVolume(initialVolume);
            }
          }, 300);
        } else {
          widget.setVolume(Math.max(0, currentVolume));
        }
      }, 250);
    });
  }, []);

  const clearTimer = useCallback((setRemaining: (time: number | null) => void) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    isPausedRef.current = true;
    remainingTimeRef.current = 0;
    setRemaining(null);
  }, []);

  const runTimer = useCallback((durationMs: number, fadeOutSeconds: number, setRemaining: (time: number | null) => void) => {
    const fadeStartMs = durationMs - (fadeOutSeconds * 1000);
    
    remainingTimeRef.current = durationMs;
    setRemaining(remainingTimeRef.current);

    if(countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    countdownIntervalRef.current = setInterval(() => {
        if (!isPausedRef.current) {
            remainingTimeRef.current -= 1000;
            setRemaining(remainingTimeRef.current > 0 ? remainingTimeRef.current : 0);
            if (remainingTimeRef.current <= 0) {
                if(countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            }
        }
    }, 1000);

    if(timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fadeOut(fadeOutSeconds);
    }, fadeStartMs > 0 ? fadeStartMs : 0);
  }, [fadeOut]);

  const startTimer = useCallback((minutes: number, fadeOutDuration: FadeOutOption, setRemaining: (time: number | null) => void) => {
    clearTimer(setRemaining);
    isPausedRef.current = false;
    const totalMs = minutes * 60 * 1000;
    runTimer(totalMs, fadeOutDuration, setRemaining);
  }, [clearTimer, runTimer]);

  const pauseTimer = useCallback(() => {
    if(isPausedRef.current) return;
    isPausedRef.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resumeTimer = useCallback((fadeOutDuration: FadeOutOption, setRemaining: (time: number | null) => void) => {
    if(!isPausedRef.current) return;
    isPausedRef.current = false;
    runTimer(remainingTimeRef.current, fadeOutDuration, setRemaining);
  }, [runTimer]);

  return { isReady, play, pause, setVolume, toggle, load, startTimer, pauseTimer, resumeTimer, clearTimer };
};