import React, { useState } from 'react';
import { Theme, FadeOutOption } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  // Layout
  isAttached: boolean;
  setIsAttached: (isAttached: boolean) => void;
  // Timer
  fadeOutDuration: FadeOutOption;
  setFadeOutDuration: (duration: FadeOutOption) => void;
  // Custom Sound
  onAddCustomSound: (url: string) => void;
  // Screen Wake Lock
  keepScreenOn: boolean;
  setKeepScreenOn: (keepOn: boolean) => void;
  // Performance
  isPerformanceMode: boolean;
  setIsPerformanceMode: (isPerformance: boolean) => void;
  // Idle Mode
  isIdleModeEnabled: boolean;
  setIsIdleModeEnabled: (isEnabled: boolean) => void;
}

const fadeOutOptions: { label: string; value: FadeOutOption }[] = [
  { label: 'Off', value: 0 },
  { label: '5s', value: 5 },
  { label: '10s', value: 10 },
  { label: '15s', value: 15 },
  { label: '20s', value: 20 },
  { label: '30s', value: 30 },
  { label: '60s', value: 60 },
];

const Toggle: React.FC<{ label: string; isEnabled: boolean; onToggle: () => void, disabled?: boolean }> = ({ label, isEnabled, onToggle, disabled }) => (
    <div className={`flex justify-between items-center transition-opacity ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <span className="font-medium">{label}</span>
        <button 
            onClick={() => !disabled && onToggle()} 
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
            disabled={disabled}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
);


const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  setTheme,
  isAttached,
  setIsAttached,
  fadeOutDuration,
  setFadeOutDuration,
  onAddCustomSound,
  keepScreenOn,
  setKeepScreenOn,
  isPerformanceMode,
  setIsPerformanceMode,
  isIdleModeEnabled,
  setIsIdleModeEnabled,
}) => {
  const [customUrl, setCustomUrl] = useState('');
  if (!isOpen) return null;

  const handleAddSound = () => {
    onAddCustomSound(customUrl);
    setCustomUrl('');
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (newTheme === Theme.Translucent) {
      setIsPerformanceMode(false);
    }
  };

  const isWakeLockSupported = typeof window !== 'undefined' && 'wakeLock' in navigator;

  return (
    <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center transition-opacity duration-300"
        onClick={onClose}
    >
      <div
        className="bg-gray-800/80 text-white rounded-2xl p-6 md:p-8 w-11/12 max-w-md shadow-2xl flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Configurações</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Tema</h3>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => handleThemeChange(Theme.Light)} className={`py-2 rounded-lg transition-all ${theme === Theme.Light ? 'ring-2 ring-white font-bold' : ''} bg-gray-200 text-black`}>Claro</button>
            <button onClick={() => handleThemeChange(Theme.Dark)} className={`py-2 rounded-lg transition-all ${theme === Theme.Dark ? 'ring-2 ring-white font-bold' : ''} bg-gray-900`}>Escuro</button>
            <button onClick={() => handleThemeChange(Theme.Translucent)} className={`py-2 rounded-lg transition-all ${theme === Theme.Translucent ? 'ring-2 ring-white font-bold' : ''} bg-cover bg-center bg-[url('https://picsum.photos/200/100')]`}>Translúcido</button>
          </div>
        </div>

        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Interface</h3>
            <Toggle label="Modo Container" isEnabled={isAttached} onToggle={() => setIsAttached(!isAttached)} />
            { (theme === Theme.Light || theme === Theme.Dark) &&
              <div>
                <Toggle label="Modo de Desempenho" isEnabled={isPerformanceMode} onToggle={() => setIsPerformanceMode(!isPerformanceMode)} />
                <p className="text-xs text-white/60 mt-1">Remove gradientes e animações para performance máxima.</p>
              </div>
            }
            <div>
              <Toggle label="Manter Tela Ativa" isEnabled={keepScreenOn} onToggle={() => setKeepScreenOn(!keepScreenOn)} disabled={!isWakeLockSupported} />
              <p className={`text-xs text-white/60 mt-1 transition-opacity ${!isWakeLockSupported ? 'opacity-50' : ''}`}>
                {isWakeLockSupported 
                  ? "Previne que a tela desligue e o som seja interrompido. Ideal para sessões longas ou para dormir."
                  : "Seu navegador não suporta esta funcionalidade."
                }
              </p>
            </div>
             {keepScreenOn && isWakeLockSupported && (
              <div className="pt-2">
                <Toggle label="Modo Ocioso" isEnabled={isIdleModeEnabled} onToggle={() => setIsIdleModeEnabled(!isIdleModeEnabled)} />
                <p className="text-xs text-white/60 mt-1">
                    Após 10s de inatividade, a tela ficará preta para economizar bateria em telas AMOLED.
                </p>
              </div>
            )}
        </div>
        
        <div className="space-y-3">
            <h3 className="text-lg font-semibold">Timer</h3>
            <div className="flex justify-between items-center">
                <span className="font-medium">Tempo de Fade Out</span>
                <select 
                    value={fadeOutDuration}
                    onChange={(e) => setFadeOutDuration(Number(e.target.value) as FadeOutOption)}
                    className="bg-gray-700 border border-gray-600 rounded-md py-1 px-2"
                >
                    {fadeOutOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Adicionar Faixa do SoundCloud</h3>
          <div className="flex items-center gap-2">
            <input 
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="Cole o link do SoundCloud aqui"
              className="w-full bg-white/10 rounded-md p-2 placeholder:text-white/50 text-sm"
            />
            <button onClick={handleAddSound} className="py-2 px-4 rounded-md bg-purple-600 hover:bg-purple-700 transition-colors text-sm font-semibold">Adicionar</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SettingsModal;