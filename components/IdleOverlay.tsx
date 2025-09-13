import React from 'react';

interface IdleOverlayProps {
  onExit: () => void;
}

const IdleOverlay: React.FC<IdleOverlayProps> = ({ onExit }) => {
  return (
    <div
      className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-end p-8 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Modo Ocioso Ativo"
    >
      <button
        onClick={onExit}
        className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
      >
        Sair do Modo Ocioso
      </button>
    </div>
  );
};

export default IdleOverlay;
