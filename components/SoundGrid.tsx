import React from 'react';
import { Category, Sound } from '../types';
import { PlayingIcon } from './icons/PlayingIcon';
import { LoadingSpinnerIcon } from './icons/LoadingSpinnerIcon';

interface SoundGridProps {
  categories: Category[];
  onSoundSelect: (sound: Sound, event: React.MouseEvent) => void;
  currentSoundUrl: string | undefined;
  isPlaying: boolean;
  isAttached: boolean;
  loadingSoundUrl: string | null;
  isPerformanceMode: boolean;
}

const SoundCard: React.FC<{ 
  sound: Sound; 
  onSelect: (event: React.MouseEvent) => void; 
  isActive: boolean; 
  isLoading: boolean; 
  index: number;
  isPerformanceMode: boolean;
}> = ({ sound, onSelect, isActive, isLoading, index, isPerformanceMode }) => (
    <div
        onClick={onSelect}
        className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer group ${!isPerformanceMode ? 'transition-all duration-300 transform hover:scale-105' : ''} ${isActive ? 'ring-4 ring-purple-500' : 'ring-2 ring-transparent'}`}
    >
        <img src={`https://picsum.photos/300/300?random=${index}`} alt={sound.name} className={`w-full h-full object-cover ${!isPerformanceMode ? 'transition-transform duration-300 group-hover:scale-110' : ''}`}/>
        <div className={`absolute inset-0 bg-black/50 ${!isPerformanceMode ? 'group-hover:bg-black/60 transition-colors duration-300' : ''} flex items-end p-3 md:p-4`}>
            <div>
              <h3 className="text-white font-semibold text-sm md:text-base leading-tight">{sound.name}</h3>
              {sound.duration && <p className="text-xs text-white/70 mt-1">{sound.duration}</p>}
            </div>
        </div>
        {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <LoadingSpinnerIcon className="w-8 h-8 text-white animate-spin" />
            </div>
        )}
         {isActive && !isLoading && (
            <div className="absolute top-2 right-2 bg-purple-600/80 rounded-full p-2">
                <PlayingIcon className="w-4 h-4 text-white"/>
            </div>
        )}
    </div>
);

const SoundGrid: React.FC<SoundGridProps> = ({ categories, onSoundSelect, currentSoundUrl, isPlaying, isAttached, loadingSoundUrl, isPerformanceMode }) => {
  let soundIndex = 0;
  return (
    <div className={`flex-grow overflow-y-auto w-full max-w-7xl mx-auto px-8 md:px-12 ${isAttached ? 'pb-16' : 'pb-32'}`}>
      <div className="space-y-8">
        {categories.map((category) => (
          <section key={category.name}>
            <h2 className="text-xl md:text-2xl font-bold mb-4">{category.name}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {category.sounds.map((sound) => {
                  const currentIndex = soundIndex++;
                  return (
                    <SoundCard
                        key={sound.url}
                        sound={sound}
                        onSelect={(e) => onSoundSelect(sound, e)}
                        isActive={currentSoundUrl === sound.url && isPlaying}
                        isLoading={loadingSoundUrl === sound.url}
                        index={currentIndex}
                        isPerformanceMode={isPerformanceMode}
                    />
                  );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default SoundGrid;