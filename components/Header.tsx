import React, { useState, useEffect, useRef } from 'react';
import { SettingsIcon } from './icons/SettingsIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { RestartIcon } from './icons/RestartIcon';
import { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  timerRemaining: number | null;
  isTimerPaused: boolean;
  timerDuration: number;
  onSetTimer: (minutes: number) => void;
  onToggleTimerPause: () => void;
  onRestartTimer: () => void;
  onOpenSettings: () => void;
}

const formatTime = (ms: number | null) => {
  if (ms === null || ms < 0) return "00:00";
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const Header: React.FC<HeaderProps> = ({ 
  theme,
  timerRemaining, 
  isTimerPaused, 
  timerDuration,
  onSetTimer,
  onToggleTimerPause,
  onRestartTimer,
  onOpenSettings 
}) => {
  const [isTimerOpen, setIsTimerOpen] = useState(false);
  const [customMinutes, setCustomMinutes] = useState('');
  const timerOptions = [15, 30, 45, 60];
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const formattedTime = formatTime(timerRemaining);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTimerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSetCustomTimer = () => {
    const minutes = parseInt(customMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onSetTimer(minutes);
      setIsTimerOpen(false);
      setCustomMinutes('');
    }
  };
  
  const isLight = theme === Theme.Light;
  const isTranslucent = theme === Theme.Translucent;

  const textColor = isLight ? 'text-slate-800' : 'text-white';
  const buttonBg = isLight ? 'bg-black/10 hover:bg-black/20' : 'bg-white/10 hover:bg-white/20';

  const headerBg = isLight ? 'bg-white/50 backdrop-blur-lg' : 'bg-slate-900/50 backdrop-blur-lg';

  const dropdownBg = isTranslucent
    ? 'bg-gray-900 text-white'
    : 'bg-gray-100 text-slate-800 dark:bg-gray-800 dark:text-white';


  return (
    <header 
        className={`sticky top-0 z-30 p-3 md:p-4 transition-colors duration-300 ${headerBg}`}
        style={{ paddingTop: `calc(0.75rem + env(safe-area-inset-top))` }}
    >
      <div className={`grid grid-cols-3 items-center max-w-7xl mx-auto ${textColor}`}>
        <div className="flex items-center gap-3 justify-self-start">
          <div className="text-2xl">🌙</div>
          <h1 className={`text-lg md:text-xl font-bold ${textColor} hidden sm:block`}>SonarCloud</h1>
        </div>

        <div className="flex items-center justify-self-center gap-2">
          {timerDuration > 0 && (
            <button
                onClick={onRestartTimer}
                className={`${buttonBg} p-3 rounded-full transition-all duration-200`}
                aria-label="Restart Timer"
              >
              <RestartIcon className="w-5 h-5" />
            </button>
          )}

          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsTimerOpen(prev => !prev)}
              className={`${buttonBg} px-4 py-3 rounded-lg w-32 text-center`}
            >
              <span className={`${textColor} font-mono tracking-wider text-base`}>{timerDuration > 0 ? formattedTime : 'Timer'}</span>
            </button>
            {isTimerOpen && (
              <div className={`absolute top-full mt-2 w-56 -translate-x-1/4 rounded-lg p-2 shadow-2xl z-20 ${dropdownBg}`}>
                <div className="grid grid-cols-2 gap-2">
                  {timerOptions.map(min => (
                    <button key={min} onClick={() => { onSetTimer(min); setIsTimerOpen(false); }} className="py-2 px-3 rounded-md hover:bg-black/10 dark:hover:bg-white/20 transition-colors">{min} min</button>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                   <div className="flex items-center gap-2">
                      <input 
                        type="number"
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(e.target.value)}
                        placeholder="minutos"
                        className="w-full bg-black/10 dark:bg-white/10 rounded-md p-2 text-center text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-white/50"
                      />
                      <button onClick={handleSetCustomTimer} className="py-2 px-3 rounded-md bg-purple-600 hover:bg-purple-700 text-white transition-colors">Definir</button>
                   </div>
                </div>
                 <button onClick={() => { onSetTimer(0); setIsTimerOpen(false); }} className="w-full mt-2 py-2 px-3 rounded-md hover:bg-black/10 dark:hover:bg-white/20 transition-colors">Off</button>
              </div>
            )}
          </div>
          
          {timerDuration > 0 && (
            <button
              onClick={onToggleTimerPause}
              className={`${buttonBg} p-3 rounded-full transition-all duration-200`}
              aria-label={isTimerPaused ? "Resume Timer" : "Pause Timer"}
            >
              {isTimerPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
            </button>
          )}
        </div>

        <button
          onClick={onOpenSettings}
          className={`${buttonBg} p-3 rounded-full transition-all duration-200 justify-self-end`}
          aria-label="Settings"
        >
          <SettingsIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;