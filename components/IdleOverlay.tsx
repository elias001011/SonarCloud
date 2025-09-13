import React from 'react';

interface IdleOverlayProps {
  onExit: () => void;
}

const IdleOverlay: React.FC<IdleOverlayProps> = ({ onExit }) => {
  return (
    <div
      onClick={onExit}
      className="fixed inset-0 bg-black z-[9999] cursor-pointer animate-fade-in"
      aria-label="Modo Ocioso Ativo. Toque para sair."
    >
    </div>
  );
};

export default IdleOverlay;