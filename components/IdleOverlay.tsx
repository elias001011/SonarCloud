import React, { useRef, useState, useEffect } from 'react';

interface IdleOverlayProps {
  onExit: () => void;
}

const IdleOverlay: React.FC<IdleOverlayProps> = ({ onExit }) => {
  const lastTapTime = useRef(0);
  const [showHint, setShowHint] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = () => {
    const now = new Date().getTime();
    if (now - lastTapTime.current < 400) { // 400ms window for double tap
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      onExit();
    } else {
      lastTapTime.current = now;
      setShowHint(true);
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
      hintTimerRef.current = setTimeout(() => {
        setShowHint(false);
      }, 2000); // Show hint for 2 seconds
    }
  };
  
  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
        if(hintTimerRef.current) clearTimeout(hintTimerRef.current);
    }
  }, []);

  return (
    <div
      onClick={handleTap}
      className="fixed inset-0 bg-black z-[9999] cursor-pointer animate-fade-in flex items-center justify-center"
      aria-label="Modo Ocioso Ativo. Toque duas vezes para sair."
    >
      {showHint && (
        <div className="text-white text-lg bg-black/50 px-4 py-2 rounded-lg animate-fade-in">
          Toque novamente para sair
        </div>
      )}
    </div>
  );
};

export default IdleOverlay;
