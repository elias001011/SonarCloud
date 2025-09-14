import React from 'react';
import { FullscreenIcon } from './icons/FullscreenIcon';

interface FullscreenButtonProps {
  onClick: () => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 right-5 z-[10000] p-3 bg-white/20 rounded-full text-white hover:bg-white/30 transition-colors animate-fade-in"
      aria-label="Entrar em modo de tela cheia imersivo"
      title="Entrar em modo de tela cheia imersivo"
    >
      <FullscreenIcon className="w-6 h-6" />
    </button>
  );
};

export default FullscreenButton;