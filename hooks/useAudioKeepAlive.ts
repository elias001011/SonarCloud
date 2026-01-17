import { useEffect, useRef } from 'react';

/**
 * Hook to keep the AudioContext active by playing a silent oscillator.
 * This prevents Android/iOS from throttling the JavaScript thread when the app is in the background,
 * which ensures the SoundCloud widget continues to communicate and play smoothly without stuttering.
 */
export const useAudioKeepAlive = (isPlaying: boolean) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    // If not playing, we can try to suspend to save resources, 
    // though keeping it running is often safer for immediate resume.
    // Here we choose to suspend to be good citizens when paused.
    if (!isPlaying) {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend().catch(() => {});
      }
      return;
    }

    const initAudioContext = async () => {
      try {
        if (!audioCtxRef.current) {
          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            audioCtxRef.current = new AudioContextClass();
          }
        }

        const ctx = audioCtxRef.current;
        if (!ctx) return;

        if (ctx.state === 'suspended') {
          await ctx.resume();
        }

        // Only create the oscillator once
        if (!oscillatorRef.current) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          
          // Use a sine wave at a very low frequency
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1, ctx.currentTime); // 1Hz
          
          // Set gain to near-zero (inaudible but active)
          // 0.0001 is often enough to keep the audio pipeline open without being heard
          gain.gain.setValueAtTime(0.0001, ctx.currentTime);
          
          osc.connect(gain);
          gain.connect(ctx.destination);
          
          osc.start();
          
          oscillatorRef.current = osc;
          gainRef.current = gain;
        }
      } catch (error) {
        console.error("Failed to initialize Audio KeepAlive:", error);
      }
    };

    // Initialize immediately when playing starts
    initAudioContext();

    // Setup visibility change handler to ensure context resumes if tab was backgrounded and then foregrounded
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPlaying && audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);
};
